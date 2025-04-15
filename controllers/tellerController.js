const tellerService = require('../services/tellerService.js');

const invalidInputTypeMsg={
  status: 'error',
  code: 'INVALID_ID',
  message: 'Invalid Input Type'
}

// GET /tellers
exports.getAllTellers = async (req, res, next) => {
  try {
    const tellers = await tellerService.getAllTellers();
    return res.status(200).json({
      success: true,
      data: tellers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /tellers/browse
exports.getAllBrowseTellers = async (req, res, next) => {
  try {
    const tellers = await tellerService.getAllBrowseTellers();
    res.json(tellers);
  } catch (err) {
    next(err);
  }
};

// GET /tellers/:id
exports.getTellerById = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.id, 10);
    const teller = await tellerService.getTellerById(tellerId);
    if (!teller) {
      return res.status(404).json({ message: 'Teller not found' });
    }
    res.json(teller);
  } catch (err) {
    next(err);
  }
};

// POST /tellers
exports.createTeller = async (req, res, next) => {
  try {
    const tellerData = req.body; // Expecting JSON: { name, email }
    const newTeller = await tellerService.createTeller(tellerData);
    res.status(200).json(newTeller);
  } catch (err) {
    next(err);
  }
};

exports.postTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // Validate tellerId
    if (isNaN(tellerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const packageData = req.body; // Expecting JSON: { packageDetail, questionNumber, price }

    // Call the service to create the package
    const newPackage = await tellerService.createTellerPackage(tellerId, packageData);

    return res.status(201).json({
      success: true,
      data: newPackage,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // Validate tellerId
    if (isNaN(tellerId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid Input Type',
      });
    }

    const packageId = parseInt(req.body.packageId, 10); // Assuming packageId is sent in the request body

    // Validate packageId
    if (isNaN(packageId)) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_PACKAGE_ID',
        message: 'Invalid Package ID',
      });
    }

    // Call the service to delete the package
    await tellerService.deleteTellerPackage(tellerId, packageId);

    return res.status(200).json({
      success: true,
      message: 'Teller package deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

exports.getTellerPackageByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const package = await tellerService.getTellerPackageByTellerId(tellerId);
    return res.status(200).json({
      success: true,
      data: package
    })
    res.json(package);
  } catch (err) {
    next(err);
  }
};

exports.getUpcomingSessionByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await tellerService.getSessionByTellerId("upcoming",tellerId);


    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

exports.getPastSessionByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);
    //check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await tellerService.getSessionByTellerId("past",tellerId);

    return res.status(200).json({
      success:true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

exports.getCurrentSessionByTellerId = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const result = await tellerService.getSessionByTellerId("current",tellerId);

    return res.status(200).json({
      success:true,
      data: result
    });

  } catch (err) {
    next(err);
  }
}

exports.patchAcceptSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    // check if sessionId is a number
    if (isNaN(sessionId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const acceptSession = await tellerService.patchSessionStatus(sessionId,"Processing");

    return res.status(200).json({
      success: true,
      data: acceptSession
    });

  } catch (err) {
    next(err);
  }
};


exports.patchDeclineSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    // check if sessionId is a number
    if (isNaN(sessionId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const declineSession = await tellerService.patchSessionStatus(sessionId,"Declined");

    return res.status(200).json({
      success: true,
      data: declineSession
    });
  } catch (err) {
    next(err);
  }
}

exports.patchEndSession = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    // check if sessionId is a number
    if (isNaN(sessionId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const endSession = await tellerService.patchSessionStatus(sessionId,"Ended");

    return res.status(200).json({
      success: true,
      data: endSession
    });
  } catch (err) {
    next(err);
  }
}