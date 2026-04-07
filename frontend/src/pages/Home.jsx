import { useState, useEffect } from "react";
import axios from "axios";
import AddNote from "../components/AddNote";
import Notepad from "../components/Notepad";
import { Search, Star, Sparkles, LayoutGrid, Activity } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "react-oidc-context";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const SkeletonCard = () => (
  <div className="mb-6 bg-sk-surface border border-sk-subtle rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded-lg skeleton-shimmer w-3/5" />
        <div className="h-2.5 rounded skeleton-shimmer w-1/4" />
      </div>
    </div>
    <div className="space-y-2 mb-5">
      <div className="h-2.5 rounded skeleton-shimmer w-full" />
      <div className="h-2.5 rounded skeleton-shimmer w-full" />
      <div className="h-2.5 rounded skeleton-shimmer w-4/5" />
      <div className="h-2.5 rounded skeleton-shimmer w-3/5" />
    </div>
    <div className="h-5 rounded-lg skeleton-shimmer w-1/4" />
  </div>
);

const Home = () => {
  const [notes, setNotes]           = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [search, setSearch]         = useState('');
  const [isLoaded, setIsLoaded]     = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const token = auth.user?.access_token;
    if (!token) return;
    axios.get(`${BACKEND_URL}/api/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setNotes(res.data); setIsLoaded(true); })
      .catch(() => setIsLoaded(true));
  }, [auth.user]);

  return (
    <div className="min-h-full flex flex-col relative bg-sk-base">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div
          className="rounded-xl px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4 border border-sk-subtle"
          style={{ background: 'var(--sk-blur-bg)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 border-r border-sk-subtle pr-5 mr-1 shrink-0">
              <LayoutGrid size={15} className="text-sk-accent" />
              <span className="text-xs font-semibold text-sk-2 tracking-wide">Workspace</span>
            </div>

            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sk-3 w-3.5 h-3.5 group-focus-within:text-sk-accent transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="w-full pl-9 pr-4 py-2 bg-sk-input border border-sk-subtle focus:border-sk-accent/30 rounded-lg text-sm text-sk-1 placeholder:text-sk-3 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowFavourites(!showFavourites)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${showFavourites
                  ? 'bg-sk-accent/12 text-sk-accent border border-sk-accent/25'
                  : 'bg-sk-raised text-sk-2 border border-sk-subtle hover:text-sk-1 hover:border-sk-strong'
                }`}
            >
              <Star size={12} className={showFavourites ? 'fill-current' : ''} />
              <span className="hidden sm:inline">Favorites</span>
            </button>

            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1 text-sk-3">
                <Activity size={9} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Notes</span>
              </div>
              <span className="text-sm font-bold text-sk-1 leading-none">{notes.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 pt-3">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-16 h-16 bg-sk-raised border border-sk-subtle rounded-2xl flex items-center justify-center mb-6"
                style={{ boxShadow: '0 0 32px rgba(6,182,212,0.08)' }}>
                <Sparkles className="w-8 h-8 text-sk-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-sk-1 mb-2 tracking-tight">Ready for your ideas</h2>
              <p className="text-sm text-sk-2 max-w-xs mx-auto leading-relaxed">
                Create your first note to start organizing your digital workspace.
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
              <Notepad showFavourites={showFavourites} searchTerm={search} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AddNote />
    </div>
  );
};

export default Home;
