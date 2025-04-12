const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleQuery = async () => {
    try {
        const teller = await prisma.Teller.findUnique({
            where: {
                id: 2
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
                                            {package:{tellerId: 2}},
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

        // Filter the payments in memory to match session IDs
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

        // Pretty print with indentation
        console.log('Upcoming:', JSON.stringify(filteredSession, null, 2));
        return filteredSession;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the query
sampleQuery()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });