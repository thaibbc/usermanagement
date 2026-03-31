// Components/AssignmentList.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Thêm useParams
import { Table, Button, Tag, Space, Spin, Typography, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, BookOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import CreateAssignmentDrawer from './CreateAssignmentDrawer';
import dayjs from 'dayjs';

const { Text } = Typography;
const { confirm } = Modal;

const AssignmentList = ({
    assignments = [],
    loading = false,
    canCreateAssignment = false,
    onCreateAssignment,
    onViewAssignment,
    onDeleteAssignment,
    onEditAssignment,
    isMobileOrTablet = false,
    isAdmin = false,
    isTeacher = false,
    fromAdmin = false,
    isStudent = false,
    submissions = [],
    currentUserId = null,
    onAssignmentSubmitted,
    isTestMode = false,
    onViewResult = null,
    onViewSubmission = null,
    colors = [],
    studentData = [],
    onSubmitEdit,
    classCode: propClassCode // Đổi tên để tránh nhầm lẫn
}) => {
    const navigate = useNavigate();
    const { classCode: paramClassCode } = useParams(); // Lấy classCode từ URL

    // Ưu tiên sử dụng classCode từ URL, nếu không có thì dùng từ props
    const classCode = paramClassCode || propClassCode;

    // Debug: log giá trị classCode
    React.useEffect(() => {
        console.log('AssignmentList - classCode from URL:', paramClassCode);
        console.log('AssignmentList - classCode from props:', propClassCode);
        console.log('AssignmentList - final classCode:', classCode);
    }, [paramClassCode, propClassCode, classCode]);

    const [submitModalVisible, setSubmitModalVisible] = React.useState(false);
    const [selectedAssignment, setSelectedAssignment] = React.useState(null);
    const [viewResultModalVisible, setViewResultModalVisible] = React.useState(false);
    const [viewSubmissionModalVisible, setViewSubmissionModalVisible] = React.useState(false);
    const [selectedSubmission, setSelectedSubmission] = React.useState(null);
    const [editDrawerVisible, setEditDrawerVisible] = React.useState(false);
    const [editFormData, setEditFormData] = React.useState(null);
    const [editLoading, setEditLoading] = React.useState(false);

    const getSubmissionStats = (assignmentId) => {
        if (!assignmentId || !Array.isArray(submissions)) {
            return { submitted: 0, graded: 0, total: 0 };
        }
        const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
        const submitted = assignmentSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
        const graded = assignmentSubmissions.filter(s => s.status === 'graded').length;
        return { submitted, graded, total: assignmentSubmissions.length };
    };

    const getStudentSubmissionStatus = (assignmentId) => {
        if (!currentUserId || !assignmentId) {
            return { status: 'not_submitted', label: 'Chưa nộp', color: 'red' };
        }
        const submission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === currentUserId);
        if (!submission) return { status: 'not_submitted', label: 'Chưa nộp', color: 'red' };
        if (submission.status === 'submitted') return { status: 'submitted', label: 'Đã nộp', color: 'orange' };
        if (submission.status === 'graded') return { status: 'graded', label: 'Đã chấm', color: 'green' };
        return { status: 'not_submitted', label: 'Chưa nộp', color: 'red' };
    };

    const handleSubmitAssignment = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmitModalVisible(true);
    };

    const handleViewResult = (assignment, submission) => {
        setSelectedAssignment(assignment);
        setSelectedSubmission(submission);
        setViewResultModalVisible(true);
    };

    const handleViewSubmission = (assignment, submission) => {
        setSelectedAssignment(assignment);
        setSelectedSubmission(submission);
        setViewSubmissionModalVisible(true);
    };

    // SỬA HÀM NÀY - Chuyển sang trang mới thay vì mở modal
    const handleViewDetail = (assignment) => {
        console.log('handleViewDetail called');
        console.log('classCode value:', classCode);
        console.log('assignment:', assignment);
        console.log('assignment._id:', assignment?._id);

        if (classCode && assignment?._id) {
            const path = `/classes/${classCode}/assignments/${assignment._id}`;
            console.log('Navigating to:', path);
            navigate(path);
        } else {
            console.error('Missing data:', { classCode, assignmentId: assignment?._id });
            message.error('Không thể mở chi tiết bài tập');
        }
    };

    const handleSubmitSuccess = () => {
        setSubmitModalVisible(false);
        setSelectedAssignment(null);
        if (onAssignmentSubmitted) {
            onAssignmentSubmitted();
        }
    };

    // Xử lý chỉnh sửa bài tập
    const handleEditAssignment = (assignment) => {
        const editData = {
            _id: assignment._id,
            title: assignment.title || '',
            type: assignment.type || 'normal',
            points: assignment.points || 10,
            requirements: assignment.requirements || '',
            color: assignment.color || '#00bcd4',
            openTime: assignment.openTime ? dayjs(assignment.openTime) : null,
            closeTime: assignment.closeTime ? dayjs(assignment.closeTime) : null,
            selectedStudents: (assignment.selectedStudents || assignment.assignedTo || []).map(s => typeof s === 'object' && s !== null ? (s._id || s.id) : s),
            questions: assignment.questions || [],
            useLibrary: assignment.questions && assignment.questions.length > 0
        };
        setEditFormData(editData);
        setEditDrawerVisible(true);
    };

    // Xử lý submit chỉnh sửa
    const handleEditSubmit = async () => {
        if (onSubmitEdit) {
            setEditLoading(true);
            try {
                await onSubmitEdit(editFormData);
                setEditDrawerVisible(false);
                setEditFormData(null);
                if (onAssignmentSubmitted) {
                    onAssignmentSubmitted();
                }
            } catch (error) {
                console.error('Edit assignment error:', error);
                message.error('Có lỗi xảy ra khi cập nhật bài tập');
            } finally {
                setEditLoading(false);
            }
        }
    };

    const canDoAssignment = isStudent || isTestMode;
    const showCreateButton = canCreateAssignment && !isTestMode;

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Bài tập',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            render: (text, record) => (
                <Space>
                    <FileTextOutlined style={{ color: record.color || '#00bcd4' }} />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Nộp bài',
            key: 'submission',
            width: 120,
            align: 'center',
            render: (_, record) => {
                if ((isTeacher || isAdmin) && !isTestMode) {
                    const stats = getSubmissionStats(record._id);
                    return (
                        <Space>
                            <Tag color="blue">{stats.submitted}</Tag>
                            <Text>/</Text>
                            <Tag color="default">{stats.total}</Tag>
                        </Space>
                    );
                } else {
                    const status = getStudentSubmissionStatus(record._id);
                    return (
                        <Tag color={status.color}>
                            {status.label}
                        </Tag>
                    );
                }
            }
        },
        {
            title: 'Yêu cầu',
            key: 'requirements',
            width: 200,
            render: (_, record) => (
                <Tooltip title={record.requirements}>
                    <Text ellipsis style={{ maxWidth: 180 }}>
                        {record.requirements || 'Không có yêu cầu'}
                    </Text>
                </Tooltip>
            )
        },
        {
            title: 'Điểm',
            key: 'points',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Tag color="processing">{record.points} điểm</Tag>
            )
        },
        {
            title: 'Ngày tạo',
            key: 'createdAt',
            width: 150,
            render: (_, record) => (
                <Text style={{ fontSize: 12 }}>
                    {record.createdAt ? new Date(record.createdAt).toLocaleString('vi-VN') : 'Chưa có'}
                </Text>
            )
        },
        {
            title: 'Thông tin nộp bài',
            key: 'submissionInfo',
            width: 200,
            render: (_, record) => {
                if ((isTeacher || isAdmin) && !isTestMode) {
                    return (
                        <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Đã nộp: {getSubmissionStats(record._id).submitted}/{getSubmissionStats(record._id).total}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Đã chấm: {getSubmissionStats(record._id).graded}
                            </Text>
                        </Space>
                    );
                } else {
                    const submission = submissions.find(s => s.assignmentId === record._id);
                    if (!submission) {
                        return <Text type="secondary">Chưa nộp bài</Text>;
                    }
                    return (
                        <Space direction="vertical" size={2}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Ngày nộp: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : 'Chưa nộp'}
                            </Text>
                            {submission.score !== null && submission.score !== undefined && (
                                <Text strong style={{ color: submission.score >= (record.points * 0.7) ? '#52c41a' : '#ff4d4f' }}>
                                    Điểm: {submission.score}/{record.points}
                                </Text>
                            )}
                        </Space>
                    );
                }
            }
        },
        {
            title: 'Hoạt động',
            key: 'action',
            width: 150,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                // Giáo viên/Admin (không test mode)
                if ((isTeacher || isAdmin) && !isTestMode) {
                    return (
                        <Space size="small">
                            <Tooltip title="Xem chi tiết">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    size="small"
                                    onClick={() => handleViewDetail(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => handleEditAssignment(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    onClick={() => onDeleteAssignment(record)}
                                />
                            </Tooltip>
                        </Space>
                    );
                }

                // Học sinh hoặc teacher/admin ở chế độ test
                const submission = submissions.find(s => s.assignmentId === record._id);
                const isExpired = record.closeTime && new Date() > new Date(record.closeTime);

                // Đã được chấm điểm -> xem kết quả
                if (submission && submission.status === 'graded') {
                    return (
                        <Tooltip title="Xem kết quả">
                            <Button
                                type="link"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => {
                                    if (onViewResult) {
                                        onViewResult(record, submission);
                                    } else {
                                        handleViewResult(record, submission);
                                    }
                                }}
                                style={{ color: '#52c41a' }}
                            >
                                Xem kết quả
                            </Button>
                        </Tooltip>
                    );
                }

                // Đã nộp nhưng chưa chấm -> xem bài nộp
                if (submission && submission.status === 'submitted') {
                    return (
                        <Tooltip title="Xem bài nộp">
                            <Button
                                type="link"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    if (onViewSubmission) {
                                        onViewSubmission(record, submission);
                                    } else {
                                        handleViewSubmission(record, submission);
                                    }
                                }}
                            >
                                Xem bài nộp
                            </Button>
                        </Tooltip>
                    );
                }

                // Chưa nộp -> nộp bài
                return (
                    <Tooltip title={isExpired ? "Đã quá hạn nộp bài" : "Nộp bài tập"}>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => handleSubmitAssignment(record)}
                            disabled={isExpired}
                            style={{ backgroundColor: '#52c41a' }}
                        >
                            Nộp bài
                        </Button>
                    </Tooltip>
                );
            }
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Đang tải bài tập...</div>
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <div>
                {showCreateButton && (
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            style={{ backgroundColor: '#00bcd4' }}
                            onClick={onCreateAssignment}
                            icon={<PlusOutlined />}
                            block={isMobileOrTablet}
                        >
                            Tạo bài tập
                        </Button>
                    </div>
                )}

                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    <BookOutlined style={{ fontSize: 48, marginBottom: 16, color: '#ddd' }} />
                    <div>Chưa có bài tập nào</div>
                    {canDoAssignment && (
                        <div style={{ fontSize: 13, marginTop: 8 }}>
                            Giáo viên sẽ giao bài tập cho bạn
                        </div>
                    )}
                    {showCreateButton && (
                        <div style={{ fontSize: 13, marginTop: 8 }}>
                            Nhấn nút "Tạo bài tập" ở trên để thêm bài tập mới
                        </div>
                    )}
                    {isTestMode && (
                        <div style={{ fontSize: 13, marginTop: 8, color: '#faad14' }}>
                            🔬 Bạn đang ở chế độ test. Hãy tạo bài tập từ menu Quản lý lớp học để test.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {showCreateButton && (
                <div style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        style={{ backgroundColor: '#00bcd4' }}
                        onClick={onCreateAssignment}
                        icon={<PlusOutlined />}
                        block={isMobileOrTablet}
                    >
                        Tạo bài tập
                    </Button>
                </div>
            )}

            {isTestMode && (
                <div style={{
                    marginBottom: 16,
                    padding: '8px 12px',
                    backgroundColor: '#fff7e6',
                    borderRadius: 8,
                    border: '1px solid #ffd666'
                }}>
                    <Space>
                        <span style={{ fontSize: 14 }}>🔬</span>
                        <Text style={{ fontSize: 12, color: '#ad6800' }}>
                            Chế độ test: Bạn đang xem bài tập với tư cách học sinh. Có thể nộp bài để kiểm tra.
                        </Text>
                    </Space>
                </div>
            )}

            <Table
                columns={columns}
                dataSource={assignments}
                rowKey="_id"
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} bài tập`,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50']
                }}
                scroll={{ x: 'max-content' }}
                size={isMobileOrTablet ? 'small' : 'middle'}
                bordered
            />

            {/* Modal nộp bài */}
            <SubmitAssignmentModal
                visible={submitModalVisible}
                onCancel={() => {
                    setSubmitModalVisible(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                currentUserId={currentUserId}
                onSubmitSuccess={handleSubmitSuccess}
                isViewMode={false}
            />

            {/* Modal xem kết quả */}
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

            {/* Drawer chỉnh sửa bài tập */}
            {editFormData && (
                <CreateAssignmentDrawer
                    visible={editDrawerVisible}
                    onClose={() => {
                        setEditDrawerVisible(false);
                        setEditFormData(null);
                    }}
                    onSubmit={handleEditSubmit}
                    loading={editLoading}
                    formData={editFormData}
                    setFormData={setEditFormData}
                    studentData={studentData}
                    colors={colors}
                    isMobile={isMobileOrTablet}
                    isMobileOrTablet={isMobileOrTablet}
                />
            )}
        </div>
    );
};

export default AssignmentList;