const express = require('express');
const router = express.Router();
const clientController = require('../controllers/customerController.js');

router.post('/', clientController.createCustomer);

router.post('/book-session', clientController.bookSession);
router.get('/get-payment/:paymentId', clientController.getPaymentByPaymentId);
router.patch('/verify-payment/:paymentId', clientController.verifyPayment);


module.exports = router;