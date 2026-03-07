const express = require('express');
const router = express.Router();
const { createSession, getSession, deleteSession } = require('../controllers/session.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/sessions', verifyToken, createSession);
router.get('/sessions/:code', getSession);
router.delete('/sessions/:code', verifyToken, deleteSession);

module.exports = router;
