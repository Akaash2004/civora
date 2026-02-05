const express = require('express');
const router = express.Router();
const { registerCitizen, login, verifyOtp } = require('../controllers/authController');

router.post('/register-citizen', registerCitizen);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

module.exports = router;
