const clientService = require('../services/customerService.js');

const invalidInputTypeMsg={
  status: 'error',
  code: 'INVALID_ID',
  message: 'Invalid Input Type'
}

exports.bookSession = async (req, res, next) => {
  try {
    const {sessionData, paymentData} = req.body; 
    const result = await clientService.bookSession(sessionData, paymentData);
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

    const result = await clientService.getPaymentByPaymentId(paymentId);

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

    const result = await clientService.verifyPayment(paymentId);


    return res.status(200).json({
      success: true,
      data: result
    })

  } catch (err) {
    next(err);
  }
};
