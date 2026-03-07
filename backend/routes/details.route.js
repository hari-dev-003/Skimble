const express = require('express');
const router = express.Router();

const { getContent, addContent, updateContent, deleteContent } = require('../controllers/details.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/details', verifyToken, getContent);

router.post('/details', verifyToken, addContent);

router.put('/details/:boardId', verifyToken, updateContent);

router.delete('/details/:boardId', verifyToken, deleteContent);

module.exports = router;
