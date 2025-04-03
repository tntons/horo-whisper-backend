const userService = require('../services/userService.js');

// GET /users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// POST /users
exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body; // Expecting JSON: { name, email }
    const newUser = await userService.createUser(userData);
    res.status(200).json(newUser);
  } catch (err) {
    next(err);
  }
};
