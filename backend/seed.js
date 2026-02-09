const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const departments = [
    { uniqueId: 'SAN001', department: 'Sanitation', password: 'sanitation123' },
    { uniqueId: 'PWD001', department: 'PWD', password: 'pwd123' },
    { uniqueId: 'WAT001', department: 'Water Supply', password: 'water123' },
    { uniqueId: 'ELE001', department: 'Electricity', password: 'electricity123' },
    { uniqueId: 'DRA001', department: 'Drainage', password: 'drainage123' }
];

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

        // Create Department Authorities
        for (const dept of departments) {
            const authorityExists = await User.findOne({ uniqueId: dept.uniqueId });
            if (!authorityExists) {
                await User.create({
                    uniqueId: dept.uniqueId,
                    password: dept.password,
                    department: dept.department,
                    role: 'authority',
                    isOtpVerified: true
                });
                console.log(`Authority created: ${dept.uniqueId} / ${dept.password} (${dept.department})`);
            } else {
                // Update password to ensure it matches what we expect
                authorityExists.password = dept.password;
                await authorityExists.save();
                console.log(`Authority updated: ${dept.uniqueId} password reset to ${dept.password}`);
            }
        }

        console.log('\nSeed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seed();

