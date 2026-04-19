import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
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

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

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

  // Zoom
  const [zoom, setZoom] = useState(1);

  // Undo / Redo
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const userId = auth.user?.profile?.sub || auth.user?.profile?.email || 'anon';
  const userProfile = auth.user?.profile;
  const userDisplayName =
    userProfile?.name || userProfile?.given_name ||
    userProfile?.preferred_username || userProfile?.['cognito:username'] ||
    userProfile?.email || 'You';
  const token = auth.user?.access_token;
  const code = sessionCode?.toUpperCase();

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
        else setError('Failed to load session. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  const handleSessionSynced = useCallback(({ elements: remoteEls, participants: remoteParticipants }) => {
    setElements(remoteEls || []);
    const filtered = (remoteParticipants || [])
      .map(p => ({ userId: p.userId, name: p.name || p.displayName || p.email || 'User' }))
      .filter(p => p.userId !== userId);
    setParticipants([{ userId, name: userDisplayName }, ...filtered]);
  }, [userId, userDisplayName]);

  const handleElementUpserted = useCallback((element) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === element.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = element; return u; }
      return [...prev, element];
    });
  }, []);

  const handleElementDeleted = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
  }, []);

  const handleCursorMoved = useCallback((data) => {
    const { userId: uid, x, y } = data;
    const name = data.name || data.displayName || data.email || 'User';
    setRemoteCursors(prev => ({ ...prev, [uid]: { x, y, name } }));
  }, []);

  const handleParticipantJoined = useCallback((data) => {
    const { userId: uid } = data;
    const name = data.name || data.displayName || data.email || 'User';
    if (uid === userId) return;
    setParticipants(prev => {
      if (prev.find(p => p.userId === uid)) return prev.map(p => p.userId === uid ? { ...p, name } : p);
      return [...prev, { userId: uid, name }];
    });
  }, [userId]);

  const handleParticipantLeft = useCallback(({ userId: uid }) => {
    setParticipants(prev => prev.filter(p => p.userId !== uid));
    setRemoteCursors(prev => { const n = { ...prev }; delete n[uid]; return n; });
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

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setElements(history[newIndex]);
  }, [historyIndex, history]);

  const handleClearAll = useCallback(() => {
    if (!window.confirm('Clear the entire canvas? This affects all collaborators.')) return;
    const deletedIds = elements.map(el => el.id);
    setElements([]);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), []]);
    setHistoryIndex(h => h + 1);
    deletedIds.forEach(id => emitElementDelete(id));
  }, [elements, historyIndex, emitElementDelete]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); handleRedo(); }
      const keyMap = { v: 'select', h: 'hand', r: 'rect', c: 'circle', l: 'line', a: 'arrow', t: 'text', p: 'pen', e: 'eraser', s: 'sticky' };
      if (keyMap[e.key] && !e.ctrlKey && !e.metaKey) setTool(keyMap[e.key]);
      if (e.key === '=' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(z => Math.min(z + 0.25, 3)); }
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(z => Math.max(z - 0.25, 0.25)); }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleUndo, handleRedo]);

  const handleLeave = () => { leaveSession(); navigate('/'); };

  const handleEndSession = async () => {
    if (!window.confirm('End this session for all participants?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/sessions/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* proceed */ }
    leaveSession();
    navigate('/');
  };

  const zoomPercent = Math.round(zoom * 100);
  const zoomIn  = () => setZoom(z => Math.min(ZOOM_LEVELS.find(l => l > z) || 3, 3));
  const zoomOut = () => setZoom(z => Math.max([...ZOOM_LEVELS].reverse().find(l => l < z) || 0.25, 0.25));
  const zoomReset = () => setZoom(1);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-sk-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sk-accent/20 border-t-sk-accent rounded-full animate-spin" />
          <p className="text-sk-3 text-sm">Loading session…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-8 bg-sk-base">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-sk-danger/10 border border-sk-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-sk-1 mb-2">Session Error</h2>
          <p className="text-sk-2 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate('/join')}
            className="px-6 py-2.5 bg-sk-accent text-white rounded-xl text-sm font-semibold hover:bg-sk-accent-hi transition-colors"
          >
            Try Another Code
          </button>
        </div>
      </div>
    );
  }

  const isHost = sessionInfo?.hostUserId === userId;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sk-base">
      {/* Top bar — replaces Navbar for whiteboard pages */}
      <SessionHeader
        sessionCode={code}
        participants={participants}
        connected={connected}
        isHost={isHost}
        onLeave={handleLeave}
        onEndSession={handleEndSession}
        currentUserId={userId}
      />

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden flex">
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
          zoom={zoom}
          setZoom={setZoom}
        />

        {/* Zoom controls — bottom right */}
        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1 bg-sk-surface border border-sk-subtle rounded-xl shadow-md px-2 py-1.5">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.25}
            title="Zoom out (Ctrl -)"
            className="w-7 h-7 flex items-center justify-center text-sk-3 hover:text-sk-1 hover:bg-sk-raised rounded-lg disabled:opacity-30 transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={zoomReset}
            title="Reset zoom (Ctrl 0)"
            className="px-2 py-1 text-xs font-bold text-sk-2 hover:text-sk-1 hover:bg-sk-raised rounded-lg transition-colors tabular-nums min-w-[46px] text-center"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= 3}
            title="Zoom in (Ctrl +)"
            className="w-7 h-7 flex items-center justify-center text-sk-3 hover:text-sk-1 hover:bg-sk-raised rounded-lg disabled:opacity-30 transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-4 bg-sk-subtle mx-0.5" />
          <button
            onClick={zoomReset}
            title="Fit to screen"
            className="w-7 h-7 flex items-center justify-center text-sk-3 hover:text-sk-1 hover:bg-sk-raised rounded-lg transition-colors"
          >
            <Maximize size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
