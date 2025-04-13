const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
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

exports.verifyPayment = async (paymentId) => {
  try{
  const existingPayment = await prisma.Payment.findUnique({
    where: { id: paymentId }
  });
  if (!existingPayment) {
    throw new AppError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
  }
  if ((existingPayment.status != 'Pending') && (existingPayment.status != 'Completed')) {
    throw new AppError(400, 'PAYMENT_STATUS_ERROR', 'Payment status is not pending or completed');
  }

  await new Promise(resolve => setTimeout(resolve, 2000)); //just some mock-up delay


  //MUST UPDATE THE STATUSSSSSSSSSSSSS

  const result = await prisma.$transaction(async (tx) => {
    // Update payment
    const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'Completed' }
    });

    // Update session
    const updatedSession = await tx.session.update({
        where: { id: paymentId },
        data: { sessionStatus: 'Active' }
    });

    return { updatedPayment, updatedSession };
  });

  return result;

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_PAYMENTSTATUS_ERROR', 'Error updating payment status');
  }
};
