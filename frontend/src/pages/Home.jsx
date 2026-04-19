import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import {
  Plus, Users, Clock, Trash2, ExternalLink, Search,
  LayoutGrid, AlertCircle, Sparkles, KeyRound, ArrowRight, FileText
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { motion, AnimatePresence } from 'framer-motion';
import Notepad from '../components/Notepad';
import NoteModal from '../components/NoteModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BOARD_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-950/40', accent: 'bg-blue-200 dark:bg-blue-800', dot: 'bg-blue-500' },
  { bg: 'bg-violet-50 dark:bg-violet-950/40', accent: 'bg-violet-200 dark:bg-violet-800', dot: 'bg-violet-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', accent: 'bg-emerald-200 dark:bg-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950/40', accent: 'bg-amber-200 dark:bg-amber-800', dot: 'bg-amber-500' },
  { bg: 'bg-rose-50 dark:bg-rose-950/40', accent: 'bg-rose-200 dark:bg-rose-800', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/40', accent: 'bg-cyan-200 dark:bg-cyan-800', dot: 'bg-cyan-500' },
];

function colorForCode(code) {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) & 0xffffffff;
  return BOARD_COLORS[Math.abs(h) % BOARD_COLORS.length];
}

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const BoardCardSkeleton = () => (
  <div className="bg-sk-surface border border-sk-subtle rounded-2xl overflow-hidden animate-pulse">
    <div className="h-28 skeleton-shimmer" />
    <div className="p-4 space-y-2">
      <div className="h-3.5 skeleton-shimmer rounded w-2/3" />
      <div className="h-3 skeleton-shimmer rounded w-1/3" />
      <div className="h-8 skeleton-shimmer rounded-lg w-full mt-3" />
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { activeSession, joinSession, leaveSession } = useSession();
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [creating, setCreating] = useState(false);
  const [ending, setEnding] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [noteSearch, setNoteSearch] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const token = auth.user?.access_token;
  const userProfile = auth.user?.profile;
  const userName = userProfile?.name || userProfile?.given_name || userProfile?.email?.split('@')[0] || 'there';

  useEffect(() => {
    if (!token) return;
    axios.get(`${BACKEND_URL}/api/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBoards(res.data || []))
      .catch(() => setBoards([]))
      .finally(() => setLoadingBoards(false));
  }, [token]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/sessions`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      joinSession(res.data, true);
      navigate(`/whiteboard/${res.data.code}`);
    } catch {
      setError('Failed to create board. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteBoard = async (code) => {
    setEnding(code);
    try {
      await axios.delete(`${BACKEND_URL}/api/sessions/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoards(prev => prev.filter(b => b.code !== code));
      if (activeSession?.code === code) leaveSession();
    } catch { /* already gone */ }
    finally {
      setEnding(null);
      setDeleteTarget(null);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const c = joinCode.trim().toUpperCase();
    if (c.length < 6) { setJoinError('Enter the full 6-character code.'); return; }
    setJoining(true);
    setJoinError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sessions/${c}`);
      joinSession(res.data, false);
      navigate(`/whiteboard/${c}`);
    } catch (err) {
      if (err.response?.status === 404) setJoinError('Session not found.');
      else if (err.response?.status === 410) setJoinError('Session has expired.');
      else setJoinError('Could not join. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-full p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-sk-1 tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName} 👋
          </h1>
          <p className="text-sm text-sk-2 mt-1">Here are your collaborative boards.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sk-accent text-white text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors shadow-sm disabled:opacity-60 shrink-0"
        >
          {creating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus size={16} strokeWidth={2.5} />
          )}
          New Board
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 p-3.5 bg-sk-danger/8 border border-sk-danger/20 rounded-xl mb-6 text-sk-danger text-sm"
        >
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Active session banner */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-sk-accent/8 border border-sk-accent/20 rounded-xl mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-sk-success animate-pulse" />
            <span className="text-sm font-semibold text-sk-1">
              Live session: <span className="font-mono text-sk-accent">{activeSession.code}</span>
            </span>
          </div>
          <button
            onClick={() => navigate(`/whiteboard/${activeSession.code}`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sk-accent text-white text-sm font-semibold rounded-lg hover:bg-sk-accent-hi transition-colors"
          >
            Rejoin <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boards Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid size={15} className="text-sk-accent" />
            <h2 className="text-sm font-semibold text-sk-2 uppercase tracking-wide">Your Boards</h2>
            {!loadingBoards && (
              <span className="text-xs font-bold text-sk-3 bg-sk-raised px-2 py-0.5 rounded-full">
                {boards.length}
              </span>
            )}
          </div>

          {loadingBoards ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <BoardCardSkeleton key={i} />)}
            </div>
          ) : boards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-sk-surface border border-sk-subtle border-dashed rounded-2xl"
            >
              <div className="w-14 h-14 bg-sk-raised border border-sk-subtle rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={22} className="text-sk-accent" />
              </div>
              <h3 className="text-base font-semibold text-sk-1 mb-1">No boards yet</h3>
              <p className="text-sm text-sk-2 max-w-xs">
                Create your first board to start collaborating with your team.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-sk-accent text-white text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors"
              >
                <Plus size={15} /> Create Board
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {boards.map((board, idx) => {
                  const color = colorForCode(board.code);
                  return (
                    <motion.div
                      key={board.code}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-sk-surface border border-sk-subtle rounded-2xl overflow-hidden hover:border-sk-accent/30 hover:shadow-md transition-all group"
                    >
                      {/* Colored preview */}
                      <div className={`${color.bg} h-24 p-3 flex items-end gap-1.5 relative`}>
                        <div className={`${color.accent} rounded-lg h-12 w-1/2 opacity-70`} />
                        <div className={`${color.accent} rounded-lg h-8 w-1/3 opacity-50`} />
                        {board.code === activeSession?.code && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-white/80 dark:bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-sk-success animate-pulse" />
                            <span className="text-[10px] font-bold text-sk-1">Live</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-mono font-bold text-sk-1 text-sm tracking-widest uppercase">
                            {board.code}
                          </span>
                          <span className="text-xs text-sk-3 flex items-center gap-1 shrink-0">
                            <Clock size={11} /> {timeAgo(board.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-sk-3 mb-3">
                          {board.elementCount > 0
                            ? `${board.elementCount} element${board.elementCount !== 1 ? 's' : ''}`
                            : 'Empty canvas'}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { joinSession(board, false); navigate(`/whiteboard/${board.code}`); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sk-accent text-white text-xs font-semibold rounded-lg hover:bg-sk-accent-hi transition-colors"
                          >
                            <ExternalLink size={12} /> Open Board
                          </button>
                          <button
                            onClick={() => setDeleteTarget(board.code)}
                            disabled={ending === board.code}
                            className="p-2 rounded-lg text-sk-3 hover:text-sk-danger hover:bg-sk-danger/8 border border-sk-subtle transition-colors"
                            title="Delete board"
                          >
                            {ending === board.code ? (
                              <div className="w-3.5 h-3.5 border-2 border-sk-danger/30 border-t-sk-danger rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Sidebar: Quick Join */}
        <div className="space-y-4">
          <div className="bg-sk-surface border border-sk-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={15} className="text-sk-accent" />
              <h2 className="text-sm font-semibold text-sk-2 uppercase tracking-wide">Join a Board</h2>
            </div>
            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setJoinError(null); }}
                maxLength={6}
                placeholder="Enter 6-char code"
                className="w-full px-3 py-2.5 bg-sk-input border border-sk-subtle rounded-xl text-sm text-sk-1 placeholder:text-sk-3 font-mono tracking-widest uppercase focus:border-sk-accent/40 outline-none transition-colors"
              />
              {joinError && (
                <p className="text-xs text-sk-danger flex items-center gap-1.5">
                  <AlertCircle size={12} /> {joinError}
                </p>
              )}
              <button
                type="submit"
                disabled={joining || joinCode.length < 6}
                className="w-full py-2.5 bg-sk-raised border border-sk-subtle text-sk-1 text-sm font-semibold rounded-xl hover:border-sk-accent/30 hover:bg-sk-accent/5 transition-colors disabled:opacity-40"
              >
                {joining ? 'Joining…' : 'Join Session'}
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="bg-sk-surface border border-sk-subtle rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-sk-2 uppercase tracking-wide mb-3">Overview</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-sk-2">Total boards</span>
              <span className="text-sm font-bold text-sk-1">{boards.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-sk-2">Active sessions</span>
              <span className="text-sm font-bold text-sk-success">
                {boards.filter(b => b.code === activeSession?.code).length > 0 ? '1' : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-sk-2 flex items-center gap-1.5">
                <Users size={13} /> Collaborating
              </span>
              <span className="text-sm font-bold text-sk-1">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-sk-accent" />
            <h2 className="text-sm font-semibold text-sk-2 uppercase tracking-wide">Your Notes</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sk-3" />
              <input
                type="text"
                value={noteSearch}
                onChange={e => setNoteSearch(e.target.value)}
                placeholder="Search notes…"
                className="pl-8 pr-3 py-2 text-sm bg-sk-input border border-sk-subtle rounded-xl text-sk-1 placeholder:text-sk-3 focus:border-sk-accent/40 outline-none transition-colors w-48"
              />
            </div>
            <button
              onClick={() => setNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-sk-accent text-white text-sm font-semibold rounded-xl hover:bg-sk-accent-hi transition-colors"
            >
              <Plus size={14} /> Add Note
            </button>
          </div>
        </div>
        <Notepad searchTerm={noteSearch} showFavourites={false} />
      </div>

      <NoteModal
        isOpen={noteModalOpen}
        mode="add"
        onClose={() => setNoteModalOpen(false)}
        onSave={() => setNoteModalOpen(false)}
      />

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !ending && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-sk-surface border border-sk-subtle rounded-2xl p-6 shadow-xl w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-sk-danger/10 border border-sk-danger/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-sk-danger" />
              </div>
              <h3 className="text-base font-bold text-sk-1 text-center mb-1">Delete Board?</h3>
              <p className="text-sm text-sk-2 text-center mb-1">
                Board <span className="font-mono font-bold text-sk-1">{deleteTarget}</span> will be permanently deleted.
              </p>
              <p className="text-xs text-sk-3 text-center mb-6">All collaborators will lose access immediately.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={!!ending}
                  className="flex-1 py-2.5 text-sm font-semibold text-sk-2 bg-sk-raised border border-sk-subtle rounded-xl hover:bg-sk-strong/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteBoard(deleteTarget)}
                  disabled={!!ending}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-sk-danger rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {ending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Delete Board'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
