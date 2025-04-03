const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async () => {
  return await prisma.user.findMany();
};

// Create a new user
exports.createUser = async (data) => {
  return await prisma.user.create({ data });
};