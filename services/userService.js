const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async () => {
  return await prisma.user.findMany();
};

// Create a new user
exports.createUser = async (data) => {
  try {
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber || null,
        birthDate: data.birthDate || null
      }
    })

    await prisma.customer.create({
      data: { userId: user.id }
    })

    return user
  } catch (e) {
    throw new AppError(500, 'CREATE_USER_ERROR', e.message)
  }
};