const { PrismaClient } = require('@prisma/client')
const { AppError } = require('../middleware/errorHandler')
const prisma = new PrismaClient()

exports.createChat = async ({ sessionId, senderId, content }) => {
  try {

    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found')
    }

    const user = await prisma.user.findUnique({ where: { id: senderId } })
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'Sender not found')
    }

    return await prisma.chat.create({
      data: { sessionId, senderId, content }
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(500, 'CREATE_CHAT_ERROR', err.message)
  }
}

exports.getChatsBySessionId = async (sessionId, currentUserId) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: sessionId } })
    if (!session) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found')
    }

    const chats = await prisma.chat.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: {
        content: true,
        createdAt: true,
        senderId: true
      }
    })

    // map to only the fields client needs
    return chats.map(chat => ({
      content:   chat.content,
      timestamp: chat.createdAt.toISOString(),
      isUser:    chat.senderId === currentUserId
    }))
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(500, 'FETCH_CHATS_ERROR', err.message)
  }
}

exports.getChatsParticipantInfoBySessionId = async (sessionId, currentUserId) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        customer: {
          include: {
            user:       true,
            prediction: true
          }
        },
        teller: {
          include: { user: true }
        }
      }
    })
    if (!session) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found')
    }

    const { customer, teller } = session
    if (!customer || !teller) {
      throw new AppError(404, 'PARTICIPANTS_NOT_FOUND', 'Customer or Teller missing')
    }

    const isCustomerSender = currentUserId === customer.user.id
    const senderRole      = isCustomerSender ? 'customer' : 'teller'

    const sessionInfo = {
      id:        session.id,
      status:    session.sessionStatus,
      timeStart: session.createdAt.toISOString(),
      timeEnd:   session.endedAt ? session.endedAt.toISOString() : null
    }

    return {
      session:    sessionInfo,
      customer,               // now includes customer.prediction
      teller,
      senderRole
    }
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(500, 'FETCH_PARTICIPANTS_ERROR', err.message)
  }
}