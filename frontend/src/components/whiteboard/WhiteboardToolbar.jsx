import { 
  MousePointer2, 
  Square, 
  Circle, 
  Minus, 
  MoveRight, 
  Type, 
  Pen, 
  Eraser, 
  Undo2, 
  Redo2, 
  Trash2,
  ChevronUp,
  Palette,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'pen', icon: Pen, label: 'Pen (P)' },
  { id: 'rect', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'arrow', icon: MoveRight, label: 'Arrow (A)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
];

const WhiteboardToolbar = ({
  tool,
  setTool,
  toolProps,
  setToolProps,
  onUndo,
  onRedo,
  onClearAll,
  canUndo,
  canRedo,
}) => {
  const [showProperties, setShowProperties] = useState(false);

  return (
    <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 sm:gap-4 w-[95vw] sm:w-auto">
      {/* Properties Popover (Contextual) */}
      <AnimatePresence>
        {showProperties && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center gap-4 sm:gap-6 shadow-premium mb-1 sm:mb-2 border-white/40 max-w-full overflow-x-auto no-scrollbar"
          >
            {/* Color Pickers */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center sm:text-left">Stroke</span>
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer mx-auto sm:mx-0">
                  <input
                    type="color"
                    value={toolProps.stroke}
                    onChange={e => setToolProps(p => ({ ...p, stroke: e.target.value }))}
                    className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                  />
                </div>
              </div>
              
              {tool !== 'pen' && tool !== 'line' && tool !== 'arrow' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center sm:text-left">Fill</span>
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer mx-auto sm:mx-0">
                    <input
                      type="color"
                      value={toolProps.fill}
                      onChange={e => setToolProps(p => ({ ...p, fill: e.target.value }))}
                      className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 sm:h-8 bg-slate-200 shrink-0" />

            {/* Range Controls */}
            <div className="flex flex-col gap-1 shrink-0">
              <div className="flex justify-between px-1 gap-4">
                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {tool === 'text' ? 'Size' : 'Width'}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-cyan-600 tabular-nums">
                  {tool === 'text' ? toolProps.fontSize : toolProps.strokeWidth}px
                </span>
              </div>
              <input
                type="range"
                min={tool === 'text' ? "12" : "1"}
                max={tool === 'text' ? "120" : "40"}
                value={tool === 'text' ? toolProps.fontSize : toolProps.strokeWidth}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (tool === 'text') setToolProps(p => ({ ...p, fontSize: val }));
                  else setToolProps(p => ({ ...p, strokeWidth: val }));
                }}
                className="w-24 sm:w-32 h-1 bg-slate-200 rounded-full appearance-none accent-cyan-500 cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Island Toolbar */}
      <motion.div 
        layout
        className="glass-panel rounded-2xl sm:rounded-[2rem] p-1.5 sm:p-2 flex items-center gap-1 sm:gap-1.5 shadow-premium border-white/50 max-w-full overflow-x-auto no-scrollbar"
      >
        {/* Tool Section */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-1 border-r border-slate-200/50 mr-0.5 sm:mr-1">
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all group shrink-0
                ${tool === id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              title={label}
            >
              {tool === id && (
                <motion.div
                  layoutId="active-tool"
                  className="absolute inset-0 bg-slate-900 rounded-xl sm:rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={18} className="sm:w-5 sm:h-5" strokeWidth={tool === id ? 2.5 : 2} />
            </button>
          ))}
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => setShowProperties(!showProperties)}
            className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all shrink-0
              ${showProperties ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            title="Object Properties"
          >
            <Palette size={18} className="sm:w-5 sm:h-5" />
          </button>

          <div className="w-px h-5 sm:h-6 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-20 transition-all shrink-0"
            title="Undo"
          >
            <Undo2 size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-20 transition-all shrink-0"
            title="Redo"
          >
            <Redo2 size={18} className="sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onClearAll}
            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
            title="Clear Canvas"
          >
            <Trash2 size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WhiteboardToolbar;
