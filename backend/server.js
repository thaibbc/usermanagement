require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// connect to MongoDB using MONGODB_URI from .env
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
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