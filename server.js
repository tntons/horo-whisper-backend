require('dotenv').config()              
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const { PrismaClient } = require('@prisma/client')
const { errorHandler } = require('./middleware/errorHandler')
const userController = require('./controllers/userController')

const app = express()
const prisma = new PrismaClient()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

app.use(cors())
app.use(express.json())

app.post('/auth/google', async (req, res) => {
  const { idToken } = req.body
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { email, given_name, family_name } = ticket.getPayload()
    if (!email) throw new Error('No email')

    // upsert user
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, firstName: given_name, lastName: family_name },
      update: {},
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )
    res.json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(401).send('Invalid Google ID token')
  }
})

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const [_, token] = auth.split(' ')
  if (!token) return res.status(401).end('Missing token')
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).end('Invalid token')
  }
}

app.post('/users', userController.createUser)

// example protected endpoint
app.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  })
  res.json(user)
})

app.post('/auth/select-role', requireAuth, async (req, res, next) => {
  const { role } = req.body
  const userId = req.user.userId

  try {
    let profile

    if (role === 'customer') {
      profile = await prisma.customer.findUnique({ where: { userId } })
      if (!profile) {
        profile = await prisma.customer.create({ data: { userId } })
      }
    }
    else if (role === 'teller') {
      profile = await prisma.teller.findUnique({ where: { userId } })
      if (!profile) {
        profile = await prisma.teller.create({ data: { userId } })
      }
    }
    else {
      return res.status(400).json({ success: false, code: 'INVALID_ROLE', message: 'Role must be "customer" or "teller"' })
    }

    res.json({ success: true, role, profile })
  } catch (err) {
    next(err)
  }
})

const userRoutes = require('./routes/userRoutes')
const tellerRoutes = require('./routes/tellerRoutes')
const customerRoutes = require('./routes/customerRoutes')
const chatRoutes = require('./routes/chatRoutes')

app.use('/users',    requireAuth, userRoutes)
app.use('/tellers',  requireAuth, tellerRoutes)
app.use('/customers',requireAuth, customerRoutes)
app.use('/chats',    requireAuth, chatRoutes)

app.use(errorHandler)

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})