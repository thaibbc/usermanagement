const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    grade: { type: Number, default: null }, // Khối lớp (1-12)
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    teacherName: { type: String, default: '' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    note: { type: String, default: '' },
    status: { type: String, enum: ['active', 'pending', 'closed'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

classroomSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Classroom', classroomSchema);
