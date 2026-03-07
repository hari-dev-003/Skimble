const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const detailsRoutes = require('./routes/details.route');
const sessionRoutes = require('./routes/session.route');
const { getPems } = require('./middleware/auth');
const { registerWhiteboardHandlers } = require('./sockets/whiteboard.socket');
const { ensureAllTables } = require('./db/ensureTables');

getPems(process.env.COGNITO_USER_POOL_ID, process.env.COGNITO_REGION);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    // Allow unauthenticated connections but flag them
    socket.data.userId = 'anonymous-' + socket.id;
    socket.data.displayName = 'Anonymous';
    return next();
  }

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      socket.data.userId = 'anonymous-' + socket.id;
      socket.data.userEmail = 'Anonymous';
      return next();
    }
    // Full verification done in getPems context
    const payload = decoded.payload;
    socket.data.userId = payload.sub || socket.id;
    socket.data.displayName = payload.name || payload.given_name || payload.preferred_username || payload['cognito:username'] || payload.email || 'User';
    next();
  } catch {
    socket.data.userId = 'anonymous-' + socket.id;
    socket.data.displayName = 'Anonymous';
    next();
  }
});

registerWhiteboardHandlers(io);

const port = process.env.PORT || 3000;

app.use(cors("*"));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Welcome to the Skimble backend!');
});

app.use('/api', detailsRoutes);
app.use('/api', sessionRoutes);

ensureAllTables()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to ensure DynamoDB tables:', err);
    process.exit(1);
  });
