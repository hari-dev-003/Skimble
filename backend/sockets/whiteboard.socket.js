const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const { saveCanvasState, fetchSessionElements } = require('../controllers/session.controller');

// In-memory store: Map<sessionCode, { elements: [], participants: Map<userId, {email, socketId}>, saveTimer }>
const activeSessions = new Map();

async function getOrCreateSession(code) {
  if (!activeSessions.has(code)) {
    const dbElements = await fetchSessionElements(code);
    activeSessions.set(code, {
      elements: dbElements || [],
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
    const s = activeSessions.get(code);
    if (s && s.dirty) {
      s.dirty = false;
      await saveCanvasState(code, s.elements);
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

      const session = await getOrCreateSession(code);

      // If server elements are empty, we can try using what the client sent as a backup
      if (session.elements.length === 0 && initialElements && initialElements.length > 0) {
        session.elements = initialElements;
      }

      const finalName = name || displayName;
      socket.data.displayName = finalName;

      session.participants.set(userId, { name: finalName, socketId: socket.id });

      socket.emit('session-synced', {
        elements: session.elements,
        participants: Array.from(session.participants.entries()).map(([uid, info]) => ({
          userId: uid,
          name: info.name,
        })),
      });

      socket.to(code).emit('participant-joined', { userId, name: finalName });
      socket.data.sessionCode = code;
    });

    socket.on('element-upsert', async ({ sessionCode, element }) => {
      if (!sessionCode || !element || !element.id) return;
      const code = sessionCode.toUpperCase();
      const session = await getOrCreateSession(code);

      const idx = session.elements.findIndex(el => el.id === element.id);
      if (idx >= 0) {
        session.elements[idx] = element;
      } else {
        session.elements.push(element);
      }

      socket.to(code).emit('element-upserted', { element });
      scheduleSave(code);
    });

    socket.on('element-delete', async ({ sessionCode, elementId }) => {
      if (!sessionCode || !elementId) return;
      const code = sessionCode.toUpperCase();
      const session = await getOrCreateSession(code);

      session.elements = session.elements.filter(el => el.id !== elementId);
      socket.to(code).emit('element-deleted', { elementId });
      scheduleSave(code);
    });

    socket.on('cursor-move', ({ sessionCode, x, y }) => {
      if (!sessionCode) return;
      const code = sessionCode.toUpperCase();
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
      if (session.dirty) {
        saveCanvasState(code, session.elements);
        session.dirty = false;
      }
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
