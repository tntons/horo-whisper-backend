const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const prisma = new PrismaClient();

// Get all tellers
exports.getAllTellers = async () => {
  try {
    const tellers = await prisma.Teller.findMany({
      include: {
        user: {
          select: {
            username: true, // Fetch the teller's name from the User table
          },
        },
        packages: {
          select: {
            price: true, // Fetch package prices to calculate the minimum price
          },
        },
        sessions: {
          select: {
            reviews: {
              select: {
                rating: true, // Fetch ratings to calculate the average rating
              },
            },
          },
        },
      },
    });

    // Format the data
    const formattedTellers = tellers.map((teller) => {
      // Calculate the total number of reviews and average rating
      const allRatings = teller.sessions.flatMap((session) =>
        session.reviews.map((review) => review.rating)
      );
      const totalReviews = allRatings.length;
      const averageRating =
        totalReviews > 0
          ? allRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews
          : 0;

      // Find the minimum package price
      const minPrice = teller.packages.length
        ? Math.min(...teller.packages.map((pkg) => pkg.price))
        : null;

      return {
        tellerId: teller.id,
        tellerName: teller.user.username,
        totalReviews,
        averageRating,
        minPrice,
        specialty: teller.specialty,
        bio: teller.bio,
        traffic: teller.traffic,
      };
    });

    return formattedTellers;
  } catch (error) {
    throw new AppError(500, 'FETCH_TELLERS_ERROR', 'Error fetching tellers');
  }
};

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
  try {
    const teller = await prisma.Teller.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true, // Fetch the teller's name
          },
        },
        packages: true, // Fetch all teller packages
        sessions: {
          select: {
            reviews: {
              include: {
                session: {
                  select: {
                    customer: {
                      select: {
                        user: {
                          select: {
                            username: true, // Fetch the customer's username
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teller) {
      throw new AppError(404, 'TELLER_NOT_FOUND', 'Teller not found');
    }

    // Extract all reviews from sessions and include customerName
    const allReviews = teller.sessions.flatMap((session) =>
      session.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewAt: review.reviewAt,
        customerName: review.customer?.user?.username || 'Anonymous', // Include customerName
      }))
    );

    // Calculate the total number of reviews and average rating
    const totalNumberOfReviews = allReviews.length;
    const averageRating =
      totalNumberOfReviews > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalNumberOfReviews
        : 0;

    // Format the response
    return {
      tellerId: teller.id,
      tellerName: teller.user.username,
      specialty: teller.specialty,
      bio: teller.bio,
      traffic: teller.traffic,
      totalNumberOfReviews,
      averageRating,
      packages: teller.packages, // All teller packages
      reviews: allReviews, // All reviews with customerName
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'FETCH_TELLER_ERROR', 'Error fetching teller details');
  }
};

exports.updateTellerById = async (tellerId, updateData) => {
  try {
    // Validate that the teller exists
    const existingTeller = await prisma.Teller.findUnique({
      where: { id: tellerId },
    });

    if (!existingTeller) {
      throw new AppError(404, 'TELLER_NOT_FOUND', 'Teller not found');
    }

    // Update the teller
    const updatedTeller = await prisma.Teller.update({
      where: { id: tellerId },
      data: updateData,
    });

    return updatedTeller;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_TELLER_ERROR', 'Error updating teller');
  }
};

// Create a new teller
exports.createTeller = async (data) => {
  return await prisma.teller.create({ data });
}

exports.createTellerPackage = async (tellerId, packageData) => {
  const { packageDetail, questionNumber, price } = packageData;

  // Validate required fields
  if (!price || isNaN(price)) {
    throw new AppError(400, 'INVALID_PACKAGE_DATA', 'Price is required and must be a number');
  }

  // Create the package
  const newPackage = await prisma.TellerPackage.create({
    data: {
      tellerId,
      packageDetail: packageDetail || null,
      questionNumber: questionNumber || null,
      price,
      status: "Active"
    },
  });

  return newPackage;
};

exports.deleteTellerPackage = async (tellerId, packageId) => {
  try {
    // Validate that the package belongs to the teller
    const existingPackage = await prisma.TellerPackage.findFirst({
      where: { id: packageId, tellerId: tellerId },
    });

    if (!existingPackage) {
      throw new AppError(404, 'PACKAGE_NOT_FOUND', 'Package not found or does not belong to the specified teller');
    }

    // Delete the package
    await prisma.TellerPackage.delete({
      where: { id: packageId },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'DELETE_PACKAGE_ERROR', 'Error deleting teller package');
  }
};

exports.getTellerPackageByTellerId = async (tellerId) => {
  const packages = await prisma.TellerPackage.findMany({
    where: { tellerId },
  });

  if (!packages || packages.length === 0) {
    throw new AppError(404, 'NO_PACKAGES_FOUND', 'No packages found for this teller');
  }
  return packages;
}

exports.markTellerPackageDeleted = async (tellerId, packageId) => {

  // Validate that the package belongs to the teller
  const existingPackage = await prisma.TellerPackage.findFirst({
    where: { id: packageId, tellerId: tellerId },
  });

  if (!existingPackage) {
    throw new AppError(404, 'PACKAGE_NOT_FOUND', 'Package not found or does not belong to the specified teller');
  }

  return prisma.tellerPackage.update({
    where: { id: packageId },
    data: { status: 'Deleted' },
  });
};


exports.getSessionByTellerId = async (type, tellerId) => {

  if (type != "upcoming" && type != "past" && type != "current") {
    throw new AppError(400, 'INVALID_SESSION_TYPE', 'Invalid session type');
  }

  const sessionStatus = {
    upcoming: ["Pending", "Processing"],
    past: ["Ended", "Declined"],
    current: ["Active"]
  };


  const teller = await prisma.Teller.findUnique({
    where: {
      id: tellerId
    },
    select: {
      id: true,
      sessions: {
        where: {
          sessionStatus: {
            in: sessionStatus[type]  // Use 'in' operator to match any of the statuses
          }
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
                select: {
                  id: true,
                  packageId: true,
                  package: true,
                  sessionId: true,
                  status: true
                }
              }
            }
          },
        }
      }
    }
  });

  console.log("printing")
  console.log(teller);

  if (!teller) {
    throw new AppError(404, 'TELLER_NOT_FOUND', 'Teller not found');
  }

  if (!teller.sessions || teller.sessions.length === 0) {
    throw new AppError(404, 'NO_SESSIONS', 'No Session found for this teller');
  }

  const filteredSessions = teller?.sessions.map(session => {
    return {
      ...session,
      customer: {
        ...session.customer,
        payments: session.customer.payments.filter(payment => payment.sessionId === session.id)
      }
    };
  });

  
  // Format result information
  const formattedSession = {
    tellerId: teller.id,  // Use teller.id instead of filteredSession.id
    sessions: filteredSessions.map(session => { 
      
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
  
      // Make sure there's at least one payment before accessing its properties
      const payment = session.customer.payments && session.customer.payments.length > 0 
        ? session.customer.payments[0] 
        : null;
  
      return {
        sessionId: session.id,
        customerId: session.customerId,
        username: session.customer.user.username,
        sessionStatus: session.sessionStatus,
        packageId: payment?.package?.id || null,
        questionNumber: payment?.package?.questionNumber || null,
        price: payment?.package?.price || null,
        paymentId: payment?.id || null,
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
      where: { id: sessionId },
      include: {
        payment: true,
      },
    });

    if (!existingSession) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    const paymentId = existingSession.paymentId;
    if (!paymentId) {
      throw new AppError(404, 'PAYMENT_NOT_FOUND', 'No payment found for this session');
    }

    //Scenario:
    //session with "Pending" status -> sessionStatus = "Processing" or "Declined", paymentStatus = "Pending" or "Declined"
    //session with "Active" status -> sessionStatus = "Ended"
    // Update session within a transaction to ensure consistency
    const session = await prisma.$transaction(async (tx) => {

      const updatedSession = await tx.Session.update({
        where: { id: sessionId },
        data: { sessionStatus: status,
          endedAt: status === "Ended" ? new Date() : null
        }
      });

      // Update the related payment
      if(status === "Processing"){
        await exports.patchPaymentStatus(paymentId, status);
      }

      return updatedSession;
    });

    return session;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'UPDATE_SESSION_ERROR', 'Error updating session status');
  }
};

exports.getSessionById = async (sessionId) => {
  try {
    const session = await prisma.Session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        sessionStatus: true,
      },
    });

    return session;
  } catch (error) {
    throw new AppError(500, 'FETCH_SESSION_ERROR', 'Error fetching session');
  }
};

exports.createReview = async ({ sessionId, rating, comment }) => {
  try {
    // Create the review
    const newReview = await prisma.Review.create({
      data: {
        sessionId,
        rating,
        comment,
        reviewAt: new Date(),
      },
    });

    return newReview;
  } catch (error) {
    throw new AppError(500, 'CREATE_REVIEW_ERROR', 'Error creating review');
  }
};