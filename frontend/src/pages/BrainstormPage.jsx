import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { Palette, Plus, Users, Clock, Trash2, AlertCircle, Sparkles, Layout, Zap, Share2 } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BrainstormPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { activeSession, joinSession, leaveSession, restoring } = useSession();
  const [creating, setCreating]     = useState(false);
  const [error, setError]           = useState(null);
  const [ending, setEnding]         = useState(false);
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session. Please try again.');
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

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return '';
    return new Date(expiresAt * 1000).toLocaleString();
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
    <div className="min-h-full p-8 max-w-xl mx-auto bg-sk-base">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-11 h-11 bg-sk-raised border border-sk-subtle rounded-xl flex items-center justify-center shrink-0">
          <Layout className="w-5 h-5 text-sk-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-sk-1 tracking-tight leading-none">Brainstorm Studio</h1>
          <p className="text-sm text-sk-2 mt-1">Infinite canvas for real-time team collaboration</p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-sk-danger/8 border border-sk-danger/20 rounded-xl mb-8 text-sk-danger"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </motion.div>
      )}

      {activeSession ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sk-surface rounded-2xl border border-sk-subtle overflow-hidden shadow-md"
        >
          {/* Session header band */}
          <div className="bg-sk-raised border-b border-sk-subtle p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sk-accent/5 blur-3xl rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-sk-accent">Active Live Session</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest bg-sk-success/10 border border-sk-success/20 text-sk-success px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-sk-success animate-pulse" /> Live
              </span>
            </div>
            <span className="relative z-10 text-5xl font-black tracking-tight text-sk-1">{activeSession.code}</span>
            <p className="text-sm text-sk-2 mt-2 relative z-10">Share this code with your team to join</p>
          </div>

          <div className="p-7 space-y-5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-sm text-sk-2">
                <Users className="w-4 h-4 text-sk-accent shrink-0" />
                Synchronized multi-user whiteboard
              </div>
              {activeSession.expiresAt && (
                <div className="flex items-center gap-2.5 text-sm text-sk-2">
                  <Clock className="w-4 h-4 text-sk-accent shrink-0" />
                  Expires {formatExpiry(activeSession.expiresAt)}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => navigate(`/whiteboard/${activeSession.code}`)}
                className="flex-1 py-3.5 bg-sk-accent text-sk-base font-semibold text-sm rounded-xl hover:bg-sk-accent-hi transition-colors active:scale-[0.97]"
              >
                Enter Studio
              </button>

              {activeSession.isHost && (
                <AnimatePresence mode="wait">
                  {confirmEnd ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={handleEndSession}
                        disabled={ending}
                        className="flex items-center gap-1.5 px-4 py-3.5 bg-sk-danger/8 border border-sk-danger/20 text-sk-danger font-semibold text-sm rounded-xl hover:bg-sk-danger/15 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" /> End?
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
                      className="w-12 h-[50px] bg-sk-raised border border-sk-subtle text-sk-3 hover:text-sk-danger hover:border-sk-danger/20 rounded-xl transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Create card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sk-surface rounded-2xl border border-sk-subtle p-10 text-center group"
          >
            <div className="w-14 h-14 bg-sk-raised border border-sk-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:border-sk-accent/20 transition-colors duration-200">
              <Plus className="w-7 h-7 text-sk-accent" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-sk-1 mb-2 tracking-tight">New Collaboration</h2>
            <p className="text-sm text-sk-2 mb-8 max-w-sm mx-auto leading-relaxed">
              Launch a professional whiteboard session and invite collaborators with a secure 6-character access code.
            </p>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="shimmer-btn inline-flex items-center gap-3 px-8 py-3.5 bg-sk-accent text-sk-base text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors disabled:opacity-50 active:scale-[0.97]"
              style={{ boxShadow: '0 4px 20px rgba(6,182,212,0.25)' }}
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-sk-base/30 border-t-sk-base rounded-full animate-spin" />
                  Initializing…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Launch Session
                </>
              )}
            </button>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Palette size={17} />, title: 'Rich Tools',    desc: 'Precise vectors & text' },
              { icon: <Zap size={17} />,     title: 'No Latency',    desc: 'Instant sync engine' },
              { icon: <Share2 size={17} />,  title: 'Zero Friction', desc: 'One-click guest join' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-sk-surface border border-sk-subtle rounded-xl p-5 text-center hover:border-sk-accent/20 transition-colors group">
                <div className="text-sk-accent mb-3 flex justify-center group-hover:scale-110 transition-transform duration-200">{icon}</div>
                <h3 className="text-xs font-semibold text-sk-1 mb-1">{title}</h3>
                <p className="text-[11px] text-sk-2 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainstormPage;
