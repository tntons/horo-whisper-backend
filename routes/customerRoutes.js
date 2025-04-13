const express = require('express');
const router = express.Router();
const clientController = require('../controllers/customerController.js');


router.post('/book-session', clientController.bookSession);
router.get('/get-payment/:paymentId', clientController.getPaymentByPaymentId);
router.get('/verify-payment/:paymentId', clientController.verifyPayment);


module.exports = router;