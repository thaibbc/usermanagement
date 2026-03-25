// routes/library.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Folder = require('../models/Folder');
const Test = require('../models/Test');
const ActionLog = require('../models/ActionLog');

// Middleware kiểm tra authentication (giả sử bạn đã có)
const auth = require('../middleware/auth');

// Hàm thu thập tất cả ID folder con
async function collectChildFolderIds(folderId) {
    const ids = [folderId.toString()];
    const children = await Folder.find({ parentId: folderId });
    for (const child of children) {
        ids.push(...await collectChildFolderIds(child._id));
    }
    return ids;
}

// ====================== FOLDER ROUTES ======================

// GET /folders - Lấy tất cả folders của user hiện tại
router.get('/folders', auth, async (req, res) => {
    try {
        const folders = await Folder.find({ userId: req.user.id }).sort({ order: 1, createdAt: 1 });
        res.json(folders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /folders - Tạo folder mới
router.post('/folders', auth, async (req, res) => {
    const { title, parentId = null, color = '#2E3A59', order = 1 } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
    }

    let normalizedParentId = null;
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
        normalizedParentId = parentId;
    }

    try {
        const folder = new Folder({
            title: title.trim(),
            userId: req.user.id,
            parentId: normalizedParentId,
            color,
            order
        });

        await folder.save();

        // Log hành động
        await ActionLog.create({
            userId: req.user?.id,
            action: 'create-folder',
            details: `Created folder "${title}" with color ${color}`
        });

        res.status(201).json(folder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /folders/:id - Cập nhật folder
router.put('/folders/:id', auth, async (req, res) => {
    try {
        const { title, parentId, color, order } = req.body;

        // Kiểm tra folder tồn tại và thuộc về user
        const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.id });
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or access denied' });
        }

        // Cập nhật các trường
        if (title) folder.title = title.trim();
        if (color) folder.color = color;
        if (order) folder.order = order;

        // Xử lý parentId
        if (parentId !== undefined) {
            if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
                // Kiểm tra không tự làm cha của chính mình
                if (parentId === req.params.id) {
                    return res.status(400).json({ message: 'Cannot set folder as its own parent' });
                }
                folder.parentId = parentId;
            } else {
                folder.parentId = null;
            }
        }

        folder.updatedAt = Date.now();
        await folder.save();

        // Log hành động
        await ActionLog.create({
            userId: req.user?.id,
            action: 'update-folder',
            details: `Updated folder "${folder.title}"`
        });

        res.json(folder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /folders/:id - Xóa folder và tất cả folder con
router.delete('/folders/:id', auth, async (req, res) => {
    try {
        const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.id });
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found or access denied' });
        }

        // Thu thập tất cả ID folder con
        const folderIds = await collectChildFolderIds(folder._id);

        // Xóa tất cả tests trong các folder này
        await Test.deleteMany({ folderId: { $in: folderIds } });

        // Xóa tất cả folders
        await Folder.deleteMany({ _id: { $in: folderIds } });

        // Log hành động
        await ActionLog.create({
            userId: req.user?.id,
            action: 'delete-folder',
            details: `Deleted folder "${folder.title}" and ${folderIds.length - 1} children`
        });

        res.json({
            message: 'Folder and children deleted successfully',
            deletedCount: folderIds.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ====================== TEST ROUTES ======================

// GET /tests - Lấy tất cả tests với phân trang và filter
router.get('/tests', auth, async (req, res) => {
    try {
        const { folderId, starred, search, page = 1, limit = 20 } = req.query;

        const criteria = { userId: req.user.id };

        if (folderId && mongoose.Types.ObjectId.isValid(folderId)) {
            criteria.folderId = folderId;
        }

        if (starred !== undefined) {
            criteria.starred = starred === 'true';
        }

        if (search) {
            criteria.name = { $regex: search, $options: 'i' };
        }

        const total = await Test.countDocuments(criteria);
        const tests = await Test.find(criteria)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .populate('questions', 'question type level');

        res.json({
            tests,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /tests/:id - Lấy chi tiết một test
router.get('/tests/:id', auth, async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('questions');

        if (!test) {
            return res.status(404).json({ message: 'Test not found or access denied' });
        }

        res.json(test);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /tests - Tạo test mới
router.post('/tests', auth, async (req, res) => {
    const { name, type = 'de-kiem-tra', total = 0, starred = false, folderId = null, questions = [] } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        const test = new Test({
            name: name.trim(),
            userId: req.user.id,
            type,
            total: total || questions.length || 0,
            starred,
            folderId: folderId && mongoose.Types.ObjectId.isValid(folderId) ? folderId : null,
            questions: questions.filter(id => mongoose.Types.ObjectId.isValid(id))
        });

        await test.save();

        // Log hành động
        await ActionLog.create({
            userId: req.user?.id,
            action: 'create-test',
            details: `Created test "${name}"`
        });

        res.status(201).json(test);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /tests/:id - Cập nhật test
router.put('/tests/:id', auth, async (req, res) => {
    try {
        const { name, type, total, starred, folderId, questions } = req.body;

        const test = await Test.findOne({ _id: req.params.id, userId: req.user.id });
        if (!test) {
            return res.status(404).json({ message: 'Test not found or access denied' });
        }

        // Cập nhật các trường
        if (name) test.name = name.trim();
        if (type) test.type = type;
        if (total !== undefined) test.total = total;
        if (starred !== undefined) test.starred = starred;
        if (folderId !== undefined) {
            test.folderId = folderId && mongoose.Types.ObjectId.isValid(folderId) ? folderId : null;
        }
        if (questions) {
            test.questions = questions.filter(id => mongoose.Types.ObjectId.isValid(id));
        }

        test.updatedAt = Date.now();
        await test.save();

        // Log hành động
        await ActionLog.create({
            userId: req.user?.id,
            action: 'update-test',
            details: `Updated test "${test.name}"`
        });

        res.json(test);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /tests/:id - Xóa test
router.delete('/tests/:id', auth, async (req, res) => {
    try {
        const test = await Test.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!test) {
            return res.status(404).json({ message: 'Test not found or access denied' });
        }

        // Log hành động
        await ActionLog.create({
            userId: req.user?.id,
            action: 'delete-test',
            details: `Deleted test "${test.name}"`
        });

        res.json({ message: 'Test deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /tests/:id/star - Đánh dấu starred
router.patch('/tests/:id/star', auth, async (req, res) => {
    try {
        const { starred } = req.body;

        const test = await Test.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { starred, updatedAt: Date.now() },
            { new: true }
        );

        if (!test) {
            return res.status(404).json({ message: 'Test not found or access denied' });
        }

        res.json(test);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ====================== BULK OPERATIONS ======================

// POST /tests/bulk - Tạo nhiều test cùng lúc
router.post('/tests/bulk', auth, async (req, res) => {
    const { tests } = req.body;

    if (!Array.isArray(tests) || tests.length === 0) {
        return res.status(400).json({ message: 'Tests array is required' });
    }

    try {
        const createdTests = await Test.insertMany(
            tests.map(t => ({
                ...t,
                userId: req.user.id,
                name: t.name?.trim(),
                folderId: t.folderId && mongoose.Types.ObjectId.isValid(t.folderId) ? t.folderId : null,
                questions: (t.questions || []).filter(id => mongoose.Types.ObjectId.isValid(id))
            }))
        );

        await ActionLog.create({
            userId: req.user?.id,
            action: 'bulk-create-tests',
            details: `Created ${createdTests.length} tests`
        });

        res.status(201).json(createdTests);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /tests/bulk - Xóa nhiều test cùng lúc
router.delete('/tests/bulk', auth, async (req, res) => {
    const { testIds } = req.body;

    if (!Array.isArray(testIds) || testIds.length === 0) {
        return res.status(400).json({ message: 'Test IDs array is required' });
    }

    try {
        const result = await Test.deleteMany({ _id: { $in: testIds }, userId: req.user.id });

        await ActionLog.create({
            userId: req.user?.id,
            action: 'bulk-delete-tests',
            details: `Deleted ${result.deletedCount} tests`
        });

        res.json({
            message: 'Tests deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;