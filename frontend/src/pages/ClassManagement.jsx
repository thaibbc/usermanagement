// pages/ClassManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Layout, Table, Input, Button, Card, Typography, Space, Select, Row, Col, message } from 'antd';
import { HomeOutlined, DeleteOutlined, SwapOutlined, LoadingOutlined } from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import { fetchClasses, createClass, deleteClass } from '../api/classes';
import useIsMobile from '../hooks/useIsMobile';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export function ClassManagement() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Sử dụng hook để kiểm tra mobile
    const isMobile = useIsMobile(1024);

    const loadClasses = useCallback(async () => {
        try {
            const isTeacher = user?.accountType === 'teacher' || user?.role === 'teacher';
            const params = isTeacher && (user?._id || user?.id) ? { teacherId: user._id || user.id } : {};
            const data = await fetchClasses(params);
            const items = data.classes ? data.classes.map(c => {
                let studentCount = 0;
                if (Array.isArray(c.students)) {
                    studentCount = c.students.length;
                } else if (typeof c.students === 'number') {
                    studentCount = c.students;
                } else if (typeof c.students === 'string') {
                    studentCount = 0;
                }

                return {
                    ...c,
                    key: c._id || c.code,
                    studentCount: studentCount
                };
            }) : [];

            setClasses(items);
            setFilteredClasses(items);
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
        grade: '',
        note: '',
    });

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

    const validateNote = (note) => {
        if (note && note.length > 200) {
            message.error('Ghi chú không được vượt quá 200 ký tự');
            return false;
        }
        return true;
    };

    const validateGrade = (grade) => {
        if (!grade) {
            message.error('Vui lòng chọn khối lớp');
            return false;
        }
        return true;
    };

    const handleCreateClass = async () => {
        if (!validateClassName(newClass.name)) {
            return;
        }
        if (!validateGrade(newClass.grade)) {
            return;
        }
        if (!validateNote(newClass.note)) {
            return;
        }

        setCreateLoading(true);

        try {
            const code = generateClassCode();
            await createClass({
                code,
                name: newClass.name.trim(),
                grade: newClass.grade ? Number(newClass.grade) : null,
                note: newClass.note.trim(),
                teacherId: user?._id || user?.id || null,
                teacherName: user?.name || '',
                students: 0,
                teacher: user?.name || '',
                phone: user?.phone || '',
                email: user?.email || ''
            });

            setNewClass({ initValue: '', name: '', grade: '', note: '' });
            await loadClasses();

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
            await loadClasses();
            const filtered = classes.filter(cls => {
                const matchKeyword = !filters.keyword ||
                    cls.name?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                    cls.code?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                    cls.teacher?.toLowerCase().includes(filters.keyword.toLowerCase());

                const matchCode = !filters.code || cls.code === filters.code;
                const matchStatus = filters.status === 'all' || cls.status === filters.status;
                const matchType = filters.type === 'all' || cls.type === filters.type;

                return matchKeyword && matchCode && matchStatus && matchType;
            });

            setFilteredClasses(filtered);
            setSelectedRowKeys([]);

            if (filtered.length === 0) {
                message.info('Không tìm thấy lớp học nào');
            } else {
                message.success(`Tìm thấy ${filtered.length} lớp học`);
            }
        } catch (error) {
            console.error('handleSearch error', error);
            message.error('Có lỗi xảy ra khi tìm kiếm');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn lớp học cần xóa');
            return;
        }

        setDeleteLoading(true);

        try {
            const selectedClasses = filteredClasses.filter(c => selectedRowKeys.includes(c.key));
            await Promise.all(selectedClasses.map(c => deleteClass(c._id || c.key)));
            message.success(`Đã xóa ${selectedRowKeys.length} lớp học thành công`);
            setSelectedRowKeys([]);
            await loadClasses();
        } catch (error) {
            console.error('handleDeleteSelected error', error);
            message.error('Có lỗi xảy ra khi xóa lớp học');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn lớp học cần chuyển trạng thái');
            return;
        }

        setStatusLoading(true);

        try {
            // TODO: Cập nhật status khi backend hỗ trợ endpoint
            message.success(`Đã chuyển trạng thái ${selectedRowKeys.length} lớp học thành công`);
            setSelectedRowKeys([]);
        } catch (error) {
            console.error('handleChangeStatus error', error);
            message.error('Có lỗi xảy ra khi chuyển trạng thái');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleClassClick = (record) => {
        if (!searchLoading && !createLoading && !deleteLoading && !statusLoading) {
            navigate(`/classes/${record.code}`, {
                state: {
                    classData: record,
                    fromManagement: true
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

    // Row selection configuration
    const rowSelection = {
        selectedRowKeys: selectedRowKeys,
        onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
        },
        getCheckboxProps: (record) => ({
            disabled: false,
            name: record.name,
        }),
        columnWidth: 50,
        fixed: 'left',
    };

    const columns = [
        {
            title: '#',
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
            key: 'students',
            width: 100,
            align: 'center',
            render: (_, record) => {
                let studentCount = 0;
                if (Array.isArray(record.students)) {
                    studentCount = record.students.length;
                } else if (typeof record.students === 'number') {
                    studentCount = record.students;
                } else if (record.studentCount) {
                    studentCount = record.studentCount;
                }
                return <Text>{studentCount} học sinh</Text>;
            }
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (note) => note || '-',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#e0f7fa' }}>
            {/* Sidebar - không hiển thị trên mobile */}
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
                                            <Option value="all">Tất cả</Option>
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
                                            disabled={searchLoading || createLoading || deleteLoading || statusLoading || selectedRowKeys.length === 0}
                                        >
                                            {statusLoading ? 'Đang xử lý...' : `Chuyển trạng thái (${selectedRowKeys.length})`}
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button
                                            icon={<DeleteOutlined />}
                                            onClick={handleDeleteSelected}
                                            loading={deleteLoading}
                                            disabled={searchLoading || createLoading || deleteLoading || statusLoading || selectedRowKeys.length === 0}
                                            danger
                                        >
                                            {deleteLoading ? 'Đang xóa...' : `Xóa (${selectedRowKeys.length})`}
                                        </Button>
                                    </Col>
                                    {selectedRowKeys.length > 0 && (
                                        <Col>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Đã chọn {selectedRowKeys.length} lớp
                                            </Text>
                                        </Col>
                                    )}
                                </Row>

                                {/* Table with row selection */}
                                {filteredClasses.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                                        Không có dữ liệu
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <Table
                                            rowSelection={rowSelection}
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
                                            Khối lớp : <span style={{ color: '#ff4d4f' }}>*</span>
                                        </Text>
                                        <Select
                                            value={newClass.grade}
                                            onChange={(value) => setNewClass({ ...newClass, grade: value })}
                                            placeholder="Chọn khối lớp"
                                            style={{ width: '100%' }}
                                            disabled={createLoading}
                                        >
                                            <Option value={1}>Khối 1</Option>
                                            <Option value={2}>Khối 2</Option>
                                            <Option value={3}>Khối 3</Option>
                                            <Option value={4}>Khối 4</Option>
                                            <Option value={5}>Khối 5</Option>
                                            <Option value={6}>Khối 6</Option>
                                            <Option value={7}>Khối 7</Option>
                                            <Option value={8}>Khối 8</Option>
                                            <Option value={9}>Khối 9</Option>
                                            <Option value={10}>Khối 10</Option>
                                            <Option value={11}>Khối 11</Option>
                                            <Option value={12}>Khối 12</Option>
                                        </Select>
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
                                        disabled={searchLoading || createLoading || deleteLoading || statusLoading || !newClass.name.trim() || !newClass.grade}
                                        style={{
                                            marginTop: 16,
                                            backgroundColor: '#1890ff',
                                            opacity: (!newClass.name.trim() || !newClass.grade || createLoading) ? 0.5 : 1
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

            {/* Style tùy chỉnh */}
            <style>{`
                .table-row-light {
                    background-color: #ffffff;
                }
                .table-row-dark {
                    background-color: #fafafa;
                }
                .ant-table-row:hover {
                    background-color: #e6f7ff !important;
                }
                .ant-table-selection-column {
                    text-align: center !important;
                    padding-left: 8px !important;
                    padding-right: 8px !important;
                }
            `}</style>
        </Layout>
    );
}

export default ClassManagement;