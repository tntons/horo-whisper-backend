const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const prisma = new PrismaClient();
const axios = require('axios');
const { zodiacLuckyInfo } = require('./predictionData');

exports.createCustomer = async ({ userId, profilePic }) => {
  try {
    // Validate that the user exists
    const user = await prisma.User.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Create the customer
    const newCustomer = await prisma.Customer.create({
      data: {
        userId,
        profilePic,
      },
    });

    return newCustomer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'CREATE_CUSTOMER_ERROR', 'Error creating customer');
  }
};

exports.bookSession = async (sessionData, paymentData) => {
  return await prisma.$transaction(async (tx) => {

    // Create the session first
    const session = await tx.Session.create({
      data: sessionData,
    });

    // Create the payment and link it to the session
    const payment = await tx.Payment.create({
      data: {
        ...paymentData,
        sessionId: session.id, // Link the payment to the session
      },
    });

    const updatedSession = await tx.Session.update({
      where: { id: session.id },
      data: {
        paymentId: payment.id, // Link the payment to the session
      },
    });


    return {
      session: updatedSession,
      payment
    };
  });
};

exports.getPaymentByPaymentId = async (paymentId) => {
  try {
    const payment = await prisma.Payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        customerId: true,
        status: true,
        createdAt: true,
        status: true,
        package: true
      }

    });

    return payment;

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'GET_PAYMENT_ERROR', error.message);
  }
};

exports.verifyPayment = async (paymentId) => {
  try {
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

exports.getSessionsByCustomerId = async (customerId) => {
  try {
    const sessions = await prisma.Session.findMany({
      where: { customerId },
      include: {
        teller: {
          select: {
            user: {
              select: {
                username: true, // Include teller's username
              },
            },
          },
        },
        reviews: true, // Include reviews for the session
        chats: true,
        payment: true, // Include payment details
      },
    });

    return sessions;
  } catch (error) {
    throw new AppError(500, 'FETCH_SESSIONS_ERROR', 'Error fetching sessions for the customer');
  }
};

exports.getPredictionByCustomerId = async (customerId) => {
  try {
    // const zodiacSign = await prisma.PredictionAttribute.findUnique({
    //   where: { customerId },
    //   select: { zodiacSign: true }
    // });

    const zodiacSign ='cancer'; // Mocked zodiac sign for testing

    if (zodiacSign==null) {
      throw new AppError(404, 'ZODIAC_SIGN_NOT_FOUND', 'No zodiac sign found for this customer');
    }

    const response = await axios.get(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${zodiacSign.toLowerCase()}&day=TODAY`);
    
    const prediction = response.data.data.horoscope_data;
    const luckyColors = zodiacLuckyInfo[zodiacSign.toLowerCase()].luckyColors;
    const luckyNumbers = zodiacLuckyInfo[zodiacSign.toLowerCase()].luckyNumbers;

    const formattedPrediction = {
      prediction: prediction,
      luckyColors: luckyColors,
      luckyNumbers: luckyNumbers,
    };

    return  formattedPrediction;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'FETCH_PREDICTION_ERROR', error.message);
  }
}