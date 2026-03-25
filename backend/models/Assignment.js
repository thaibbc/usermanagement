// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['normal', 'quiz', 'code'], default: 'normal' },
    points: { type: Number, default: 10, min: 1, max: 100 },
    color: { type: String, default: '#00bcd4' },
    requirements: { type: String, default: '' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    selectedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    openTime: { type: Date, default: null },
    closeTime: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

assignmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);