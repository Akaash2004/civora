const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to create Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register Citizen
// @route   POST /api/auth/register-citizen
// @access  Public
exports.registerCitizen = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        const userExists = await User.findOne({ phoneNumber });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            phoneNumber,
            password,
            role: 'citizen'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: createToken(user._id),
                message: 'Registration successful. Please verify OTP (Mocked).'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login User (Citizen, Authority, Admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phoneOrIdOrUsername, password } = req.body;

        // Try to find by any unique field
        const user = await User.findOne({
            $or: [
                { phoneNumber: phoneOrIdOrUsername },
                { uniqueId: phoneOrIdOrUsername },
                { username: phoneOrIdOrUsername }
            ]
        });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                phoneNumber: user.phoneNumber,
                uniqueId: user.uniqueId,
                username: user.username,
                role: user.role,
                department: user.department,
                token: createToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP (Mock)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        // Mock verification: success if OTP is 123456
        if (otp === '123456') {
            await User.findOneAndUpdate({ phoneNumber }, { isOtpVerified: true });
            res.json({ message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
