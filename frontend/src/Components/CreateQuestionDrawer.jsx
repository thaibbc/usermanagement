// components/CreateQuestionDrawer.jsx
import React, { useState } from 'react';
import {
    Drawer,
    Button,
    Form,
    Input,
    Select,
    Checkbox,
    message,
    Row,
    Col,
    Grid,
    Space,
    Typography,
    Spin
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    CloseOutlined,
    AudioOutlined,
    PictureOutlined,
    LoadingOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const CreateQuestionDrawer = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [questions, setQuestions] = useState([
        {
            id: 1,
            answers: [
                { id: 'A', label: 'A' },
                { id: 'B', label: 'B' },
                { id: 'C', label: 'C' },
                { id: 'D', label: 'D' }
            ]
        }
    ]);

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            // Validate dữ liệu
            let isValid = true;

            questions.forEach((q, index) => {
                const questionContent = values[`noiDungCauHoi_${q.id}`];
                const answerType = values[`loaiDapAn_${q.id}`];

                if (!questionContent) {
                    message.error(`Câu hỏi ${index + 1}: Vui lòng nhập nội dung câu hỏi`);
                    isValid = false;
                    return;
                }

                if (!answerType) {
                    message.error(`Câu hỏi ${index + 1}: Vui lòng nhập loại đáp án`);
                    isValid = false;
                    return;
                }

                // Kiểm tra các đáp án
                let hasCorrectAnswer = false;
                q.answers.forEach(a => {
                    const answerContent = values[`dapAn_${q.id}_${a.id}`];
                    const isCorrect = values[`dapAn_${q.id}_${a.id}_dung`];

                    if (!answerContent) {
                        message.error(`Câu hỏi ${index + 1}: Vui lòng nhập đáp án ${a.label}`);
                        isValid = false;
                        return;
                    }

                    if (isCorrect) {
                        hasCorrectAnswer = true;
                    }
                });

                if (!hasCorrectAnswer) {
                    message.error(`Câu hỏi ${index + 1}: Vui lòng chọn ít nhất 1 đáp án đúng`);
                    isValid = false;
                    return;
                }
            });

            if (!isValid) {
                setSubmitLoading(false);
                return;
            }

            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const formattedValues = {
                ...values,
                questions: questions.map(q => ({
                    id: q.id,
                    answers: q.answers.map(a => ({
                        id: a.id,
                        content: values[`dapAn_${q.id}_${a.id}`],
                        isCorrect: values[`dapAn_${q.id}_${a.id}_dung`] || false
                    })),
                    questionContent: values[`noiDungCauHoi_${q.id}`],
                    answerType: values[`loaiDapAn_${q.id}`]
                }))
            };

            if (onSubmit) {
                await onSubmit(formattedValues);
            }

            message.success('Tạo câu hỏi thành công!');
            handleClose();
        } catch (error) {
            console.error('Submit error:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleClose = () => {
        if (submitLoading) return; // Không cho đóng khi đang submit

        form.resetFields();
        setQuestions([
            {
                id: 1,
                answers: [
                    { id: 'A', label: 'A' },
                    { id: 'B', label: 'B' },
                    { id: 'C', label: 'C' },
                    { id: 'D', label: 'D' }
                ]
            }
        ]);
        if (onClose) {
            onClose();
        }
    };

    const handleAddAnswer = (questionId) => {
        if (submitLoading) return;

        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                if (q.answers.length >= 6) {
                    message.warning('Chỉ có thể thêm tối đa 6 đáp án');
                    return q;
                }
                const nextLabel = String.fromCharCode(65 + q.answers.length);
                return {
                    ...q,
                    answers: [...q.answers, { id: nextLabel, label: nextLabel }]
                };
            }
            return q;
        }));
    };

    const handleRemoveAnswer = (questionId, answerId) => {
        if (submitLoading) return;

        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                if (q.answers.length <= 2) {
                    message.warning('Phải có ít nhất 2 đáp án');
                    return q;
                }
                return {
                    ...q,
                    answers: q.answers.filter(a => a.id !== answerId)
                };
            }
            return q;
        }));
    };

    const handleAddQuestion = () => {
        if (submitLoading) return;

        if (questions.length >= 10) {
            message.warning('Chỉ có thể thêm tối đa 10 câu hỏi');
            return;
        }
        const newQuestionId = questions.length + 1;
        setQuestions([...questions, {
            id: newQuestionId,
            answers: [
                { id: 'A', label: 'A' },
                { id: 'B', label: 'B' },
                { id: 'C', label: 'C' },
                { id: 'D', label: 'D' }
            ]
        }]);
        message.success(`Đã thêm câu hỏi ${newQuestionId}`);
    };

    const handleRemoveQuestion = (questionId) => {
        if (submitLoading) return;

        if (questions.length <= 1) {
            message.warning('Phải có ít nhất 1 câu hỏi');
            return;
        }
        setQuestions(questions.filter(q => q.id !== questionId));
        message.success('Đã xóa câu hỏi');
    };

    // Responsive drawer width
    const getDrawerWidth = () => {
        if (!screens.md) return '100%'; // Mobile
        if (!screens.lg) return '95%'; // Tablet
        return '85%'; // Desktop
    };

    return (
        <Drawer
            title={
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: screens.xs ? '14px' : '16px',
                    fontWeight: 600,
                    color: '#00bcd4'
                }}>
                    <Space>
                        <span>📝</span>
                        <span>TẠO CÂU HỎI MỚI</span>
                    </Space>
                    {submitLoading && <LoadingOutlined style={{ color: '#00bcd4' }} />}
                </div>
            }
            placement="right"
            width={getDrawerWidth()}
            onClose={handleClose}
            open={visible}
            closable={!submitLoading}
            maskClosable={!submitLoading}
            footer={
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    padding: screens.xs ? '12px 16px' : '12px 24px',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <Button
                        onClick={handleClose}
                        size={screens.xs ? 'middle' : 'large'}
                        disabled={submitLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        style={{ backgroundColor: '#00bcd4' }}
                        size={screens.xs ? 'middle' : 'large'}
                        loading={submitLoading}
                        disabled={submitLoading}
                        icon={submitLoading ? <LoadingOutlined /> : null}
                    >
                        {submitLoading ? 'Đang lưu...' : 'Lưu câu hỏi'}
                    </Button>
                </div>
            }
            styles={{
                body: {
                    padding: screens.xs ? '12px' : '20px',
                    backgroundColor: '#f5f5f5',
                    maxHeight: 'calc(100vh - 108px)',
                    overflowY: 'auto',
                    opacity: submitLoading ? 0.7 : 1,
                    pointerEvents: submitLoading ? 'none' : 'auto'
                }
            }}
        >
            <Spin spinning={submitLoading} tip="Đang xử lý..." size="large">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{
                        maxWidth: '100%',
                        backgroundColor: '#fff',
                        padding: screens.xs ? '12px' : '20px',
                        borderRadius: '8px'
                    }}
                    size={screens.xs ? 'middle' : 'large'}
                >
                    {/* Responsive layout */}
                    <Row gutter={[screens.xs ? 12 : 24, screens.xs ? 12 : 24]}>
                        {/* Left Column - Metadata */}
                        <Col xs={24} md={8} lg={7}>
                            <div style={{
                                borderRight: screens.md && !screens.xs ? '1px solid #f0f0f0' : 'none',
                                paddingRight: screens.md && !screens.xs ? '20px' : 0
                            }}>
                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>STT</Text>}
                                    name="stt"
                                    rules={[{ required: true, message: 'Vui lòng chọn STT' }]}
                                >
                                    <Select
                                        placeholder="Chọn số thứ tự"
                                        disabled={submitLoading}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <Option key={num} value={num}>Câu {num}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>KHỐI LỚP</Text>}
                                    name="khoiLop"
                                    rules={[{ required: true, message: 'Vui lòng chọn khối lớp' }]}
                                >
                                    <Select
                                        placeholder="Chọn khối lớp"
                                        disabled={submitLoading}
                                    >
                                        {[6, 7, 8, 9, 10, 11, 12].map(level => (
                                            <Option key={level} value={`lop${level}`}>Lớp {level}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>UNIT</Text>}
                                    name="unit"
                                    rules={[{ required: true, message: 'Vui lòng chọn unit' }]}
                                >
                                    <Select
                                        placeholder="Chọn unit"
                                        disabled={submitLoading}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                            <Option key={num} value={`unit${num}`}>Unit {num}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>KỸ NĂNG</Text>}
                                    name="kyNang"
                                    rules={[{ required: true, message: 'Vui lòng chọn kỹ năng' }]}
                                >
                                    <Select
                                        placeholder="Chọn kỹ năng"
                                        disabled={submitLoading}
                                    >
                                        <Option value="R">Reading - Đọc</Option>
                                        <Option value="W">Writing - Viết</Option>
                                        <Option value="L">Listening - Nghe</Option>
                                        <Option value="S">Speaking - Nói</Option>
                                        <Option value="P">Pronunciation - Phát âm</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>DẠNG CÂU HỎI</Text>}
                                    name="dangCauHoi"
                                    rules={[{ required: true, message: 'Vui lòng chọn dạng câu hỏi' }]}
                                >
                                    <Select
                                        placeholder="Chọn dạng câu hỏi"
                                        disabled={submitLoading}
                                    >
                                        <Option value="multiple">Multiple choice - Nhiều lựa chọn</Option>
                                        <Option value="cloze">Cloze - Điền vào chỗ trống</Option>
                                        <Option value="reading">Reading comprehension - Đọc hiểu</Option>
                                        <Option value="truefalse">True/False - Đúng/Sai</Option>
                                        <Option value="matching">Matching - Ghép cặp</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>YÊU CẦU ĐỀ BÀI</Text>}
                                    name="yeuCauDeBai"
                                >
                                    <Select
                                        placeholder="Chọn yêu cầu đề bài"
                                        allowClear
                                        disabled={submitLoading}
                                    >
                                        <Option value="read_passage">Read the following passage, choose TRUE/FALSE and choose the correct answers A-B-C-D.</Option>
                                        <Option value="choose_answer">Choose the correct answer A, B, C, or D.</Option>
                                        <Option value="fill_blank">Fill in the blank with the correct word.</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<Text strong style={{ color: '#00bcd4' }}>MỨC ĐỘ NHẬN THỨC</Text>}
                                    name="mucDoNhanThuc"
                                    rules={[{ required: true, message: 'Vui lòng chọn mức độ nhận thức' }]}
                                >
                                    <Select
                                        placeholder="Chọn mức độ nhận thức"
                                        disabled={submitLoading}
                                    >
                                        <Option value="nhan-biet">Nhận biết</Option>
                                        <Option value="thong-hieu">Thông hiểu</Option>
                                        <Option value="van-dung">Vận dụng</Option>
                                        <Option value="van-dung-cao">Vận dụng cao</Option>
                                    </Select>
                                </Form.Item>
                            </div>
                        </Col>

                        {/* Right Column - Content */}
                        <Col xs={24} md={16} lg={17}>
                            {/* Audio and Image Links */}
                            <Row gutter={[screens.xs ? 8 : 16, screens.xs ? 8 : 16]} style={{ marginBottom: '20px' }}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Link audio" name="linkAudio">
                                        <Input
                                            placeholder="https://example.com/audio.mp3"
                                            suffix={
                                                <Button
                                                    type="text"
                                                    icon={<AudioOutlined />}
                                                    size="small"
                                                    disabled={submitLoading}
                                                >
                                                    Upload
                                                </Button>
                                            }
                                            disabled={submitLoading}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Link hình ảnh" name="linkHinhAnh">
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            suffix={
                                                <Button
                                                    type="text"
                                                    icon={<PictureOutlined />}
                                                    size="small"
                                                    disabled={submitLoading}
                                                >
                                                    Upload
                                                </Button>
                                            }
                                            disabled={submitLoading}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Reading Content */}
                            <Form.Item
                                label="Nội dung bài đọc (đoạn văn)"
                                name="noiDungBaiDoc"
                            >
                                <TextArea
                                    rows={screens.xs ? 3 : 5}
                                    placeholder="Nhập nội dung bài đọc..."
                                    style={{
                                        fontFamily: 'monospace',
                                        backgroundColor: '#fafafa'
                                    }}
                                    disabled={submitLoading}
                                />
                                <Text style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
                                    Hỗ trợ định dạng: Ctrl+B (In đậm), Ctrl+I (Nghiêng), Ctrl+U (Gạch chân)
                                </Text>
                            </Form.Item>

                            {/* Questions Section */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: screens.xs ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: screens.xs ? 'stretch' : 'center',
                                    gap: screens.xs ? '12px' : 0,
                                    marginBottom: '16px'
                                }}>
                                    <Text strong style={{
                                        fontSize: screens.xs ? '15px' : '16px',
                                        color: '#00bcd4'
                                    }}>
                                        Danh sách câu hỏi nhỏ
                                    </Text>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        ghost
                                        block={screens.xs}
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi nhỏ
                                    </Button>
                                </div>

                                {questions.map((question, qIndex) => (
                                    <div
                                        key={question.id}
                                        style={{
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '8px',
                                            padding: screens.xs ? '12px' : '16px',
                                            marginBottom: '16px',
                                            backgroundColor: '#fff',
                                            position: 'relative',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                            opacity: submitLoading ? 0.8 : 1
                                        }}
                                    >
                                        {/* Question Header */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: screens.xs ? 'column' : 'row',
                                            justifyContent: 'space-between',
                                            alignItems: screens.xs ? 'flex-start' : 'center',
                                            gap: screens.xs ? '12px' : 0,
                                            marginBottom: '16px',
                                            paddingBottom: '12px',
                                            borderBottom: '1px dashed #d9d9d9'
                                        }}>
                                            <Text strong style={{
                                                fontSize: screens.xs ? '14px' : '15px',
                                                color: '#00bcd4'
                                            }}>
                                                Câu hỏi {question.id}
                                            </Text>
                                            {questions.length > 1 && (
                                                <Button
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveQuestion(question.id)}
                                                    block={screens.xs}
                                                    disabled={submitLoading}
                                                >
                                                    Xóa câu hỏi
                                                </Button>
                                            )}
                                        </div>

                                        {/* Answer Type */}
                                        <Form.Item
                                            label="Loại đáp án"
                                            name={`loaiDapAn_${question.id}`}
                                            rules={[{ required: true, message: 'Vui lòng nhập loại đáp án' }]}
                                        >
                                            <Input
                                                placeholder="Ví dụ: Chọn đáp án đúng nhất"
                                                disabled={submitLoading}
                                            />
                                        </Form.Item>

                                        {/* Question Content */}
                                        <Form.Item
                                            label="Nội dung câu hỏi"
                                            name={`noiDungCauHoi_${question.id}`}
                                            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                                        >
                                            <TextArea
                                                rows={screens.xs ? 2 : 3}
                                                placeholder="Nhập nội dung câu hỏi..."
                                                disabled={submitLoading}
                                            />
                                        </Form.Item>

                                        {/* Answers Section */}
                                        <div style={{ marginTop: '16px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '12px',
                                                fontWeight: 600,
                                                fontSize: '13px',
                                                color: '#666'
                                            }}>
                                                <span>Đáp án</span>
                                                <span>Đúng/Sai</span>
                                            </div>

                                            {question.answers.map((answer) => (
                                                <div key={answer.id} style={{ marginBottom: '12px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: screens.xs ? 'column' : 'row',
                                                        gap: screens.xs ? '8px' : '8px',
                                                        alignItems: screens.xs ? 'stretch' : 'center'
                                                    }}>
                                                        <div style={{
                                                            width: screens.xs ? 'auto' : '28px',
                                                            fontWeight: 600,
                                                            color: '#00bcd4',
                                                            marginBottom: screens.xs ? '4px' : 0
                                                        }}>
                                                            {answer.label}
                                                        </div>
                                                        <Form.Item
                                                            name={`dapAn_${question.id}_${answer.id}`}
                                                            style={{
                                                                flex: 1,
                                                                marginBottom: screens.xs ? '8px' : 0,
                                                                width: screens.xs ? '100%' : 'auto'
                                                            }}
                                                            rules={[{ required: true, message: 'Vui lòng nhập đáp án' }]}
                                                        >
                                                            <Input
                                                                placeholder={`Nhập đáp án ${answer.label}`}
                                                                disabled={submitLoading}
                                                            />
                                                        </Form.Item>
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '8px',
                                                            alignItems: 'center',
                                                            justifyContent: screens.xs ? 'flex-start' : 'center'
                                                        }}>
                                                            <Form.Item
                                                                name={`dapAn_${question.id}_${answer.id}_dung`}
                                                                valuePropName="checked"
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Checkbox disabled={submitLoading} />
                                                            </Form.Item>
                                                            <Button
                                                                type="text"
                                                                icon={<CloseOutlined />}
                                                                size="small"
                                                                onClick={() => handleRemoveAnswer(question.id, answer.id)}
                                                                disabled={question.answers.length <= 2 || submitLoading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Answer Button */}
                                            <Button
                                                type="dashed"
                                                icon={<PlusOutlined />}
                                                onClick={() => handleAddAnswer(question.id)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                                block={screens.xs}
                                                disabled={submitLoading}
                                            >
                                                Thêm đáp án
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Drawer>
    );
};

export default CreateQuestionDrawer;