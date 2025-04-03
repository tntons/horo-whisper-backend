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