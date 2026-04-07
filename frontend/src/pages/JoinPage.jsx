import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const JoinPage = () => {
  const navigate = useNavigate();
  const { joinSession } = useSession();
  const [code, setCode]     = useState(['', '', '', '', '', '']);
  const [joining, setJoining] = useState(false);
  const [error, setError]   = useState(null);
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 bg-sk-raised border border-sk-subtle rounded-2xl flex items-center justify-center mx-auto mb-5">
            <KeyRound className="w-6 h-6 text-sk-accent" />
          </div>
          <h1 className="text-2xl font-bold text-sk-1 tracking-tight">Join a Session</h1>
          <p className="text-sm text-sk-2 mt-2">Enter your team's 6-character access code</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-sk-surface rounded-2xl border border-sk-subtle p-8 shadow-md"
        >
          {/* Code inputs */}
          <div className="flex gap-2 justify-center mb-8">
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
                className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none uppercase
                  ${char
                    ? 'border-sk-accent/40 bg-sk-accent/10 text-sk-accent'
                    : 'border-sk-subtle bg-sk-input text-sk-1 focus:border-sk-accent/30 focus:bg-sk-accent/5'
                  }`}
              />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3.5 bg-sk-danger/8 border border-sk-danger/20 rounded-xl mb-6 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-sk-danger flex-shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-sk-danger">{error}</span>
            </motion.div>
          )}

          <button
            onClick={handleJoin}
            disabled={joining || codeString.length < 6}
            className="shimmer-btn group w-full flex items-center justify-center gap-2.5 py-3.5 bg-sk-accent text-sk-base text-sm font-semibold rounded-xl transition-all hover:bg-sk-accent-hi disabled:opacity-40 disabled:bg-sk-raised disabled:text-sk-2 disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {joining ? (
              <div className="w-5 h-5 border-2 border-sk-base/30 border-t-sk-base rounded-full animate-spin" />
            ) : (
              <>
                <span>Join Session</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </>
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-sk-subtle flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sk-success" />
            <span className="text-[11px] font-medium text-sk-3">End-to-end encrypted session</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinPage;
