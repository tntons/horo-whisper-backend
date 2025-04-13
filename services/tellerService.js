const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const prisma = new PrismaClient();

// Get all tellers
exports.getAllTellers = async () => {
  return await prisma.teller.findMany();
}

// Get all tellers name
exports.getAllBrowseTellers = async () => {
  return await prisma.teller.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}

// Get teller by ID
exports.getTellerById = async (id) => {
  return await prisma.teller.findUnique({
    where: { id },
  });
}

// Create a new teller
exports.createTeller = async (data) => {
  return await prisma.teller.create({ data });
}

exports.getTellerPackageById = async (tellerId) => {
  const packages = await prisma.TellerPackage.findMany({
    where: { tellerId },
  });

  if (!packages || packages.length === 0) {
    throw new AppError(404, 'NO_PACKAGES_FOUND', 'No packages found for this teller');
  }
  return packages;
}

exports.getUpcomingSessionByTellerId = async (tellerId) => {
  const teller = await prisma.Teller.findUnique({
    where: {
      id: tellerId
    },
    select: {
      id: true,
      sessions: {
        where: {
          sessionStatus: "Pending"
        },
        select: {
          id: true,
          customerId: true,
          tellerId: true,
          sessionStatus: true,
          createdAt: true,
          customer: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              },
              payments: {
                where: {
                  AND: [
                    { status: "Disabled" },
                    { package: { tellerId: tellerId } },
                  ]
                },
                select: {
                  id: true,
                  customerId: true,
                  packageId: true,
                  status: true,
                  package: true
                }
              }
            }
          },
        }
      }
    }
  });

  if (!teller) {
    throw new AppError(404, 'TELLER_NOT_FOUND', 'Teller not found');
  }

  if (!teller.sessions || teller.sessions.length === 0) {
    throw new AppError(404, 'NO_UPCOMING_SESSIONS', 'No upcoming sessions found for this teller');
  }

  const filteredSession = {
    ...teller,
    sessions: teller.sessions.map(session => ({
      ...session,
      customer: {
        ...session.customer,
        payments: session.customer.payments.filter(payment =>
          payment.id === session.id
        )
      }
    }))
  };

  const formattedSession = {
    tellerId: filteredSession.id,
    sessions: filteredSession.sessions.map(session => {
        // Format date and time in Thai timezone
        const thaiDateTime = new Date(session.createdAt).toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        console.log(thaiDateTime);
        // Split into date and time
        const [thaiDate, thaiTime] = thaiDateTime.split(', ');

        return {
            sessionId: session.id,
            date: thaiDate,
            time: thaiTime,
            customerId: session.customerId,
            username: session.customer.user.username,
            sessionStatus: session.sessionStatus,
            packageId: session.customer.payments[0].package.id,
            questionNumber: session.customer.payments[0].package.questionNumber,
            price: session.customer.payments[0].package.price,
            paymentId: session.customer.payments[0].id,
        };
    })
};

  return formattedSession;
}

exports.patchPaymentStatus = async (paymentId, status) => {
  const newStatus = status === "Processing" ? "Pending" : "Declined";
  try {
    const payment = await prisma.Payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new AppError(404, 'PAYMENT_NOT_FOUND', 'Payment not found');
    }

    const updatedPayment = await prisma.Payment.update({
      where: { id: paymentId },
      data: { status: newStatus }
    });

    return updatedPayment;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_PAYMENT_ERROR', 'Error updating payment status');
  }
};

exports.patchSessionStatus = async (sessionId, status) => {
  try {
    // First check if session exists
    const existingSession = await prisma.Session.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    // Check if session is in a valid state to be accepted
    if (existingSession.sessionStatus !== 'Pending') {
      throw new AppError(400, 'INVALID_SESSION_STATUS', 'Session can only be accepted when in pending status');
    }

    // Update session within a transaction to ensure consistency
    const session = await prisma.$transaction(async (prisma) => {
      const updatedSession = await prisma.Session.update({
        where: { id: sessionId },
        data: { sessionStatus: status }
      });

      // Update the related payment
      await exports.patchPaymentStatus(sessionId, status);

      return updatedSession;
    });

    return session;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_SESSION_ERROR', 'Error updating session status');
  }
};


