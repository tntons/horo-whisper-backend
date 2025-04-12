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
    res.json(tellers);
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

exports.getTellerPackageById = async (req, res, next) => {
  try {
    const tellerId = parseInt(req.params.tellerId, 10);

    // check if tellerId is a number
    if (isNaN(tellerId)) {
      return res.status(400).json(invalidInputTypeMsg);
    }

    const package = await tellerService.getTellerPackageById(tellerId);
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

    const teller = await tellerService.getUpcomingSessionByTellerId(tellerId);


    return res.status(200).json({
      success: true,
      data: teller
    });

  } catch (err) {
    next(err);
  }
};

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