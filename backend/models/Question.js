const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    khoiLop: { type: String, required: true },
    unit: { type: String, default: '' },
    kyNang: { type: String, default: '' },
    cauHoi: { type: String, required: true },
    answer: { type: String, default: '' },
    dapAnA: { type: String, default: '' },
    dapAnB: { type: String, default: '' },
    dapAnC: { type: String, default: '' },
    dapAnD: { type: String, default: '' },
    loaiCauHoi: { type: String, default: '' },
    mucDoNhanThuc: { type: String, default: '' },
    yeuCauDeBai: { type: String, default: '' },
    noiDungBaiDoc: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

questionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Question', questionSchema);
