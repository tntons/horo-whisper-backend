const { PrismaClient } = require('@prisma/client');
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
  return await prisma.TellerPackage.findMany({
    where: { tellerId },
  });
}