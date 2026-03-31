// pages/ClassDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Layout,
    Tabs,
    Spin,
    message,
    Button,
    Typography,
    Space,
    Tag,
    Modal,
    Result,
    Card
} from 'antd';
import {
    HomeOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import CreateAssignmentDrawer from '../Components/CreateAssignmentDrawer';
import ClassInfoCard from '../Components/ClassInfoCard';
import AssignmentList from '../Components/AssignmentList';
import StudentTable from '../Components/StudentTable';
import NotificationList from '../Components/NotificationList';
import StudentResultTab from '../Components/StudentResultTab';
import EbookTab from '../Components/EbookTab';
import SubmitAssignmentModal from '../Components/SubmitAssignmentModal';
import EditClassModal from '../Components/EditClassModal';
import {
    AddStudentModal,
    ImportStudentModal,
    StudentDetailModal,
    EditStudentModal
} from '../Components/StudentModals';
import {
    getClassByCode,
    approveClassJoin,
    rejectClassJoin,
    removeStudentFromClass,
    addStudentToClass,
    importStudentsToClass,
    bulkApproveJoinRequests,
    getClassStats,
    updateClassStatus,
    fetchAssignments,
    fetchSubmissions,
    createAssignment,
    deleteAssignment,
    updateClass
} from '../api/classes';
import { getUser } from '../api/users';
import useIsMobile from '../hooks/useIsMobile';

const { Content } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

export function ClassDetail({ classData: propClassData, onBack }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { classCode } = useParams();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState('baitap');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    // Sử dụng hook useIsMobile để đồng bộ với các trang khác
    const isMobile = useIsMobile(1024);
    const isTablet = useIsMobile(1024);

    // Data states
    const [classData, setClassData] = useState(propClassData || location.state?.classData || null);
    const [loading, setLoading] = useState(!propClassData && !location.state?.classData);
    const [fromAdmin, setFromAdmin] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [classStats, setClassStats] = useState(null);
    const [teacherInfo, setTeacherInfo] = useState({
        name: 'Đang tải...',
        phone: 'Đang tải...',
        email: 'Đang tải...'
    });

    // Assignment states
    const [assignments, setAssignments] = useState([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [submissions, setSubmissions] = useState([]);

    // Result view states
    const [viewResultModalVisible, setViewResultModalVisible] = useState(false);
    const [viewSubmissionModalVisible, setViewSubmissionModalVisible] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Student management states
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [studentDetailModalVisible, setStudentDetailModalVisible] = useState(false);
    const [editStudentModalVisible, setEditStudentModalVisible] = useState(false);
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');
    const [newStudentNote, setNewStudentNote] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Form states for assignment
    const [formData, setFormData] = useState({
        title: '',
        type: undefined,
        points: 10,
        color: '#00bcd4',
        requirements: '',
        questions: [],
        selectedStudents: [],
        useLibrary: false,
        openTime: null,
        closeTime: null
    });

    useEffect(() => {
        if (location.state?.fromManagement) {
            setFromAdmin(true);
        }
    }, [location.state]);

    const isAdmin = user?.accountType === 'admin';
    const isTeacher = user?.accountType === 'teacher';
    const isStudent = user?.accountType === 'student';
    const currentUserId = user?._id || user?.id;

    // Kiểm tra xem user hiện tại có phải chủ lớp không
    const classTeacherId = classData?.teacherId?._id || classData?.teacherId;
    const isClassOwner = isAdmin || (isTeacher && String(classTeacherId) === String(currentUserId));

    const isViewingAsStudent = isStudent || (isTeacher && !isClassOwner);
    const canCreateAssignment = isClassOwner;
    const canManageStudents = isClassOwner;

    const isPending = classData?.pendingStudents?.some(s => String(s._id || s) === String(currentUserId));
    const isApproved = classData?.students?.some(s => String(s._id || s) === String(currentUserId));

    const totalStudents = classStats?.totalStudents ?? (Array.isArray(classData?.students) ? classData.students.length : (classData?.students || 0));

    // ==================== ASSIGNMENT FUNCTIONS ====================
    const loadAssignments = useCallback(async () => {
        if (!classData?._id) return;
        setAssignmentsLoading(true);
        try {
            const response = await fetchAssignments(classData._id);
            const assignmentsData = response?.assignments || response?.data || [];
            setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        } catch (err) {
            console.error('Failed to load assignments:', err);
        } finally {
            setAssignmentsLoading(false);
        }
    }, [classData?._id]);

    const loadSubmissions = useCallback(async () => {
        if (!classData?._id) return;
        try {
            const response = await fetchSubmissions(classData._id, isViewingAsStudent ? currentUserId : null);
            let submissionsData = [];

            if (response?.submissions && Array.isArray(response.submissions)) {
                submissionsData = response.submissions;
            } else if (response?.data && Array.isArray(response.data)) {
                submissionsData = response.data;
            } else if (Array.isArray(response)) {
                submissionsData = response;
            }

            // Chuẩn hóa dữ liệu submissions
            const normalizedSubmissions = submissionsData.map(sub => ({
                ...sub,
                assignmentId: sub.assignmentId?._id || sub.assignmentId || sub.assignment,
                studentId: sub.studentId?._id || sub.studentId || sub.student,
                status: sub.status || (sub.score ? 'graded' : 'submitted')
            }));

            setSubmissions(normalizedSubmissions);
        } catch (err) {
            console.error('Failed to load submissions:', err);
            setSubmissions([]);
        }
    }, [classData?._id, isViewingAsStudent, currentUserId]);

    const handleSaveAssignment = async () => {
        if (!canCreateAssignment) {
            message.warning('Bạn không có quyền tạo bài tập');
            return;
        }

        if (!formData.title || !formData.title.trim()) {
            message.error('Vui lòng nhập tiêu đề bài tập');
            return;
        }
        if (!formData.type) {
            message.error('Vui lòng chọn loại bài tập');
            return;
        }
        if (!formData.points || formData.points <= 0) {
            message.error('Điểm phải lớn hơn 0');
            return;
        }
        if (formData.points > 100) {
            message.error('Điểm không được vượt quá 100');
            return;
        }

        setSubmitLoading(true);
        try {
            // Chuẩn bị dữ liệu câu hỏi để gửi lên API
            const questionsToSave = formData.questions.map(q => ({
                _id: q._id,
                cauHoi: q.cauHoi,
                loaiCauHoi: q.loaiCauHoi,
                mucDoNhanThuc: q.mucDoNhanThuc,
                answer: q.answer,
                yeuCauDeBai: q.yeuCauDeBai,
                noiDungBaiDoc: q.noiDungBaiDoc,
                dapAnA: q.dapAnA,
                dapAnB: q.dapAnB,
                dapAnC: q.dapAnC,
                dapAnD: q.dapAnD
            }));

            await createAssignment(classData._id, {
                title: formData.title.trim(),
                type: formData.type,
                points: formData.points,
                color: formData.color,
                requirements: formData.requirements,
                questions: questionsToSave,
                selectedStudents: formData.selectedStudents,
                openTime: formData.openTime,
                closeTime: formData.closeTime
            });
            message.success('Đã tạo bài tập thành công!');
            closeDrawer();
            await loadAssignments();
            await loadSubmissions();
        } catch (err) {
            console.error('handleSaveAssignment error:', err);
            message.error(err?.message || 'Có lỗi xảy ra khi tạo bài tập');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteAssignment = async (assignment) => {
        if (!canCreateAssignment) return;

        confirm({
            title: 'Xác nhận xóa bài tập',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa bài tập "${assignment.title}"? Hành động này sẽ xóa tất cả bài nộp của học sinh.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteAssignment(classData._id, assignment._id);
                    message.success('Đã xóa bài tập thành công');
                    await loadAssignments();
                    await loadSubmissions();
                } catch (err) {
                    console.error('Delete assignment error:', err);
                    message.error('Có lỗi xảy ra khi xóa bài tập');
                }
            }
        });
    };

    const handleViewAssignment = (assignment) => {
        Modal.info({
            title: assignment.title,
            width: 600,
            content: (
                <div style={{ marginTop: 16 }}>
                    <p><strong>Loại bài tập:</strong> {
                        assignment.type === 'quiz' ? 'Trắc nghiệm' :
                            assignment.type === 'code' ? 'Lập trình' : 'Bài tập thường'
                    }</p>
                    <p><strong>Điểm:</strong> {assignment.points} điểm</p>
                    <p><strong>Số câu hỏi:</strong> {assignment.questions?.length || 0} câu</p>
                    {assignment.requirements && (
                        <p><strong>Yêu cầu:</strong> {assignment.requirements}</p>
                    )}
                    {assignment.openTime && (
                        <p><strong>Thời gian mở:</strong> {new Date(assignment.openTime).toLocaleString('vi-VN')}</p>
                    )}
                    {assignment.closeTime && (
                        <p><strong>Thời gian đóng:</strong> {new Date(assignment.closeTime).toLocaleString('vi-VN')}</p>
                    )}
                    <p><strong>Ngày tạo:</strong> {new Date(assignment.createdAt).toLocaleString('vi-VN')}</p>
                </div>
            ),
            okText: 'Đóng'
        });
    };

    // ==================== TEACHER INFO FUNCTIONS ====================
    const fetchTeacherInfo = useCallback(async (teacherId) => {
        if (!teacherId) {
            setTeacherInfo({
                name: classData?.teacherName || 'Chưa cập nhật',
                phone: 'Chưa cập nhật',
                email: 'Chưa cập nhật'
            });
            return;
        }

        try {
            if (typeof teacherId === 'object' && teacherId !== null) {
                setTeacherInfo({
                    name: teacherId.name || classData?.teacherName || 'Chưa cập nhật',
                    phone: teacherId.phone || 'Chưa cập nhật',
                    email: teacherId.email || 'Chưa cập nhật'
                });
                return;
            }

            const response = await getUser(teacherId);
            if (response) {
                setTeacherInfo({
                    name: response.name || classData?.teacherName || 'Chưa cập nhật',
                    phone: response.phone || 'Chưa cập nhật',
                    email: response.email || 'Chưa cập nhật'
                });
            }
        } catch (err) {
            console.error('Error fetching teacher info:', err);
            setTeacherInfo({
                name: classData?.teacherName || 'Chưa cập nhật',
                phone: 'Chưa cập nhật',
                email: 'Chưa cập nhật'
            });
        }
    }, [classData?.teacherName]);

    // ==================== CLASS DATA FUNCTIONS ====================
    const loadClassData = useCallback(async (code) => {
        if (!code) return;
        try {
            setLoading(true);
            const response = await getClassByCode(code);
            setClassData({
                ...response,
                key: response._id || response.code
            });

            if (response.teacherId) {
                await fetchTeacherInfo(response.teacherId);
            } else {
                setTeacherInfo({
                    name: response.teacherName || 'Chưa cập nhật',
                    phone: 'Chưa cập nhật',
                    email: 'Chưa cập nhật'
                });
            }

            if (response._id) {
                const stats = await getClassStats(response._id);
                setClassStats(stats);
            }
        } catch (err) {
            console.error('Error fetching class data:', err);
            message.error('Không thể tải thông tin lớp học');
            navigate('/student-class');
        } finally {
            setLoading(false);
        }
    }, [navigate, fetchTeacherInfo]);

    useEffect(() => {
        if (classCode) {
            loadClassData(classCode);
        } else if (classData?.code) {
            loadClassData(classData.code);
        }
    }, [classCode, classData?.code, loadClassData]);

    useEffect(() => {
        if (classData?._id) {
            loadAssignments();
            loadSubmissions();
        }
    }, [classData?._id, loadAssignments, loadSubmissions]);

    // ==================== HANDLERS ====================
    const handleCopyCode = () => {
        if (classData?.code) {
            navigator.clipboard.writeText(classData.code);
            message.success('Đã sao chép mã lớp');
        }
    };

    const showDrawer = () => {
        if (!canCreateAssignment) {
            message.warning('Bạn không có quyền tạo bài tập');
            return;
        }
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setFormData({
            title: '',
            type: undefined,
            points: 10,
            color: '#00bcd4',
            requirements: '',
            questions: [],
            selectedStudents: [],
            useLibrary: false,
            openTime: null,
            closeTime: null
        });
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (isClassOwner) {
            navigate('/classes');
        } else {
            navigate('/student-class');
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!canManageStudents) return;

        confirm({
            title: 'Xác nhận thay đổi trạng thái',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn chuyển trạng thái lớp thành "${newStatus === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}"?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await updateClassStatus(classData._id, newStatus);
                    message.success('Cập nhật trạng thái thành công');
                    await loadClassData(classData.code);
                } catch (err) {
                    console.error('Update status error:', err);
                    message.error('Có lỗi xảy ra khi cập nhật trạng thái');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    // ==================== EDIT CLASS HANDLER ====================
    const handleEditClass = () => {
        setEditModalVisible(true);
    };

    const handleClassUpdated = async () => {
        await loadClassData(classData.code);
        message.success('Đã cập nhật thông tin lớp học');
    };

    // ==================== STUDENT MANAGEMENT HANDLERS ====================
    const handleApproveStudent = async (pendingStudent) => {
        if (!canManageStudents) return;

        if (!pendingStudent || !pendingStudent.id) {
            message.error('Không tìm thấy thông tin học sinh');
            return;
        }

        setActionLoading(true);
        try {
            await approveClassJoin(classData._id, pendingStudent.id);
            message.success(`Đã duyệt học sinh ${pendingStudent.name}`);
            await loadClassData(classData.code);
            setSelectedRowKeys([]);
        } catch (err) {
            console.error('approveClassJoin error', err);
            message.error(err?.message || 'Duyệt lớp không thành công');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectStudent = async (pendingStudent) => {
        if (!canManageStudents) return;

        if (!pendingStudent || !pendingStudent.id) {
            message.error('Không tìm thấy thông tin học sinh');
            return;
        }

        setActionLoading(true);
        try {
            await rejectClassJoin(classData._id, pendingStudent.id);
            message.success(`Đã từ chối học sinh ${pendingStudent.name}`);
            await loadClassData(classData.code);
            setSelectedRowKeys([]);
        } catch (err) {
            console.error('rejectClassJoin error', err);
            message.error(err?.message || 'Từ chối lớp không thành công');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSelectedStudents = (keys = null) => {
        if (!canManageStudents) return;

        const keysToDelete = keys || selectedRowKeys;
        if (keysToDelete.length === 0) {
            message.warning('Vui lòng chọn học sinh cần xóa');
            return;
        }

        confirm({
            title: 'Xác nhận xóa học sinh',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa ${keysToDelete.length} học sinh đã chọn?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await Promise.all(keysToDelete.map(studentId =>
                        removeStudentFromClass(classData._id, studentId.replace('pending-', ''))
                    ));
                    message.success(`Đã xóa ${keysToDelete.length} học sinh thành công`);
                    setSelectedRowKeys([]);
                    await loadClassData(classData.code);
                } catch (err) {
                    console.error('Delete students error:', err);
                    message.error('Có lỗi xảy ra khi xóa học sinh');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleAddStudent = async () => {
        if (!canManageStudents) return;

        if (!newStudentEmail.trim()) {
            message.error('Vui lòng nhập email học sinh');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudentEmail)) {
            message.error('Email không hợp lệ');
            return;
        }

        setActionLoading(true);
        try {
            await addStudentToClass(classData._id, {
                email: newStudentEmail,
                name: newStudentName,
                phone: newStudentPhone,
                note: newStudentNote
            });
            message.success('Đã thêm học sinh thành công');
            setAddStudentModalVisible(false);
            resetAddStudentForm();
            await loadClassData(classData.code);
        } catch (err) {
            console.error('Add student error:', err);
            message.error(err?.message || 'Có lỗi xảy ra khi thêm học sinh');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddSelectedStudents = async (selectedStudents) => {
        if (!canManageStudents) return;

        setActionLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const student of selectedStudents) {
            try {
                await addStudentToClass(classData._id, {
                    email: student.email,
                    name: student.name,
                    phone: student.phone || '',
                    note: ''
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to add student ${student.name}:`, err);
                errorCount++;
            }
        }

        if (successCount > 0) {
            message.success(`Đã thêm ${successCount} học sinh thành công`);
            if (errorCount > 0) {
                message.warning(`Không thể thêm ${errorCount} học sinh`);
            }
            setAddStudentModalVisible(false);
            resetAddStudentForm();
            await loadClassData(classData.code);
            setSelectedRowKeys([]); // Reset selection if needed
        } else {
            message.error('Không thể thêm học sinh nào');
        }
        setActionLoading(false);
    };

    const resetAddStudentForm = () => {
        setNewStudentEmail('');
        setNewStudentName('');
        setNewStudentPhone('');
        setNewStudentNote('');
    };

    const handleImportStudents = async () => {
        if (!canManageStudents) return;

        if (!importFile) {
            message.error('Vui lòng chọn file để import');
            return;
        }

        setActionLoading(true);
        try {
            await importStudentsToClass(classData._id, importFile);
            message.success('Import học sinh thành công');
            setImportModalVisible(false);
            setImportFile(null);
            await loadClassData(classData.code);
        } catch (err) {
            console.error('Import students error:', err);
            message.error(err?.message || 'Có lỗi xảy ra khi import');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveAllPending = () => {
        if (!canManageStudents) return;

        const pendingStudents = classData?.pendingStudents || [];
        if (pendingStudents.length === 0) {
            message.info('Không có học sinh nào đang chờ duyệt');
            return;
        }

        const pendingIds = pendingStudents.map(s => s._id || s);

        confirm({
            title: 'Xác nhận phê duyệt tất cả',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            content: `Bạn có chắc chắn muốn phê duyệt ${pendingStudents.length} học sinh đang chờ?`,
            okText: 'Phê duyệt',
            cancelText: 'Hủy',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await bulkApproveJoinRequests(classData._id, pendingIds);
                    message.success(`Đã phê duyệt ${pendingStudents.length} học sinh thành công`);
                    await loadClassData(classData.code);
                    setSelectedRowKeys([]);
                } catch (err) {
                    console.error('Approve all error:', err);
                    message.error('Có lỗi xảy ra khi phê duyệt');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleViewStudent = (student) => {
        setSelectedStudent(student);
        setStudentDetailModalVisible(true);
    };

    const handleEditStudent = (student) => {
        if (!canManageStudents) return;

        setSelectedStudent(student);
        setNewStudentName(student.name);
        setNewStudentEmail(student.email);
        setNewStudentPhone(student.phone);
        setNewStudentNote(student.note);
        setEditStudentModalVisible(true);
    };

    const downloadTemplate = () => {
        const template = 'email,name,phone,note\nstudent1@email.com,Student 1,0123456789,Ghi chú 1\nstudent2@email.com,Student 2,0987654321,Ghi chú 2';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_import_students.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // ==================== FILTER FUNCTIONS ====================
    const getFilteredStudents = () => {
        const approved = (classData?.students || []).map((stu, index) => ({
            key: stu._id || stu,
            id: stu._id || stu,
            code: stu.code || stu.studentCode || `HS${String(index + 1).padStart(3, '0')}`,
            name: stu.name || 'Không tên',
            email: stu.email || '-',
            phone: stu.phone || '-',
            note: stu.note || '',
            status: 'Đã duyệt',
            type: 'approved',
            avatar: stu.avatar,
            joinDate: stu.joinDate || new Date().toLocaleDateString('vi-VN')
        }));

        const pending = (classData?.pendingStudents || []).map((stu, index) => ({
            key: `pending-${stu._id || stu}`,
            id: stu._id || stu,
            code: stu.code || stu.studentCode || `HS${String(approved.length + index + 1).padStart(3, '0')}`,
            name: stu.name || 'Không tên',
            email: stu.email || '-',
            phone: stu.phone || '-',
            note: stu.note || 'Đang chờ duyệt',
            status: 'Chờ duyệt',
            type: 'pending',
            avatar: stu.avatar,
            requestDate: stu.requestDate || new Date().toLocaleDateString('vi-VN')
        }));

        let all = [...approved, ...pending];

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            all = all.filter(s =>
                s.name.toLowerCase().includes(searchLower) ||
                s.email.toLowerCase().includes(searchLower) ||
                s.code.toLowerCase().includes(searchLower) ||
                (s.phone && s.phone.toLowerCase().includes(searchLower))
            );
        }

        if (statusFilter !== 'all') {
            all = all.filter(s => s.type === statusFilter);
        }

        return all;
    };

    const studentData = getFilteredStudents();
    const colors = [
        '#ffffff', '#000000', '#ff0000', '#e91e63', '#9c27b0', '#673ab7',
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
        '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
        '#795548', '#607d8b'
    ];

    const getNotifications = () => {
        if (!classData) return [];
        const studentId = user?._id || user?.id;
        const isPendingCheck = (classData.pendingStudents || []).map(s => String(s._id || s)).includes(String(studentId));
        const isJoinedCheck = (classData.students || []).map(s => String(s._id || s)).includes(String(studentId));
        const notifications = [];

        if (isViewingAsStudent) {
            if (isPendingCheck) {
                notifications.push('Yêu cầu tham gia đã gửi, chờ giáo viên duyệt.');
            } else if (isJoinedCheck) {
                notifications.push('Bạn đã được duyệt tham gia lớp.');
            } else {
                notifications.push('Bạn chưa tham gia hoặc yêu cầu nào. Hãy nhập mã để gửi yêu cầu.');
            }
        }

        if (isClassOwner) {
            if (classData.pendingStudents?.length > 0) {
                notifications.push(`Có ${classData.pendingStudents.length} yêu cầu mới của học sinh cần duyệt.`);
            } else {
                notifications.push('Hiện không có yêu cầu mới từ học sinh');
            }
        }

        if (notifications.length === 0) {
            notifications.push('Chưa có thông báo nào');
        }

        return notifications;
    };

    // ==================== TAB ITEMS ====================
    const tabItems = [
        {
            key: 'baitap',
            label: (
                <span>
                    Bài tập
                    {assignments.length > 0 && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>{assignments.length}</Tag>
                    )}
                </span>
            ),
            children: (
                <AssignmentList
                    assignments={assignments}
                    loading={assignmentsLoading}
                    canCreateAssignment={canCreateAssignment}
                    onCreateAssignment={showDrawer}
                    onViewAssignment={handleViewAssignment}
                    onDeleteAssignment={handleDeleteAssignment}
                    isMobileOrTablet={isTablet}
                    isAdmin={isAdmin && isClassOwner}
                    isTeacher={isTeacher && isClassOwner}
                    fromAdmin={fromAdmin}
                    isStudent={isViewingAsStudent}
                    submissions={submissions}
                    currentUserId={currentUserId}
                    onAssignmentSubmitted={() => {
                        loadAssignments();
                        loadSubmissions();
                    }}
                    isTestMode={false}
                    onViewResult={(assignment, submission) => {
                        setSelectedAssignment(assignment);
                        setSelectedSubmission(submission);
                        setViewResultModalVisible(true);
                    }}
                    onViewSubmission={(assignment, submission) => {
                        setSelectedAssignment(assignment);
                        setSelectedSubmission(submission);
                        setViewSubmissionModalVisible(true);
                    }}
                    classCode={classData?.code || classData?.code}  // Đảm bảo classCode được truyền
                />
            )
        },
        {
            key: 'ketqua',
            label: 'Kết quả rèn luyện',
            children: (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    <div>Chưa có kết quả nào</div>
                </div>
            )
        },
        {
            key: 'hocsinh',
            label: (
                <span>
                    Học sinh
                    {(classData?.pendingStudents?.length > 0 && canManageStudents) && (
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                            {classData.pendingStudents.length} chờ
                        </Tag>
                    )}
                </span>
            ),
            children: (
                <div style={{ padding: isMobile ? '8px' : '16px' }}>
                    {canManageStudents ? (
                        <StudentTable
                            students={getFilteredStudents()}
                            loading={actionLoading}
                            selectedRowKeys={selectedRowKeys}
                            onSelectChange={setSelectedRowKeys}
                            searchText={searchText}
                            onSearchChange={setSearchText}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                            onAddStudent={() => {
                                resetAddStudentForm();
                                setAddStudentModalVisible(true);
                            }}
                            onImportStudent={() => setImportModalVisible(true)}
                            onDeleteSelected={handleDeleteSelectedStudents}
                            onApproveAll={handleApproveAllPending}
                            onApproveStudent={handleApproveStudent}
                            onRejectStudent={handleRejectStudent}
                            onViewStudent={handleViewStudent}
                            onEditStudent={handleEditStudent}
                            canManage={true}
                            isMobile={isMobile}
                            pendingCount={classData?.pendingStudents?.length || 0}
                        />
                    ) : (
                        <StudentResultTab isPending={isPending} isApproved={isApproved} />
                    )}
                </div>
            )
        },
        {
            key: 'thongbao',
            label: 'Thông báo',
            children: (
                <NotificationList
                    notifications={getNotifications()}
                    isMobile={isMobile}
                />
            )
        },
        {
            key: 'renluyen',
            label: 'Rèn luyện, bồi dưỡng',
            children: (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    <div>Chưa có bài rèn luyện nào</div>
                </div>
            )
        }
    ];

    if (isViewingAsStudent) {
        tabItems.push({
            key: 'sachdientu',
            label: 'Sách điện tử',
            children: <EbookTab isMobile={isMobile} />
        });
    }

    // ==================== RENDER ====================
    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
                {!isMobile && (
                    <Sidebar
                        collapsed={isSidebarCollapsed}
                        setCollapsed={setIsSidebarCollapsed}
                    />
                )}
                <Layout style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 250),
                    transition: 'margin-left 0.3s ease'
                }}>
                    <Header
                        onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    // sidebarCollapsed={isSidebarCollapsed}
                    />
                    <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spin size="large" description="Đang tải thông tin lớp học..." />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    if (!classData) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
                {!isMobile && (
                    <Sidebar
                        collapsed={isSidebarCollapsed}
                        setCollapsed={setIsSidebarCollapsed}
                    />
                )}
                <Layout style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 250),
                    transition: 'margin-left 0.3s ease',
                }}>
                    <Header
                        onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        sidebarCollapsed={isSidebarCollapsed}
                    />
                    <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div>
                            <Text type="danger">Không tìm thấy thông tin lớp học</Text>
                            <Button type="primary" onClick={() => navigate('/student-class')} style={{ marginLeft: 16 }}>
                                Quay lại
                            </Button>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
            {!isMobile && (
                <Sidebar
                    collapsed={isSidebarCollapsed}
                    setCollapsed={setIsSidebarCollapsed}
                />
            )}

            <Layout style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 250),
                transition: 'margin-left 0.3s ease'
            }}>
                <Header
                    onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                <div style={{
                    backgroundColor: '#00bcd4',
                    padding: isMobile ? '12px 16px' : '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HomeOutlined style={{ fontSize: isMobile ? '18px' : '20px', color: 'white' }} />
                        <Text style={{ color: 'white', fontSize: isMobile ? '13px' : '14px' }}>
                            {isClassOwner ? 'Quản lý' : 'Học sinh'} - Lớp học - {classData.name}
                        </Text>
                    </div>
                </div>

                <Content style={{ padding: isMobile ? '16px' : '24px' }}>
                    <ClassInfoCard
                        classData={classData}
                        teacherInfo={teacherInfo}
                        totalStudents={totalStudents}
                        onCopyCode={handleCopyCode}
                        onBack={handleBack}
                        onUpdateStatus={handleUpdateStatus}
                        onEdit={canManageStudents ? handleEditClass : null}
                        isMobile={isMobile}
                        isTestMode={false}
                    />

                    {/* Card bao bọc các tab */}
                    <Card
                        style={{
                            marginTop: 24,
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            backgroundColor: 'white'
                        }}
                        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
                        variant="borderless"
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            items={tabItems}
                            size={isMobile ? 'small' : 'middle'}
                            tabBarGutter={isMobile ? 8 : 16}
                            tabBarStyle={{ fontSize: isMobile ? '12px' : '14px' }}
                        />
                    </Card>
                </Content>

                {/* Create Assignment Drawer */}
                {canCreateAssignment && (
                    <CreateAssignmentDrawer
                        visible={drawerVisible}
                        onClose={closeDrawer}
                        onSubmit={handleSaveAssignment}
                        loading={submitLoading}
                        formData={formData}
                        setFormData={setFormData}
                        studentData={studentData.filter(s => s.status === 'Đã duyệt')}
                        colors={colors}
                        isMobile={isMobile}
                        isMobileOrTablet={isTablet}
                    />
                )}

                {/* Edit Class Modal */}
                {canManageStudents && (
                    <EditClassModal
                        visible={editModalVisible}
                        onCancel={() => setEditModalVisible(false)}
                        classData={classData}
                        onSuccess={handleClassUpdated}
                    />
                )}

                {/* Modals - chỉ hiển thị khi có quyền quản lý */}
                {canManageStudents && (
                    <>
                        <AddStudentModal
                            visible={addStudentModalVisible}
                            onCancel={() => {
                                setAddStudentModalVisible(false);
                                resetAddStudentForm();
                            }}
                            onSubmit={handleAddStudent}
                            onAddSelected={handleAddSelectedStudents}
                            loading={actionLoading}
                            email={newStudentEmail}
                            setEmail={setNewStudentEmail}
                            name={newStudentName}
                            setName={setNewStudentName}
                            phone={newStudentPhone}
                            setPhone={setNewStudentPhone}
                            note={newStudentNote}
                            setNote={setNewStudentNote}
                        />

                        <ImportStudentModal
                            visible={importModalVisible}
                            onCancel={() => {
                                setImportModalVisible(false);
                                setImportFile(null);
                            }}
                            onSubmit={handleImportStudents}
                            loading={actionLoading}
                            importFile={importFile}
                            setImportFile={setImportFile}
                            onDownloadTemplate={downloadTemplate}
                        />

                        <EditStudentModal
                            visible={editStudentModalVisible}
                            onCancel={() => {
                                setEditStudentModalVisible(false);
                                resetAddStudentForm();
                            }}
                            onSubmit={() => {
                                message.success('Cập nhật thông tin thành công');
                                setEditStudentModalVisible(false);
                            }}
                            loading={actionLoading}
                            name={newStudentName}
                            setName={setNewStudentName}
                            email={newStudentEmail}
                            phone={newStudentPhone}
                            setPhone={setNewStudentPhone}
                            note={newStudentNote}
                            setNote={setNewStudentNote}
                        />
                    </>
                )}

                <StudentDetailModal
                    visible={studentDetailModalVisible}
                    onCancel={() => setStudentDetailModalVisible(false)}
                    student={selectedStudent}
                />

                {/* Modal xem kết quả bài tập */}
                <SubmitAssignmentModal
                    visible={viewResultModalVisible}
                    onCancel={() => {
                        setViewResultModalVisible(false);
                        setSelectedAssignment(null);
                        setSelectedSubmission(null);
                    }}
                    assignment={selectedAssignment}
                    currentUserId={currentUserId}
                    onSubmitSuccess={() => { }}
                    isViewMode={true}
                    existingSubmission={selectedSubmission}
                />

                {/* Modal xem bài nộp (chưa chấm) */}
                <SubmitAssignmentModal
                    visible={viewSubmissionModalVisible}
                    onCancel={() => {
                        setViewSubmissionModalVisible(false);
                        setSelectedAssignment(null);
                        setSelectedSubmission(null);
                    }}
                    assignment={selectedAssignment}
                    currentUserId={currentUserId}
                    onSubmitSuccess={() => { }}
                    isViewMode={true}
                    existingSubmission={selectedSubmission}
                />
            </Layout>
        </Layout>
    );
}

export default ClassDetail;