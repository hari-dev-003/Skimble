import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Arrow, Text, Transformer, Group, RegularPolygon } from 'react-konva';
import { useTheme } from '../../context/ThemeContext';

const PARTICIPANT_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

const STICKY_COLORS = ['#FEF08A', '#BBF7D0', '#BAE6FD', '#FBCFE8', '#DDD6FE', '#FED7AA'];

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

function ElementRenderer({ element, onSelect, onDragEnd, onTransformEnd, tool, onDblClickSticky, isEditing }) {
  const shapeRef = useRef(null);
  const { isDark } = useTheme();

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

  // Helper to resolve theme-aware colors for default text/strokes
  const resolveColor = (color, isText = false) => {
    if (!color) return isText ? (isDark ? '#F8FAFC' : '#1A1A1A') : 'transparent';
    // If color is the default dark or default light, make it theme-aware
    const normalized = color.toLowerCase();
    if (normalized === '#1a1a1a' || normalized === '#ffffff') {
      return isDark ? '#F8FAFC' : '#1A1A1A';
    }
    return color;
  };

  switch (element.type) {
    case 'rect':
      return <Rect {...commonProps} width={element.width} height={element.height} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} cornerRadius={4} />;
    case 'circle':
      return <Ellipse {...commonProps} radiusX={element.radiusX} radiusY={element.radiusY} fill={element.fill} stroke={element.stroke} strokeWidth={element.strokeWidth} />;
    case 'line':
      return <Line {...commonProps} points={element.points} stroke={resolveColor(element.stroke)} strokeWidth={element.strokeWidth} lineCap="round" lineJoin="round" fill="transparent" />;
    case 'arrow':
      return <Arrow {...commonProps} points={element.points} stroke={resolveColor(element.stroke)} strokeWidth={element.strokeWidth} fill={resolveColor(element.stroke)} pointerLength={10} pointerWidth={8} />;
    case 'text':
      return <Text {...commonProps} visible={!isEditing} text={element.text || ''} fontSize={element.fontSize || 16} fontFamily={element.fontFamily || 'Aptos, sans-serif'} fill={resolveColor(element.fill, true)} strokeWidth={0} wrap="word" />;
    case 'pen':
    case 'freehand':
      return <Line {...commonProps} points={element.points} stroke={resolveColor(element.stroke)} strokeWidth={element.strokeWidth} tension={0.4} lineCap="round" lineJoin="round" fill="transparent" />;
    case 'sticky': {
      const w = element.width || 200;
      const h = element.height || 200;
      const dogEarSize = 24;
      
      // Determine dot colors based on background
      const dotColors = ['#ff5f57', '#ffbd2e', '#28c941']; // macOS style window dots

      return (
        <Group
          {...commonProps}
          onDblClick={(e) => { if (tool === 'select') onDblClickSticky?.(element.id, e); }}
          onDblTap={(e) => { if (tool === 'select') onDblClickSticky?.(element.id, e); }}
        >
          {/* Main Paper */}
          <Rect
            width={w}
            height={h}
            fill={element.fill || '#FEF08A'}
            cornerRadius={4}
            shadowColor="rgba(0,0,0,0.12)"
            shadowBlur={10}
            shadowOffsetY={6}
          />
          
          {/* Top Bar / Handle */}
          <Rect
            width={w}
            height={32}
            fill="rgba(0,0,0,0.04)"
            cornerRadius={[4, 4, 0, 0]}
          />

          {/* Decorative dots */}
          <Group x={12} y={12}>
            {dotColors.map((c, i) => (
              <Ellipse key={i} x={i * 14} y={0} radiusX={3.5} radiusY={3.5} fill={c} opacity={0.8} />
            ))}
          </Group>

          {/* Dog-ear corner (bottom right) */}
          <Line
            points={[
              w - dogEarSize, h,
              w, h,
              w, h - dogEarSize
            ]}
            fill="rgba(0,0,0,0.08)"
            closed
          />
          <Line
            points={[
              w - dogEarSize, h,
              w - dogEarSize, h - dogEarSize,
              w, h - dogEarSize
            ]}
            fill="rgba(0,0,0,0.03)"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={1}
            closed
          />

          <Text
            x={16}
            y={44}
            width={w - 32}
            height={h - 60}
            visible={!isEditing}
            text={element.text || ''}
            fontSize={element.fontSize || 14}
            fontFamily="'Lexend', sans-serif"
            fill="rgba(0,0,0,0.75)"
            wrap="word"
            lineHeight={1.5}
            fontStyle="500"
          />
        </Group>
      );
    }
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
  zoom = 1,
  setZoom,
}) => {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingElement, setDrawingElement] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  /**
   * editingText: { id, isNew, canvasX?, canvasY?, screenX, screenY, fill, opacity, fontSize, isSticky? }
   */
  const [editingText, setEditingText] = useState(null);
  const textareaRef = useRef(null);

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

  // Focus textarea
  useEffect(() => {
    if (!editingText || !textareaRef.current) return;
    const ta = textareaRef.current;
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
    return stage.getRelativePointerPosition() || { x: 0, y: 0 };
  };

  const getScreenCoords = (canvasX, canvasY) => {
    const box = stageRef.current.container().getBoundingClientRect();
    return { 
      screenX: box.left + (canvasX * zoom) + stagePos.x, 
      screenY: box.top + (canvasY * zoom) + stagePos.y 
    };
  };

  const handleWheel = (e) => {
    if (!setZoom) return;
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0
      ? Math.min(zoom * scaleBy, 3)
      : Math.max(zoom / scaleBy, 0.25);

    setZoom(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePos(newPos);
  };

  /* ── Finalize text / sticky editing ── */
  const finalizeTextEdit = useCallback(() => {
    if (!editingText) return;
    const val = textareaRef.current?.value || '';
    const currentEditingId = editingText.id;

    if (editingText.isSticky) {
      if (val.trim() || !editingText.isNew) {
        updateElement(editingText.id, { text: val });
      } else {
        const newElements = elementsRef.current.filter(el => el.id !== editingText.id);
        setElements(newElements);
        pushHistory(newElements);
        onElementDelete(editingText.id);
      }
    } else if (editingText.isNew) {
      if (val.trim()) {
        addElement({
          id: editingText.id,
          type: 'text',
          x: editingText.canvasX,
          y: editingText.canvasY,
          text: val.trim(),
          fill: editingText.fill,
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: editingText.opacity,
          fontSize: editingText.fontSize,
          fontFamily: 'Aptos, sans-serif',
          rotation: 0, scaleX: 1, scaleY: 1,
          creatorId: userId,
        });
      }
    } else {
      if (val.trim()) {
        updateElement(editingText.id, { text: val.trim() });
      } else {
        const newElements = elementsRef.current.filter(el => el.id !== editingText.id);
        setElements(newElements);
        pushHistory(newElements);
        onElementDelete(editingText.id);
      }
    }
    setEditingText(prev => prev?.id === currentEditingId ? null : prev);
  }, [editingText, userId, addElement, updateElement, setElements, pushHistory, onElementDelete]);

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); finalizeTextEdit(); }
    if (e.key === 'Enter' && !e.shiftKey && !editingText?.isSticky) {
      e.preventDefault();
      finalizeTextEdit();
    }
  };

  /* ── Mouse down ── */
  const handleStageMouseDown = (e) => {
    const clickedOnStage = e.target === e.target.getStage();

    if (tool === 'select') {
      if (clickedOnStage) setSelectedId(null);
      return;
    }

    if (tool === 'eraser') {
      if (!clickedOnStage) {
        const target = e.target;
        const elId = target.id() || target.parent?.id?.();
        if (elId) {
          const newElements = elementsRef.current.filter(el => el.id !== elId);
          setElements(newElements);
          pushHistory(newElements);
          onElementDelete(elId);
        }
      }
      return;
    }

    if (tool === 'text' || tool === 'sticky') {
      if (editingText) finalizeTextEdit();
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
    const clickedOnStage = e.target === e.target.getStage();
    if (!clickedOnStage) return;

    if (tool === 'text') {
      const pos = getPointerPos();
      const { screenX, screenY } = getScreenCoords(pos.x, pos.y);
      setEditingText({
        id: generateId(),
        isNew: true,
        canvasX: pos.x,
        canvasY: pos.y,
        screenX,
        screenY,
        fill: toolProps.fill,
        opacity: toolProps.opacity,
        fontSize: toolProps.fontSize || 18,
      });
    } else if (tool === 'sticky') {
      const pos = getPointerPos();
      const stickyColor = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
      const newSticky = {
        id: generateId(),
        type: 'sticky',
        x: pos.x - 100,
        y: pos.y - 100,
        width: 200,
        height: 200,
        fill: stickyColor,
        stroke: 'transparent',
        strokeWidth: 0,
        text: '',
        fontSize: 13,
        opacity: 1,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        creatorId: userId,
      };
      addElement(newSticky);
      // Immediately open edit overlay for the new sticky
      const { screenX, screenY } = getScreenCoords(pos.x - 100, pos.y - 100);
      setEditingText({
        id: newSticky.id,
        isNew: false,
        isSticky: true,
        screenX,
        screenY,
        stickyWidth: 200,
        stickyHeight: 200,
      });
    }
  };

  const handleStageMouseMove = () => {
    const pos = getPointerPos();
    setLocalCursor(pos);
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

  /* ── Double-click to re-edit text or sticky ── */
  const handleDblClick = (e) => {
    if (tool !== 'select') return;
    const target = e.target;
    const id = target.id() || target.parent?.id?.();
    const el = elementsRef.current.find(x => x.id === id);
    if (!el) return;

    if (el.type === 'text') {
      const { screenX, screenY } = getScreenCoords(el.x, el.y);
      setEditingText({ id, isNew: false, screenX, screenY, fontSize: el.fontSize || 18, fill: el.fill });
    }
  };

  const handleDblClickSticky = useCallback((id) => {
    const el = elementsRef.current.find(x => x.id === id);
    if (!el) return;
    const { screenX, screenY } = getScreenCoords(el.x, el.y);
    setEditingText({
      id,
      isNew: false,
      isSticky: true,
      screenX,
      screenY,
      stickyWidth: (el.width || 200) * zoom,
      stickyHeight: (el.height || 200) * zoom,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

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
    if (tool === 'hand') return 'grab';
    if (tool === 'select') return selectedId ? 'default' : 'default';
    if (tool === 'eraser') return 'cell';
    if (tool === 'sticky') return 'copy';
    if (tool === 'text') {
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='4' x2='12' y2='20'%3E%3C/line%3E%3Cline x1='8' y1='4' x2='16' y2='4'%3E%3C/line%3E%3Cline x1='8' y1='20' x2='16' y2='20'%3E%3C/line%3E%3C/svg%3E") 12 12, text`;
    }
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='5' x2='12' y2='19'%3E%3C/line%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E") 12 12, crosshair`;
  };

  const participantColorMap = {};
  Object.keys(remoteCursors).forEach((uid, i) => {
    participantColorMap[uid] = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
  });

  const editingDefaultValue = editingText?.isSticky
    ? (elementsRef.current.find(el => el.id === editingText?.id)?.text || '')
    : editingText?.isNew
      ? ''
      : (elementsRef.current.find(el => el.id === editingText?.id)?.text || '');

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      style={{ cursor: getCursor(), background: 'var(--sk-base)' }}
    >
      {/* Dot grid — theme-aware */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, var(--sk-strong) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable={(tool === 'select' && !selectedId) || tool === 'hand'}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onTouchStart={handleStageMouseDown}
        onTouchMove={handleStageMouseMove}
        onTouchEnd={handleStageMouseUp}
        onDblClick={handleDblClick}
        onWheel={handleWheel}
        style={{ position: 'absolute', top: 0, left: 0, cursor: getCursor() }}
      >
        <Layer>
          {elements.map(el => (
            <ElementRenderer
              key={el.id}
              element={el}
              isEditing={editingText?.id === el.id}
              onSelect={handleSelect}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              tool={tool}
              onDblClickSticky={handleDblClickSticky}
            />
          ))}

          {drawingElement && (
            <ElementRenderer element={drawingElement} onSelect={() => {}} onDragEnd={() => {}} onTransformEnd={() => {}} tool="select" onDblClickSticky={() => {}} />
          )}

          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
            anchorStyleFunc={(anchor) => { anchor.cornerRadius(4); }}
          />
        </Layer>

        <Layer listening={false}>
          {Object.entries(remoteCursors).map(([uid, cursor]) => (
            <RemoteCursor key={uid} x={cursor.x} y={cursor.y} username={cursor.name || 'User'} color={participantColorMap[uid] || '#8B5CF6'} />
          ))}
          {localCursor && (
            <RemoteCursor x={localCursor.x} y={localCursor.y} username={userEmail} color="#06b6d4" />
          )}
        </Layer>
      </Stage>

      {/* Text editing overlay */}
      {editingText && !editingText.isSticky && (
        <textarea
          key={editingText.id}
          ref={textareaRef}
          defaultValue={editingDefaultValue}
          onBlur={finalizeTextEdit}
          onKeyDown={handleTextareaKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-50 border rounded-2xl shadow-lg p-4 resize-none outline-none min-w-[200px] min-h-[60px] placeholder:opacity-40 focus:border-cyan-500/50"
          style={{
            left: editingText.screenX,
            top: editingText.screenY,
            fontSize: `${editingText.fontSize || 18}px`,
            fontFamily: 'Aptos, sans-serif',
            lineHeight: 1.5,
            transform: 'translate(-10px, -10px)',
            fontWeight: 600,
            background: 'var(--sk-surface)',
            color: 'var(--sk-1)',
            borderColor: 'var(--sk-accent)',
          }}
          placeholder="Start typing..."
          rows={1}
          spellCheck={false}
          autoFocus
        />
      )}

      {/* Sticky note editing overlay */}
      {editingText?.isSticky && (
        <textarea
          key={`sticky-${editingText.id}`}
          ref={textareaRef}
          defaultValue={editingDefaultValue}
          onBlur={finalizeTextEdit}
          onKeyDown={handleTextareaKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-50 resize-none outline-none p-4 pt-11"
          style={{
            left: editingText.screenX,
            top: editingText.screenY,
            width: editingText.stickyWidth || 200 * zoom,
            height: editingText.stickyHeight || 200 * zoom,
            fontSize: `${14 * zoom}px`,
            fontFamily: "'Lexend', sans-serif",
            lineHeight: 1.5,
            background: 'transparent',
            color: 'rgba(0,0,0,0.8)',
            borderRadius: '4px',
            border: '2px solid rgba(6,182,212,0.6)',
            boxShadow: '0 0 0 3px rgba(6,182,212,0.15)',
            fontWeight: 500,
          }}
          placeholder="Add a note..."
          spellCheck={false}
          autoFocus
        />
      )}
    </div>
  );
};

export default WhiteboardCanvas;
