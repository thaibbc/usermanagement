const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const ActionLog = require('../models/ActionLog');

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, khoiLop, unit, kyNang, loaiCauHoi, mucDoNhanThuc, search, folderId } = req.query;
        const criteria = {};
        if (khoiLop) criteria.khoiLop = khoiLop;
        if (unit) criteria.unit = unit;
        if (kyNang) criteria.kyNang = kyNang;
        if (loaiCauHoi) criteria.loaiCauHoi = loaiCauHoi;
        if (mucDoNhanThuc) criteria.mucDoNhanThuc = mucDoNhanThuc;
        if (search) criteria.cauHoi = { $regex: search, $options: 'i' };
        if (folderId) criteria.folderId = new mongoose.Types.ObjectId(folderId);

        const total = await Question.countDocuments(criteria);
        const questions = await Question.find(criteria)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ questions, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const payload = req.body;
    if (!payload.khoiLop || !payload.cauHoi) return res.status(400).json({ message: 'khoiLop and cauHoi are required' });
    try {
        const question = await Question.create(payload);
        await ActionLog.create({ action: 'create-question', details: `Created question: ${question.cauHoi.substring(0, 50)}...` });
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!question) return res.status(404).json({ message: 'Question not found' });
        await ActionLog.create({ action: 'update-question', details: `Updated question ${question._id}` });
        res.json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        await ActionLog.create({ action: 'delete-question', details: `Deleted question ${question._id}` });
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
