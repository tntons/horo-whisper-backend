const express = require('express');
const router = express.Router();
const clientController = require('../controllers/customerController.js');


router.post('/book-session', clientController.createSession);

module.exports = router;