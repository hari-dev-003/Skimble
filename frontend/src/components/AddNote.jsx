import { Plus, Sparkles, PenLine } from "lucide-react";
import NoteModal from "./NoteModal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AddNote = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <NoteModal
                isOpen={isModalOpen}
                onSave={() => window.location.reload()} // Quick way to refresh dashboard
                onClose={() => setIsModalOpen(false)}
            />

            <motion.div 
                className="fixed bottom-10 right-10 z-50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ y: -4 }}
            >
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative flex items-center gap-3 h-14 pl-5 pr-7 bg-[#0f172a] text-white rounded-2xl shadow-premium border border-white/10 overflow-hidden transition-all duration-500"
                >
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-cyan-500 rounded-xl text-[#0f172a] group-hover:scale-110 transition-transform">
                        <Plus size={20} strokeWidth={3} />
                    </div>
                    
                    <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em]">
                        New Note
                    </span>
                </button>
            </motion.div>
        </>
    );
}

export default AddNote;
