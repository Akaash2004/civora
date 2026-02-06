const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin already exists:', adminExists.username);
            process.exit(0);
        }

        const admin = await User.create({
            username: 'admin',
            password: 'adminpassword123',
            role: 'admin',
            isOtpVerified: true
        });

        console.log('Admin created successfully:');
        console.log('Username: admin');
        console.log('Password: adminpassword123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
