// pages/QuestionBank.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
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
    Grid,
    Modal,
} from 'antd';
import {
    PlusOutlined,
    DownloadOutlined,
    SearchOutlined,
    DeleteOutlined,
    EyeOutlined,
    EditOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import CreateQuestionDrawer from '../Components/CreateQuestionModal';
import ImportExcelModal from '../Components/ImportExcelModal';
import QuestionPreviewModal from '../Components/QuestionPreviewModal';
import { fetchQuestions, createQuestion, deleteQuestion } from '../api/questions';

const { Content } = Layout;
const { Option } = Select;
const { useBreakpoint } = Grid;

export const QuestionBank = () => {
    const { isAdmin } = useUser();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
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
    const [importExcelVisible, setImportExcelVisible] = useState(false);
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const [showBanner, setShowBanner] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [totalQuestions, setTotalQuestions] = useState(0);
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
                ...(filters.cauHoi && { search: filters.cauHoi })
            };
            // Filter out null values
            const filteredParams = Object.fromEntries(
                Object.entries(params).filter(([, value]) => value != null && value !== '')
            );
            console.log('loadQuestions params:', filteredParams);
            const data = await fetchQuestions(filteredParams);
            console.log('loadQuestions data:', data);
            const questionItems = data.questions ? data.questions.map(q => ({
                ...q,
                key: q._id || q.id,
                ngayTao: q.createdAt ? new Date(q.createdAt).toLocaleDateString('vi-VN') : '',
                ngaySua: q.updatedAt ? new Date(q.updatedAt).toLocaleDateString('vi-VN') : ''
            })) : [];
            console.log('loadQuestions questionItems:', questionItems);
            setQuestions(questionItems);
            setTotalQuestions(data.total || 0);
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
    }, [filters]);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            width: 80,
            render: (text, record, index) => String(index + 1).padStart(4, '0'), // Hiển thị số thứ tự dạng 0001, 0002...
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
            render: (text) => {
                const typeMap = {
                    multiple: 'Multiple Choice',
                    cloze: 'Cloze',
                    truefalse: 'True/False',
                    order: 'order'
                };
                return typeMap[text] || text;
            }
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
            render: (_, record, index) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            const previewData = {
                                ...record,
                                stt: String(index + 1).padStart(4, '0'),
                                yeuCauDeBai: record.yeuCauDeBai || '',
                                readingContent: record.noiDungBaiDoc || '',
                                imageLink: record.linkHinhAnh || '',
                                audioLink: record.linkAudio || '',
                                options: record.loaiCauHoi === 'multiple' ? {
                                    A: record.dapAnA,
                                    B: record.dapAnB,
                                    C: record.dapAnC,
                                    D: record.dapAnD
                                } : undefined,
                            };

                            if (record.loaiCauHoi === 'truefalse' && record.cauHoi) {
                                const stmts = record.cauHoi.split('\n');
                                const ans = record.answer ? record.answer.split(' ; ') : [];
                                previewData.statements = stmts.map((s, idx) => ({
                                    statement: s,
                                    answer: ans[idx] || ''
                                }));
                                previewData.cauHoi = '';
                            }

                            if (record.loaiCauHoi === 'cloze' && record.answer) {
                                previewData.answer = record.answer.split(' ; ').join(' | ');
                            }

                            setPreviewQuestion(previewData);
                        }}
                    />
                    {isAdmin && (
                        <>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => message.info('Chỉnh sửa câu hỏi #' + record.id)}
                            />
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Xác nhận xóa',
                                        content: `Bạn có chắc chắn muốn xóa câu hỏi này không?`,
                                        okText: 'Xóa',
                                        okType: 'danger',
                                        cancelText: 'Hủy',
                                        onOk: async () => {
                                            try {
                                                await deleteQuestion(record.key);
                                                message.success('Đã xóa câu hỏi thành công');
                                                loadQuestions();
                                            } catch (error) {
                                                console.warn(`Ignored delete error for ${record.key}:`, error);
                                                message.error('Xóa câu hỏi thất bại');
                                            }
                                        }
                                    });
                                }}
                            />
                        </>
                    )}
                </Space>
            )
        }
    ];

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
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

        setDeleting(true);
        try {
            await Promise.all(
                selectedRowKeys.map(key =>
                    deleteQuestion(key).catch(err => {
                        console.warn(`Ignored delete error for ${key}:`, err);
                    })
                )
            );
            message.success(`Đã xóa câu hỏi thành công`);
            setSelectedRowKeys([]);
            await loadQuestions();
        } catch (err) {
            console.error('delete selected error', err);
            message.error('Xóa câu hỏi thất bại');
        } finally {
            setDeleting(false);
        }
    };

    const handleCreateQuestion = () => {
        setCreateDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setCreateDrawerVisible(false);
    };

    const handleQuestionSubmit = async () => {
        console.log('handleQuestionSubmit called');
        // CreateQuestionModal đã gọi API tạo câu hỏi thành công
        handleDrawerClose();
        setSelectedRowKeys([]);
        // Reset filters để hiển thị tất cả câu hỏi bao gồm câu hỏi mới
        setFilters({
            khoiLop: null,
            unit: null,
            kyNang: null,
            dangCauHoi: null,
            yeuCauDeBai: null,
            mucDoNhanThuc: null,
            cauHoi: '',
            id: ''
        });
        console.log('filters reset, calling loadQuestions');
        await loadQuestions();
        console.log('loadQuestions completed');
    };


    const filterFields = [
        {
            label: 'Khối lớp',
            field: 'khoiLop',
            placeholder: 'Tất cả',
            options: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
        },
        {
            label: 'Unit',
            field: 'unit',
            placeholder: 'Tất cả',
            options: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10', 'Unit 11', 'Unit 12']
        },
        {
            label: 'Kỹ năng',
            field: 'kyNang',
            placeholder: 'Tất cả',
            options: ['Reading', 'Writing', 'Listening', 'Speaking', 'Pronunciation']
        },
        {
            label: 'Dạng câu hỏi',
            field: 'dangCauHoi',
            placeholder: 'Tất cả',
            options: [
                { label: 'True/False', value: 'truefalse' },
                { label: 'Cloze', value: 'cloze' },
                { label: 'order', value: 'order' },
                { label: 'Multiple Choice', value: 'multiple' }
            ]
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
                                    {Array.isArray(options) && options[0]?.value
                                        ? options.map(option => (
                                            <Option key={option.value} value={option.value}>{option.label}</Option>
                                        ))
                                        : options.map(option => (
                                            <Option key={option} value={option}>{option}</Option>
                                        ))
                                    }
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
                                Tổng số: <strong>{totalQuestions}</strong> câu hỏi
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
                                    {Array.isArray(options) && options[0]?.value
                                        ? options.map(option => (
                                            <Option key={option.value} value={option.value}>{option.label}</Option>
                                        ))
                                        : options.map(option => (
                                            <Option key={option} value={option}>{option}</Option>
                                        ))
                                    }
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
                        Tổng số: <strong>{totalQuestions}</strong> câu hỏi
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
                                {Array.isArray(options) && options[0]?.value
                                    ? options.map(option => (
                                        <Option key={option.value} value={option.value}>{option.label}</Option>
                                    ))
                                    : options.map(option => (
                                        <Option key={option} value={option}>{option}</Option>
                                    ))
                                }
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
                            Tổng số: <strong>{totalQuestions}</strong> câu hỏi
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
                    {isAdmin && (
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
                                loading={deleting}
                            >
                                Xóa câu hỏi đã chọn ({selectedRowKeys.length})
                            </Button>
                        </div>
                    )}

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
                        rowSelection={isAdmin ? {
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                            type: 'checkbox'
                        } : undefined}
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
                        {isAdmin && (
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
                                    onClick={() => setImportExcelVisible(true)}
                                >
                                    Nhập từ Excel
                                </Button>
                            </div>
                        )}

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

            {/* Import Excel Modal */}
            <ImportExcelModal
                open={importExcelVisible}
                onClose={() => setImportExcelVisible(false)}
                onSave={() => loadQuestions()}
            />

            <CreateQuestionDrawer
                visible={createDrawerVisible}
                onClose={handleDrawerClose}
                onSubmit={handleQuestionSubmit}
            />

            <QuestionPreviewModal
                question={previewQuestion}
                onClose={() => setPreviewQuestion(null)}
            />
        </Layout>
    );
};

export default QuestionBank;