import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
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
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && codeString.length === 6) {
      handleJoin();
    }
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
    if (codeString.length < 6) {
      setError('Please enter the full 6-character session code.');
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sessions/${codeString}`);
      joinSession(res.data, false);
      navigate(`/whiteboard/${codeString}`);
    } catch (err) {
      if (err.response?.status === 404) setError('Session not found. Check the code and try again.');
      else if (err.response?.status === 410) setError('This session has expired.');
      else setError('Failed to join session. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
            <KeyRound className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-[700] text-slate-900 tracking-tighter">Access Workspace</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Enter your team's unique 6-character session code</p>
        </motion.div>

        {/* Code input */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20" />
          
          <div className="flex gap-2 justify-center mb-10">
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
                className={`w-12 h-16 text-center text-2xl font-black border-2 rounded-2xl transition-all duration-300 focus:outline-none uppercase tracking-tighter
                  ${char
                    ? 'border-cyan-500 bg-cyan-50/30 text-cyan-700 shadow-inner'
                    : 'border-slate-100 bg-slate-50 text-slate-900 focus:border-cyan-400 focus:bg-white focus:shadow-lg focus:shadow-cyan-100'
                  }`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl mb-6 text-red-700 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-bold">{error}</span>
            </motion.div>
          )}

          <button
            onClick={handleJoin}
            disabled={joining || codeString.length < 6}
            className="shimmer-btn group w-full flex items-center justify-center gap-3 py-5 bg-[#0f172a] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 hover:scale-105 active:scale-[0.95] disabled:opacity-50 disabled:bg-slate-200 disabled:scale-100 z-10"
          >
            {joining ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Join</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </>
            )}
          </button>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Access Only</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinPage;
