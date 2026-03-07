const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const { saveCanvasState } = require('../controllers/session.controller');

// In-memory store: Map<sessionCode, { elements: [], participants: Map<userId, {email, socketId}>, saveTimer }>
const activeSessions = new Map();

function getOrCreateSession(code) {
  if (!activeSessions.has(code)) {
    activeSessions.set(code, {
      elements: [],
      participants: new Map(),
      saveTimer: null,
      dirty: false,
    });
  }
  return activeSessions.get(code);
}

function scheduleSave(code) {
  const session = activeSessions.get(code);
  if (!session) return;
  if (session.saveTimer) clearTimeout(session.saveTimer);
  session.dirty = true;
  session.saveTimer = setTimeout(async () => {
    if (session.dirty) {
      session.dirty = false;
      await saveCanvasState(code, session.elements);
    }
  }, 3000);
}

function registerWhiteboardHandlers(io) {
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const displayName = socket.data.displayName;

    socket.on('join-session', async ({ sessionCode, initialElements, name }) => {
      if (!sessionCode) return;
      const code = sessionCode.toUpperCase();
      socket.join(code);

      const session = getOrCreateSession(code);

      // If server has no elements yet but client sent initial (from DB load in frontend)
      if (session.elements.length === 0 && initialElements && initialElements.length > 0) {
        session.elements = initialElements;
      }

      // Use the name provided by the client if available, otherwise fallback to auth data
      const finalName = name || displayName;
      socket.data.displayName = finalName; // Update persistent socket data

      session.participants.set(userId, { name: finalName, socketId: socket.id });

      // Send current canvas state to the joining user
      socket.emit('session-synced', {
        elements: session.elements,
        participants: Array.from(session.participants.entries()).map(([uid, info]) => ({
          userId: uid,
          name: info.name,
        })),
      });

      // Notify others that someone joined
      socket.to(code).emit('participant-joined', { userId, name: finalName });

      socket.data.sessionCode = code;
    });

    socket.on('element-upsert', ({ sessionCode, element }) => {
      if (!sessionCode || !element || !element.id) return;
      const code = sessionCode.toUpperCase();
      const session = activeSessions.get(code);
      if (!session) return;

      const idx = session.elements.findIndex(el => el.id === element.id);
      if (idx >= 0) {
        session.elements[idx] = element;
      } else {
        session.elements.push(element);
      }

      // Broadcast to all OTHER clients in the room
      socket.to(code).emit('element-upserted', { element });
      scheduleSave(code);
    });

    socket.on('element-delete', ({ sessionCode, elementId }) => {
      if (!sessionCode || !elementId) return;
      const code = sessionCode.toUpperCase();
      const session = activeSessions.get(code);
      if (!session) return;

      session.elements = session.elements.filter(el => el.id !== elementId);
      socket.to(code).emit('element-deleted', { elementId });
      scheduleSave(code);
    });

    socket.on('cursor-move', ({ sessionCode, x, y }) => {
      if (!sessionCode) return;
      const code = sessionCode.toUpperCase();
      // Always use the latest displayName from socket.data
      socket.to(code).emit('cursor-moved', { userId, name: socket.data.displayName, x, y });
    });

    socket.on('leave-session', ({ sessionCode }) => {
      if (!sessionCode) return;
      const code = sessionCode.toUpperCase();
      handleLeave(socket, code, io);
    });

    socket.on('disconnecting', () => {
      const code = socket.data.sessionCode;
      if (code) {
        handleLeave(socket, code, io);
      }
    });
  });
}

function handleLeave(socket, code, io) {
  const userId = socket.data.userId;
  const session = activeSessions.get(code);
  if (session) {
    session.participants.delete(userId);
    if (session.participants.size === 0) {
      // Persist final state before clearing from memory
      if (session.dirty) {
        saveCanvasState(code, session.elements);
        session.dirty = false;
      }
      // Keep in memory for 5 min in case users reconnect quickly
      setTimeout(() => {
        const s = activeSessions.get(code);
        if (s && s.participants.size === 0) {
          if (s.saveTimer) clearTimeout(s.saveTimer);
          activeSessions.delete(code);
        }
      }, 5 * 60 * 1000);
    }
  }
  socket.to(code).emit('participant-left', { userId });
  socket.leave(code);
}

module.exports = { registerWhiteboardHandlers, activeSessions };
