import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import WhiteboardCanvas from '../components/whiteboard/WhiteboardCanvas';
import WhiteboardToolbar from '../components/whiteboard/WhiteboardToolbar';
import SessionHeader from '../components/whiteboard/SessionHeader';
import { useWhiteboardSocket } from '../hooks/useWhiteboardSocket';
import { useSession } from '../context/SessionContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const DEFAULT_TOOL_PROPS = {
  fill: '#ffffff',
  stroke: '#1a1a1a',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 18,
};

const Whiteboard = () => {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { activeSession, leaveSession } = useSession();

  const [elements, setElements] = useState([]);
  const [tool, setTool] = useState('select');
  const [toolProps, setToolProps] = useState(DEFAULT_TOOL_PROPS);
  const [participants, setParticipants] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Undo/redo history
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const userId = auth.user?.profile?.sub || auth.user?.profile?.email || 'anon';
  const userProfile = auth.user?.profile;
  const userDisplayName = userProfile?.name || userProfile?.given_name || userProfile?.preferred_username || userProfile?.['cognito:username'] || userProfile?.email || 'You';
  const token = auth.user?.access_token;
  const code = sessionCode?.toUpperCase();

  // Load session data from backend on mount
  useEffect(() => {
    if (!code) return;
    const load = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/sessions/${code}`);
        const data = res.data;
        setSessionInfo(data);
        const initialEls = data.canvasElements || [];
        setElements(initialEls);
        setHistory([initialEls]);
        setHistoryIndex(0);
      } catch (err) {
        if (err.response?.status === 404) setError('Session not found. The code may be incorrect or expired.');
        else if (err.response?.status === 410) setError('This session has expired.');
        else setError('Failed to load session. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  // Socket callbacks
  const handleSessionSynced = useCallback(({ elements: remoteEls, participants: remoteParticipants }) => {
    setElements(remoteEls || []);
    // Ensure we don't include the local user twice in the participants list
    const filteredParticipants = (remoteParticipants || []).map(p => ({
      userId: p.userId,
      name: p.name || p.displayName || p.email || p.userEmail || 'User'
    })).filter(p => p.userId !== userId);
    
    // Add the local user with their current display name
    setParticipants([{ userId, name: userDisplayName }, ...filteredParticipants]);
  }, [userId, userDisplayName]);

  const handleElementUpserted = useCallback((element) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === element.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = element;
        return updated;
      }
      return [...prev, element];
    });
  }, []);

  const handleElementDeleted = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
  }, []);

  const handleCursorMoved = useCallback((data) => {
    const { userId: uid, x, y } = data;
    const name = data.name || data.displayName || data.email || data.userEmail || 'User';
    setRemoteCursors(prev => ({
      ...prev,
      [uid]: { x, y, name },
    }));
  }, []);

  const handleParticipantJoined = useCallback((data) => {
    const { userId: uid } = data;
    const name = data.name || data.displayName || data.email || data.userEmail || 'User';
    if (uid === userId) return; // Don't add local user twice
    setParticipants(prev => {
      if (prev.find(p => p.userId === uid)) {
        // Update name if already exists
        return prev.map(p => p.userId === uid ? { ...p, name } : p);
      }
      return [...prev, { userId: uid, name }];
    });
  }, [userId]);

  const handleParticipantLeft = useCallback(({ userId: uid }) => {
    setParticipants(prev => prev.filter(p => p.userId !== uid));
    setRemoteCursors(prev => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  }, []);

  const { connected, emitElementUpsert, emitElementDelete, emitCursorMove } = useWhiteboardSocket({
    sessionCode: code,
    token,
    displayName: userDisplayName,
    initialElements: elements,
    onSessionSynced: handleSessionSynced,
    onElementUpserted: handleElementUpserted,
    onElementDeleted: handleElementDeleted,
    onCursorMoved: handleCursorMoved,
    onParticipantJoined: handleParticipantJoined,
    onParticipantLeft: handleParticipantLeft,
  });

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const prevEls = history[newIndex];
    setHistoryIndex(newIndex);
    setElements(prevEls);
    // Emit full diff would be complex; for simplicity re-sync via socket not implemented
    // (local undo works; remote undo is out of scope for MVP)
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const nextEls = history[newIndex];
    setHistoryIndex(newIndex);
    setElements(nextEls);
  }, [historyIndex, history]);

  // Clear all
  const handleClearAll = useCallback(() => {
    if (!window.confirm('Clear the entire canvas? This affects all collaborators.')) return;
    const deletedIds = elements.map(el => el.id);
    setElements([]);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), []]);
    setHistoryIndex(h => h + 1);
    deletedIds.forEach(id => emitElementDelete(id));
  }, [elements, historyIndex, emitElementDelete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); handleRedo(); }
      const keyMap = { v: 'select', r: 'rect', c: 'circle', l: 'line', a: 'arrow', t: 'text', p: 'pen', e: 'eraser' };
      if (keyMap[e.key] && !e.ctrlKey && !e.metaKey) setTool(keyMap[e.key]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleUndo, handleRedo]);

  const handleLeave = () => {
    leaveSession();
    navigate('/brainstorm');
  };

  const handleEndSession = async () => {
    if (!window.confirm('End this session for all participants?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/sessions/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // proceed even if delete fails
    }
    leaveSession();
    navigate('/brainstorm');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading session…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Session Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/join')}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Try Another Code
          </button>
        </div>
      </div>
    );
  }

  const isHost = sessionInfo?.hostUserId === userId;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SessionHeader
        sessionCode={code}
        participants={participants}
        connected={connected}
        isHost={isHost}
        onLeave={handleLeave}
        onEndSession={handleEndSession}
        currentUserId={userId}
      />
      <div className="flex-1 relative flex overflow-hidden">
        <WhiteboardToolbar
          tool={tool}
          setTool={setTool}
          toolProps={toolProps}
          setToolProps={setToolProps}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearAll={handleClearAll}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
        <WhiteboardCanvas
          elements={elements}
          setElements={setElements}
          tool={tool}
          toolProps={toolProps}
          onElementChange={emitElementUpsert}
          onElementDelete={emitElementDelete}
          remoteCursors={remoteCursors}
          userId={userId}
          userEmail={userDisplayName}
          onCursorMove={emitCursorMove}
          history={history}
          setHistory={setHistory}
          historyIndex={historyIndex}
          setHistoryIndex={setHistoryIndex}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
