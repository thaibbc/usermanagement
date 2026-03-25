// migration.js - Migrate existing folders and tests to add userId
const mongoose = require('mongoose');
const User = require('./models/User');
const Folder = require('./models/Folder');
const Test = require('./models/Test');

async function migrateData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/usermanagement', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Find admin user
        const adminUser = await User.findOne({ accountType: 'admin' });
        if (!adminUser) {
            console.log('No admin user found. Please create admin user first.');
            return;
        }

        console.log(`Found admin user: ${adminUser.email} (${adminUser._id})`);

        // Update all folders without userId
        const folderResult = await Folder.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: adminUser._id } }
        );
        console.log(`Updated ${folderResult.modifiedCount} folders`);

        // Update all tests without userId
        const testResult = await Test.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: adminUser._id } }
        );
        console.log(`Updated ${testResult.modifiedCount} tests`);

        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateData();