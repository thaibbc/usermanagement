const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLog');

// GET logs optionally filtered by userCode or action, with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, userCode, action } = req.query;
        const filters = {};
        if (userCode) filters.userCode = userCode;
        if (action) filters.action = action;

        const pageNum = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * pageSize;

        const total = await ActionLog.countDocuments(filters);
        const logs = await ActionLog.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        res.json({ logs, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;