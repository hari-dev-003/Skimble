import { useState, useEffect } from "react";
import axios from "axios";
import NoteModal from "./NoteModal";
import { Star, Calendar, ArrowUpRight, FileText, MoreVertical, Hash } from "lucide-react";
import FilterBar from "./FilterBar";
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { useAuth } from "react-oidc-context";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Notepad = ({ showFavourites, searchTerm = '', isMasonry = true }) => {
    const [data, setData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedSort, setSelectedSort] = useState("Date");
    const auth = useAuth();

    const fetchdata = async () => {
        const token = auth.user?.access_token;
        if (!token) return;

        try {
            const res = await axios.get(`${BACKEND_URL}/api/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchdata();
        }
    }, [auth.isAuthenticated]);

    useEffect(() => {
        if (!data) {
            setFilteredData([]);
            return;
        }
        let filtered = [...data];
        if (showFavourites) {
            filtered = filtered.filter(note => note.favourite);
        }
        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(note =>
                (note.title || '').toLowerCase().includes(lower) ||
                (note.content || '').toLowerCase().includes(lower)
            );
        }
        if (selectedCategory !== "All") {
            filtered = filtered.filter(note => note.category === selectedCategory);
        }
        if (selectedSort === "Date") {
            filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        } else if (selectedSort === "Alphabetical") {
            filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (selectedSort === "Priority") {
            filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        setFilteredData(filtered);
    }, [data, selectedCategory, selectedSort, showFavourites, searchTerm]);

    const handleExport = () => {
        if (!filteredData || filteredData.length === 0) return;
        const csvRows = [["Title", "Content", "Category", "Updated At"].join(",")];
        filteredData.forEach(note => {
            csvRows.push([`"${note.title || ""}"`, `"${note.content || ""}"`, `"${note.category || "General"}"`, note.updatedAt || ""].join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "skimble_export.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setModalMode("edit");
        setModalOpen(true);
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        const d = new Date(ts * 1000);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const masonryBreakpoints = {
        default: 3,
        1100: 2,
        700: 1
    };

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

            <div className="mt-10">
                <Masonry
                    breakpointCols={masonryBreakpoints}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {filteredData?.map((note) => (
                        <motion.div
                            key={note.boardId}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 group"
                            onClick={() => handleNoteClick(note)}
                        >
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-premium hover:border-cyan-400/40 group-hover:-translate-y-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-md font-black text-slate-900 tracking-tight leading-tight capitalize line-clamp-1">
                                                {note.title || 'Untitled'}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-slate-400">
                                                <Calendar size={10} />
                                                {formatDate(note.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {note.favourite && (
                                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                            <Star size={12} fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-6 mb-6 font-medium">
                                    {note.content}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-cyan-100 transition-colors">
                                        <Hash size={10} className="text-slate-400 group-hover:text-cyan-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700">
                                            {note.category || 'Note'}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-cyan-600 group-hover:bg-cyan-50 transition-all">
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </Masonry>
            </div>
        </div>
    );
}

export default Notepad;
