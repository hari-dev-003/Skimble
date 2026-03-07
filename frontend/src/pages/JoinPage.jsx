import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { useSession } from '../context/SessionContext';

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
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Brainstorm Session</h1>
          <p className="text-gray-500 text-sm">Enter the 6-character code shared by the session host</p>
        </div>

        {/* Code input */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">
            Session Code
          </label>

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
                className={`w-12 h-14 text-center text-xl font-mono font-bold border-2 rounded-xl transition-all duration-150 focus:outline-none
                  ${char
                    ? 'border-purple-400 bg-purple-50 text-purple-800'
                    : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-purple-400 focus:bg-purple-50'
                  }`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={joining || codeString.length < 6}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {joining ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Joining…
              </>
            ) : (
              <>
                Join Session
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Ask your team host for the session code
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
