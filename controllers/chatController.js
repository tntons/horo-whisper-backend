const chatService = require('../services/chatService')
const { AppError } = require('../middleware/errorHandler')

const invalidInputTypeMsg = {
  status: 'error',
  code: 'INVALID_INPUT',
  message: 'sessionId and content are required'
}

exports.createChat = async (req, res, next) => {
  try {
    const senderId = req.user.userId
    const { sessionId, content } = req.body

    // validate input
    if (!sessionId || typeof content !== 'string') {
      return res.status(400).json(invalidInputTypeMsg)
    }

    const newChat = await chatService.createChat({ sessionId, senderId, content })
    return res.status(201).json({ success: true, data: newChat })
  } catch (err) {
    next(err)
  }
}

exports.getChatsBySessionId = async (req, res, next) => {
  try {
    const sessionId      = parseInt(req.params.sessionId, 10)
    const currentUserId  = req.user.userId

    if (isNaN(sessionId)) {
      return res.status(400).json({
        status: 'error', code: 'INVALID_ID', message: 'Invalid sessionId'
      })
    }

    const messages = await chatService.getChatsBySessionId(
      sessionId,
      currentUserId
    )
    res.json({ success: true, data: messages })
  } catch (err) {
    next(err)
  }
}

exports.getChatsParticipantInfoBySessionId = async (req, res, next) => {
    try {
        const sessionId = parseInt(req.params.sessionId, 10)
        const currentUserId  = req.user.userId
    
        if (isNaN(sessionId)) {
        return res.status(400).json({
            status: 'error', code: 'INVALID_ID', message: 'Invalid sessionId'
        })
        }
    
        const participants = await chatService.getChatsParticipantInfoBySessionId(
        sessionId,
        currentUserId
        )
        res.json({ success: true, data: participants })
    } catch (err) {
        next(err)
    }
}