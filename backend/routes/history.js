const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLog');

// GET logs optionally filtered by userCode or action
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.userCode) filters.userCode = req.query.userCode;
        if (req.query.action) filters.action = req.query.action;
        const logs = await ActionLog.find(filters).sort({ createdAt: -1 }).limit(1000);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;