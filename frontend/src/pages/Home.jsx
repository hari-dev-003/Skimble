import { useState, useEffect } from "react";
import axios from "axios";
import AddNote from "../components/AddNote";
import Notepad from "../components/Notepad";
import { PenTool, Search, Star } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/details`)
      .then(response => setNotes(response.data))
      .catch(error => console.error("Error fetching notes:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar: search + favourites filter */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes, tags…"
              className="pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white transition-all w-64"
            />
          </div>
          <button
            onClick={() => setShowFavourites(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200
              ${showFavourites
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
          >
            <Star className={`w-4 h-4 ${showFavourites ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            Favourites
          </button>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4">
        {notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <PenTool className="w-20 h-20 text-gray-300 mx-auto animate-bounce" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full animate-ping" />
            </div>
            <h2 className="text-3xl font-bold text-gray-600 mb-2">No notes yet</h2>
            <p className="text-gray-500 mb-8">Create your first note to get started!</p>
          </div>
        ) : (
          <Notepad showFavourites={showFavourites} searchTerm={search} />
        )}
      </main>

      <AddNote />
    </div>
  );
};

export default Home;
