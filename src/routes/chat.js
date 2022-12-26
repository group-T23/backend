const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const { verifyAuthentication } = require('../utils/auth');

router.get('', verifyAuthentication, chatController.getChat);
router.post('/', verifyAuthentication, chatController.createChat);
router.delete('/', verifyAuthentication, chatController.deleteChat);
router.get('/message', verifyAuthentication, chatController.getMessage);
router.post('/message', verifyAuthentication, chatController.sendMessage);

module.exports = router;