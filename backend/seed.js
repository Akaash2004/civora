const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create Admin
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                password: 'adminpassword123',
                role: 'admin',
                isOtpVerified: true
            });
            console.log('Admin created: admin / adminpassword123');
        } else {
            console.log('Admin already exists');
        }

        // Create Test Authority
        const authorityExists = await User.findOne({ uniqueId: 'DEPT001' });
        if (!authorityExists) {
            await User.create({
                uniqueId: 'DEPT001',
                password: 'authority123',
                department: 'Sanitation',
                role: 'authority',
                isOtpVerified: true
            });
            console.log('Authority created: DEPT001 / authority123 (Sanitation)');
        } else {
            console.log('Authority already exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seed();
