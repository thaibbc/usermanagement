// pages/ClassManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Table, Input, Button, Card, Typography, Space, Select, Row, Col, message } from 'antd';
import { HomeOutlined, DeleteOutlined, SwapOutlined, LoadingOutlined } from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const initialClassData = [
    {
        key: 'LFZ723',
        code: 'LFZ723',
        name: '123',
        students: 1,
        note: '',
        teacher: 'Lê Minh Vương',
        phone: '0963875102',
        email: 'vuonglo.dev@gmail.com'
    },
    {
        key: 'ABC456',
        code: 'ABC456',
        name: 'Lớp 3A',
        students: 25,
        note: 'Lớp chuyên',
        teacher: 'Nguyễn Văn A',
        phone: '0912345678',
        email: 'teacher@gmail.com'
    },
];

export function ClassManagement() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState(initialClassData);
    const [filteredClasses, setFilteredClasses] = useState(initialClassData);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Loading states
    const [searchLoading, setSearchLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const [filters, setFilters] = useState({
        status: 'active',
        type: 'all',
        code: '',
        keyword: '',
    });

    const [newClass, setNewClass] = useState({
        initValue: '',
        name: '',
        note: '',
    });

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Validate tên lớp
    const validateClassName = (name) => {
        if (!name.trim()) {
            message.error('Tên lớp không được để trống');
            return false;
        }
        if (name.trim().length < 2) {
            message.error('Tên lớp phải có ít nhất 2 ký tự');
            return false;
        }
        if (name.trim().length > 50) {
            message.error('Tên lớp không được vượt quá 50 ký tự');
            return false;
        }
        return true;
    };

    // Validate ghi chú
    const validateNote = (note) => {
        if (note && note.length > 200) {
            message.error('Ghi chú không được vượt quá 200 ký tự');
            return false;
        }
        return true;
    };

    const handleCreateClass = async () => {
        // Validate dữ liệu
        if (!validateClassName(newClass.name)) {
            return;
        }
        if (!validateNote(newClass.note)) {
            return;
        }

        setCreateLoading(true);

        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const code = generateClassCode();
            const newClassData = {
                key: code,
                code: code,
                name: newClass.name.trim(),
                students: 0,
                note: newClass.note.trim(),
                teacher: '',
                phone: '',
                email: ''
            };

            setClasses([...classes, newClassData]);
            setFilteredClasses([...classes, newClassData]);
            setNewClass({ initValue: '', name: '', note: '' });

            message.success('Tạo lớp học thành công!');
        } catch (error) {
            message.error('Có lỗi xảy ra khi tạo lớp học');
            console.error('Create class error:', error);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearchLoading(true);

        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Logic tìm kiếm
            const filtered = classes.filter(cls => {
                const matchKeyword = !filters.keyword ||
                    cls.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                    cls.code.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                    cls.teacher.toLowerCase().includes(filters.keyword.toLowerCase());

                const matchCode = !filters.code || cls.code === filters.code;

                // Giả lập filter theo status và type
                const matchStatus = filters.status === 'active' || filters.status === 'all';
                const matchType = filters.type === 'all' || filters.type === 'grade1';

                return matchKeyword && matchCode && matchStatus && matchType;
            });

            setFilteredClasses(filtered);

            if (filtered.length === 0) {
                message.info('Không tìm thấy lớp học nào');
            } else {
                message.success(`Tìm thấy ${filtered.length} lớp học`);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi tìm kiếm');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        setDeleteLoading(true);

        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success('Đã xóa các lớp học được chọn thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa lớp học');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        setStatusLoading(true);

        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1200));

            message.success('Đã chuyển trạng thái lớp học thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi chuyển trạng thái');
        } finally {
            setStatusLoading(false);
        }
    };

    // pages/ClassManagement.jsx
    // Trong hàm handleClassClick
    const handleClassClick = (record) => {
        if (!searchLoading && !createLoading && !deleteLoading && !statusLoading) {
            navigate(`/classes/${record.code}`, {
                state: {
                    classData: record,
                    fromManagement: true // Thêm flag này
                }
            });
        }
    };

    const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const columns = [
        {
            title: '',
            key: 'index',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1,
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
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
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
                <div style={{ backgroundColor: '#00bcd4', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <HomeOutlined style={{ fontSize: '20px', color: 'white' }} />
                    <Text style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>Administration</Text>
                </div>

                {/* Page Title */}
                <div style={{ backgroundColor: 'white', padding: '16px 24px', marginBottom: '24px' }}>
                    <Text style={{ fontSize: '16px', fontWeight: 500 }}>Quản lý lớp học</Text>
                </div>

                {/* Main Content */}
                <Content style={{ padding: '0 24px 24px' }}>
                    <Row gutter={16}>
                        {/* Left Panel - Class List */}
                        <Col xs={24} lg={18}>
                            <Card
                                styles={{ body: { padding: 24 } }}
                                style={{ backgroundColor: 'white', marginBottom: isMobile ? 16 : 0 }}
                                variant="borderless"
                            >
                                <Title
                                    level={5}
                                    style={{
                                        marginBottom: 24,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        fontSize: '14px',
                                        color: '#333',
                                    }}
                                >
                                    Danh sách lớp học
                                </Title>

                                {/* Filters */}
                                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Select
                                            value={filters.status}
                                            onChange={(value) => setFilters({ ...filters, status: value })}
                                            style={{ width: '100%' }}
                                            placeholder="Đang dùng"
                                            disabled={searchLoading}
                                        >
                                            <Option value="active">Đang dùng</Option>
                                            <Option value="inactive">Không dùng</Option>
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Select
                                            value={filters.type}
                                            onChange={(value) => setFilters({ ...filters, type: value })}
                                            style={{ width: '100%' }}
                                            placeholder="Tất cả"
                                            disabled={searchLoading}
                                        >
                                            <Option value="all">Tất cả</Option>
                                            <Option value="grade1">Lớp 1</Option>
                                            <Option value="grade2">Lớp 2</Option>
                                            <Option value="grade3">Lớp 3</Option>
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Select
                                            value={filters.code}
                                            onChange={(value) => setFilters({ ...filters, code: value })}
                                            style={{ width: '100%' }}
                                            placeholder="Mã lớp"
                                            disabled={searchLoading}
                                        >
                                            <Option value="">Tất cả</Option>
                                            {classes.map(cls => (
                                                <Option key={cls.code} value={cls.code}>{cls.code}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Input
                                            value={filters.keyword}
                                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                            placeholder="Nhập từ khóa..."
                                            style={{ width: '100%' }}
                                            allowClear
                                            disabled={searchLoading}
                                        />
                                    </Col>
                                </Row>

                                {/* Search Button */}
                                <Row style={{ marginBottom: 16 }}>
                                    <Col>
                                        <Button
                                            type="primary"
                                            onClick={handleSearch}
                                            loading={searchLoading}
                                            icon={searchLoading ? <LoadingOutlined /> : null}
                                            style={{ backgroundColor: '#1890ff' }}
                                            disabled={searchLoading || createLoading || deleteLoading || statusLoading}
                                        >
                                            {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* Action Buttons */}
                                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                                    <Col>
                                        <Button
                                            icon={<SwapOutlined />}
                                            onClick={handleChangeStatus}
                                            loading={statusLoading}
                                            disabled={searchLoading || createLoading || deleteLoading || statusLoading}
                                        >
                                            {statusLoading ? 'Đang xử lý...' : 'Chuyển trạng thái'}
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button
                                            icon={<DeleteOutlined />}
                                            onClick={handleDeleteSelected}
                                            loading={deleteLoading}
                                            disabled={searchLoading || createLoading || deleteLoading || statusLoading}
                                            danger
                                        >
                                            {deleteLoading ? 'Đang xóa...' : 'Xóa / Chuyển trạng thái'}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* Table */}
                                {classes.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                                        No data available
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <Table
                                            columns={columns}
                                            dataSource={filteredClasses}
                                            pagination={{
                                                pageSize: 10,
                                                showSizeChanger: false,
                                                showTotal: (total) => `Tổng ${total} lớp`,
                                            }}
                                            size="middle"
                                            bordered
                                            rowClassName={(record, index) =>
                                                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                                            }
                                            onRow={(record) => ({
                                                onClick: () => handleClassClick(record),
                                                style: {
                                                    cursor: (searchLoading || createLoading || deleteLoading || statusLoading)
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                                    opacity: (searchLoading || createLoading || deleteLoading || statusLoading)
                                                        ? 0.5
                                                        : 1
                                                },
                                            })}
                                            scroll={{ x: 'max-content' }}
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {/* Right Panel - Create Class */}
                        <Col xs={24} lg={6}>
                            <Card
                                styles={{ body: { padding: 24 } }}
                                style={{ backgroundColor: 'white' }}
                                variant="borderless"
                            >
                                <Title
                                    level={5}
                                    style={{
                                        marginBottom: 24,
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        fontSize: '14px',
                                        color: '#333',
                                    }}
                                >
                                    Tạo lớp học
                                </Title>

                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div>
                                        <Text style={{ marginBottom: 6, display: 'block', fontSize: '13px', color: '#666' }}>
                                            Khởi lớp :
                                        </Text>
                                        <Input
                                            value={newClass.initValue}
                                            onChange={(e) => setNewClass({ ...newClass, initValue: e.target.value })}
                                            placeholder="Nhập khởi lớp"
                                            allowClear
                                            disabled={createLoading}
                                        />
                                    </div>

                                    <div>
                                        <Text style={{ marginBottom: 6, display: 'block', fontSize: '13px', color: '#666' }}>
                                            Tên lớp : <span style={{ color: '#ff4d4f' }}>*</span>
                                        </Text>
                                        <Input
                                            value={newClass.name}
                                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                            placeholder="Nhập tên lớp (bắt buộc)"
                                            allowClear
                                            disabled={createLoading}
                                            status={newClass.name && newClass.name.length < 2 ? 'error' : ''}
                                        />
                                        {newClass.name && newClass.name.length < 2 && (
                                            <Text style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Tên lớp phải có ít nhất 2 ký tự
                                            </Text>
                                        )}
                                    </div>

                                    <div>
                                        <Text style={{ marginBottom: 6, display: 'block', fontSize: '13px', color: '#666' }}>
                                            Ghi chú :
                                        </Text>
                                        <Input
                                            value={newClass.note}
                                            onChange={(e) => setNewClass({ ...newClass, note: e.target.value })}
                                            placeholder="Nhập ghi chú"
                                            allowClear
                                            disabled={createLoading}
                                            maxLength={200}
                                            showCount
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        block
                                        onClick={handleCreateClass}
                                        loading={createLoading}
                                        disabled={searchLoading || createLoading || deleteLoading || statusLoading || !newClass.name.trim()}
                                        style={{
                                            marginTop: 16,
                                            backgroundColor: '#1890ff',
                                            opacity: (!newClass.name.trim() || createLoading) ? 0.5 : 1
                                        }}
                                    >
                                        {createLoading ? 'Đang tạo...' : 'Tạo lớp học'}
                                    </Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
}

export default ClassManagement;