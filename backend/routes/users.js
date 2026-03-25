const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Account = require('../models/Account');
const ActionLog = require('../models/ActionLog');

const splitName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return { middleName: '', firstName: '', name: '' };
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { middleName: '', firstName: '', name: '' };
    if (parts.length === 1) {
        // Nếu chỉ 1 từ: để both middleName và firstName giống nhau
        return { middleName: parts[0], firstName: parts[0], name: parts[0] };
    }
    const firstName = parts[parts.length - 1];
    const middleName = parts.slice(0, -1).join(' ');
    return { middleName, firstName, name: `${middleName} ${firstName}`.trim() };
};

const avatarUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ chấp nhận ảnh'), false);
        }
        cb(null, true);
    }
});

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

        // ensure each has a code, name, middleName and firstName (for any returned documents)
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
            if ((!u.middleName || !u.firstName) && u.name) {
                const parts = splitName(u.name);
                u.middleName = parts.middleName;
                u.firstName = parts.firstName;
                // do not overwrite existing meaningful values with blank if it's already set
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
    console.log('GET /api/users/:id called with', req.params.id);
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.code) {
            user.code = Math.floor(10000 + Math.random() * 90000).toString();
        }
        if (!user.name && user.email) {
            user.name = user.email.split('@')[0];
        }
        if ((!user.middleName || !user.firstName) && user.name) {
            const parts = splitName(user.name);
            user.middleName = parts.middleName;
            user.firstName = parts.firstName;
        }
        await user.save();
        console.log('returning user', user._id.toString());
        res.json(user);
    } catch (err) {
        console.error('error fetching user', err);
        res.status(500).json({ message: err.message });
    }
});

// CREATE a user
router.post('/', async (req, res) => {
    // allow profile fields from frontend
    let { name, dateOfBirth, grade, gender, accountType, level, city, district, school, email, phone, status, password } = req.body;

    if (name) {
        const parts = splitName(name);
        name = parts.name;
        req.body.middleName = parts.middleName;
        req.body.firstName = parts.firstName;
    }

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
    const user = new User({ name, dateOfBirth, grade, gender, accountType, level, city, district, school, email, phone, status });
    try {
        const newUser = await user.save();
        // create corresponding account record
        await Account.create({ userId: newUser._id, email, password });
        // log creation
        await ActionLog.create({ userId: newUser._id, userCode: newUser.code, action: 'create', details: `Created user ${newUser.name}` });
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

// UPLOAD avatar for a user
router.post('/:id/avatar', avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file ảnh' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const encoded = req.file.buffer.toString('base64');
        const avatarDataUrl = `data:${req.file.mimetype};base64,${encoded}`;

        user.avatar = avatarDataUrl;
        user.avatarUrl = avatarDataUrl; // keep compatible với frontend hiện tại
        await user.save();

        await ActionLog.create({ userId: user._id, userCode: user.code, action: 'update', details: `Updated avatar for user ${user.name}` });

        res.json({ message: 'Avatar uploaded', avatarUrl: avatarDataUrl });
    } catch (err) {
        console.error('avatar upload failed', err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE a user
router.put('/:id', async (req, res) => {
    // allow updating school as well; req.body may contain any of the schema fields
    try {
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) return res.status(404).json({ message: 'User not found' });

        // build 'middleName'/'firstName' from name if provided; or build name from provided middle+first
        if (req.body.name) {
            const parts = splitName(req.body.name);
            req.body.middleName = parts.middleName;
            req.body.firstName = parts.firstName;
            req.body.name = parts.name;
        } else if (req.body.middleName !== undefined || req.body.firstName !== undefined) {
            const middle = (req.body.middleName || existingUser.middleName || '').trim();
            const first = (req.body.firstName || existingUser.firstName || '').trim();
            const full = [middle, first].filter(Boolean).join(' ').trim();
            req.body.name = full || existingUser.name;
            req.body.middleName = middle;
            req.body.firstName = first;
        }

        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        // if email was changed, update account record too
        if (req.body.email) {
            await Account.findOneAndUpdate({ userId: updated._id }, { email: req.body.email });
        }
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
        const account = await Account.findOne({ userId: req.params.id });
        if (!account) return res.status(404).json({ message: 'Account not found' });
        account.password = password; // hashed in pre-save
        await account.save();
        // log against user
        await ActionLog.create({ userId: account.userId, userCode: account.userCode || '', action: 'password', details: `Changed password for user ${account.userId}` });
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
        // also remove associated account
        await Account.deleteOne({ userId: req.params.id });
        await ActionLog.create({ userId: deleted._id, userCode: deleted.code, action: 'delete', details: `Deleted user ${deleted.name}` });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// authentication endpoint
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// login route returns a JWT token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // log incoming attempt (never log password)
    console.log('LOGIN attempt:', { email });
    if (!email || !password) {
        console.log('LOGIN failed: missing credentials', req.body);
        return res.status(400).json({ message: 'Email and password required' });
    }
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            console.log('LOGIN failed: account not found', email);
            return res.status(404).json({ message: 'User not found' });
        }
        const valid = await bcrypt.compare(password, account.password);
        if (!valid) {
            console.log('LOGIN failed: wrong password for', email);
            return res.status(401).json({ message: 'Incorrect password' });
        }
        // load user profile for payload
        const user = await User.findById(account.userId);
        if (!user) {
            console.log('LOGIN failed: linked user missing for account', email);
            return res.status(500).json({ message: 'Internal error' });
        }
        // generate token
        // include user fields so frontend can display them
        const payload = {
            id: user._id,
            email: account.email,
            accountType: user.accountType,
            name: user.name,
            avatar: user.avatar || '',
            avatarUrl: user.avatarUrl || ''
        };
        const token = jwt.sign({ id: user._id, email: account.email, accountType: user.accountType }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
        console.log('LOGIN success for', email);
        res.json({ token, user: payload });
    } catch (err) {
        console.error('LOGIN error', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
