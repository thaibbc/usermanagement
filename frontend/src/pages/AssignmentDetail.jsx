// pages/AssignmentDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Layout,
    Card,
    Typography,
    Space,
    Tag,
    Button,
    Spin,
    message,
    Row,
    Col,
    Table,
    Avatar,
    Tooltip,
    Divider,
    Empty,
    List,
    Badge
} from 'antd';
import {
    HomeOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ArrowLeftOutlined,
    TrophyOutlined,
    FileDoneOutlined
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import ClassInfoCard from '../Components/ClassInfoCard';
import { getAssignmentById, fetchSubmissions, getClassByCode, getClassStats } from '../api/classes';
import { getUser } from '../api/users';
import useIsMobile from '../hooks/useIsMobile';
import SubmitAssignmentModal from '../Components/SubmitAssignmentModal';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export function AssignmentDetail() {
    const navigate = useNavigate();
    const { classCode, assignmentId } = useParams();
    const { user } = useUser();
    const isMobile = useIsMobile(1024);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState(null);
    const [classData, setClassData] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [classStats, setClassStats] = useState(null);
    const [viewSubmissionModalOpen, setViewSubmissionModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const isAdmin = user?.accountType === 'admin';
    const isTeacher = user?.accountType === 'teacher';
    const currentUserId = user?._id || user?.id;

    // Load dữ liệu
    const loadData = useCallback(async () => {
        if (!assignmentId || !classCode) {
            message.error('Thiếu thông tin bài tập hoặc lớp học');
            navigate('/classes');
            return;
        }

        setLoading(true);
        try {
            const classResponse = await getClassByCode(classCode);
            setClassData(classResponse);

            if (classResponse.teacherId) {
                try {
                    const teacherResponse = await getUser(classResponse.teacherId);
                    setTeacherInfo(teacherResponse);
                } catch (err) {
                    setTeacherInfo({
                        name: classResponse.teacherName || 'Chưa cập nhật',
                        phone: 'Chưa cập nhật',
                        email: 'Chưa cập nhật'
                    });
                }
            } else {
                setTeacherInfo({
                    name: classResponse.teacherName || 'Chưa cập nhật',
                    phone: 'Chưa cập nhật',
                    email: 'Chưa cập nhật'
                });
            }

            if (classResponse._id) {
                const stats = await getClassStats(classResponse._id);
                setClassStats(stats);
            }

            const assignmentResponse = await getAssignmentById(classResponse._id, assignmentId);
            setAssignment(assignmentResponse);

            const submissionsResponse = await fetchSubmissions(classResponse._id);
            let submissionsData = [];
            if (submissionsResponse?.submissions && Array.isArray(submissionsResponse.submissions)) {
                submissionsData = submissionsResponse.submissions;
            } else if (submissionsResponse?.data && Array.isArray(submissionsResponse.data)) {
                submissionsData = submissionsResponse.data;
            } else if (Array.isArray(submissionsResponse)) {
                submissionsData = submissionsResponse;
            }

            const filteredSubmissions = submissionsData.filter(
                sub => sub.assignmentId === assignmentId || sub.assignmentId?._id === assignmentId
            );

            setSubmissions(filteredSubmissions);
        } catch (err) {
            console.error('Error loading assignment detail:', err);
            message.error('Không thể tải thông tin bài tập');
            navigate(`/classes/${classCode}`);
        } finally {
            setLoading(false);
        }
    }, [assignmentId, classCode, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalStudents = classStats?.totalStudents || classData?.students?.length || 0;

    // Columns cho bảng bài tập bên trái
    const assignmentColumns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Tên bài tập',
            key: 'title',
            render: () => (
                <Space>
                    <FileTextOutlined style={{ color: '#00bcd4' }} />
                    <Text strong>{assignment?.title}</Text>
                </Space>
            )
        },
        {
            title: 'Ngày tạo',
            key: 'createdAt',
            width: 150,
            render: () => (
                <Text style={{ fontSize: 12 }}>
                    {assignment?.createdAt ? new Date(assignment.createdAt).toLocaleString('vi-VN') : 'Chưa có'}
                </Text>
            )
        }
    ];

    const handleBack = () => {
        navigate(`/classes/${classCode}`);
    };

    const handleCopyCode = () => {
        if (classData?.code) {
            navigator.clipboard.writeText(classData.code);
            message.success('Đã sao chép mã lớp');
        }
    };

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
                    <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                    <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spin size="large" description="Đang tải thông tin bài tập..." />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    if (!assignment || !classData) {
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
                    <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                    <Content style={{ padding: 24 }}>
                        <Card>
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <Text type="danger">Không tìm thấy thông tin bài tập</Text>
                                <div style={{ marginTop: 16 }}>
                                    <Button type="primary" onClick={handleBack}>
                                        Quay lại lớp học
                                    </Button>
                                </div>
                            </div>
                        </Card>
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
                <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

                {/* Breadcrumb - đã bỏ nút quay lại */}
                <div style={{
                    backgroundColor: '#00bcd4',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <HomeOutlined style={{ fontSize: 20, color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: 14 }}>
                        Lớp học / {classData?.name} / Bài tập / {assignment?.title}
                    </Text>
                </div>

                <Content style={{ padding: isMobile ? '16px' : '24px' }}>
                    <Row gutter={[24, 24]}>
                        {/* Card 1: Thông tin lớp học - truyền hideMenu để ẩn nút 3 chấm */}
                        <Col xs={24}>
                            <ClassInfoCard
                                classData={classData}
                                teacherInfo={teacherInfo}
                                totalStudents={totalStudents}
                                onCopyCode={handleCopyCode}
                                onBack={handleBack}
                                onUpdateStatus={() => { }}
                                onEdit={null}
                                isMobile={isMobile}
                                isTestMode={false}
                                hideMenu={true} // Thêm prop để ẩn menu
                            />
                        </Col>

                        {/* Card 2: CLASSWORK BÀI TẬP - Bên trái */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileTextOutlined style={{ color: '#00bcd4', fontSize: 18 }} />
                                        <span style={{ fontWeight: 600, fontSize: 16 }}>CLASSWORK</span>
                                        <span style={{ fontWeight: 600, fontSize: 16, color: '#00bcd4' }}>BÀI TẬP</span>
                                    </div>
                                }
                                style={{
                                    borderRadius: 12,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    backgroundColor: 'white'
                                }}
                                variant="borderless"
                            >
                                {/* Thông tin bài tập */}
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4} style={{ marginBottom: 8, fontSize: 18 }}>
                                        {assignment?.title}
                                    </Title>
                                    <Space size="large" style={{ marginBottom: 16 }}>
                                        <Space>
                                            <TrophyOutlined style={{ color: '#faad14' }} />
                                            <Text>Điểm tối đa: {assignment?.points}</Text>
                                        </Space>
                                        <Space>
                                            <FileTextOutlined style={{ color: '#1890ff' }} />
                                            <Text>Loại bài tập: {
                                                assignment?.type === 'quiz' ? 'Trắc nghiệm' :
                                                    assignment?.type === 'code' ? 'Lập trình' : 'Luyện tập'
                                            }</Text>
                                        </Space>
                                    </Space>

                                    <Divider style={{ margin: '16px 0' }} />

                                    <div>
                                        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
                                            Yêu cầu / Hướng dẫn làm bài
                                        </Text>
                                        <Paragraph style={{ color: '#666', marginBottom: 0 }}>
                                            {assignment?.requirements || 'Không có yêu cầu cụ thể'}
                                        </Paragraph>
                                    </div>
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                {/* Danh sách câu hỏi (nếu có) */}
                                {assignment?.questions?.length > 0 && (
                                    <>
                                        <div style={{ marginBottom: 16 }}>
                                            <Text strong>Danh sách câu hỏi:</Text>
                                        </div>
                                        <List
                                            size="small"
                                            dataSource={assignment.questions}
                                            renderItem={(q, idx) => (
                                                <List.Item style={{ padding: '8px 0' }}>
                                                    <Space>
                                                        <Badge count={idx + 1} style={{ backgroundColor: '#00bcd4' }} />
                                                        <Text>{q.cauHoi || q.question}</Text>
                                                    </Space>
                                                </List.Item>
                                            )}
                                        />
                                    </>
                                )}

                                {/* Bảng bài tập */}
                                <div style={{ marginTop: 24 }}>
                                    <Table
                                        columns={assignmentColumns}
                                        dataSource={[assignment]}
                                        rowKey="_id"
                                        pagination={false}
                                        size="small"
                                        bordered
                                    />
                                </div>
                            </Card>
                        </Col>

                        {/* Card 3: CLASSWORK BÀI LÀM CỦA HỌC SINH - Bên phải */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileDoneOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                                        <span style={{ fontWeight: 600, fontSize: 16 }}>CLASSWORK</span>
                                        <span style={{ fontWeight: 600, fontSize: 16, color: '#52c41a' }}>BÀI LÀM CỦA HỌC SINH</span>
                                    </div>
                                }
                                style={{
                                    borderRadius: 12,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    backgroundColor: 'white'
                                }}
                                variant="borderless"
                            >
                                {submissions.length === 0 ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                                <FileDoneOutlined style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
                                                <div style={{ color: '#999', marginTop: 8 }}>Trống</div>
                                                <div style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>
                                                    Chưa có học sinh nào nộp bài
                                                </div>
                                            </div>
                                        }
                                    />
                                ) : (
                                    <Table
                                        columns={[
                                            {
                                                title: '#',
                                                key: 'index',
                                                width: 50,
                                                align: 'center',
                                                render: (_, __, index) => index + 1
                                            },
                                            {
                                                title: 'Học sinh',
                                                dataIndex: 'studentName',
                                                key: 'studentName',
                                                render: (text, record) => (
                                                    <Space>
                                                        <Avatar icon={<UserOutlined />} size="small" />
                                                        <Text>{text || record.studentId?.name || 'Không tên'}</Text>
                                                    </Space>
                                                )
                                            },
                                            {
                                                title: 'Trạng thái',
                                                key: 'status',
                                                width: 100,
                                                render: (_, record) => {
                                                    if (record.status === 'graded') {
                                                        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã chấm</Tag>;
                                                    }
                                                    if (record.status === 'submitted') {
                                                        return <Tag color="orange" icon={<ClockCircleOutlined />}>Đã nộp</Tag>;
                                                    }
                                                    return <Tag color="red" icon={<CloseCircleOutlined />}>Chưa nộp</Tag>;
                                                }
                                            },
                                            {
                                                title: 'Điểm',
                                                key: 'score',
                                                width: 80,
                                                render: (_, record) => {
                                                    if (record.score !== null && record.score !== undefined) {
                                                        return <Text strong>{record.score}/{assignment?.points}</Text>;
                                                    }
                                                    return <Text type="secondary">--</Text>;
                                                }
                                            },
                                            {
                                                title: 'Thao tác',
                                                key: 'action',
                                                width: 80,
                                                render: (_, record) => (
                                                    <Tooltip title="Xem bài làm">
                                                        <Button
                                                            type="link"
                                                            icon={<EyeOutlined />}
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedSubmission(record);
                                                                setViewSubmissionModalOpen(true);
                                                            }}
                                                            disabled={!record.submittedAt}
                                                        >
                                                            Xem
                                                        </Button>
                                                    </Tooltip>
                                                )
                                            }
                                        ]}
                                        dataSource={submissions}
                                        rowKey="_id"
                                        pagination={{
                                            pageSize: 10,
                                            showTotal: (total) => `Tổng ${total} bài nộp`,
                                            size: 'small'
                                        }}
                                        size="small"
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Content>

                {/* Modal xem bài làm chi tiết */}
                <SubmitAssignmentModal
                    open={viewSubmissionModalOpen}
                    onCancel={() => {
                        setViewSubmissionModalOpen(false);
                        setSelectedSubmission(null);
                    }}
                    assignment={assignment}
                    currentUserId={selectedSubmission?.studentId?._id || selectedSubmission?.studentId}
                    onSubmitSuccess={() => { }}
                    isViewMode={true}
                    existingSubmission={selectedSubmission}
                />
            </Layout>
        </Layout>
    );
}

export default AssignmentDetail;