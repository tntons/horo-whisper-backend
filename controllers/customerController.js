const clientService = require('../services/customerService.js');

// POST /clients
exports.bookSession = async (req, res, next) => {
  try {
    const {sessionData, paymentData} = req.body; 
    const result = await clientService.bookSession(sessionData, paymentData);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};