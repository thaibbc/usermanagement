// setup-admin.js - Create admin user from admin.json
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const adminData = require('./data/admin.json');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/usermanagement', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log(`Admin ID: ${existingAdmin._id}`);
            return existingAdmin._id;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const adminUser = new User({
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            accountType: adminData.accountType
        });

        await adminUser.save();

        console.log('Admin user created successfully');
        console.log(`Admin ID: ${adminUser._id}`);

        return adminUser._id;

    } catch (error) {
        console.error('Failed to create admin user:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createAdmin();