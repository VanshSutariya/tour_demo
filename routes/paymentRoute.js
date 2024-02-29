const express = require('express');
const paymentController = require('../controller/paymentController');
const authController = require('../controller/authController');
const router = express.Router();

router.use(authController.protect);

router.post('/create-checkout-session/:tourId', paymentController.checkout);

module.exports = router;
