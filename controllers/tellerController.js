const tellerService = require('../services/tellerService.js');

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
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid teller ID provided'
      });
    }

    const package = await tellerService.getTellerPackageById(tellerId);
    return res.status(200).json({
      success: true,
      data:package
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
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid teller ID provided'
      });
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