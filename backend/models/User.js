const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    // full name of the user (họ và tên)
    name: { type: String, required: true },
    // personal details
    dateOfBirth: { type: Date },
    grade: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    // school name
    school: { type: String, default: '' },
    // contact & authentication
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác', ''], default: '' },
    accountType: { type: String, enum: ['admin', 'teacher', 'parent', 'student'], default: '' },
    level: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
});

const bcrypt = require('bcryptjs');

// generate a random 5-digit code before save if not set
userSchema.pre('save', function (next) {
    if (!this.code) {
        // simple random code; collisions extremely unlikely but we use unique index to enforce
        this.code = Math.floor(10000 + Math.random() * 90000).toString();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);