import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const STORAGE_KEY = 'skimble_active_session';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  // true while we're checking localStorage + validating with the backend on first load
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setRestoring(false);
        return;
      }
      try {
        const saved = JSON.parse(stored);
        if (!saved?.code) throw new Error('invalid');
        // Validate the session still exists and hasn't expired
        const res = await axios.get(`${BACKEND_URL}/api/sessions/${saved.code}`);
        // Merge fresh data from server with the saved isHost flag
        setActiveSession({ ...res.data, isHost: saved.isHost });
      } catch {
        // Session expired, deleted, or corrupt — clear storage
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setRestoring(false);
      }
    };
    restore();
  }, []);

  const joinSession = useCallback((sessionData, isHost = false) => {
    const session = { ...sessionData, isHost };
    setActiveSession(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const leaveSession = useCallback(() => {
    setActiveSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SessionContext.Provider value={{ activeSession, joinSession, leaveSession, restoring }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
