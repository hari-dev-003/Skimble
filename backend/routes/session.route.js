const express = require('express');
const router = express.Router();
const { createSession, getSession, deleteSession, listUserSessions, joinSession } = require('../controllers/session.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/sessions', verifyToken, listUserSessions);
router.post('/sessions', verifyToken, createSession);
router.post('/sessions/:code/join', verifyToken, joinSession);
router.get('/sessions/:code', getSession);
router.delete('/sessions/:code', verifyToken, deleteSession);

module.exports = router;
