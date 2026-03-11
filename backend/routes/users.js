const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');

// GET all users (with optional query filters and pagination)
router.get('/', async (req, res) => {
    try {
        // extract pagination params separately so they don't become filters
        const { page = 1, limit = 10, ...queryFilters } = req.query;
        const filters = { ...queryFilters };

        const pageNum = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * pageSize;

        // compute total count for given filters
        const total = await User.countDocuments(filters);

        const users = await User.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        // ensure each has a code and name (for any returned documents)
        const ops = [];
        users.forEach(u => {
            if (!u.code) {
                u.code = Math.floor(10000 + Math.random() * 90000).toString();
                ops.push(u.save());
            }
            if (!u.name && u.email) {
                u.name = u.email.split('@')[0];
                ops.push(u.save());
            }
        });
        if (ops.length) await Promise.all(ops);

        res.json({ users, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.code) {
            user.code = Math.floor(10000 + Math.random() * 90000).toString();
        }
        if (!user.name && user.email) {
            user.name = user.email.split('@')[0];
        }
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a user
router.post('/', async (req, res) => {
    // allow school field from frontend
    let { name, accountType, level, city, district, school, email, phone, status, password } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
        // generate simple random password
        password = Math.random().toString(36).slice(-8);
    }
    if (!school && email) {
        school = email.split('@')[1] || '';
    }
    const user = new User({ name, accountType, level, city, district, school, email, phone, status, password });
    try {
        const newUser = await user.save();
        // log creation
        await ActionLog.create({ userId: newUser._id, userCode: newUser.code, action: 'create', details: `Created user ${newUser.name}` });
        // email notification removed per request; only log creation
        // (was sending credentials to the new user's address)
        res.status(201).json(newUser);
    } catch (err) {
        // duplicate-key detection
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || 'field';
            const value = err.keyValue ? err.keyValue[field] : '';
            return res.status(400).json({ message: `${field} \"${value}\" đã tồn tại` });
        }
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a user
router.put('/:id', async (req, res) => {
    // allow updating school as well; req.body may contain any of the schema fields
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        await ActionLog.create({ userId: updated._id, userCode: updated.code, action: 'update', details: `Updated user ${updated.name}` });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// CHANGE password for a user
router.put('/:id/password', async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, { password }, { new: true });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        // log action
        await ActionLog.create({ userId: updated._id, userCode: updated.code, action: 'password', details: `Changed password for ${updated.name}` });
        // send notification email containing the new password
        // email notification removed per request; only log password update
        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        await ActionLog.create({ userId: deleted._id, userCode: deleted.code, action: 'delete', details: `Deleted user ${deleted.name}` });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
