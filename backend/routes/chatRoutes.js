const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.post('/session', auth, chatController.createSession);
router.get('/session', auth, chatController.getSessions);
router.delete('/session/:id', auth, chatController.deleteSession);

router.post('/message', auth, chatController.sendMessage);
router.get('/message/:sessionId', auth, chatController.getMessages);

module.exports = router;
