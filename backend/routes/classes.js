const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const ActionLog = require('../models/ActionLog');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

const generateCode = (prefix = '') => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${random}`;
};

// ==================== CLASS ROUTES ====================

// GET all classes
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, studentId, teacherId } = req.query;
        const criteria = {};

        if (status) criteria.status = status;
        if (teacherId) criteria.teacherId = teacherId;

        if (studentId) {
            criteria.$or = [
                { students: studentId },
                { pendingStudents: studentId }
            ];
        }

        const total = await Classroom.countDocuments(criteria);
        const classes = await Classroom.find(criteria)
            .populate('teacherId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({ classes, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET class by code
router.get('/code/:code', async (req, res) => {
    try {
        const classroom = await Classroom.findOne({ code: req.params.code })
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');
        if (!classroom) return res.status(404).json({ message: 'Class not found' });
        res.json(classroom);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET class by ID
router.get('/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');
        if (!classroom) return res.status(404).json({ message: 'Class not found' });
        res.json(classroom);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE class
router.post('/', auth, async (req, res) => {
    const { code, name, grade, teacherId, teacherName, note } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    // Check permissions: admin or teacher
    const isAdmin = req.user.accountType === 'admin';
    const isTeacher = req.user.accountType === 'teacher';
    if (!isAdmin && !isTeacher) {
        return res.status(403).json({ message: 'Chỉ giáo viên hoặc admin mới có thể tạo lớp học' });
    }

    try {
        const classCode = code || generateCode('CL-');
        const existing = await Classroom.findOne({ code: classCode });
        if (existing) {
            return res.status(409).json({ message: 'Class code already exists, retry' });
        }

        const classroom = await Classroom.create({
            code: classCode,
            name,
            grade: grade ? Number(grade) : null,
            teacherId: teacherId || (isTeacher ? req.user._id : null),
            teacherName: teacherName || (isTeacher ? req.user.name : ''),
            note: note || '',
            status: teacherId ? 'active' : 'pending'
        });

        await ActionLog.create({ action: 'create-class', details: `Created class ${name} (${classCode})` });
        res.status(201).json(classroom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE class
router.put('/:id', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền chỉnh sửa lớp học' });
        }

        const updatedClassroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('teacherId', 'name email phone');

        await ActionLog.create({ action: 'update-class', details: `Updated class ${updatedClassroom.name}` });
        res.json(updatedClassroom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE class
router.delete('/:id', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền xóa lớp học' });
        }

        await Classroom.findByIdAndDelete(req.params.id);

        // Delete all assignments for this class
        await Assignment.deleteMany({ classId: req.params.id });

        await ActionLog.create({ action: 'delete-class', details: `Deleted class ${classroom.name}` });
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== STUDENT MANAGEMENT ====================

// REQUEST to join class (pending approval)
router.post('/:id/join', auth, async (req, res) => {
    const userId = req.user._id; // Use authenticated user

    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        if (classroom.students.includes(userId)) {
            return res.status(409).json({ message: 'User already enrolled in class' });
        }

        if (classroom.pendingStudents && classroom.pendingStudents.includes(userId)) {
            return res.status(409).json({ message: 'Enrollment already pending' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        classroom.pendingStudents = classroom.pendingStudents || [];
        classroom.pendingStudents.push(userId);
        await classroom.save();

        await ActionLog.create({
            action: 'request-join-class',
            details: `User ${user.name} requested to join class ${classroom.name}`
        });

        res.json({
            message: 'Request to join class submitted',
            class: classroom
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// APPROVE student request
router.post('/:id/approve/:userId', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền duyệt học sinh' });
        }

        const { userId } = req.params;

        if (!classroom.pendingStudents || !classroom.pendingStudents.includes(userId)) {
            return res.status(404).json({ message: 'No pending request from this user' });
        }

        classroom.pendingStudents = classroom.pendingStudents.filter(id => id.toString() !== userId);
        if (!classroom.students.includes(userId)) {
            classroom.students.push(userId);
        }

        if (classroom.status === 'pending') {
            classroom.status = 'active';
        }

        await classroom.save();

        const user = await User.findById(userId);
        await ActionLog.create({
            action: 'approve-join-class',
            details: `User ${user?.name || userId} approved into class ${classroom.name}`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json(updatedClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// REJECT student request
router.post('/:id/reject/:userId', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền từ chối học sinh' });
        }

        const { userId } = req.params;

        if (!classroom.pendingStudents || !classroom.pendingStudents.includes(userId)) {
            return res.status(404).json({ message: 'No pending request from this user' });
        }

        classroom.pendingStudents = classroom.pendingStudents.filter(id => id.toString() !== userId);
        await classroom.save();

        const user = await User.findById(userId);
        await ActionLog.create({
            action: 'reject-join-class',
            details: `User ${user?.name || userId} rejected from class ${classroom.name}`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json({ message: 'Enrollment request rejected', class: updatedClass });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// BULK APPROVE pending requests
router.post('/:id/approve/bulk', auth, async (req, res) => {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'userIds array is required' });
    }

    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền duyệt học sinh' });
        }

        let approvedCount = 0;
        userIds.forEach(userId => {
            if (classroom.pendingStudents && classroom.pendingStudents.includes(userId)) {
                classroom.pendingStudents = classroom.pendingStudents.filter(id => id.toString() !== userId);
                if (!classroom.students.includes(userId)) {
                    classroom.students.push(userId);
                    approvedCount++;
                }
            }
        });

        if (classroom.status === 'pending' && classroom.students.length > 0) {
            classroom.status = 'active';
        }

        await classroom.save();

        await ActionLog.create({
            action: 'bulk-approve-join',
            details: `Bulk approved ${approvedCount} students to class ${classroom.name}`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json({
            message: `Approved ${approvedCount} students`,
            class: updatedClass
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// BULK REJECT pending requests
router.post('/:id/reject/bulk', auth, async (req, res) => {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'userIds array is required' });
    }

    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền từ chối học sinh' });
        }

        let rejectedCount = 0;
        userIds.forEach(userId => {
            if (classroom.pendingStudents && classroom.pendingStudents.includes(userId)) {
                classroom.pendingStudents = classroom.pendingStudents.filter(id => id.toString() !== userId);
                rejectedCount++;
            }
        });

        await classroom.save();

        await ActionLog.create({
            action: 'bulk-reject-join',
            details: `Bulk rejected ${rejectedCount} students from class ${classroom.name}`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json({
            message: `Rejected ${rejectedCount} students`,
            class: updatedClass
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LEAVE class
router.post('/:id/leave', auth, async (req, res) => {
    const { userId: bodyUserId } = req.body;

    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        let userId = req.user._id; // Default to self
        // Allow teachers/admins to remove other students
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if ((isAdmin || isTeacherOwner) && bodyUserId) {
            userId = bodyUserId;
        }

        const studentIndex = classroom.students.findIndex(s => s.toString() === userId);
        const pendingIndex = classroom.pendingStudents.findIndex(s => s.toString() === userId);

        if (studentIndex === -1 && pendingIndex === -1) {
            return res.status(404).json({ message: 'User is not enrolled or pending in this class' });
        }

        let action;
        if (studentIndex !== -1) {
            classroom.students.splice(studentIndex, 1);
            action = 'leave-class';
        } else {
            classroom.pendingStudents.splice(pendingIndex, 1);
            action = 'cancel-pending-join';
        }

        await classroom.save();
        const user = await User.findById(userId);
        await ActionLog.create({
            action,
            details: `User ${user ? user.name : userId} ${action === 'leave-class' ? 'left' : 'cancelled request for'} class ${classroom.name}`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json(updatedClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// REMOVE student from class (teacher/admin)
router.delete('/:id/students/:studentId', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền xóa học sinh' });
        }

        const { studentId } = req.params;

        classroom.students = classroom.students.filter(id => id.toString() !== studentId);
        classroom.pendingStudents = classroom.pendingStudents.filter(id => id.toString() !== studentId);

        await classroom.save();

        const user = await User.findById(studentId);
        await ActionLog.create({
            action: 'remove-student',
            details: `Student ${user?.name || studentId} removed from class ${classroom.name}`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json(updatedClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD student to class (teacher/admin)
router.post('/:id/students', auth, async (req, res) => {
    const { email, name, phone, note } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // Check permissions: admin or teacher who owns the class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        if (!isAdmin && !isTeacherOwner) {
            return res.status(403).json({ message: 'Không có quyền thêm học sinh' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name: name || email.split('@')[0],
                phone: phone || '',
                accountType: 'student',
                status: 'active'
            });
        }

        if (classroom.students.includes(user._id)) {
            return res.status(409).json({ message: 'Student already in class' });
        }

        if (classroom.pendingStudents && classroom.pendingStudents.includes(user._id)) {
            return res.status(409).json({ message: 'Student already has pending request' });
        }

        classroom.pendingStudents = classroom.pendingStudents || [];
        classroom.pendingStudents.push(user._id);

        if (note) {
            classroom.note = note;
        }

        await classroom.save();

        await ActionLog.create({
            action: 'add-student',
            details: `Student ${user.name} added to class ${classroom.name} (pending approval)`
        });

        const updatedClass = await Classroom.findById(classroom._id)
            .populate('students', 'name email phone')
            .populate('pendingStudents', 'name email phone')
            .populate('teacherId', 'name email phone');

        res.json(updatedClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// IMPORT students from file (teacher/admin)
router.post('/:id/students/import', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        // TODO: Implement file parsing logic
        // This is a placeholder - you'll need to add multer for file upload
        // and parse the file content

        res.json({ message: 'Import functionality to be implemented' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== ASSIGNMENT ROUTES ====================

// GET all assignments for a class
router.get('/:id/assignments', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if user has access to this class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        const isStudent = classroom.students.some(s => String(s) === String(req.user._id));
        if (!isAdmin && !isTeacherOwner && !isStudent) {
            return res.status(403).json({ message: 'Không có quyền truy cập lớp học này' });
        }

        let query = { classId: req.params.id };
        if (req.user.accountType === 'student') {
            // Students only see assignments assigned to them
            query.selectedStudents = req.user._id;
        }

        const assignments = await Assignment.find(query)
            .sort({ createdAt: -1 })
            .populate('selectedStudents', 'name email')
            .populate('questions'); // Populate all question fields

        res.json({ assignments, total: assignments.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single assignment
router.get('/:id/assignments/:assignmentId', auth, async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if user has access to this class
        const isAdmin = req.user.accountType === 'admin';
        const isTeacherOwner = req.user.accountType === 'teacher' && String(classroom.teacherId) === String(req.user._id);
        const isStudent = classroom.students.some(s => String(s) === String(req.user._id));
        if (!isAdmin && !isTeacherOwner && !isStudent) {
            return res.status(403).json({ message: 'Không có quyền truy cập lớp học này' });
        }

        const assignment = await Assignment.findOne({
            _id: req.params.assignmentId,
            classId: req.params.id
        }).populate('selectedStudents', 'name email')
            .populate('questions');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // For students, check if they are selected
        if (req.user.accountType === 'student' && !assignment.selectedStudents.some(s => String(s._id || s) === String(req.user._id))) {
            return res.status(403).json({ message: 'Bạn không được giao bài tập này' });
        }

        res.json(assignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE assignment
router.post('/:id/assignments', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const { title, type, points, color, requirements, questions, selectedStudents, openTime, closeTime } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Đảm bảo questions chỉ chứa ObjectId (lấy từ selectedQuestions)
        const questionIds = Array.isArray(questions)
            ? questions.map(q => typeof q === 'object' && q !== null ? (q._id || q.id) : q).filter(Boolean)
            : [];

        const assignment = await Assignment.create({
            classId: req.params.id,
            title,
            type: type || 'normal',
            points: points || 10,
            color: color || '#00bcd4',
            requirements: requirements || '',
            questions: questionIds,
            selectedStudents: selectedStudents || [],
            openTime: openTime || null,
            closeTime: closeTime || null
        });

        await ActionLog.create({
            action: 'create-assignment',
            details: `Created assignment "${title}" in class ${classroom.name}`
        });

        res.status(201).json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE assignment
router.put('/:id/assignments/:assignmentId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const updateData = { ...req.body };
        if (updateData.questions && Array.isArray(updateData.questions)) {
            updateData.questions = updateData.questions.map(q =>
                typeof q === 'object' && q !== null ? (q._id || q.id) : q
            ).filter(Boolean);
        }

        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.assignmentId, classId: req.params.id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await ActionLog.create({
            action: 'update-assignment',
            details: `Updated assignment "${assignment.title}" in class ${classroom.name}`
        });

        res.json(assignment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE assignment
router.delete('/:id/assignments/:assignmentId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const assignment = await Assignment.findOneAndDelete({
            _id: req.params.assignmentId,
            classId: req.params.id
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await Submission.deleteMany({ assignmentId: req.params.assignmentId });

        await ActionLog.create({
            action: 'delete-assignment',
            details: `Deleted assignment "${assignment.title}" from class ${classroom.name}`
        });

        res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== SUBMISSION ROUTES ====================

// GET all submissions for a class (teacher view or student view)
router.get('/:id/submissions', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const { studentId } = req.query;

        // Get all assignments for this class
        const assignments = await Assignment.find({ classId: req.params.id });
        const assignmentIds = assignments.map(a => a._id);

        // Get submissions for these assignments
        let submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
            .populate('studentId', 'name email')
            .populate('assignmentId', 'title type points')
            .sort({ createdAt: -1 });

        // If studentId is provided, filter to only their submissions
        if (studentId) {
            submissions = submissions.filter(s => {
                const studentIdObj = s.studentId?._id || s.studentId;
                return studentIdObj && studentIdObj.toString() === studentId;
            });
        }

        res.json({ submissions, total: submissions.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET submissions for an assignment (teacher view)
router.get('/:id/assignments/:assignmentId/submissions', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.json({ submissions, total: submissions.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SUBMIT assignment (student)
router.post('/:id/assignments/:assignmentId/submit', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const { userId, answers, content, files } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        if (!classroom.students.includes(userId)) {
            return res.status(403).json({ message: 'Student not enrolled in this class' });
        }

        if (assignment.closeTime && new Date() > new Date(assignment.closeTime)) {
            return res.status(400).json({ message: 'Assignment is closed' });
        }

        if (assignment.selectedStudents && assignment.selectedStudents.length > 0) {
            if (!assignment.selectedStudents.includes(userId)) {
                return res.status(403).json({ message: 'This assignment is not assigned to you' });
            }
        }

        let submission = await Submission.findOne({
            assignmentId: req.params.assignmentId,
            studentId: userId
        });

        let score = null;
        let status = 'submitted';

        // Auto-grade quiz assignments OR assignments with questions
        if (answers && answers.length > 0 && (assignment.type === 'quiz' || (assignment.questions && assignment.questions.length > 0))) {
            const questions = await Question.find({ _id: { $in: assignment.questions } });
            let correctAnswers = 0;

            answers.forEach(studentAnswer => {
                const question = questions.find(q => (q._id || q.id).toString() === studentAnswer.questionId);
                if (question && question.answer) {
                    const studentAns = (studentAnswer.answer || '').trim().toLowerCase();
                    const correctAns = (question.answer || '').trim().toLowerCase();
                    if (studentAns === correctAns) {
                        correctAnswers++;
                    }
                }
            });

            if (questions.length > 0) {
                score = Math.round((correctAnswers / questions.length) * (assignment.points || 10));
                status = 'graded';
            }
        }

        if (submission) {
            submission.answers = answers || submission.answers;
            submission.content = content || submission.content;
            submission.files = files || submission.files;
            submission.status = status;
            submission.score = score;
            submission.submittedAt = Date.now();
            await submission.save();
        } else {
            submission = await Submission.create({
                assignmentId: req.params.assignmentId,
                studentId: userId,
                answers: answers || [],
                content: content || '',
                files: files || [],
                status: status,
                score: score
            });
        }

        await ActionLog.create({
            action: 'submit-assignment',
            details: `Student submitted assignment "${assignment.title}"`
        });

        res.json({ message: 'Assignment submitted successfully', submission });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GRADE submission (teacher)
router.post('/:id/assignments/:assignmentId/grade/:studentId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const { score, feedback } = req.body;

        if (score === undefined || score === null) {
            return res.status(400).json({ message: 'Score is required' });
        }

        if (score < 0 || score > assignment.points) {
            return res.status(400).json({ message: `Score must be between 0 and ${assignment.points}` });
        }

        const submission = await Submission.findOneAndUpdate(
            {
                assignmentId: req.params.assignmentId,
                studentId: req.params.studentId
            },
            {
                score,
                feedback: feedback || '',
                status: 'graded',
                gradedAt: Date.now()
            },
            { new: true, upsert: true }
        );

        await ActionLog.create({
            action: 'grade-assignment',
            details: `Graded assignment "${assignment.title}" for student`
        });

        res.json({ message: 'Assignment graded successfully', submission });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== UTILITY ROUTES ====================

// GET class statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        const totalStudents = Array.isArray(classroom.students) ? classroom.students.length : 0;
        const pendingStudents = Array.isArray(classroom.pendingStudents) ? classroom.pendingStudents.length : 0;

        const stats = {
            classId: classroom._id,
            classCode: classroom.code,
            className: classroom.name,
            status: classroom.status,
            totalStudents,
            approvedStudents: totalStudents,
            pendingStudents,
            lastUpdated: classroom.updatedAt || classroom.createdAt
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET pending requests count
router.get('/:id/pending/count', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        res.json({ count: classroom.pendingStudents?.length || 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CHECK if user is in class
router.get('/:id/check-user/:userId', async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        const { userId } = req.params;
        const isApproved = classroom.students?.some(id => id.toString() === userId);
        const isPending = classroom.pendingStudents?.some(id => id.toString() === userId);

        res.json({
            isApproved: isApproved || false,
            isPending: isPending || false,
            status: isApproved ? 'approved' : (isPending ? 'pending' : 'none')
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE class status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!status || !['active', 'pending', 'closed'].includes(status)) {
        return res.status(400).json({ message: 'Valid status (active/pending/closed) is required' });
    }

    try {
        const classroom = await Classroom.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('teacherId', 'name email phone');

        if (!classroom) return res.status(404).json({ message: 'Class not found' });

        await ActionLog.create({
            action: 'update-status',
            details: `Class ${classroom.name} status changed to ${status}`
        });

        res.json(classroom);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;