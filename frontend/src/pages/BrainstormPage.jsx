import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { Palette, Plus, Users, Clock, Trash2, AlertCircle, Sparkles, Layout, Zap, Share2 } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BrainstormPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { activeSession, joinSession, leaveSession, restoring } = useSession();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);

  const handleCreateSession = async () => {
    setCreating(true);
    setError(null);
    try {
      const token = auth.user?.access_token;
      const res = await axios.post(
        `${BACKEND_URL}/api/sessions`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sessionData = res.data;
      joinSession(sessionData, true);
      navigate(`/whiteboard/${sessionData.code}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (!window.confirm('End this brainstorm session? All collaborators will be disconnected.')) return;
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
    }
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt * 1000);
    return date.toLocaleString();
  };

  if (restoring) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-8 max-w-2xl mx-auto bg-slate-50 font-['Outfit']">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
          <Layout className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-[36px] font-[650] text-slate-900 tracking-tighter capitalize leading-none">Brainstorm Studio</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Infinite canvas for real-time team collaboration</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-8 text-red-700"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-bold">{error}</span>
        </motion.div>
      )}

      {activeSession ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] border border-slate-200 shadow-premium overflow-hidden"
        >
          <div className="bg-[#0f172a] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Active Live Session</span>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Live
              </span>
            </div>
            <div className="relative z-10 flex items-baseline gap-4">
              <span className="text-5xl font-black tracking-tighter uppercase">{activeSession.code}</span>
            </div>
            <p className="text-slate-400 text-xs font-bold mt-2 relative z-10">Share this unique identifier with your team</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Synchronized Multi-User Whiteboard</span>
              </div>
              {activeSession.expiresAt && (
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span>Available until {formatExpiry(activeSession.expiresAt)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate(`/whiteboard/${activeSession.code}`)}
                className="flex-1 py-4 bg-cyan-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-cyan-500 hover:shadow-xl hover:shadow-cyan-200 transition-all duration-300"
              >
                Enter Studio
              </button>
              {activeSession.isHost && (
                <button
                  onClick={handleEndSession}
                  disabled={ending}
                  className="flex items-center justify-center w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-100 transition-all duration-300 disabled:opacity-50"
                  title="End Session"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-10 text-center relative overflow-hidden group"
          >
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-105 transition-transform duration-500">
              <Plus className="w-10 h-10 text-cyan-600" strokeWidth={3} />
            </div>
            <h2 className="text-[33px] font-[650] text-slate-900 mb-2 tracking-tighter capitalise">New Collaboration</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto font-medium leading-relaxed">
              Instantly launch a professional whiteboard session. Invite collaborators with a secure 6-character access code.
            </p>
            <button
              onClick={handleCreateSession}
              disabled={creating}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-[#0f172a] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cyan-600 transition-all duration-500 shadow-xl hover:shadow-cyan-200 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initializing…
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-cyan-400 group-hover:text-white" />
                  Launch Session
                </>
              )}
            </button>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Palette size={20}/>, title: 'Rich Tools', desc: 'Precise vectors & text' },
              { icon: <Zap size={20}/>, title: 'No Latency', desc: 'Instant sync engine' },
              { icon: <Share2 size={20}/>, title: 'Zero Friction', desc: 'One-click guest join' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm hover:border-cyan-200 transition-all group">
                <div className="text-cyan-600 mb-3 flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-[10px] font-black text-slate-900 mb-1 uppercase tracking-widest">{title}</h3>
                <p className="text-[10px] text-slate-400 font-bold leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainstormPage;
