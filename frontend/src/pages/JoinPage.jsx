import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ArrowRight, Users } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const JoinPage = () => {
  const navigate = useNavigate();
  const { joinSession } = useSession();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);

  const codeString = code.join('').toUpperCase();

  const handleDigitChange = (index, value) => {
    const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError(null);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter' && codeString.length === 6) handleJoin();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) newCode[i] = pasted[i] || '';
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleJoin = async () => {
    if (codeString.length < 6) { setError('Please enter the full 6-character session code.'); return; }
    setJoining(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sessions/${codeString}`);
      joinSession(res.data, false);
      navigate(`/whiteboard/${codeString}`);
    } catch (err) {
      if (err.response?.status === 404)      setError('Session not found. Check the code and try again.');
      else if (err.response?.status === 410) setError('This session has expired.');
      else setError('Failed to join session. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-sk-base">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 bg-sk-accent/10 border border-sk-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={22} className="text-sk-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sk-1 tracking-tight">Join a Board</h1>
          <p className="text-sm text-sk-2 mt-2">Enter the 6-character session code from your host</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sk-surface rounded-2xl border border-sk-subtle p-7 shadow-sm"
        >
          {/* Code Inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {code.map((char, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                type="text"
                maxLength={1}
                value={char}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoFocus={i === 0}
                className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl transition-all duration-150 focus:outline-none uppercase font-mono
                  ${char
                    ? 'border-sk-accent/40 bg-sk-accent/8 text-sk-accent'
                    : 'border-sk-subtle bg-sk-input text-sk-1 focus:border-sk-accent/30 focus:bg-sk-accent/5'
                  }`}
                style={{ height: '52px' }}
              />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3.5 bg-sk-danger/8 border border-sk-danger/20 rounded-xl mb-5"
            >
              <AlertCircle size={14} className="text-sk-danger shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-sk-danger">{error}</span>
            </motion.div>
          )}

          <button
            onClick={handleJoin}
            disabled={joining || codeString.length < 6}
            className="group w-full flex items-center justify-center gap-2.5 py-3.5 bg-sk-accent text-white text-sm font-semibold rounded-xl transition-all hover:bg-sk-accent-hi disabled:opacity-40 disabled:bg-sk-raised disabled:text-sk-2 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {joining ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Join Session</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </>
            )}
          </button>

          <div className="mt-5 pt-5 border-t border-sk-subtle flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sk-success" />
            <span className="text-[11px] font-medium text-sk-3">End-to-end encrypted session</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinPage;
