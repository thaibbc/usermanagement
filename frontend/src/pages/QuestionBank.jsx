// pages/QuestionBank.jsx
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Tabs,
    Button,
    Input,
    Select,
    Table,
    Space,
    Checkbox,
    message,
    Row,
    Col,
    Grid
} from 'antd';
import {
    PlusOutlined,
    DownloadOutlined,
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import CreateQuestionDrawer from '../Components/CreateQuestionModal';
import { fetchQuestions, createQuestion, deleteQuestion } from '../api/questions';

const { Content } = Layout;
const { Option } = Select;
const { useBreakpoint } = Grid;

export const QuestionBank = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        khoiLop: null,
        unit: null,
        kyNang: null,
        dangCauHoi: null,
        yeuCauDeBai: null,
        mucDoNhanThuc: null,
        cauHoi: '',
        id: ''
    });
    const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
    const [showBanner, setShowBanner] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const screens = useBreakpoint();

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const params = {
                khoiLop: filters.khoiLop,
                unit: filters.unit,
                kyNang: filters.kyNang,
                loaiCauHoi: filters.dangCauHoi,
                mucDoNhanThuc: filters.mucDoNhanThuc,
                search: filters.cauHoi || undefined
            };
            const data = await fetchQuestions(params);
            const questionItems = data.questions ? data.questions.map(q => ({ ...q, key: q._id || q.id })) : [];
            setQuestions(questionItems);
        } catch (err) {
            console.error('loadQuestions error', err);
            message.error('Không thể tải câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const columns = [
        {
            title: '#',
            dataIndex: 'key',
            width: 60,
        },
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
        },
        {
            title: 'Khối lớp',
            dataIndex: 'khoiLop',
            width: 100,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            width: 100,
        },
        {
            title: 'Kỹ năng',
            dataIndex: 'kyNang',
            width: 100,
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'cauHoi',
            width: 350,
            render: (text, record) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <strong>Question:</strong> {text.replace('Question:', '')}
                    </div>
                    <div>
                        <strong>Answer:</strong> {record.answer}
                    </div>
                </div>
            )
        },
        {
            title: 'Loại câu hỏi',
            dataIndex: 'loaiCauHoi',
            width: 180,
        },
        {
            title: 'Mức độ nhận thức',
            dataIndex: 'mucDoNhanThuc',
            width: 150,
        },
        {
            title: 'Ngày tạo / Ngày sửa',
            dataIndex: 'ngayTao',
            width: 150,
            render: (text, record) => (
                <div>
                    <div>{record.ngayTao} /</div>
                    <div>{record.ngaySua}</div>
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => message.info('Xem chi tiết câu hỏi #' + record.id)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => message.info('Chỉnh sửa câu hỏi #' + record.id)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => message.warning('Xóa câu hỏi #' + record.id)}
                    />
                </Space>
            )
        }
    ];

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const handleSearch = async () => {
        await loadQuestions();
        message.success('Đã cập nhật danh sách câu hỏi');
    };

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn câu hỏi để xóa');
            return;
        }

        try {
            await Promise.all(selectedRowKeys.map(key => deleteQuestion(key)));
            message.success(`Đã xóa ${selectedRowKeys.length} câu hỏi`);
            setSelectedRowKeys([]);
            await loadQuestions();
        } catch (err) {
            console.error('delete selected error', err);
            message.error('Xóa câu hỏi thất bại');
        }
    };

    const handleCreateQuestion = () => {
        setCreateDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setCreateDrawerVisible(false);
    };

    const handleQuestionSubmit = async (values) => {
        try {
            await createQuestion(values);
            message.success('Tạo câu hỏi thành công!');
            handleDrawerClose();
            setSelectedRowKeys([]);
            await loadQuestions();
        } catch (err) {
            console.error('handleQuestionSubmit error', err);
            message.error('Tạo câu hỏi thất bại');
        }
    };

    const filterFields = [
        {
            label: 'Khối lớp',
            field: 'khoiLop',
            placeholder: 'Tất cả',
            options: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12']
        },
        {
            label: 'Unit',
            field: 'unit',
            placeholder: 'Tất cả',
            options: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7']
        },
        {
            label: 'Kỹ năng',
            field: 'kyNang',
            placeholder: 'Tất cả',
            options: ['R - Reading', 'W - Writing', 'L - Listening', 'S - Speaking', 'P - Pronunciation']
        },
        {
            label: 'Dạng câu hỏi',
            field: 'dangCauHoi',
            placeholder: 'Tất cả',
            options: ['Multiple choice', 'Cloze', 'Reading comprehension', 'True/False', 'Matching']
        },
        {
            label: 'Yêu cầu đề bài',
            field: 'yeuCauDeBai',
            placeholder: 'Chọn yêu cầu',
            options: ['Read the following passage, choose TRUE/FALSE and choose the correct answers A-B-C-D.']
        },
        {
            label: 'Mức độ nhận thức',
            field: 'mucDoNhanThuc',
            placeholder: 'Tất cả',
            options: ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao']
        }
    ];

    // Responsive filter section
    const renderFilterSection = () => {
        // Mobile: mỗi ô 1 hàng, ẩn label
        if (!screens.md) {
            return (
                <div style={{ marginBottom: 24 }}>
                    <Row gutter={[12, 12]}>
                        {filterFields.map(({ field, placeholder, options }) => (
                            <Col span={24} key={field}>
                                <Select
                                    placeholder={placeholder}
                                    value={filters[field]}
                                    onChange={(value) => handleFilterChange(field, value)}
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    {options.map(option => (
                                        <Option key={option} value={option}>{option}</Option>
                                    ))}
                                </Select>
                            </Col>
                        ))}
                        <Col span={24}>
                            <Input
                                placeholder="Nhập nội dung câu hỏi"
                                value={filters.cauHoi}
                                onChange={(e) => handleFilterChange('cauHoi', e.target.value)}
                                prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            />
                        </Col>
                        <Col span={24}>
                            <Input
                                placeholder="Nhập mã câu hỏi"
                                value={filters.id}
                                onChange={(e) => handleFilterChange('id', e.target.value)}
                            />
                        </Col>
                        <Col span={24}>
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                block
                                size="large"
                            >
                                Tìm kiếm
                            </Button>
                        </Col>
                        <Col span={24}>
                            <div style={{ textAlign: 'center', color: '#666', padding: '8px 0' }}>
                                Tổng số: <strong>193</strong> câu hỏi
                            </div>
                        </Col>
                    </Row>
                </div>
            );
        }

        // Tablet: hiển thị label, 2-3 ô mỗi hàng
        if (!screens.lg) {
            return (
                <div style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        {filterFields.map(({ label, field, placeholder, options }) => (
                            <Col xs={24} sm={12} md={8} key={field}>
                                <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                                    {label}
                                </div>
                                <Select
                                    placeholder={placeholder}
                                    value={filters[field]}
                                    onChange={(value) => handleFilterChange(field, value)}
                                    style={{ width: '100%' }}
                                    allowClear
                                >
                                    {options.map(option => (
                                        <Option key={option} value={option}>{option}</Option>
                                    ))}
                                </Select>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                                Câu hỏi
                            </div>
                            <Input
                                placeholder="Nhập nội dung câu hỏi"
                                value={filters.cauHoi}
                                onChange={(e) => handleFilterChange('cauHoi', e.target.value)}
                                prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                                ID (Mã câu hỏi)
                            </div>
                            <Input
                                placeholder="Nhập mã câu hỏi"
                                value={filters.id}
                                onChange={(e) => handleFilterChange('id', e.target.value)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                                &nbsp;
                            </div>
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                style={{ width: '100%', height: 40 }}
                            >
                                Tìm kiếm
                            </Button>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 16, textAlign: 'right', color: '#666' }}>
                        Tổng số: <strong>193</strong> câu hỏi
                    </div>
                </div>
            );
        }

        // Desktop: 6 ô 1 hàng
        return (
            <div style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    {filterFields.map(({ label, field, placeholder, options }) => (
                        <Col span={4} key={field}>
                            <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                                {label}
                            </div>
                            <Select
                                placeholder={placeholder}
                                value={filters[field]}
                                onChange={(value) => handleFilterChange(field, value)}
                                style={{ width: '100%' }}
                                allowClear
                            >
                                {options.map(option => (
                                    <Option key={option} value={option}>{option}</Option>
                                ))}
                            </Select>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={8}>
                        <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                            Câu hỏi
                        </div>
                        <Input
                            placeholder="Nhập nội dung câu hỏi"
                            value={filters.cauHoi}
                            onChange={(e) => handleFilterChange('cauHoi', e.target.value)}
                            prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                        />
                    </Col>
                    <Col span={4}>
                        <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                            ID (Mã câu hỏi)
                        </div>
                        <Input
                            placeholder="Nhập mã câu hỏi"
                            value={filters.id}
                            onChange={(e) => handleFilterChange('id', e.target.value)}
                        />
                    </Col>
                    <Col span={4}>
                        <div style={{ marginBottom: 4, fontSize: '13px', color: '#666' }}>
                            &nbsp;
                        </div>
                        <Button
                            type="primary"
                            onClick={handleSearch}
                            style={{ width: '100%', height: 40 }}
                        >
                            Tìm kiếm
                        </Button>
                    </Col>
                    <Col span={8} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <div style={{ color: '#666', lineHeight: '40px' }}>
                            Tổng số: <strong>193</strong> câu hỏi
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    const tabItems = [
        {
            key: '1',
            label: 'Quản lý câu hỏi',
            children: (
                <div style={{ padding: screens.xs ? '16px' : '24px', background: '#fff' }}>
                    {/* Filter Section */}
                    {renderFilterSection()}

                    {/* Action Buttons */}
                    <div style={{
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: screens.xs ? 'center' : 'flex-start'
                    }}>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteSelected}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Xóa câu hỏi đã chọn ({selectedRowKeys.length})
                        </Button>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={questions}
                        loading={loading}
                        scroll={{ x: 1800 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} câu hỏi`,
                            size: screens.xs ? 'small' : 'default'
                        }}
                        bordered
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                            type: 'checkbox'
                        }}
                        size={screens.xs ? 'small' : 'middle'}
                        style={{ background: '#fff' }}
                    />
                </div>
            )
        },
        {
            key: '2',
            label: 'Lịch sử thao tác',
            children: (
                <div style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
                    Lịch sử thao tác - Đang phát triển
                </div>
            )
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
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

                <Content style={{ padding: screens.xs ? '12px' : '24px' }}>
                    {/* Banner Section */}
                    {showBanner && (
                        <div style={{
                            marginBottom: '24px',
                            position: 'relative',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: screens.xs ? '20px' : '32px 48px',
                            color: 'white'
                        }}>
                            <div style={{
                                fontSize: screens.xs ? 20 : 28,
                                fontWeight: 'bold',
                                marginBottom: 8
                            }}>
                                📚 Ngân hàng câu hỏi
                            </div>
                            <div style={{
                                fontSize: screens.xs ? 14 : 16,
                                opacity: 0.9
                            }}>
                                Quản lý và tạo mới các câu hỏi cho bài tập, đề thi
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => setShowBanner(false)}
                                style={{
                                    position: 'absolute',
                                    top: screens.xs ? '8px' : '12px',
                                    right: screens.xs ? '8px' : '12px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    width: screens.xs ? '32px' : '36px',
                                    height: screens.xs ? '32px' : '36px',
                                    color: 'white',
                                    border: 'none'
                                }}
                            />
                        </div>
                    )}

                    {/* Main Content Card */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {/* Header with buttons */}
                        <div style={{
                            padding: screens.xs ? '12px 16px' : '16px 24px',
                            display: 'flex',
                            justifyContent: screens.xs ? 'center' : 'flex-end',
                            gap: '12px',
                            borderBottom: '1px solid #f0f0f0',
                            flexWrap: screens.xs ? 'wrap' : 'nowrap'
                        }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreateQuestion}
                                size={screens.xs ? 'middle' : 'large'}
                                block={screens.xs}
                            >
                                Tạo câu hỏi
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                size={screens.xs ? 'middle' : 'large'}
                                block={screens.xs}
                            >
                                Nhập từ Excel
                            </Button>
                        </div>

                        {/* Tabs */}
                        <Tabs
                            items={tabItems}
                            defaultActiveKey="1"
                            style={{ padding: screens.xs ? '0 12px' : '0 24px' }}
                            size={screens.xs ? 'small' : 'middle'}
                        />
                    </div>
                </Content>
            </Layout>

            {/* Create Question Drawer */}
            <CreateQuestionDrawer
                visible={createDrawerVisible}
                onClose={handleDrawerClose}
                onSubmit={handleQuestionSubmit}
            />
        </Layout>
    );
};

export default QuestionBank;