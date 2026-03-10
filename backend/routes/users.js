const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');

// GET all users (with optional query filters)
router.get('/', async (req, res) => {
    try {
        const filters = { ...req.query };
        const users = await User.find(filters).sort({ createdAt: -1 });
        // ensure each has a code and name
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
        res.json(users);
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
    let { name, accountType, level, city, district, school, email, phone, status } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!school && email) {
        school = email.split('@')[1] || '';
    }
    const user = new User({ name, accountType, level, city, district, school, email, phone, status });
    try {
        const newUser = await user.save();
        // log creation
        await ActionLog.create({ userId: newUser._id, userCode: newUser.code, action: 'create', details: `Created user ${newUser.name}` });
        res.status(201).json(newUser);
    } catch (err) {
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
