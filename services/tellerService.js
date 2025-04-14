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

exports.getSessionByTellerId = async (type, tellerId) => {

  if (type != "upcoming" && type != "past" && type != "current") {
    throw new AppError(400, 'INVALID_SESSION_TYPE', 'Invalid session type');
  }

  const sessionStatus = {
    upcoming: "Pending",
    past: "Ended",
    current: "Active"
  }
  const paymentStatus = {
    upcoming: "Disabled",
    past: "Completed",
    current: "Completed"
  }


  const teller = await prisma.Teller.findUnique({
    where: {
      id: tellerId
    },
    select: {
      id: true,
      sessions: {
        where: {
          sessionStatus: sessionStatus[type]
        },
        select: {
          id: true,
          customerId: true,
          tellerId: true,
          sessionStatus: true,
          createdAt: true,
          endedAt: true,
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
                    { status: paymentStatus[type] },
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
    throw new AppError(404, 'NO_SESSIONS', 'No Session found for this teller');
  }

  //a customer may have multiple payment, ASSUME coresspond Payment has the same id as sessionId
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

  //format result information
  const formattedSession = {
    tellerId: filteredSession.id,
    sessions: filteredSession.sessions.map(session => {

      // Format date and time in Thai timezone
      const convertToThaiDateTime = (date) => {
        return new Date(date).toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      };


      const formatDateTime = (timestamp) => {
        const thaiDateTime = convertToThaiDateTime(timestamp);
        const [date, time] = thaiDateTime.split(', ');
        return { date, time };
      };

      return {
        sessionId: session.id,
        customerId: session.customerId,
        username: session.customer.user.username,
        sessionStatus: session.sessionStatus,
        packageId: session.customer.payments[0].package.id,
        questionNumber: session.customer.payments[0].package.questionNumber,
        price: session.customer.payments[0].package.price,
        paymentId: session.customer.payments[0].id,
        createdDate: formatDateTime(session.createdAt).date,
        createdTime: formatDateTime(session.createdAt).time,
        endedDate: session.endedAt ? formatDateTime(session.endedAt).date : null,
        endedTime: session.endedAt ? formatDateTime(session.endedAt).time : null,
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

    const existingSession = await prisma.Session.findUnique({
      where: { id: sessionId }
    });

    if (!existingSession) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    //Scenario:
    //session with "Pending" status -> sessionStatus = "Processing" or "Declined", paymentStatus = "Pending" or "Declined"
    //session with "Active" status -> sessionStatus = "Ended"
    // Update session within a transaction to ensure consistency
    const session = await prisma.$transaction(async (prisma) => {

      const updatedSession = await prisma.Session.update({
        where: { id: sessionId },
        data: { sessionStatus: status,
          endedAt: status == "Ended" ? new Date() : null
        }
      });

      // Update the related payment
      if(status =="Processing"){
      await exports.patchPaymentStatus(sessionId, status);
      }

      return updatedSession;
    });

    return session;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_SESSION_ERROR', 'Error updating session status');
  }
};


