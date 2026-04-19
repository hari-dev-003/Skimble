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

export function useWhiteboardSocket({ 
  sessionCode, 
  token, 
  displayName, 
  initialElements, 
  onElementUpserted, 
  onElementDeleted, 
  onCursorMoved, 
  onParticipantJoined, 
  onParticipantLeft, 
  onSessionSynced 
}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const joinedRef = useRef(false);

  // Use refs for callbacks to avoid stale closures in useEffect
  const callbacks = useRef({
    onElementUpserted,
    onElementDeleted,
    onCursorMoved,
    onParticipantJoined,
    onParticipantLeft,
    onSessionSynced
  });

  useEffect(() => {
    callbacks.current = {
      onElementUpserted,
      onElementDeleted,
      onCursorMoved,
      onParticipantJoined,
      onParticipantLeft,
      onSessionSynced
    };
  });

  useEffect(() => {
    if (!sessionCode) return;

    const socket = io(BACKEND_URL, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Only join if we haven't or if sessionCode changed
      // Wait for initialElements to be populated if they are coming from a load
      if (initialElements && initialElements.length > 0) {
        socket.emit('join-session', {
          sessionCode: sessionCode.toUpperCase(),
          initialElements,
          name: displayName,
        });
        joinedRef.current = true;
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      joinedRef.current = false;
    });

    socket.on('session-synced', (data) => {
      callbacks.current.onSessionSynced?.(data);
    });

    socket.on('element-upserted', ({ element }) => {
      callbacks.current.onElementUpserted?.(element);
    });

    socket.on('element-deleted', ({ elementId }) => {
      callbacks.current.onElementDeleted?.(elementId);
    });

    socket.on('cursor-moved', (data) => {
      callbacks.current.onCursorMoved?.(data);
    });

    socket.on('participant-joined', (data) => {
      callbacks.current.onParticipantJoined?.(data);
    });

    socket.on('participant-left', (data) => {
      callbacks.current.onParticipantLeft?.(data);
    });

    return () => {
      socket.emit('leave-session', { sessionCode: sessionCode.toUpperCase() });
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      joinedRef.current = false;
    };
  // Re-run if any of these change, especially initialElements for the first join
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode, token, displayName, initialElements?.length > 0]);

  // Special case: if we connected but didn't have initial elements yet, join once they arrive
  useEffect(() => {
    if (socketRef.current?.connected && !joinedRef.current && initialElements && initialElements.length > 0) {
      socketRef.current.emit('join-session', {
        sessionCode: sessionCode.toUpperCase(),
        initialElements,
        name: displayName,
      });
      joinedRef.current = true;
    }
  }, [initialElements, sessionCode, displayName]);

  const emitElementUpsert = useCallback((element) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-upsert', {
        sessionCode: sessionCode.toUpperCase(),
        element,
      });
    }
  }, [sessionCode]);

  const emitElementDelete = useCallback((elementId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-delete', {
        sessionCode: sessionCode.toUpperCase(),
        elementId,
      });
    }
  }, [sessionCode]);

  // Throttled cursor emit — max once per 100ms
  const emitCursorMove = useCallback(
    throttle((x, y) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('cursor-move', {
          sessionCode: sessionCode.toUpperCase(),
          x,
          y,
        });
      }
    }, 100),
    [sessionCode]
  );

  return { connected, emitElementUpsert, emitElementDelete, emitCursorMove };
}
