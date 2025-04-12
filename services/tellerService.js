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
    select:{
        id: true,
        sessions: {
            where:{
                sessionStatus: "Pending"
            },
            select:{
                id: true,
                customerId: true,
                tellerId: true,
                sessionStatus: true,
                customer:{
                    select:{
                        user:{
                            select:{
                                id: true,
                                username: true
                            }
                        },
                        payments:{
                            where:{
                                AND:[
                                    {status: "Disabled"},
                                    {package:{tellerId: tellerId}},
                                ]
                            },
                            select:{
                                id: true,
                                customerId: true,
                                packageId: true,
                                status: true,
                                package:true
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

return filteredSession;
}