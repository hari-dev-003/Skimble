import { useState, useEffect } from "react";
import axios from "axios";
import NoteModal from "./NoteModal";
import { Star, Calendar, ArrowUpRight, FileText, Hash } from "lucide-react";
import FilterBar from "./FilterBar";
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { useAuth } from "react-oidc-context";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const CATEGORY_STYLES = {
  Work:      { bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.22)', color: '#818CF8' },
  Personal:  { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.22)', color: '#34D399' },
  Urgent:    { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.22)',  color: '#F87171' },
  Completed: { bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.22)', color: '#9CA3AF' },
  General:   { bg: 'rgba(6,182,212,0.10)',   border: 'rgba(6,182,212,0.22)', color: '#22D3EE' },
};
const getCatStyle = (cat) => CATEGORY_STYLES[cat] || CATEGORY_STYLES.General;

const Notepad = ({ showFavourites, searchTerm = '' }) => {
  const [data, setData]               = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalMode, setModalMode]     = useState("add");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort]         = useState("Date");
  const auth = useAuth();

  const fetchdata = async () => {
    const token = auth.user?.access_token;
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) { console.error("Error fetching data:", err); }
  };

  useEffect(() => { if (auth.isAuthenticated) fetchdata(); }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!data) { setFilteredData([]); return; }
    let filtered = [...data];
    if (showFavourites) filtered = filtered.filter(n => n.favourite);
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        (n.title || '').toLowerCase().includes(lower) ||
        (n.content || '').toLowerCase().includes(lower)
      );
    }
    if (selectedCategory !== "All") filtered = filtered.filter(n => n.category === selectedCategory);
    if (selectedSort === "Date")          filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    else if (selectedSort === "Alphabetical") filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (selectedSort === "Priority")     filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    setFilteredData(filtered);
  }, [data, selectedCategory, selectedSort, showFavourites, searchTerm]);

  const handleExport = () => {
    if (!filteredData?.length) return;
    const csvRows = [["Title", "Content", "Category", "Updated At"].join(",")];
    filteredData.forEach(n => {
      csvRows.push([`"${n.title || ""}"`, `"${n.content || ""}"`, `"${n.category || "General"}"`, n.updatedAt || ""].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "skimble_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note); setModalMode("edit"); setModalOpen(true);
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const masonryBreakpoints = { default: 3, 1100: 2, 700: 1 };

  return (
    <div className="w-full">
      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        note={selectedNote}
        mode={modalMode}
        onSave={fetchdata}
      />
      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        onExport={handleExport}
      />

      <div className="mt-8">
        <Masonry
          breakpointCols={masonryBreakpoints}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filteredData?.map((note, index) => {
            const cat = getCatStyle(note.category);
            return (
              <motion.div
                key={note.boardId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.22 }}
                className="mb-6 group cursor-pointer"
                onClick={() => handleNoteClick(note)}
              >
                <div className="bg-sk-surface border border-sk-subtle rounded-2xl p-5 sk-card relative flex flex-col">
                  {/* Favorite star */}
                  {note.favourite && (
                    <Star size={12} className="absolute top-4 right-4 text-amber-400 fill-amber-400" />
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3 pr-5">
                    <div className="w-8 h-8 rounded-xl bg-sk-raised border border-sk-subtle flex items-center justify-center text-sk-3 group-hover:border-sk-accent/20 group-hover:text-sk-accent transition-all shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-sk-1 tracking-tight leading-snug line-clamp-1">
                        {note.title || 'Untitled'}
                      </h2>
                      <div className="flex items-center gap-1 mt-1 text-sk-3">
                        <Calendar size={9} />
                        <span className="text-[11px] font-medium">{formatDate(note.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sk-2 text-[13px] leading-relaxed line-clamp-5 mb-4 flex-1">
                    {note.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }}
                    >
                      <Hash size={8} />
                      {note.category || 'General'}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <ArrowUpRight size={14} className="text-sk-accent" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </Masonry>
      </div>
    </div>
  );
};

export default Notepad;
