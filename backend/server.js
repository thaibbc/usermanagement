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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});