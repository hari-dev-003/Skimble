import { useState, useEffect } from "react";
import axios from "axios";
import AddNote from "../components/AddNote";
import Notepad from "../components/Notepad";
import { Search, Star, Sparkles, LayoutGrid, Clock, ChevronDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "react-oidc-context";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const token = auth.user?.access_token;
    if (!token) return;

    axios.get(`${BACKEND_URL}/api/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setNotes(response.data);
        setIsLoaded(true);
      })
      .catch(error => {
        console.error("Error fetching notes:", error);
        setIsLoaded(true);
      });
  }, [auth.user]);

  return (
    <div className="min-h-full flex flex-col relative bg-slate-50">
      {/* Royal Arctic Header */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-4 sm:py-6">
        <div className="glass-panel rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-premium border-white/40 gap-4">
          <div className="flex items-center gap-4 sm:gap-8 flex-1">
            <div className="hidden sm:flex items-center gap-2 text-slate-900 font-bold border-r border-slate-200 pr-6 mr-2">
              <LayoutGrid size={18} className="text-cyan-600" />
              <span className="text-sm tracking-tight font-black uppercase">Workspace</span>
            </div>

            <div className="relative group max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-transparent focus:border-cyan-200 focus:bg-white rounded-xl text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setShowFavourites(!showFavourites)}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all
                ${showFavourites
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              <Star size={14} className={showFavourites ? 'fill-white' : ''} />
              <span className="hidden sm:inline">Favorites</span>
            </button>
            
            <div className="hidden xs:flex flex-col items-end min-w-[60px] sm:min-w-[80px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity size={10} className="sm:w-3 sm:h-3" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-800">{notes.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 px-4 sm:px-8 pt-2">
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-premium relative group">
                <Sparkles className="w-10 h-10 text-cyan-500 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-cyan-500/5 rounded-[2rem] animate-ping" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Ready for your ideas</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium">Create your first note to start organizing your digital workspace.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
              <Notepad showFavourites={showFavourites} searchTerm={search} isMasonry={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AddNote />
    </div>
  );
};

export default Home;
