import { Star, StarOff, Pencil, X, Trash2, Check, ArrowRight, CornerDownRight } from "lucide-react";
import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const NoteModal = ({ isOpen, onClose, note, mode = "add", onSave }) => {
    const [title, setTitle] = useState(note?.title || "");
    const [content, setContent] = useState(note?.content || "");
    const [category, setCategory] = useState(note?.category || "General");
    const [favourite, setFavourite] = useState(note?.favourite || false);
    const [isSaving, setIsSaving] = useState(false);
    const auth = useAuth();

    const categories = ["Work", "Personal", "Urgent", "Completed", "General"];

    useEffect(() => {
        if (isOpen) {
            setTitle(note?.title || "");
            setContent(note?.content || "");
            setCategory(note?.category || "General");
            setFavourite(note?.favourite || false);
        }
    }, [note, isOpen]);

    const handleSave = async () => {
        const token = auth.user?.access_token;
        if (!token) return;
        
        setIsSaving(true);
        const payload = { title, content, favourite, category };
        try {
            if (mode === "edit" && note?.boardId) {
                await axios.put(`${BACKEND_URL}/api/details/${note.boardId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${BACKEND_URL}/api/details`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        const token = auth.user?.access_token;
        if (!token || !note?.boardId) return;

        try {
            await axios.delete(`${BACKEND_URL}/api/details/${note.boardId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onSave) onSave();
            onClose();
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-premium overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Pencil size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
                                        {mode === "edit" ? "Refine Note" : "New Thought"}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                        <CornerDownRight size={10} /> Workspace / Notes
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFavourite(!favourite)}
                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center
                                        ${favourite 
                                            ? 'bg-amber-100 text-amber-500 shadow-inner' 
                                            : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Star size={20} fill={favourite ? "currentColor" : "none"} />
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-4 space-y-6">
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Give it a title..."
                                className="w-full text-3xl font-black text-slate-800 placeholder:text-slate-200 outline-none border-none p-0 focus:ring-0"
                            />

                            {/* Category Selector */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border
                                            ${category === cat 
                                                ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-100' 
                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Let your ideas flow here..."
                                className="w-full h-64 text-lg text-slate-600 placeholder:text-slate-300 outline-none border-none p-0 focus:ring-0 resize-none leading-relaxed"
                            />
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                {mode === "edit" && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete Note
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-800 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !title || !content}
                                    className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-indigo-500/20 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {mode === "edit" ? "Save Changes" : "Create Note"}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NoteModal;
