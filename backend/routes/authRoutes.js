const { protect, authorize } = require('../middleware/authMiddleware');
const { registerCitizen, login, verifyOtp, registerAuthority } = require('../controllers/authController');

router.post('/register-citizen', registerCitizen);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/register-authority', protect, authorize('admin'), registerAuthority);

module.exports = router;
