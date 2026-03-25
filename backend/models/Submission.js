// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        answer: { type: String, default: '' }
    }],
    content: { type: String, default: '' },
    files: [{ type: String, default: [] }],
    score: { type: Number, default: null, min: 0 },
    feedback: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date, default: null }
});

submissionSchema.pre('save', function (next) {
    if (this.score !== null && this.score !== undefined) {
        this.status = 'graded';
        this.gradedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('Submission', submissionSchema);