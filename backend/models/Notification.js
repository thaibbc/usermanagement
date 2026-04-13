const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // HTML content from rich text editor
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Teacher/Admin who created
    type: { type: String, enum: ['general', 'assignment'], default: 'general' }, // general or assignment-related
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }, // If related to assignment
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Students who receive this
    isRead: { type: Map, of: Boolean, default: {} }, // userId -> boolean
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

notificationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Notification', notificationSchema);