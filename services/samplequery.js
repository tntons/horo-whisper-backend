const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AppError } = require('../middleware/errorHandler');

const paymentId = 6;
const sampleQuery = async () => {
    try {
        const payment = await prisma.Payment.findUnique({
          where: { id: paymentId }
        });
    
        if (!payment) {
          throw new AppError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
        }
    
        const updatedPayment = await prisma.Payment.update({
          where: { id: paymentId },
          data: { status: 'Disabled' }
        });
    
        return updatedPayment;
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'UPDATE_PAYMENT_ERROR', 'Error updating payment status');
      }
}

// Execute the query
sampleQuery()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });