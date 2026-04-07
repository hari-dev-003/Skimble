import { Plus } from "lucide-react";
import NoteModal from "./NoteModal";
import { useState } from "react";
import { motion } from "framer-motion";

const AddNote = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <NoteModal
        isOpen={isModalOpen}
        onSave={() => window.location.reload()}
        onClose={() => setIsModalOpen(false)}
      />

      <motion.button
        className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-sk-accent rounded-full flex items-center justify-center text-sk-base"
        style={{ boxShadow: '0 4px 20px rgba(6,182,212,0.35)' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        aria-label="New note"
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>
    </>
  );
};

export default AddNote;
