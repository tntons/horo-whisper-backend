const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Create Session
exports.createSession = async (data) => {
  return await prisma.Session.create({ data });
}