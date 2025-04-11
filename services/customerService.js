const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.bookSession = async (sessionData, paymentData) => {
  return await prisma.$transaction(async (tx) => {

    const payment = await tx.Payment.create({
      data: paymentData
    });

    const session = await tx.Session.create({
      data: sessionData
    });

    return {
      session,
      payment
    };
  });
};