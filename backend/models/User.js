const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    name: { type: String, required: true },
    password: { type: String, default: '' },
    accountType: { type: String, default: '' },
    level: { type: String, default: '' },
    city: { type: String, default: '' },
    district: { type: String, default: '' },
    school: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
});

// generate a random 5-digit code before save if not set
userSchema.pre('save', function (next) {
    if (!this.code) {
        // simple random code; collisions extremely unlikely but we use unique index to enforce
        this.code = Math.floor(10000 + Math.random() * 90000).toString();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);