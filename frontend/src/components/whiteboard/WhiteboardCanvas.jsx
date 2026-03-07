import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Arrow, Text, Transformer, Group, RegularPolygon } from 'react-konva';

const PARTICIPANT_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

function RemoteCursor({ x, y, username, color }) {
  const displayText = username || 'User';
  return (
    <Group x={x} y={y} listening={false}>
      <RegularPolygon sides={3} radius={8} fill={color} rotation={30} offsetX={-2} offsetY={-4} />
      <Rect x={8} y={4} width={Math.max(60, displayText.length * 7)} height={18} fill={color} cornerRadius={4} />
      <Text x={10} y={7} text={displayText} fontSize={11} fill="white" fontFamily="Aptos, sans-serif" />
    </Group>
  );
}

function ElementRenderer({ element, onSelect, onDragEnd, onTransformEnd, tool }) {
  const shapeRef = useRef(null);

  const commonProps = {
    ref: shapeRef,
    id: element.id,
    x: element.x,
    y: element.y,
    opacity: element.opacity,
    rotation: element.rotation || 0,
    scaleX: element.scaleX || 1,
    scaleY: element.scaleY || 1,
    draggable: tool === 'select',
    onClick: (e) => { if (tool === 'select' || tool === 'eraser') onSelect(element.id, e); },
    onTap: (e) => { if (tool === 'select' || tool === 'eraser') onSelect(element.id, e); },
    onDragEnd: (e) => { onDragEnd(element.id, { x: e.target.x(), y: e.target.y() }); },
    onTransformEnd: (e) => {
      const node = e.target;
      onTransformEnd(element.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
    },
  };

  switch (element.type) {
    case 'rect':
      return <Rect {...commonProps} width={element.width} height={element.height} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} cornerRadius={4} />;
    case 'circle':
      return <Ellipse {...commonProps} radiusX={element.radiusX} radiusY={element.radiusY} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />;
    case 'line':
      return <Line {...commonProps} points={element.points} stroke={element.stroke} strokeWidth={element.strokeWidth} lineCap="round" lineJoin="round" fill="transparent" />;
    case 'arrow':
      return <Arrow {...commonProps} points={element.points} stroke={element.stroke} strokeWidth={element.strokeWidth} fill={element.stroke} pointerLength={10} pointerWidth={8} />;
    case 'text':
      return <Text {...commonProps} text={element.text || ''} fontSize={element.fontSize || 16} fontFamily={element.fontFamily || 'Aptos, sans-serif'} fill={element.fill} strokeWidth={0} wrap="word" />;
    case 'pen':
    case 'freehand':
      return <Line {...commonProps} points={element.points} stroke={element.stroke} strokeWidth={element.strokeWidth} tension={0.4} lineCap="round" lineJoin="round" fill="transparent" />;
    default:
      return null;
  }
}

const WhiteboardCanvas = ({
  elements,
  setElements,
  tool,
  toolProps,
  onElementChange,
  onElementDelete,
  remoteCursors,
  userId,
  userEmail,
  onCursorMove,
  history,
  setHistory,
  historyIndex,
  setHistoryIndex,
}) => {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingElement, setDrawingElement] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  /**
   * editingText shape:
   *   isNew: true  → no canvas element exists yet, create on confirm
   *     { id, isNew, canvasX, canvasY, screenX, screenY, fill, opacity, fontSize }
   *   isNew: false → editing an existing element
   *     { id, isNew, screenX, screenY }
   */
  const [editingText, setEditingText] = useState(null);
  const textareaRef = useRef(null);

  // Ref so finalizeTextEdit always reads fresh elements without stale closure
  const elementsRef = useRef(elements);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync Transformer
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedId && tool === 'select') {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) { 
        transformerRef.current.nodes([node]); 
        transformerRef.current.borderStroke('#06b6d4');
        transformerRef.current.anchorStroke('#06b6d4');
        transformerRef.current.getLayer()?.batchDraw(); 
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, tool, elements]);

  useEffect(() => { if (tool !== 'select') setSelectedId(null); }, [tool]);

  // Delete/Escape keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (editingText) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) handleDeleteSelected();
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, editingText]);

  // Focus textarea when editing state changes
  useEffect(() => {
    if (!editingText || !textareaRef.current) return;
    const ta = textareaRef.current;
    
    // Small timeout to ensure focus works correctly after event processing
    const timeoutId = setTimeout(() => {
      ta.focus();
      if (!editingText.isNew) {
        const len = ta.value.length;
        ta.setSelectionRange(len, len);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [editingText]);

  const generateId = () => crypto.randomUUID();

  const pushHistory = useCallback((els) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(els);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, setHistory, setHistoryIndex]);

  const addElement = useCallback((el) => {
    const newElements = [...elementsRef.current, el];
    setElements(newElements);
    pushHistory(newElements);
    onElementChange(el);
  }, [setElements, pushHistory, onElementChange]);

  const updateElement = useCallback((id, updates) => {
    const newElements = elementsRef.current.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
    pushHistory(newElements);
    const updated = newElements.find(el => el.id === id);
    if (updated) onElementChange(updated);
  }, [setElements, pushHistory, onElementChange]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;
    const newElements = elementsRef.current.filter(el => el.id !== selectedId);
    setElements(newElements);
    pushHistory(newElements);
    onElementDelete(selectedId);
    setSelectedId(null);
  }, [selectedId, setElements, pushHistory, onElementDelete]);

  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    return stage.getPointerPosition() || { x: 0, y: 0 };
  };

  const getScreenCoords = (canvasX, canvasY) => {
    const box = stageRef.current.container().getBoundingClientRect();
    return { screenX: box.left + canvasX, screenY: box.top + canvasY };
  };

  /* ── Finalize text editing ── */
  const finalizeTextEdit = useCallback(() => {
    if (!editingText) return;
    const val = textareaRef.current?.value?.trim() || '';
    const currentEditingId = editingText.id;

    if (editingText.isNew) {
      if (val) {
        addElement({
          id: editingText.id,
          type: 'text',
          x: editingText.canvasX,
          y: editingText.canvasY,
          text: val,
          fill: editingText.fill,
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: editingText.opacity,
          fontSize: editingText.fontSize,
          fontFamily: 'Aptos, sans-serif',
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          creatorId: userId,
        });
      }
    } else {
      // Editing existing element
      if (val) {
        updateElement(editingText.id, { text: val });
      } else {
        const newElements = elementsRef.current.filter(el => el.id !== editingText.id);
        setElements(newElements);
        pushHistory(newElements);
        onElementDelete(editingText.id);
      }
    }
    // Only clear if we are still editing the same element to avoid race conditions
    setEditingText(prev => prev?.id === currentEditingId ? null : prev);
  }, [editingText, userId, addElement, updateElement, setElements, pushHistory, onElementDelete]);

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); finalizeTextEdit(); }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finalizeTextEdit(); }
  };

  /* ── Mouse down ── */
  const handleStageMouseDown = (e) => {
    const clickedOnStage = e.target === e.target.getStage();

    if (tool === 'select') {
      if (clickedOnStage) setSelectedId(null);
      return;
    }

    if (tool === 'eraser') {
      if (!clickedOnStage && e.target.id()) {
        const elId = e.target.id();
        const newElements = elementsRef.current.filter(el => el.id !== elId);
        setElements(newElements);
        pushHistory(newElements);
        onElementDelete(elId);
      }
      return;
    }

    if (tool === 'text') {
      // If clicking away while editing, finalize current edit
      if (editingText) {
        finalizeTextEdit();
      }
      return;
    }

    const pos = getPointerPos();
    setIsDrawing(true);

    if (tool === 'rect') {
      setDrawingElement({ id: generateId(), type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, fill: toolProps.fill, stroke: toolProps.stroke, strokeWidth: toolProps.strokeWidth, opacity: toolProps.opacity, rotation: 0, scaleX: 1, scaleY: 1, creatorId: userId });
    } else if (tool === 'circle') {
      setDrawingElement({ id: generateId(), type: 'circle', x: pos.x, y: pos.y, radiusX: 0, radiusY: 0, fill: toolProps.fill, stroke: toolProps.stroke, strokeWidth: toolProps.strokeWidth, opacity: toolProps.opacity, rotation: 0, scaleX: 1, scaleY: 1, creatorId: userId });
    } else if (tool === 'line' || tool === 'arrow') {
      setDrawingElement({ id: generateId(), type: tool, x: 0, y: 0, points: [pos.x, pos.y, pos.x, pos.y], stroke: toolProps.stroke, strokeWidth: toolProps.strokeWidth, fill: 'transparent', opacity: toolProps.opacity, rotation: 0, scaleX: 1, scaleY: 1, creatorId: userId });
    } else if (tool === 'pen') {
      setDrawingElement({ id: generateId(), type: 'pen', x: 0, y: 0, points: [pos.x, pos.y], stroke: toolProps.stroke, strokeWidth: toolProps.strokeWidth, fill: 'transparent', opacity: toolProps.opacity, rotation: 0, scaleX: 1, scaleY: 1, creatorId: userId });
    }
  };

  const handleStageClick = (e) => {
    if (tool !== 'text') return;
    
    // Only create text if clicking on the stage itself (empty area)
    const clickedOnStage = e.target === e.target.getStage();
    if (!clickedOnStage) return;

    const pos = getPointerPos();
    const { screenX, screenY } = getScreenCoords(pos.x, pos.y);

    setEditingText({
      id: generateId(),
      isNew: true,
      canvasX: pos.x,
      canvasY: pos.y,
      screenX,
      screenY,
      fill: toolProps.fill === '#ffffff' ? '#1a1a1a' : toolProps.fill,
      opacity: toolProps.opacity,
      fontSize: toolProps.fontSize || 18,
    });
  };

  const handleStageMouseMove = () => {
    const pos = getPointerPos();
    setLocalCursor(pos); // Track local cursor for the name tag
    onCursorMove(pos.x, pos.y);
    if (!isDrawing || !drawingElement) return;

    if (drawingElement.type === 'rect') {
      setDrawingElement(prev => ({ ...prev, width: pos.x - prev.x, height: pos.y - prev.y }));
    } else if (drawingElement.type === 'circle') {
      const r = Math.sqrt((pos.x - drawingElement.x) ** 2 + (pos.y - drawingElement.y) ** 2);
      setDrawingElement(prev => ({ ...prev, radiusX: r, radiusY: r }));
    } else if (drawingElement.type === 'line' || drawingElement.type === 'arrow') {
      setDrawingElement(prev => ({ ...prev, points: [prev.points[0], prev.points[1], pos.x, pos.y] }));
    } else if (drawingElement.type === 'pen') {
      setDrawingElement(prev => ({ ...prev, points: [...prev.points, pos.x, pos.y] }));
    }
  };

  const handleStageMouseUp = () => {
    if (!isDrawing || !drawingElement) return;
    setIsDrawing(false);

    const isRect = drawingElement.type === 'rect';
    const isCircle = drawingElement.type === 'circle';
    if (isRect && Math.abs(drawingElement.width) < 4 && Math.abs(drawingElement.height) < 4) { setDrawingElement(null); return; }
    if (isCircle && drawingElement.radiusX < 4) { setDrawingElement(null); return; }

    let finalEl = { ...drawingElement };
    if (isRect) {
      if (finalEl.width < 0) { finalEl.x += finalEl.width; finalEl.width = Math.abs(finalEl.width); }
      if (finalEl.height < 0) { finalEl.y += finalEl.height; finalEl.height = Math.abs(finalEl.height); }
    }
    addElement(finalEl);
    setDrawingElement(null);
  };

  /* ── Double-click to re-edit existing text ── */
  const handleDblClick = (e) => {
    if (tool !== 'select') return;
    const id = e.target.id();
    const el = elementsRef.current.find(x => x.id === id);
    if (!el || el.type !== 'text') return;
    const { screenX, screenY } = getScreenCoords(el.x, el.y);
    setEditingText({ id, isNew: false, screenX, screenY, fontSize: el.fontSize || 18, fill: el.fill });
  };

  const handleSelect = (id, e) => {
    if (tool === 'eraser') {
      const newElements = elementsRef.current.filter(el => el.id !== id);
      setElements(newElements);
      pushHistory(newElements);
      onElementDelete(id);
      return;
    }
    e?.cancelBubble && (e.cancelBubble = true);
    setSelectedId(id);
  };

  const handleDragEnd = (id, { x, y }) => {
    const newElements = elementsRef.current.map(el => el.id === id ? { ...el, x, y } : el);
    setElements(newElements);
    pushHistory(newElements);
    const updated = newElements.find(el => el.id === id);
    if (updated) onElementChange(updated);
  };

  const handleTransformEnd = (id, updates) => {
    const newElements = elementsRef.current.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(newElements);
    pushHistory(newElements);
    const updated = newElements.find(el => el.id === id);
    if (updated) onElementChange(updated);
  };

  const getCursor = () => {
    if (tool === 'select') return 'default';
    if (tool === 'eraser') return 'cell';
    // Custom black cursors for text and crosshair to ensure they are always black
    if (tool === 'text') {
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='4' x2='12' y2='20'%3E%3C/line%3E%3Cline x1='8' y1='4' x2='16' y2='4'%3E%3C/line%3E%3Cline x1='8' y1='20' x2='16' y2='20'%3E%3C/line%3E%3C/svg%3E") 12 12, text`;
    }
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='5' x2='12' y2='19'%3E%3C/line%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E") 12 12, crosshair`;
  };

  const participantColorMap = {};
  Object.keys(remoteCursors).forEach((uid, i) => {
    participantColorMap[uid] = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
  });

  const editingDefaultValue = editingText?.isNew
    ? ''
    : (elementsRef.current.find(el => el.id === editingText?.id)?.text || '');

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-[#f8f9fc]"
      style={{ cursor: getCursor() }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onTouchStart={handleStageMouseDown}
        onTouchMove={handleStageMouseMove}
        onTouchEnd={handleStageMouseUp}
        onDblClick={handleDblClick}
        style={{ position: 'absolute', top: 0, left: 0, cursor: getCursor() }}
      >
        <Layer>
          {elements.map(el => (
            <ElementRenderer key={el.id} element={el} onSelect={handleSelect} onDragEnd={handleDragEnd} onTransformEnd={handleTransformEnd} tool={tool} />
          ))}

          {drawingElement && (
            <ElementRenderer element={drawingElement} onSelect={() => {}} onDragEnd={() => {}} onTransformEnd={() => {}} tool="select" />
          )}

          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
            anchorStyleFunc={(anchor) => { anchor.cornerRadius(4); }}
          />
        </Layer>

        <Layer listening={false}>
          {/* Render remote cursors with name tags */}
          {Object.entries(remoteCursors).map(([uid, cursor]) => (
            <RemoteCursor key={uid} x={cursor.x} y={cursor.y} username={cursor.name || 'User'} color={participantColorMap[uid] || '#8B5CF6'} />
          ))}
          {/* Render local user's name tag next to their cursor position */}
          {localCursor && (
            <RemoteCursor x={localCursor.x} y={localCursor.y} username={userEmail} color="#06b6d4" />
          )}
        </Layer>
      </Stage>

      {/* Text textarea — appears at click position; element created only on confirm */}
      {editingText && (
        <textarea
          key={editingText.id}
          ref={textareaRef}
          defaultValue={editingDefaultValue}
          onBlur={finalizeTextEdit}
          onKeyDown={handleTextareaKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-50 bg-white/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-premium p-4 resize-none outline-none min-w-[200px] min-h-[60px] text-slate-800 placeholder:text-slate-300 focus:border-cyan-500/50"
          style={{
            left: editingText.screenX,
            top: editingText.screenY,
            fontSize: `${editingText.fontSize || 18}px`,
            fontFamily: 'Aptos, sans-serif',
            lineHeight: 1.5,
            transform: 'translate(-10px, -10px)',
            fontWeight: 600,
          }}
          placeholder="Start typing..."
          rows={1}
          spellCheck={false}
          autoFocus
        />
      )}
    </div>
  );
};

export default WhiteboardCanvas;
