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

exports.updateUserByCusId = async (customerId, updateData) => {
  try {
    // Validate that the customer exists
    const customer = await prisma.Customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    if (updateData.birthDate === "") {
      updateData.birthDate = null;
    } else {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    // Update the user data
    const updatedUser = await prisma.User.update({
      where: { id: customer.userId },
      data: updateData,
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_USER_ERROR', 'Error updating user');
  }
}

exports.updatePredictionByCusId = async (customerId, updateData) => {
  try {
    // Validate that the customer exists
    const customer = await prisma.Customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    // Validate that the prediction attribute exists
    const predictionAttribute = await prisma.PredictionAttribute.findUnique({ where: { customerId } });
    if (!predictionAttribute) {
      updatedPredictionAttribute = this.createPredictionAttribute(customerId, updateData);
    } else {
      // Update the prediction attribute
      updatedPredictionAttribute = await prisma.PredictionAttribute.update({
        where: { customerId },
        data: updateData,
      });
    }

    return updatedPredictionAttribute;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_USER_ERROR', 'Error updating user');
  }
}

exports.createPredictionAttribute = async (customerId, predictionAttribute) => {
  try {
    // Validate that the customer exists
    const customer = await prisma.Customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    // Create the prediction attribute
    const newPredictionAttribute = await prisma.PredictionAttribute.create({
      data: {
        customerId,
        ...predictionAttribute,
      },
    });
    return newPredictionAttribute;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'CREATE_PREDICTION_ATTRIBUTE_ERROR', 'Error creating prediction attribute');
  }
};

exports.getPredictionAttributeByCustomerId = async (customerId) => {
  try {
    // Validate that the customer exists
    const customer = await prisma.Customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }
    // Fetch the prediction attribute
    const predictionAttribute = await prisma.PredictionAttribute.findUnique({
      where: { customerId },
      include: {
        customer: {
          include: {
            user: true,
          }
        }
      }
    });
    if (!predictionAttribute) {
      throw new AppError(404, 'PREDICTION_ATTRIBUTE_NOT_FOUND', 'Prediction attribute not found');
    }
    return predictionAttribute;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'FETCH_PREDICTION_ATTRIBUTE_ERROR', 'Error fetching prediction attribute');
  }
};

exports.getCustomerById = async (id) => {
  try {
    const customer = await prisma.Customer.findUnique({
      where: { id },
      include: {
        user: true,
        prediction: true,
      },
    });

    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    return customer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'FETCH_CUSTOMER_ERROR', error.message);
  }
};

exports.getCustomerByUserId = async (userId) => {
  try {
    const customer = await prisma.Customer.findUnique({
      where: { userId },
      include: {
        user: true,
        prediction: true,
        sessions: true,
        payments: true,
        reports: true
      }
    })
    console.log('customer:', customer)
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer profile not found')
    }
    return customer
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(500, 'FETCH_CUSTOMER_ERROR', err.message)
  }
}

exports.updateCustomerByUserId = async (userId, updateData) => {
  try {

    const { profilePic, birthDate: bd, birthTime: bt, ...userFields } = updateData

    // build a proper ISO timestamp for birthDate
    if (bd) {
      // if consumer passed an array [date, time]
        const [datePart, timePart] =
        Array.isArray(bd) && bd.length === 2 ? bd : [bd, bt || '00:00']


        const hhmmss = timePart.includes(':') ? `${timePart}:00` : `${timePart}`

        const isoWithOffset = `${datePart}T${hhmmss}+07:00`
        userFields.birthDate = new Date(isoWithOffset)
    }


    const [updatedUser, updatedCustomer] = await prisma.$transaction([
      // update User table
      prisma.user.update({
        where: { id: userId },
        data: userFields
      }),

      // update Customer table
      prisma.customer.update({
        where: { userId },
        data: { profilePic }
      })
    ])

    return { ...updatedUser, customer: updatedCustomer }
  } catch (error) {
    console.error('UPDATE_CUSTOMER_ERROR:', error.message)
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_CUSTOMER_ERROR', 'Error updating customer' + error.message);
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
                username: true, 
              },
            },
          },
        },
        reviews: true,
        chats: true,
        payment: true,
      },
    });

    return sessions;
  } catch (error) {
    console.error('FETCH_SESSIONS_ERROR:', error);

    throw new AppError(
      500,
      'FETCH_SESSIONS_ERROR',
      error.message || 'Error fetching sessions for the customer'
    );
  }
};

exports.getSessionsByCustomerId = async (userId) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    })
    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer profile not found')
    }

    const sessions = await prisma.session.findMany({
      where: { customerId: customer.id },
      include: {
        teller: {
          select: {
            user: { 
              select: { 
                username: true 
              }
            },
            profilePic: true  // Add this line to include profilePic
          }
        },
        reviews: true,
        payment: true,
        chats: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      }
    })

    // Rest of the code remains the same...
    const sessionIds = sessions.map(s => s.id)
    const unreadGroups = await prisma.chat.groupBy({
      by: ['sessionId'],
      where: {
        sessionId: { in: sessionIds },
        isRead: false,
        senderId: { not: userId }
      },
      _count: { _all: true }
    })
    const unreadMap = unreadGroups.reduce((m, g) => {
      m[g.sessionId] = g._count._all
      return m
    }, {})

    return sessions.map(session => {
      const lastChat = session.chats[0] && {
        id: session.chats[0].id,
        content: session.chats[0].content,
        timestamp: session.chats[0].createdAt.toISOString(),
        senderId: session.chats[0].senderId
      }
      return {
        ...session,
        lastChat,
        unreadCount: unreadMap[session.id] || 0,
        chats: undefined
      }
    })
  } catch (error) {
    console.error('FETCH_SESSIONS_ERROR:', error)
    throw new AppError(
      500,
      'FETCH_SESSIONS_ERROR',
      error.message || 'Error fetching sessions for the customer'
    )
  }
}

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