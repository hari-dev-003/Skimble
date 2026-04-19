import {
  MousePointer2, Square, Circle, Minus, MoveRight,
  Type, Pen, Eraser, Undo2, Redo2, Trash2, Palette,
  StickyNote, Hand, MoreHorizontal, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, memo } from 'react';

const ALL_TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'hand',   icon: Hand,          label: 'Pan (H)' },
  { id: 'pen',    icon: Pen,           label: 'Pen (P)' },
  { id: 'rect',   icon: Square,        label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle,        label: 'Circle (C)' },
  { id: 'line',   icon: Minus,         label: 'Line (L)' },
  { id: 'arrow',  icon: MoveRight,     label: 'Arrow (A)' },
  { id: 'text',   icon: Type,          label: 'Text (T)' },
  { id: 'sticky', icon: StickyNote,    label: 'Sticky Note (S)' },
  { id: 'eraser', icon: Eraser,        label: 'Eraser (E)' },
  { id: 'props',  icon: Palette,       label: 'Properties' },
  { id: 'undo',   icon: Undo2,         label: 'Undo (Ctrl+Z)' },
  { id: 'redo',   icon: Redo2,         label: 'Redo (Ctrl+Y)' },
  { id: 'clear',  icon: Trash2,        label: 'Clear Canvas' },
];

const ToolButton = memo(({ item, active, disabled, onClick, isOverflow }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      disabled={disabled}
      title={item.label}
      className={`relative flex items-center justify-center transition-all flex-shrink-0
        ${isOverflow ? 'w-full px-4 py-3 gap-3 justify-start hover:bg-sk-raised rounded-xl' : 'w-10 h-10 rounded-xl'}
        ${active && !isOverflow ? 'text-white' : 'text-sk-3 hover:text-sk-1 hover:bg-sk-raised'}
        ${disabled ? 'opacity-25 pointer-events-none' : ''}
      `}
    >
      {active && !isOverflow && (
        <motion.div
          layoutId="active-tool-bg"
          className="absolute inset-0 bg-sk-accent rounded-xl -z-10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      {isOverflow && <span className="text-sm font-medium">{item.label}</span>}
      {active && isOverflow && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sk-accent" />}
    </button>
  );
});

ToolButton.displayName = 'ToolButton';

const WhiteboardToolbar = ({
  tool, setTool,
  toolProps, setToolProps,
  onUndo, onRedo, onClearAll,
  canUndo, canRedo,
}) => {
  const [showProps, setShowProps] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ALL_TOOLS.length);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const targetWidth = screenWidth * 0.65;
      const buttonWidth = 44; // 40px width + 4px gap approx
      const count = Math.floor(targetWidth / buttonWidth);
      setVisibleCount(Math.max(3, Math.min(count - 1, ALL_TOOLS.length)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleTools = ALL_TOOLS.slice(0, visibleCount);
  const overflowTools = ALL_TOOLS.slice(visibleCount);

  const handleToolClick = (id) => {
    if (id === 'undo') onUndo();
    else if (id === 'redo') onRedo();
    else if (id === 'clear') onClearAll();
    else if (id === 'props') setShowProps(!showProps);
    else setTool(id);
    setShowMore(false);
  };

  const getIsActive = (id) => {
    if (id === 'props') return showProps;
    return tool === id;
  };

  const getIsDisabled = (id) => {
    if (id === 'undo') return !canUndo;
    if (id === 'redo') return !canRedo;
    return false;
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex flex-col items-center pointer-events-none px-4">
      <div className="pointer-events-auto relative flex flex-col items-center gap-4 w-full sm:max-w-[65%]">
        
        {/* Main Toolbar Pill */}
        <div className="flex items-center gap-1 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-sk-subtle rounded-2xl shadow-xl">
          {visibleTools.map(item => (
            <ToolButton 
              key={item.id} 
              item={item} 
              active={getIsActive(item.id)}
              disabled={getIsDisabled(item.id)}
              onClick={handleToolClick}
            />
          ))}

          {overflowTools.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
                  ${showMore ? 'bg-sk-accent text-white shadow-md' : 'text-sk-3 hover:text-sk-1 hover:bg-sk-raised'}
                `}
              >
                <MoreHorizontal size={18} />
              </button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-3 right-0 bg-white dark:bg-slate-900 border border-sk-subtle rounded-2xl shadow-2xl p-2 min-w-[200px] flex flex-col gap-1 overflow-hidden"
                  >
                    <p className="px-3 py-2 text-[10px] font-bold text-sk-3 uppercase tracking-widest border-b border-sk-subtle mb-1">More Tools</p>
                    <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                      {overflowTools.map(item => (
                        <ToolButton 
                          key={item.id} 
                          item={item} 
                          active={getIsActive(item.id)}
                          disabled={getIsDisabled(item.id)}
                          onClick={handleToolClick}
                          isOverflow 
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <AnimatePresence>
          {showProps && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="absolute bottom-full mb-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-sk-subtle rounded-3xl p-5 shadow-2xl w-full max-w-[320px]"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-sk-3 uppercase tracking-widest">Properties</p>
                <button onClick={() => setShowProps(false)} className="text-sk-3 hover:text-sk-1 p-1">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sk-2">Stroke</span>
                  <div className="w-8 h-8 rounded-full border-2 border-sk-subtle shadow-sm overflow-hidden relative cursor-pointer">
                    <input
                      type="color"
                      value={toolProps.stroke}
                      onChange={e => setToolProps(p => ({ ...p, stroke: e.target.value }))}
                      className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                    />
                  </div>
                </div>

                {tool !== 'pen' && tool !== 'line' && tool !== 'arrow' && tool !== 'eraser' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sk-2">Fill</span>
                    <div className="w-8 h-8 rounded-full border-2 border-sk-subtle shadow-sm overflow-hidden relative cursor-pointer">
                      <input
                        type="color"
                        value={toolProps.fill}
                        onChange={e => setToolProps(p => ({ ...p, fill: e.target.value }))}
                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="h-px bg-sk-subtle" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-sk-3 uppercase tracking-wider">{tool === 'text' ? 'Size' : 'Width'}</span>
                    <span className="text-[10px] font-bold text-sk-accent">{tool === 'text' ? toolProps.fontSize : toolProps.strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={tool === 'text' ? '12' : '1'}
                    max={tool === 'text' ? '120' : '40'}
                    value={tool === 'text' ? toolProps.fontSize : toolProps.strokeWidth}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (tool === 'text') setToolProps(p => ({ ...p, fontSize: val }));
                      else setToolProps(p => ({ ...p, strokeWidth: val }));
                    }}
                    className="w-full h-1.5 bg-sk-subtle rounded-lg appearance-none accent-sk-accent cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-sk-3 uppercase tracking-wider">Opacity</span>
                    <span className="text-[10px] font-bold text-sk-accent">{Math.round(toolProps.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={toolProps.opacity}
                    onChange={e => setToolProps(p => ({ ...p, opacity: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-sk-subtle rounded-lg appearance-none accent-sk-accent cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WhiteboardToolbar;
