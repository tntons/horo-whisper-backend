const clientService = require('../services/customerService.js');

// POST /clients
exports.createSession = async (req, res, next) => {
  try {
    const sessionData = req.body; 
    const newSession = await clientService.createSession(sessionData);
    res.status(200).json(newSession);
  } catch (err) {
    next(err);
  }
};