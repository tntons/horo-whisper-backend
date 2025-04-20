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
    const user = await userService.createUser(req.body)
    return res.status(201).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
};
