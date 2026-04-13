// Script để tạo lớp học mẫu
const mongoose = require('mongoose');
require('dotenv').config();

const Classroom = require('./models/Classroom');
const User = require('./models/User');

async function createSampleClass() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management');
        console.log('Connected to MongoDB');

        // Tìm giáo viên
        const teacher = await User.findOne({ email: 'thaibc13@gmail.com' });
        if (!teacher) {
            console.log('Teacher not found, creating...');
            const newTeacher = await User.create({
                name: 'thai Tran',
                email: 'thaibc13@gmail.com',
                phone: '0383714022',
                accountType: 'teacher',
                status: 'active'
            });
            teacherId = newTeacher._id;
        } else {
            teacherId = teacher._id;
        }

        // Tạo lớp học
        const classroom = await Classroom.create({
            code: 'PQBD0P',
            name: 'test1',
            grade: 1,
            teacherId: teacherId,
            teacherName: 'thai Tran',
            status: 'active',
            note: 'Lớp học mẫu'
        });

        console.log('Created classroom:', classroom);
        console.log('Class code: PQBD0P');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createSampleClass();