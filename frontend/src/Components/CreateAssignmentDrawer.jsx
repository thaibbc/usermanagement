// Components/CreateAssignmentDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Input,
    Select,
    Row,
    Col,
    Button,
    InputNumber,
    DatePicker,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    Spin,
    message,
    Divider,
    Card,
    Alert,
    Empty,
    Image
} from 'antd';
import {
    CloseOutlined,
    FontColorsOutlined,
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    PictureOutlined,
    LinkOutlined,
    BookOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    FileTextOutlined,
    PlusOutlined
} from '@ant-design/icons';
import LibraryDrawer from './LibraryDrawer';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper kiểm tra đường dẫn hình ảnh
const isImageUrl = (text) => {
    if (typeof text !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
    return text.startsWith('http') && imageExtensions.test(text);
};

// Helper kiểm tra đường dẫn chung
const isUrl = (text) => {
    if (typeof text !== 'string') return false;
    return text.startsWith('http://') || text.startsWith('https://');
};

const CreateAssignmentDrawer = ({
    visible,
    onClose,
    onSubmit,
    loading,
    formData,
    setFormData,
    studentData,
    colors,
    isMobile,
    isMobileOrTablet
}) => {
    const [libraryDrawerVisible, setLibraryDrawerVisible] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);

    // Cập nhật selectedQuestions khi formData.questions thay đổi
    useEffect(() => {
        if (formData.questions && formData.questions.length > 0) {
            // Kiểm tra nếu questions là mảng object
            if (typeof formData.questions[0] === 'object') {
                setSelectedQuestions(formData.questions);
            }
        } else {
            setSelectedQuestions([]);
        }
    }, [formData.questions]);

    const studentColumns = [
        {
            title: 'Tên học sinh',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <Text type="secondary">{text}</Text>
        },
    ];

    const handleSave = async () => {
        // Validate tiêu đề
        if (!formData.title || !formData.title.trim()) {
            message.error('Vui lòng nhập tiêu đề bài tập');
            return;
        }

        // Validate loại bài tập
        if (!formData.type) {
            message.error('Vui lòng chọn loại bài tập');
            return;
        }

        // Validate điểm
        if (!formData.points || formData.points <= 0) {
            message.error('Điểm phải lớn hơn 0');
            return;
        }

        if (formData.points > 100) {
            message.error('Điểm không được vượt quá 100');
            return;
        }

        // Validate thời gian đóng phải sau thời gian mở
        if (formData.openTime && formData.closeTime) {
            if (formData.closeTime.isBefore(formData.openTime)) {
                message.error('Thời gian đóng phải sau thời gian mở');
                return;
            }
        }

        // Kiểm tra nếu chọn từ thư viện nhưng không có câu hỏi
        if (formData.useLibrary && selectedQuestions.length === 0) {
            message.error('Vui lòng chọn bài tập từ thư viện có câu hỏi');
            return;
        }

        if (onSubmit) {
            await onSubmit();
        }
    };

    // Xử lý khi chọn bài tập từ thư viện
    const handleSelectFromLibrary = (selectedTest) => {
        console.log('Selected test from library:', selectedTest);

        // Lấy câu hỏi từ bài tập đã chọn
        let questionsFromLibrary = [];

        if (selectedTest.questions && Array.isArray(selectedTest.questions)) {
            questionsFromLibrary = selectedTest.questions;
        } else if (selectedTest.questionsList && Array.isArray(selectedTest.questionsList)) {
            questionsFromLibrary = selectedTest.questionsList;
        }

        // Chuẩn hóa dữ liệu câu hỏi
        const normalizedQuestions = questionsFromLibrary.map(q => ({
            ...q,
            _id: q._id || q.id,
            cauHoi: q.cauHoi || q.question || q.title || 'Không có nội dung',
            loaiCauHoi: q.loaiCauHoi || q.type || 'multiple_choice',
            mucDoNhanThuc: q.mucDoNhanThuc || q.level || 'Thông hiểu',
            answer: q.answer || '',
            yeuCauDeBai: q.yeuCauDeBai || q.requirements || '',
            noiDungBaiDoc: q.noiDungBaiDoc || q.content || '',
            dapAnA: q.dapAnA || q.answerA || '',
            dapAnB: q.dapAnB || q.answerB || '',
            dapAnC: q.dapAnC || q.answerC || '',
            dapAnD: q.dapAnD || q.answerD || ''
        }));

        setFormData({
            ...formData,
            title: selectedTest.name || selectedTest.title,
            type: selectedTest.type?.toLowerCase() === 'quiz' ? 'quiz' : 'normal',
            points: selectedTest.points || 10,
            requirements: selectedTest.requirements || selectedTest.description || '',
            // Giữ lại danh sách học sinh đã chọn trước đó, không reset về []
            useLibrary: true,
            openTime: selectedTest.openTime ? dayjs(selectedTest.openTime) : null,
            closeTime: selectedTest.closeTime ? dayjs(selectedTest.closeTime) : null,
            questions: normalizedQuestions
        });

        setSelectedQuestions(normalizedQuestions);

        message.success(`Đã chọn bài tập: ${selectedTest.name || selectedTest.title} với ${normalizedQuestions.length} câu hỏi`);
        setLibraryDrawerVisible(false);
    };

    // Xóa một câu hỏi
    const handleRemoveQuestion = (questionId) => {
        const newQuestions = selectedQuestions.filter(q => q._id !== questionId);
        setSelectedQuestions(newQuestions);
        setFormData({ ...formData, questions: newQuestions });

        if (newQuestions.length === 0) {
            setFormData({ ...formData, useLibrary: false });
        }

        message.success('Đã xóa câu hỏi');
    };

    // Xóa tất cả câu hỏi
    const handleClearAllQuestions = () => {
        setSelectedQuestions([]);
        setFormData({
            ...formData,
            questions: [],
            useLibrary: false,
            title: '',
            type: undefined,
            points: 10,
            requirements: ''
        });
        message.info('Đã xóa tất cả câu hỏi');
    };

    // Toggle mở rộng câu hỏi
    const toggleExpandQuestion = (questionId) => {
        setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
    };

    const getDrawerWidth = () => {
        if (isMobile) return '100%';
        if (isMobileOrTablet) return '100%';
        return '110%';
    };

    // Render câu hỏi chi tiết
    const renderQuestionDetail = (question, index) => {
        const isExpanded = expandedQuestionId === question._id;

        return (
            <Card
                key={question._id || index}
                size="small"
                style={{
                    marginBottom: 12,
                    backgroundColor: '#fff',
                    borderLeft: `3px solid ${formData.color || '#00bcd4'}`
                }}
                styles={{ body: { padding: '12px' } }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <Space wrap style={{ marginBottom: 8 }}>
                            <Tag color="blue">Câu {index + 1}</Tag>
                            <Tag color={question.loaiCauHoi === 'multiple_choice' ? 'green' : 'orange'}>
                                {question.loaiCauHoi === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}
                            </Tag>
                            <Tag color="purple">{question.mucDoNhanThuc || 'Thông hiểu'}</Tag>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => toggleExpandQuestion(question._id)}
                                style={{ padding: 0 }}
                            >
                                {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                            </Button>
                        </Space>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>
                            {question.cauHoi}
                        </div>
                        {isExpanded && (
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0' }}>
                                {/* Hình ảnh và Video/Audio */}
                                {(question.linkHinhAnh || question.linkAudio) && (
                                    <div style={{ marginBottom: 16 }}>
                                        {question.linkHinhAnh && (
                                            <div style={{ marginBottom: 12, textAlign: 'center' }}>
                                                {isImageUrl(question.linkHinhAnh) ? (
                                                    <Image
                                                        src={question.linkHinhAnh}
                                                        alt="Hình ảnh Câu hỏi"
                                                        style={{ maxWidth: '100%', maxHeight: 250, objectFit: 'contain' }}
                                                        fallback="https://via.placeholder.com/250?text=Lỗi+Hình+Ảnh"
                                                    />
                                                ) : isUrl(question.linkHinhAnh) ? (
                                                    <div style={{ padding: '16px', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
                                                        <a href={question.linkHinhAnh} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                            🔗 Mở link Hình ảnh / Tài liệu
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span>{question.linkHinhAnh}</span>
                                                )}
                                            </div>
                                        )}
                                        {question.linkAudio && (
                                            <div style={{ textAlign: 'center' }}>
                                                <audio controls src={question.linkAudio} style={{ width: '100%', maxWidth: 350, marginTop: 8 }}>
                                                    Trình duyệt không hỗ trợ.
                                                </audio>
                                                {isUrl(question.linkAudio) && (
                                                    <div style={{ marginTop: 8, fontSize: '13px' }}>
                                                        <a href={question.linkAudio} target="_blank" rel="noopener noreferrer">
                                                            🔗 File Audio (Nếu trình nghe bị lỗi)
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {question.yeuCauDeBai && (
                                    <div style={{ marginBottom: 8 }}>
                                        <Text type="secondary">Yêu cầu đề bài: </Text>
                                        <Text>{question.yeuCauDeBai}</Text>
                                    </div>
                                )}
                                {question.noiDungBaiDoc && (
                                    <div style={{ marginBottom: 8 }}>
                                        <Text type="secondary">Nội dung bài đọc: </Text>
                                        <Text italic>{question.noiDungBaiDoc}</Text>
                                    </div>
                                )}
                                {question.answer && (
                                    <div style={{ marginBottom: 8 }}>
                                        <Text type="secondary">Đáp án gợi ý: </Text>
                                        <Text>{question.answer}</Text>
                                    </div>
                                )}
                                {(question.dapAnA || question.dapAnB || question.dapAnC || question.dapAnD) && (
                                    <div>
                                        <Text type="secondary">Các đáp án: </Text>
                                        <div style={{ marginTop: 4, marginLeft: 16 }}>
                                            {question.dapAnA && <div>A. {question.dapAnA}</div>}
                                            {question.dapAnB && <div>B. {question.dapAnB}</div>}
                                            {question.dapAnC && <div>C. {question.dapAnC}</div>}
                                            {question.dapAnD && <div>D. {question.dapAnD}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleRemoveQuestion(question._id)}
                        disabled={loading}
                    />
                </div>
            </Card>
        );
    };

    return (
        <>
            <Drawer
                title={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                    }}>
                        <Space>
                            <FileTextOutlined style={{ color: '#00bcd4', fontSize: 18 }} />
                            <Text style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 600, color: '#00bcd4' }}>
                                TẠO MỚI BÀI TẬP
                            </Text>
                        </Space>
                        <Space>
                            {formData.useLibrary && selectedQuestions.length > 0 && (
                                <Tag color="green" icon={<CheckCircleOutlined />} style={{ marginRight: 8 }}>
                                    {selectedQuestions.length} câu hỏi
                                </Tag>
                            )}
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    color: '#666',
                                    fontSize: 16
                                }}
                            />
                        </Space>
                    </div>
                }
                open={visible}
                onClose={onClose}
                size={getDrawerWidth() === '100%' ? 'large' : undefined}
                width={getDrawerWidth() === '100%' ? undefined : getDrawerWidth()}
                closable={false}
                mask={{ closable: !loading }}
                styles={{
                    body: {
                        padding: isMobile ? '16px' : '24px',
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 108px)',
                    }
                }}
                footer={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8,
                        padding: isMobile ? '12px 16px' : '12px 24px',
                        borderTop: '1px solid #f0f0f0'
                    }}>
                        <Button onClick={onClose} disabled={loading} size={isMobile ? 'middle' : 'large'}>
                            Đóng
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            loading={loading}
                            disabled={loading}
                            size={isMobile ? 'middle' : 'large'}
                            style={{ backgroundColor: '#00bcd4' }}
                        >
                            {loading ? 'Đang lưu...' : 'Lưu bài tập'}
                        </Button>
                    </div>
                }
            >
                <Spin spinning={loading} description="Đang xử lý...">
                    {/* Tiêu đề */}
                    <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Tiêu đề <span style={{ color: '#ff4d4f' }}>*</span>
                        </Text>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Nhập tiêu đề bài tập"
                            size={isMobile ? 'middle' : 'large'}
                            disabled={loading}
                            showCount
                            maxLength={200}
                        />
                    </div>

                    {/* Loại bài tập và Điểm */}
                    <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 0]} style={{ marginBottom: isMobile ? 16 : 20 }}>
                        <Col xs={24} md={16}>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Loại bài tập <span style={{ color: '#ff4d4f' }}>*</span>
                            </Text>
                            <Select
                                value={formData.type}
                                onChange={(value) => setFormData({ ...formData, type: value })}
                                placeholder="Chọn loại bài tập"
                                style={{ width: '100%' }}
                                size={isMobile ? 'middle' : 'large'}
                                disabled={loading}
                            >
                                <Option value="normal">Bài tập thường</Option>
                                <Option value="quiz">Trắc nghiệm</Option>
                                <Option value="code">Lập trình</Option>
                            </Select>
                        </Col>
                        <Col xs={24} md={8}>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Điểm <span style={{ color: '#ff4d4f' }}>*</span>
                            </Text>
                            <InputNumber
                                min={1}
                                max={100}
                                value={formData.points}
                                onChange={(value) => setFormData({ ...formData, points: value || 1 })}
                                style={{ width: '100%' }}
                                size={isMobile ? 'middle' : 'large'}
                                disabled={loading}
                            />
                        </Col>
                    </Row>

                    {/* Thời gian mở và đóng */}
                    <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 0]} style={{ marginBottom: isMobile ? 16 : 20 }}>
                        <Col xs={24} md={12}>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Thời gian mở
                            </Text>
                            <DatePicker
                                showTime
                                value={formData.openTime}
                                onChange={(value) => setFormData({ ...formData, openTime: value })}
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn thời gian mở"
                                style={{ width: '100%' }}
                                size={isMobile ? 'middle' : 'large'}
                                disabled={loading}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Thời gian đóng
                            </Text>
                            <DatePicker
                                showTime
                                value={formData.closeTime}
                                onChange={(value) => setFormData({ ...formData, closeTime: value })}
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn thời gian đóng"
                                style={{ width: '100%' }}
                                size={isMobile ? 'middle' : 'large'}
                                disabled={loading}
                            />
                        </Col>
                    </Row>

                    {/* Màu sắc */}
                    <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 12, fontWeight: 500 }}>
                            Màu sắc
                        </Text>
                        <div style={{ display: 'flex', gap: isMobile ? 6 : 10, flexWrap: 'wrap' }}>
                            {colors.map(color => (
                                <Tooltip key={color} title={color}>
                                    <div
                                        onClick={() => !loading && setFormData({ ...formData, color })}
                                        style={{
                                            width: isMobile ? 28 : 32,
                                            height: isMobile ? 28 : 32,
                                            borderRadius: '50%',
                                            backgroundColor: color,
                                            border: color === '#ffffff' ? '2px solid #d9d9d9' : 'none',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            boxShadow: formData.color === color ? '0 0 0 3px #00bcd4' : 'none',
                                            transition: 'all 0.2s ease',
                                            transform: formData.color === color ? 'scale(1.1)' : 'scale(1)',
                                            position: 'relative'
                                        }}
                                    >
                                        {formData.color === color && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: isMobile ? 8 : 10,
                                                height: isMobile ? 8 : 10,
                                                borderRadius: '50%',
                                                backgroundColor: '#fff'
                                            }} />
                                        )}
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Yêu cầu / Hướng dẫn */}
                    <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Yêu cầu / Hướng dẫn
                        </Text>
                        <TextArea
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            placeholder="Nhập yêu cầu / hướng dẫn cho học sinh..."
                            rows={4}
                            disabled={loading}
                            showCount
                            maxLength={1000}
                        />
                    </div>

                    {/* Chọn học sinh giao bài */}
                    <div style={{ marginBottom: isMobile ? 16 : 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                                Chọn học sinh giao bài
                            </Text>
                            <Tag color="blue">Đã chọn: {(formData.selectedStudents || []).length}/{(studentData || []).length}</Tag>
                        </div>
                        <Table
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys: (formData.selectedStudents || []).map(s => typeof s === 'object' && s !== null ? (s._id || s.id) : s),
                                onChange: (selectedRowKeys) => setFormData({ ...formData, selectedStudents: selectedRowKeys }),
                                getCheckboxProps: () => ({ disabled: loading })
                            }}
                            columns={studentColumns}
                            dataSource={studentData}
                            pagination={false}
                            size="small"
                            scroll={{ y: isMobile ? 150 : 200 }}
                            rowKey="key"
                        />
                        {studentData.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                                <Empty description="Chưa có học sinh trong lớp" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Chọn bài tập từ thư viện */}
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type={formData.useLibrary ? 'primary' : 'default'}
                            icon={<BookOutlined />}
                            onClick={() => setLibraryDrawerVisible(true)}
                            size={isMobile ? 'middle' : 'large'}
                            disabled={loading}
                            block={isMobile}
                            style={{
                                backgroundColor: formData.useLibrary ? '#00bcd4' : undefined,
                                borderColor: formData.useLibrary ? '#00bcd4' : undefined,
                                height: isMobile ? 40 : 44
                            }}
                        >
                            {formData.useLibrary ? 'Đã chọn bài tập từ thư viện' : 'Chọn bài tập từ thư viện'}
                        </Button>
                        {!formData.useLibrary && (
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                                Hoặc bạn có thể tạo bài tập mới bằng cách nhập thông tin bên trên
                            </Text>
                        )}
                    </div>

                    {/* Hiển thị danh sách câu hỏi đã chọn */}
                    {selectedQuestions.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 12
                            }}>
                                <Space>
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                        Danh sách câu hỏi ({selectedQuestions.length} câu)
                                    </Text>
                                </Space>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={handleClearAllQuestions}
                                    danger
                                    disabled={loading}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                            <div style={{
                                maxHeight: 400,
                                overflowY: 'auto',
                                border: '1px solid #f0f0f0',
                                borderRadius: 8,
                                padding: 8,
                                background: '#fafafa'
                            }}>
                                {selectedQuestions.map((q, idx) => renderQuestionDetail(q, idx))}
                            </div>
                        </div>
                    )}

                    {/* Hiển thị khi chưa chọn câu hỏi */}
                    {formData.useLibrary && selectedQuestions.length === 0 && (
                        <Alert
                            message="Chưa có câu hỏi"
                            description="Bạn đã chọn bài tập từ thư viện nhưng không có câu hỏi. Vui lòng chọn lại bài tập khác."
                            type="warning"
                            showIcon
                            style={{ marginTop: 16 }}
                            action={
                                <Button size="small" onClick={() => setLibraryDrawerVisible(true)}>
                                    Chọn lại
                                </Button>
                            }
                        />
                    )}
                </Spin>
            </Drawer>

            <LibraryDrawer
                visible={libraryDrawerVisible}
                onClose={() => setLibraryDrawerVisible(false)}
                onSelectTest={handleSelectFromLibrary}
            />
        </>
    );
};

export default CreateAssignmentDrawer;