const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')

router.post('/',    chatController.createChat)
router.get('/history/:sessionId', chatController.getChatsBySessionId)
router.get('/info/:sessionId', chatController.getChatsParticipantInfoBySessionId)

module.exports = router