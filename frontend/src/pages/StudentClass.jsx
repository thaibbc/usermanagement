// pages/StudentClass.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Input, Button, Table, Tag, message, Space } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

const { Content } = Layout;
const { Text } = Typography;

export function StudentClass() {
    const navigate = useNavigate();
    const [classCode, setClassCode] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [classes, setClasses] = useState([
        {
            key: '1',
            code: 'LEZ123',
            name: '123',
            students: 1,
            note: 'Học Toán',
            status: 'confirmed',
            teacher: 'Lê Minh Vương'
        },
        {
            key: '2',
            code: 'ABC456',
            name: 'Lớp 3A',
            students: 25,
            note: 'Lớp chuyên Toán',
            status: 'pending',
            teacher: 'Nguyễn Văn A'
        }
    ]);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleJoinClass = () => {
        if (!classCode.trim()) {
            message.warning('Vui lòng nhập mã lớp học!');
            return;
        }

        // Kiểm tra xem lớp đã tồn tại chưa
        const existingClass = classes.find(c => c.code === classCode.toUpperCase());
        if (existingClass) {
            message.error('Bạn đã tham gia lớp học này rồi!');
            return;
        }

        // Giả lập tham gia lớp học thành công
        const newClass = {
            key: Date.now().toString(),
            code: classCode.toUpperCase(),
            name: `Lớp ${classCode.toUpperCase()}`,
            students: 1,
            note: 'Chờ xác nhận',
            status: 'pending',
            teacher: 'Đang cập nhật'
        };

        setClasses([...classes, newClass]);
        message.success('Đã gửi yêu cầu tham gia lớp học!');
        setClassCode('');
    };

    const handleClassClick = (record) => {
        navigate(`/classes/${record.code}`, {
            state: {
                classData: {
                    ...record,
                    // Thêm thông tin cần thiết cho ClassDetail
                    phone: '',
                    email: ''
                }
            }
        });
    };

    const handleLeaveClass = (record) => {
        // Xác nhận rời lớp
        const newClasses = classes.filter(c => c.key !== record.key);
        setClasses(newClasses);
        message.info(`Đã rời khỏi lớp ${record.name}`);
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'key',
            key: 'key',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Mã lớp',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: 'Tên lớp',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: 'Giáo viên',
            dataIndex: 'teacher',
            key: 'teacher',
            width: 150,
        },
        {
            title: 'Sĩ số',
            dataIndex: 'students',
            key: 'students',
            width: 100,
            align: 'center',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 200,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            align: 'center',
            render: (status) => {
                if (status === 'confirmed') {
                    return <Tag color="green">Đã xác nhận</Tag>;
                }
                return <Tag color="orange">Chờ xác nhận</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
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
            )
        }
    ];

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
                        Học sinh - Lớp học
                    </Text>
                </div>

                {/* Page Title */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '16px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <UserOutlined style={{ fontSize: '20px', color: '#00bcd4' }} />
                    <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                        Quản lý lớp học của tôi
                    </Text>
                </div>

                {/* Main Content */}
                <Content style={{ padding: '0 24px 24px' }}>
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

                    {/* Bảng danh sách lớp học */}
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
                                        style: { cursor: 'pointer' }
                                    })}
                                    scroll={{ x: 'max-content' }}
                                />
                            </div>
                        )}
                    </Card>

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
                            </ul>
                        </div>
                    </Card>
                </Content>
            </Layout>

            {/* Style tùy chỉnh */}
            <style>{`
                .ant-table-thead > tr > th {
                    background-color: #fafafa !important;
                    font-weight: 600 !important;
                    color: #333 !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background-color: #e6f7ff !important;
                }
            `}</style>
        </Layout>
    );
}

export default StudentClass;