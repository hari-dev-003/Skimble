import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { Plus, Users, Trash2, AlertCircle, Sparkles, ArrowRight, Zap, Share2 } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BrainstormPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { activeSession, joinSession, leaveSession, restoring } = useSession();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const handleCreateSession = async () => {
    setCreating(true);
    setError(null);
    try {
      const token = auth.user?.access_token;
      const res = await axios.post(`${BACKEND_URL}/api/sessions`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      joinSession(res.data, true);
      navigate(`/whiteboard/${res.data.code}`);
    } catch {
      setError('Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirmEnd) { setConfirmEnd(true); return; }
    if (!activeSession) return;
    setEnding(true);
    try {
      const token = auth.user?.access_token;
      await axios.delete(`${BACKEND_URL}/api/sessions/${activeSession.code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      leaveSession();
    } catch {
      leaveSession();
    } finally {
      setEnding(false);
      setConfirmEnd(false);
    }
  };

  if (restoring) {
    return (
      <div className="min-h-full flex items-center justify-center bg-sk-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 border-4 border-sk-accent/20 border-t-sk-accent rounded-full animate-spin" />
          <p className="text-xs font-medium text-sk-3 tracking-wide">Syncing workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sk-1 tracking-tight">Studio</h1>
        <p className="text-sm text-sk-2 mt-1">Launch a live collaborative whiteboard session.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-sk-danger/8 border border-sk-danger/20 rounded-xl mb-6 text-sk-danger"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {activeSession ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sk-surface rounded-2xl border border-sk-subtle overflow-hidden shadow-sm"
        >
          {/* Session header */}
          <div className="bg-sk-raised border-b border-sk-subtle p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sk-accent/5 blur-3xl rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sk-accent">Active Session</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-sk-success/10 border border-sk-success/20 text-sk-success px-2.5 py-1 rounded-full uppercase tracking-wide">
                <div className="w-1.5 h-1.5 rounded-full bg-sk-success animate-pulse" /> Live
              </span>
            </div>
            <span className="relative z-10 text-4xl font-black tracking-tight text-sk-1 font-mono">{activeSession.code}</span>
            <p className="text-sm text-sk-2 mt-1 relative z-10">Share this code to invite collaborators</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2.5 text-sm text-sk-2">
              <div className="flex items-center gap-2.5">
                <Users size={14} className="text-sk-accent shrink-0" />
                Multi-user synchronized whiteboard
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => navigate(`/whiteboard/${activeSession.code}`)}
                className="flex-1 py-3 bg-sk-accent text-white font-semibold text-sm rounded-xl hover:bg-sk-accent-hi transition-colors flex items-center justify-center gap-2"
              >
                Enter Board <ArrowRight size={15} />
              </button>

              {activeSession.isHost && (
                <AnimatePresence mode="wait">
                  {confirmEnd ? (
                    <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <button
                        onClick={handleEndSession}
                        disabled={ending}
                        className="flex items-center gap-1.5 px-4 py-3 bg-sk-danger/8 border border-sk-danger/20 text-sk-danger font-semibold text-sm rounded-xl hover:bg-sk-danger/15 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} /> End?
                      </button>
                      <button
                        onClick={() => setConfirmEnd(false)}
                        className="px-3 text-sm font-medium text-sk-3 hover:text-sk-1 transition-colors"
                      >
                        No
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="delete"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleEndSession}
                      className="w-12 h-12 bg-sk-raised border border-sk-subtle text-sk-3 hover:text-sk-danger hover:border-sk-danger/20 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sk-surface rounded-2xl border border-sk-subtle p-8 text-center hover:border-sk-accent/20 transition-colors"
          >
            <div className="w-14 h-14 bg-sk-accent/10 border border-sk-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Plus size={26} className="text-sk-accent" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-sk-1 mb-2 tracking-tight">New Collaboration Board</h2>
            <p className="text-sm text-sk-2 mb-7 max-w-xs mx-auto leading-relaxed">
              Launch a live whiteboard and invite your team with a secure 6-character code.
            </p>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-sk-accent text-white text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors disabled:opacity-50 shadow-sm"
            >
              {creating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
              ) : (
                <><Sparkles size={15} /> Launch Session</>
              )}
            </button>
          </motion.div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Zap size={16} />, title: 'Real-time', desc: 'Instant sync' },
              { icon: <Users size={16} />, title: 'Multiplayer', desc: 'Team cursors' },
              { icon: <Share2 size={16} />, title: 'One code', desc: 'Easy invite' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-sk-surface border border-sk-subtle rounded-xl p-4 text-center hover:border-sk-accent/20 transition-colors">
                <div className="text-sk-accent mb-2 flex justify-center">{icon}</div>
                <h3 className="text-xs font-semibold text-sk-1 mb-0.5">{title}</h3>
                <p className="text-[11px] text-sk-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainstormPage;
