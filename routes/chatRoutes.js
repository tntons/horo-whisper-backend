const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')

router.post('/',    chatController.createChat)
router.get('/:sessionId', chatController.getChatsBySessionId)

module.exports = router