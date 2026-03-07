import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Throttle helper
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

export function useWhiteboardSocket({ sessionCode, token, displayName, initialElements, onElementUpserted, onElementDeleted, onCursorMoved, onParticipantJoined, onParticipantLeft, onSessionSynced }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionCode) return;

    const socket = io(BACKEND_URL, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-session', {
        sessionCode: sessionCode.toUpperCase(),
        initialElements: initialElements || [],
        name: displayName,
      });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('session-synced', (data) => {
      onSessionSynced?.(data);
    });

    socket.on('element-upserted', ({ element }) => {
      onElementUpserted?.(element);
    });

    socket.on('element-deleted', ({ elementId }) => {
      onElementDeleted?.(elementId);
    });

    socket.on('cursor-moved', (data) => {
      onCursorMoved?.(data);
    });

    socket.on('participant-joined', (data) => {
      onParticipantJoined?.(data);
    });

    socket.on('participant-left', (data) => {
      onParticipantLeft?.(data);
    });

    return () => {
      socket.emit('leave-session', { sessionCode: sessionCode.toUpperCase() });
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode]);

  const emitElementUpsert = useCallback((element) => {
    socketRef.current?.emit('element-upsert', {
      sessionCode: sessionCode.toUpperCase(),
      element,
    });
  }, [sessionCode]);

  const emitElementDelete = useCallback((elementId) => {
    socketRef.current?.emit('element-delete', {
      sessionCode: sessionCode.toUpperCase(),
      elementId,
    });
  }, [sessionCode]);

  // Throttled cursor emit — max once per 50ms
  const emitCursorMove = useCallback(
    throttle((x, y) => {
      socketRef.current?.emit('cursor-move', {
        sessionCode: sessionCode.toUpperCase(),
        x,
        y,
      });
    }, 50),
    [sessionCode]
  );

  return { connected, emitElementUpsert, emitElementDelete, emitCursorMove };
}
