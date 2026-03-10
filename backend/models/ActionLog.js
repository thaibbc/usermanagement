const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    userCode: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    details: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActionLog', actionSchema);