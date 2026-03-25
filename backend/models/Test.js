const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, default: 'de-kiem-tra' },
    total: { type: Number, default: 0 },
    starred: { type: Boolean, default: false },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp
testSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Test', testSchema);
