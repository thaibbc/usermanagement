require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// ensure upload dirs for avatars exist
const avatarDir = path.join(__dirname, 'uploads', 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect to MongoDB using MONGODB_URI from .env
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    // optional admin seeding; set SEED_ADMIN=true to enable
    if (process.env.SEED_ADMIN === 'true') {
        try {
            const fs = require('fs');
            const path = require('path');
            const User = require('./models/User');
            const Account = require('./models/Account');
            // read default admin info from data file (not hardcoded)
            let adminData = {};
            try {
                const raw = fs.readFileSync(path.join(__dirname, 'data', 'admin.json'));
                adminData = JSON.parse(raw);
            } catch (e) {
                console.warn('Could not read admin.json, using built-in defaults');
                adminData = { name: 'Testbank', email: 'testitdn@gmail.com', password: 'sachso', accountType: 'admin' };
            }
            // only create the admin user/account if it doesn't already exist
            const existing = await User.findOne({ email: adminData.email });
            if (!existing) {
                const newUser = await User.create({
                    name: adminData.name,
                    email: adminData.email,
                    accountType: adminData.accountType || 'admin'
                });
                await Account.create({ userId: newUser._id, email: adminData.email, password: adminData.password });
                console.log(`Created default admin user & account (${adminData.email} / ${adminData.password})`);
            } else {
                const acct = await Account.findOne({ email: adminData.email });
                if (!acct) {
                    await Account.create({ userId: existing._id, email: adminData.email, password: adminData.password });
                    console.log('Created missing account for existing admin user');
                }
            }
            // intentionally no dumping of accounts here
        } catch (err) {
            console.error('Error creating default user:', err);
        }
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// middlewares
app.use(cors());
app.use(express.json());

// routes
const usersRouter = require('./routes/users');
const historyRouter = require('./routes/history');
app.use('/api/users', usersRouter);
app.use('/api/history', historyRouter);
app.get('/', (req, res) => {
    res.send('User management backend is running');
});

// quick utility endpoint for checking mail delivery
app.get('/api/test-email', async (req, res) => {
    const to = req.query.to;
    if (!to) return res.status(400).send('query parameter "to" required');
    try {
        const { transporter } = require('./utils/mailer');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@example.com',
            to,
            subject: 'Test message from user-management backend',
            text: 'This is a transport test. If you receive this, the mailer is working.',
        });
        res.json({ success: true, info });
    } catch (err) {
        console.error('test-email failed', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});