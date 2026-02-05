const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: function () { return this.role === 'citizen'; },
        unique: true,
        sparse: true // Allows multiple null/missing values for non-citizen roles
    },
    uniqueId: {
        type: String,
        required: function () { return this.role === 'authority'; },
        unique: true,
        sparse: true
    },
    username: {
        type: String,
        required: function () { return this.role === 'admin'; },
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['citizen', 'authority', 'admin'],
        required: true
    },
    department: {
        type: String,
        enum: ['PWD', 'Sanitation', 'Water Supply', 'Electricity', 'Drainage', 'Admin'],
        required: function () { return this.role === 'authority'; }
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
