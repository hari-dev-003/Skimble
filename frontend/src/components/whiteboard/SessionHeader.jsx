import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Trash2, X, Share2, Download, ChevronDown, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICIPANT_COLORS = [
  '#2563EB', '#7C3AED', '#059669', '#D97706',
  '#DC2626', '#DB2777', '#0891B2', '#65A30D',
];

const NAV_TABS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Templates', path: '/templates' },
  { label: 'Team', path: '/team' },
];

const SessionHeader = ({
  sessionCode, participants, connected,
  isHost, onLeave, onEndSession, currentUserId,
}) => {
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleEnd = () => {
    if (!confirmEnd) { setConfirmEnd(true); return; }
    onEndSession();
  };

  return (
    <header className="h-14 bg-sk-surface border-b border-sk-subtle flex items-center px-4 sm:px-5 z-50 shrink-0 gap-3">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
        <div className="w-8 h-8 bg-sk-accent rounded-lg flex items-center justify-center shadow-sm group-hover:bg-sk-accent-hi transition-colors">
          <PenTool size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="hidden sm:block font-bold text-sk-1 text-base tracking-tight">Skimble</span>
      </Link>

      {/* Nav Tabs */}
      <nav className="hidden md:flex items-center gap-0.5 border-l border-sk-subtle pl-3 ml-1">
        {NAV_TABS.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className="px-3 py-1.5 text-sm text-sk-3 hover:text-sk-1 hover:bg-sk-raised rounded-lg transition-colors"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Session Name + Participants — centered */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Session code pill */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-sk-raised border border-sk-subtle rounded-xl text-sm font-mono font-bold text-sk-1 hover:border-sk-accent/30 hover:bg-sk-accent/5 transition-colors group"
          title="Click to copy session code"
        >
          <span className="uppercase tracking-widest">{sessionCode}</span>
          <span className="text-sk-3 group-hover:text-sk-accent transition-colors">
            {copied ? <Check size={13} className="text-sk-success" /> : <Copy size={13} />}
          </span>
        </button>

        {/* Participants */}
        <div className="relative">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-sk-raised transition-all"
          >
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((p, i) => (
                <div
                  key={p.userId}
                  className="w-6 h-6 rounded-full border-2 border-sk-surface flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                  style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                >
                  {(p.name?.[0] || '?').toUpperCase()}
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-sk-surface bg-sk-raised flex items-center justify-center text-sk-3 text-[9px] font-bold shadow-sm">
                  +{participants.length - 3}
                </div>
              )}
            </div>

            {/* Live dot */}
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                connected ? 'bg-sk-success shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-sk-warning animate-pulse'
              }`}
            />
            <ChevronDown size={12} className="text-sk-3" />
          </button>

          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-sk-surface border border-sk-subtle rounded-xl shadow-lg py-2 min-w-[200px] z-50"
              >
                <p className="text-[10px] font-bold text-sk-3 uppercase tracking-widest px-3 mb-1.5">
                  {participants.length} participant{participants.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-0.5">
                  {participants.map((p, i) => (
                    <div key={p.userId} className="flex items-center gap-2.5 px-3 py-2 hover:bg-sk-raised transition-colors">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ backgroundColor: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length] }}
                      >
                        {(p.name?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-sk-1 truncate max-w-[100px]">{p.name}</span>
                      {p.userId === currentUserId && (
                        <span className="text-[9px] font-bold text-sk-accent bg-sk-accent/10 px-1.5 py-0.5 rounded ml-auto">you</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sk-2 border border-sk-subtle rounded-lg hover:bg-sk-raised transition-colors">
          <Download size={13} /> Export
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-sk-accent rounded-lg hover:bg-sk-accent-hi transition-colors shadow-sm"
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">Share</span>
        </button>

        {isHost && (
          <button
            onClick={handleEnd}
            title={confirmEnd ? 'Click to confirm end' : 'End session for all'}
            className={`p-2 rounded-lg transition-colors ${
              confirmEnd
                ? 'text-sk-danger bg-sk-danger/10'
                : 'text-sk-3 hover:text-sk-danger hover:bg-sk-danger/8'
            }`}
          >
            <Trash2 size={15} />
          </button>
        )}

        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sk-2 bg-sk-raised border border-sk-subtle rounded-lg hover:bg-sk-strong/20 hover:text-sk-1 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
};

export default SessionHeader;
