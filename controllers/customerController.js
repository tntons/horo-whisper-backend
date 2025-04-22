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

exports.getCustomerById = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    console.log(customerId)
    console.log("printing")
    const customer = await customerService.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.createPredictionAttribute = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.cusId, 10);
    const createdAttribute = req.body;

    if (isNaN(customerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }
    // Call the service to create the prediction attribute
    const newPredictionAttribute = await customerService.createPredictionAttribute(
      customerId,
      createdAttribute
    );
    return res.status(201).json({
      success: true,
      data: newPredictionAttribute,
    });
  }  catch (err) {
    next(err)
  }
}

exports.getPredictionAttributeByCustomerId = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.cusId, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }
    const predictionAttribute = await customerService.getPredictionAttributeByCustomerId(
      customerId
    );
    if (!predictionAttribute) {
      return res.status(404).json({ message: 'Prediction attribute not found' });
    }
    res.json({ success: true, data: predictionAttribute });
  } catch (err) {
    next(err)
  }
}

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await customerService.getCustomerByUserId(req.user.userId)
    res.json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
}

exports.patchProfile = async (req, res, next) => {
  try {
    const updated = await customerService.updateCustomerByUserId(
      req.user.userId,
      req.body
    )
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

exports.patchCustomerById = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);

    // Validate tellerId
    if (isNaN(customerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const updateData = req.body;
    const updatedCustomerId = await customerService.updateCustomerById(customerId, updateData);

    return res.status(200).json({
      success: true,
      data: updatedCustomer,
    });
  } catch (err) {
    next(err);
  }
};

exports.bookSession = async (req, res, next) => {
  try {

    const { customerId, tellerId, packageId } = req.body;

    // Validate input
    if (!customerId || !tellerId || !packageId ) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'All fields (customerId, tellerId, packageId, paymentAmount) are required.',
      });
    }

    // Prepare session data
    const sessionData = {
      customerId,
      tellerId,
      sessionStatus: 'Pending', // Default status
      createdAt: new Date(),
    };

    // Prepare payment data
    const paymentData = {
      customerId,
      packageId,
      status: 'Disabled', // Default status
      createdAt: new Date(),
    };
    console.log(sessionData);
    console.log(paymentData);

    // Call the service to book the session
    const result = await customerService.bookSession(sessionData, paymentData);
    console.log(result);

    return res.status(201).json({
      success: true,
      data: result,
    });
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

exports.getSessionsByCustomerId = async (req, res, next) => {
  try {
    console.log('imhere');
    const sessions = await customerService.getSessionsByCustomerId(
      req.user.userId
    );
    return res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    console.error('FETCH_SESSIONS_ERROR:', err);
    next(err);
  }
};

exports.getPredictionByCustomerId = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.customerId, 10);
    console.log(customerId);
    const prediction = await customerService.getPredictionByCustomerId(customerId);
    return res.status(200).json({ success: true, data: prediction });
  } catch (err) {
    console.error('FETCH_PREDICTION_ERROR:', err);
    next(err);
  }
}