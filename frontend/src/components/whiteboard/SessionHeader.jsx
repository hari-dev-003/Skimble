import { useState } from 'react';
import { Copy, Check, Users, Wifi, WifiOff, X, Crown, Trash2, Link as LinkIcon, Share2, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICIPANT_COLORS = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
];

const SessionHeader = ({ sessionCode, participants, connected, isHost, onLeave, onEndSession, currentUserId }) => {
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-40 pointer-events-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Session Identity */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass-panel rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-3 sm:gap-4 shadow-premium border-white/40 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-600/20 text-white">
                <LinkIcon size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-800 tracking-tighter text-sm sm:text-lg uppercase truncate">{sessionCode}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-md sm:rounded-lg transition-all"
                    title="Copy Link"
                  >
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="hidden xs:flex text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] items-center gap-1">
                  <CornerDownRight size={8} /> Active
                </p>
              </div>
            </div>

            <div className="h-6 sm:h-8 w-px bg-slate-200 shrink-0" />

            {/* Participants Pill */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center gap-1 sm:gap-2 px-1 py-1 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  {participants.slice(0, 2).map((p, i) => (
                    <div
                      key={p.userId}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] sm:text-[10px] font-black ring-1 ring-slate-100 shadow-sm"
                      style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                    >
                      {(p.name?.[0] || '?').toUpperCase()}
                    </div>
                  ))}
                  {participants.length > 2 && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-500 text-[8px] sm:text-[10px] font-black ring-1 ring-slate-100 shadow-sm">
                      +{participants.length - 2}
                    </div>
                  )}
                </div>
                <span className="hidden md:inline text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800">
                  Collaborative
                </span>
              </button>

              <AnimatePresence>
                {showParticipants && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 glass-panel rounded-xl p-2 min-w-[180px] shadow-premium border-white/50"
                  >
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Team</p>
                    <div className="space-y-1">
                      {participants.map((p, i) => (
                        <div key={p.userId} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-white text-[8px] font-black"
                              style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                            >
                              {(p.name?.[0] || '?').toUpperCase()}
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
                              {p.name}
                            </span>
                          </div>
                          {p.userId === currentUserId && (
                            <span className="text-[7px] font-black text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded uppercase">You</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Status */}
        <div className="flex items-center gap-2 pointer-events-auto justify-end sm:justify-start">
          <div className="glass-panel rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-3 sm:gap-4 shadow-premium border-white/40">
            {/* Status */}
            <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-slate-200">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {connected ? 'Live' : 'Connect'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {isHost && (
                <button
                  onClick={onEndSession}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Terminate"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={onLeave}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
              >
                <X size={12} strokeWidth={3} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;
