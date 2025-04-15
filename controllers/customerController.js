const customerService = require('../services/customerService.js');

const invalidInputTypeMsg={
  status: 'error',
  code: 'INVALID_ID',
  message: 'Invalid Input Type'
}

exports.createCustomer = async (req, res, next) => {
  try {
    const { userId, profilePic = null } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'userId is required.',
      });
    }

    // Call the service to create the customer
    const newCustomer = await customerService.createCustomer({ userId, profilePic });

    return res.status(201).json({
      success: true,
      data: newCustomer,
    });
  } catch (err) {
    next(err);
  }
};

exports.bookSession = async (req, res, next) => {
  try {
    const {sessionData, paymentData} = req.body; 
    const result = await customerService.bookSession(sessionData, paymentData);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPaymentByPaymentId = async (req, res, next) => {
  try{
    const paymentId = parseInt(req.params.paymentId, 10);

    if (isNaN(paymentId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await customerService.getPaymentByPaymentId(paymentId);

    return res.status(200).json({
      success: true,
      data: result
    })
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const paymentId = parseInt(req.params.paymentId, 10);

    if (isNaN(paymentId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await customerService.verifyPayment(paymentId);


    return res.status(200).json({
      success: true,
      data: result
    })

  } catch (err) {
    next(err);
  }
};
