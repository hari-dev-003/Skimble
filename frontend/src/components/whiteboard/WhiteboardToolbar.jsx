import { MousePointer2, Square, Circle, Minus, MoveRight, Type, Pen, Eraser, Undo2, Redo2, Trash2 } from 'lucide-react';

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'rect', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'arrow', icon: MoveRight, label: 'Arrow (A)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'pen', icon: Pen, label: 'Pen (P)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
];

const PRESET_COLORS = [
  '#1a1a1a', '#EF4444', '#F59E0B', '#10B981',
  '#3B82F6', '#8B5CF6', '#EC4899', '#ffffff',
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
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-1.5 select-none max-w-[95vw] overflow-x-auto no-scrollbar">
      {/* Tool buttons */}
      <div className="flex items-center gap-1 pr-1 border-r border-gray-200/80">
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            title={label}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0
              ${tool === id
                ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md shadow-purple-200'
                : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-800'
              }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Property controls - only show relevant ones or group them */}
      <div className="flex items-center gap-3 px-3">
        {/* Stroke / Fill Color Pickers */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <input
              type="color"
              value={toolProps.stroke}
              onChange={e => setToolProps(p => ({ ...p, stroke: e.target.value }))}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg cursor-pointer border border-gray-200 p-0 bg-white"
              title="Stroke color"
            />
          </div>
          {tool !== 'pen' && tool !== 'line' && tool !== 'arrow' && (
            <div className="flex flex-col items-center">
              <input
                type="color"
                value={toolProps.fill}
                onChange={e => setToolProps(p => ({ ...p, fill: e.target.value }))}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg cursor-pointer border border-gray-200 p-0 bg-white"
                title="Fill color"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Dynamic Controls based on Tool */}
        {tool === 'text' ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">Size</span>
            <input
              type="number"
              min="8"
              max="120"
              value={toolProps.fontSize}
              onChange={e => setToolProps(p => ({ ...p, fontSize: Number(e.target.value) }))}
              className="w-12 text-center text-xs border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase hidden sm:block">Width</span>
            <input
              type="range"
              min="1"
              max="20"
              value={toolProps.strokeWidth}
              onChange={e => setToolProps(p => ({ ...p, strokeWidth: Number(e.target.value) }))}
              className="w-16 sm:w-20 accent-purple-500"
              title={`Stroke width: ${toolProps.strokeWidth}`}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200" />

      {/* History actions */}
      <div className="flex items-center gap-0.5 pl-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all shrink-0"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all shrink-0"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClearAll}
          title="Clear canvas"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WhiteboardToolbar;
