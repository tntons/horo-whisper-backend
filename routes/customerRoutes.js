const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController.js');

router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
// router.patch('/:id', customerController.patchCustomerById);
router.get('/profile', customerController.getProfile)
router.patch('/profile',  customerController.patchProfile)

router.post('/:cusId/attribute', customerController.createPredictionAttribute);
router.get('/:cusId/attribute', customerController.getPredictionAttributeByCustomerId);

router.post('/book-session', customerController.bookSession);

router.get('/get-payment/:paymentId', customerController.getPaymentByPaymentId);
router.patch('/verify-payment/:paymentId', customerController.verifyPayment);

router.get('/sessions', customerController.getSessionsByCustomerId);

router.get('/daily-prediction/:customerId', customerController.getPredictionByCustomerId);


module.exports = router;