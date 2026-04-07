import { Star, Pencil, X, Trash2, ArrowRight, CornerDownRight } from "lucide-react";
import { useAuth } from "react-oidc-context";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const NoteModal = ({ isOpen, onClose, note, mode = "add", onSave }) => {
  const [title, setTitle]         = useState(note?.title    || "");
  const [content, setContent]     = useState(note?.content  || "");
  const [category, setCategory]   = useState(note?.category || "General");
  const [favourite, setFavourite] = useState(note?.favourite || false);
  const [isSaving, setIsSaving]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const auth = useAuth();

  const categories = ["Work", "Personal", "Urgent", "Completed", "General"];

  useEffect(() => {
    if (isOpen) {
      setTitle(note?.title    || "");
      setContent(note?.content  || "");
      setCategory(note?.category || "General");
      setFavourite(note?.favourite || false);
      setConfirmDelete(false);
    }
  }, [note, isOpen]);

  const handleSave = async () => {
    const token = auth.user?.access_token;
    if (!token) return;
    setIsSaving(true);
    try {
      const payload = { title, content, favourite, category };
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
    } catch (error) { console.error("Error saving note:", error); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    const token = auth.user?.access_token;
    if (!token || !note?.boardId) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/details/${note.boardId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onSave) onSave();
      onClose();
    } catch (error) { console.error("Error deleting note:", error); }
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
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'var(--sk-backdrop)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className="relative w-full max-w-2xl bg-sk-raised rounded-2xl border border-sk-subtle overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sk-accent/12 border border-sk-accent/25 flex items-center justify-center text-sk-accent shrink-0">
                  <Pencil size={17} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-sk-1 tracking-tight">
                    {mode === "edit" ? "Edit Note" : "New Note"}
                  </h2>
                  <p className="text-[11px] font-medium text-sk-3 mt-0.5 flex items-center gap-1">
                    <CornerDownRight size={9} /> Workspace / Notes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFavourite(!favourite)}
                  className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center
                    ${favourite
                      ? 'bg-amber-500/12 border border-amber-500/25 text-amber-500'
                      : 'bg-sk-surface border border-sk-subtle text-sk-3 hover:text-sk-2 hover:border-sk-strong'
                    }`}
                >
                  <Star size={15} fill={favourite ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg bg-sk-surface border border-sk-subtle text-sk-3 hover:text-sk-1 hover:border-sk-strong transition-all flex items-center justify-center"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-2 space-y-4">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note title…"
                className="w-full text-2xl font-semibold text-sk-1 placeholder:text-sk-3 bg-transparent outline-none border-none"
              />

              {/* Categories */}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border
                      ${category === cat
                        ? 'bg-sk-accent/12 text-sk-accent border-sk-accent/25'
                        : 'bg-sk-surface text-sk-3 border-sk-subtle hover:border-sk-strong hover:text-sk-2'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Let your ideas flow…"
                className="w-full h-52 text-[15px] text-sk-2 placeholder:text-sk-3 bg-transparent outline-none border-none resize-none leading-relaxed"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-sk-surface border-t border-sk-subtle flex items-center justify-between">
              <div className="min-h-[32px] flex items-center">
                {mode === "edit" && (
                  <AnimatePresence mode="wait">
                    {confirmDelete ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-sk-3">Are you sure?</span>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sk-danger bg-sk-danger/8 border border-sk-danger/20 rounded-lg hover:bg-sk-danger/15 transition-all"
                        >
                          <Trash2 size={11} /> Yes, delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-2 py-1.5 text-xs font-medium text-sk-3 hover:text-sk-1 transition-colors"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="delete"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sk-3 hover:text-sk-danger hover:bg-sk-danger/8 rounded-lg transition-all"
                      >
                        <Trash2 size={12} /> Delete
                      </motion.button>
                    )}
                  </AnimatePresence>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-sk-3 hover:text-sk-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title || !content}
                  className="flex items-center gap-2 px-6 py-2 bg-sk-accent text-sk-base rounded-xl text-sm font-semibold hover:bg-sk-accent-hi disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-sk-base/30 border-t-sk-base rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "edit" ? "Save Changes" : "Create Note"}
                      <ArrowRight size={14} />
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
