// pages/StudentClass.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Input, Button, Table, Tag, message, Space } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
    fetchClasses,
    getClassByCode,
    joinClass,
    leaveClass
} from '../api/classes';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

const { Content } = Layout;
const { Text } = Typography;

export function StudentClass() {
    const navigate = useNavigate();
    const [classCode, setClassCode] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const isAdmin = user?.accountType === 'admin';
    const isTeacher = user?.accountType === 'teacher';
    const isStudent = user?.accountType === 'student';

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadClasses = React.useCallback(async () => {
        if (!user?.id) {
            setClasses([]);
            return;
        }

        try {
            const data = await fetchClasses({ studentId: user.id });
            const items = data.classes ? data.classes.map(c => {
                const isJoined = (c.students || []).map(String).includes(String(user.id));
                const isPending = (c.pendingStudents || []).map(String).includes(String(user.id));

                let studentCount = 0;
                if (Array.isArray(c.students)) {
                    studentCount = c.students.length;
                } else if (typeof c.students === 'number') {
                    studentCount = c.students;
                }

                return {
                    ...c,
                    key: c._id || c.code,
                    isJoined,
                    isPending,
                    studentCount,
                    status: isJoined ? 'confirmed' : isPending ? 'pending' : c.status || 'unknown'
                };
            }) : [];
            setClasses(items);
        } catch (err) {
            console.error('loadClasses error', err);
            message.error('Không thể tải danh sách lớp học');
        }
    }, [user]);



    useEffect(() => {
        (async () => {
            await loadClasses();
        })();
    }, [loadClasses]);

    const handleJoinClass = async () => {
        if (!classCode.trim()) {
            message.warning('Vui lòng nhập mã lớp học!');
            return;
        }

        const code = classCode.toUpperCase();

        try {
            const classroom = await getClassByCode(code);
            if (!classroom || !classroom._id) {
                message.error('Không tìm thấy lớp học');
                return;
            }

            if (classroom.status === 'closed') {
                message.warning('Lớp học không còn hiệu lực.');
                return;
            }

            const isAlreadyStudent = (classroom.students || []).map(String).includes(String(user?.id));
            const isPending = (classroom.pendingStudents || []).map(String).includes(String(user?.id));

            if (isAlreadyStudent) {
                message.info('Bạn đã tham gia lớp học này rồi.');
                setClassCode('');
                await loadClasses();
                return;
            }

            if (isPending) {
                message.info('Yêu cầu của bạn đang chờ giáo viên xác nhận.');
                setClassCode('');
                return;
            }

            await joinClass(classroom._id, user?._id || user?.id);
            message.success('Yêu cầu tham gia đã gửi. Vui lòng chờ giáo viên xác nhận.');

            setClassCode('');
            await loadClasses();
        } catch (err) {
            console.error('handleJoinClass error', err);
            const msg = err?.message || 'Tham gia lớp học thất bại';
            message.error(msg);
        }
    };

    const handleClassClick = (record) => {
        if (record.status === 'pending') {
            message.warning('Lớp học đang chờ giáo viên duyệt. Bạn chưa thể vào lớp.');
            return;
        }
        navigate(`/classes/${record.code}`, {
            state: {
                classData: {
                    ...record,
                    phone: record.phone || '',
                    email: record.email || '',
                    teacher: record.teacher || record.teacherName || ''
                }
            }
        });
    };

    const handleLeaveClass = async (record) => {
        try {
            await leaveClass(record._id || record.key, user?.id);
            message.info(`Đã rời khỏi lớp ${record.name}`);
            await loadClasses();
        } catch (err) {
            console.error('handleLeaveClass error', err);
            message.error('Rời lớp thất bại');
        }
    };



    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Mã lớp',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            render: (code) => <Text strong>{code}</Text>
        },
        {
            title: 'Tên lớp',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (name) => <Text>{name}</Text>
        },
        {
            title: 'Giáo viên',
            key: 'teacher',
            width: 150,
            render: (_, record) => {
                const teacherName = record.teacher || record.teacherName || 'Chưa cập nhật';
                return <Text>{teacherName}</Text>;
            }
        },
        {
            title: 'Sĩ số',
            key: 'students',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const studentCount = record.studentCount || (Array.isArray(record.students) ? record.students.length : 0);
                return <Tag color="blue">{studentCount} học sinh</Tag>;
            }
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 200,
            render: (note) => <Text type="secondary" ellipsis>{note || '-'}</Text>
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record) => {
                if (record.status === 'confirmed') {
                    return <Tag color="green" icon={<CheckCircleOutlined />}>Đã tham gia</Tag>;
                }
                if (record.status === 'pending') {
                    return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
                }
                return <Tag color="default">Chưa tham gia</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => {
                if (record.status === 'confirmed') {
                    return (
                        <Button
                            type="text"
                            danger
                            icon={<LogoutOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveClass(record);
                            }}
                            size="small"
                        >
                            Rời lớp
                        </Button>
                    );
                }
                if (record.status === 'pending') {
                    return (
                        <Button
                            type="text"
                            disabled
                            size="small"
                        >
                            Đang chờ
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    // Render student view (for all users)
    const renderStudentView = () => (
        <>
            <Card
                title={
                    <Text style={{ fontSize: '15px', fontWeight: 600, color: '#00bcd4' }}>
                        Tham gia lớp học mới
                    </Text>
                }
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '24px'
                }}
                variant="borderless"
            >
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: 16,
                    maxWidth: isMobile ? '100%' : 600
                }}>
                    <Text style={{
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                        color: '#666'
                    }}>
                        Mã lớp học:
                    </Text>
                    <Input
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã lớp học (ví dụ: LEZ123)"
                        style={{ flex: 1 }}
                        size="large"
                        onPressEnter={handleJoinClass}
                        allowClear
                    />
                    <Button
                        type="primary"
                        onClick={handleJoinClass}
                        size="large"
                        block={isMobile}
                        style={{
                            backgroundColor: '#00bcd4',
                            minWidth: isMobile ? '100%' : '120px'
                        }}
                    >
                        Xác nhận
                    </Button>
                </div>
            </Card>

            <Card
                title={
                    <Space>
                        <Text style={{ fontSize: '15px', fontWeight: 600, color: '#00bcd4' }}>
                            Danh sách lớp học đã tham gia
                        </Text>
                        <Tag color="blue">{classes.length} lớp</Tag>
                    </Space>
                }
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                variant="borderless"
            >
                {classes.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#999'
                    }}>
                        <UserOutlined style={{ fontSize: 48, marginBottom: 16, color: '#ddd' }} />
                        <div>Bạn chưa tham gia lớp học nào</div>
                        <div style={{ fontSize: 13, marginTop: 8 }}>
                            Hãy nhập mã lớp học để tham gia
                        </div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <Table
                            columns={columns}
                            dataSource={classes}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                showTotal: (total) => `Tổng ${total} lớp học`
                            }}
                            size="middle"
                            bordered
                            onRow={(record) => ({
                                onClick: () => handleClassClick(record),
                                style: { cursor: record.status === 'pending' ? 'not-allowed' : 'pointer' }
                            })}
                            scroll={{ x: 'max-content' }}
                        />
                    </div>
                )}
            </Card>
        </>
    );



    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* Sidebar */}
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

                {/* Breadcrumb */}
                <div style={{
                    backgroundColor: '#00bcd4',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <HomeOutlined style={{ fontSize: '20px', color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
                        {(isAdmin || isTeacher) ? 'Quản trị viên / Giáo viên' : 'Học sinh'} - Lớp học
                    </Text>
                </div>

                {/* Page Title */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '16px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: 'space-between'
                }}>
                    <Space>
                        <UserOutlined style={{ fontSize: '20px', color: '#00bcd4' }} />
                        <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                            Quản lý lớp học của tôi
                        </Text>
                    </Space>
                </div>

                {/* Main Content */}
                <Content style={{ padding: '0 24px 24px' }}>
                    {renderStudentView()}

                    {/* Thông tin thêm */}
                    <Card
                        style={{
                            marginTop: '24px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '12px'
                        }}
                        variant="borderless"
                    >
                        <div style={{ fontSize: '13px', color: '#666' }}>
                            <Text strong>Lưu ý:</Text>
                            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                <li>Mã lớp học được cung cấp bởi giáo viên</li>
                                <li>Sau khi gửi yêu cầu, giáo viên sẽ xác nhận trong vòng 24h</li>
                                <li>Có thể rời lớp bất cứ lúc nào</li>
                                <li>Khi rời lớp, bạn sẽ không thể xem bài tập và tài liệu của lớp đó</li>
                            </ul>
                        </div>
                    </Card>
                </Content>
            </Layout>

            <style>{`
                .ant-table-thead > tr > th {
                    background-color: #fafafa !important;
                    font-weight: 600 !important;
                    color: #333 !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background-color: #e6f7ff !important;
                }
                .ant-table-tbody > tr {
                    cursor: pointer;
                }
            `}</style>
        </Layout>
    );
}

export default StudentClass;