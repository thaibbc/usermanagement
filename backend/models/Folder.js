const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    color: {
        type: String,
        default: '#2E3A59'
    },
    order: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
folderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

folderSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Folder', folderSchema);