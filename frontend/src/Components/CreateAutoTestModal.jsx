// Components/CreateAutoTestModal.jsx
import React, { useState } from 'react';
import {
    Modal,
    Input,
    Select,
    Button,
    InputNumber,
    Checkbox,
    Form,
    Row,
    Col,
    Space,
    Grid,
    Card,
    Typography,
    message,
    Spin,
    Tag
} from 'antd';
import { PlusOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Text } = Typography;

export const CreateAutoTestModal = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const [testType, setTestType] = useState('');
    const [testCount, setTestCount] = useState(1);
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const screens = useBreakpoint();
    const [rows, setRows] = useState([
        {
            id: 1,
            grade: '',
            unit: '',
            skill: '',
            questionType: '',
            category: '',
            difficulty: '',
            count: 0
        }
    ]);

    const handleAddRow = () => {
        if (loading) return;

        if (rows.length >= 10) {
            message.warning('Chỉ có thể thêm tối đa 10 dòng');
            return;
        }

        const newRow = {
            id: rows.length + 1,
            grade: '',
            unit: '',
            skill: '',
            questionType: '',
            category: '',
            difficulty: '',
            count: 0
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveRow = (id) => {
        if (loading) return;

        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id));
        }
    };

    // Validate tất cả các dòng
    const validateRows = () => {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Kiểm tra các trường bắt buộc
            if (!row.questionType) {
                message.error(`Dòng ${i + 1}: Vui lòng chọn Loại câu hỏi`);
                return false;
            }
            if (!row.category) {
                message.error(`Dòng ${i + 1}: Vui lòng chọn Loại tuỳ chọn`);
                return false;
            }

            // Kiểm tra số câu
            if (row.count <= 0) {
                message.error(`Dòng ${i + 1}: Số câu phải lớn hơn 0`);
                return false;
            }
            if (row.count > 100) {
                message.error(`Dòng ${i + 1}: Số câu không được vượt quá 100`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            // Validate loại đề
            if (!testType) {
                message.error('Vui lòng chọn Loại đề');
                setLoading(false);
                return;
            }

            // Validate số lượng đề
            if (testCount < 1 || testCount > 100) {
                message.error('Số lượng đề phải từ 1 đến 100');
                setLoading(false);
                return;
            }

            // Validate các dòng
            if (!validateRows()) {
                setLoading(false);
                return;
            }

            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            onSubmit({
                testType,
                testCount,
                shuffleQuestions,
                rows
            });

            message.success('Tạo đề tự động thành công!');

            // Reset form
            setTestType('');
            setTestCount(1);
            setShuffleQuestions(false);
            setRows([{
                id: 1,
                grade: '',
                unit: '',
                skill: '',
                questionType: '',
                category: '',
                difficulty: '',
                count: 0
            }]);

            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;

        // Reset form when closing
        setTestType('');
        setTestCount(1);
        setShuffleQuestions(false);
        setRows([{
            id: 1,
            grade: '',
            unit: '',
            skill: '',
            questionType: '',
            category: '',
            difficulty: '',
            count: 0
        }]);
        onClose();
    };

    // Responsive width
    const getModalWidth = () => {
        if (!screens.md) return '95%'; // Mobile
        if (!screens.lg) return '90%'; // Tablet
        return 1200; // Desktop
    };

    // Responsive column spans
    const getColSpans = () => {
        if (!screens.md) {
            return {
                grade: 24, unit: 24, skill: 24, questionType: 24, category: 24, difficulty: 24, count: 24, action: 24
            };
        }
        if (!screens.lg) {
            return {
                grade: 12, unit: 12, skill: 12, questionType: 12, category: 12, difficulty: 12, count: 20, action: 4
            };
        }
        return {
            grade: 3, unit: 2, skill: 2, questionType: 3, category: 3, difficulty: 2, count: 3, action: 1
        };
    };

    const spans = getColSpans();
    const isMobileOrTablet = !screens.lg; // Tablet trở xuống

    return (
        <Modal
            title={
                <div style={{
                    fontSize: screens.xs ? '14px' : '16px',
                    fontWeight: 600,
                    color: '#00BCD4',
                    padding: screens.xs ? '4px 0' : '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Space>
                        <span>⚡</span>
                        <span>TẠO ĐỀ TỰ ĐỘNG</span>
                    </Space>
                    {loading && <LoadingOutlined style={{ color: '#00BCD4' }} />}
                </div>
            }
            open={visible}
            onCancel={handleClose}
            width={getModalWidth()}
            maskClosable={!loading}
            closable={!loading}
            footer={[
                <Button
                    key="close"
                    onClick={handleClose}
                    size={screens.xs ? 'middle' : 'large'}
                    disabled={loading}
                >
                    Đóng
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    size={screens.xs ? 'middle' : 'large'}
                    style={{ background: '#00BCD4' }}
                    loading={loading}
                    disabled={loading}
                >
                    {loading ? 'Đang tạo...' : 'Tạo đề'}
                </Button>,
            ]}
            styles={{
                body: {
                    padding: screens.xs ? '12px' : '20px',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                }
            }}
        >
            <Spin spinning={loading} description="Đang xử lý...">
                <Form form={form} layout="vertical" size={screens.xs ? 'middle' : 'middle'}>
                    {/* Header Form */}
                    <Row gutter={[screens.xs ? 8 : 16, 12]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <Text strong style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                                        <span style={{ color: '#ff4d4f' }}>* </span>
                                        Loại đề:
                                    </Text>
                                }
                                required
                            >
                                <Select
                                    placeholder="Chọn loại đề"
                                    value={testType}
                                    onChange={setTestType}
                                    size={screens.xs ? 'middle' : 'large'}
                                    disabled={loading}
                                >
                                    <Option value="15min">Kiểm tra 15 phút</Option>
                                    <Option value="45min">Kiểm tra 1 tiết</Option>
                                    <Option value="90min">Kiểm tra học kỳ</Option>
                                    <Option value="practice">Bài tập thực hành</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label={
                                    <Text strong style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                                        <span style={{ color: '#ff4d4f' }}>* </span>
                                        Số lượng đề:
                                    </Text>
                                }
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    value={testCount}
                                    onChange={setTestCount}
                                    style={{ width: screens.xs ? '100%' : '200px' }}
                                    size={screens.xs ? 'middle' : 'large'}
                                    disabled={loading}
                                    placeholder="Nhập số lượng"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Dynamic Rows */}
                    <div style={{
                        marginTop: '16px',
                        maxHeight: '45vh',
                        overflowY: 'auto',
                        paddingRight: screens.xs ? '0' : '4px'
                    }}>
                        {rows.map((row, index) => (
                            <Card
                                key={row.id}
                                size="small"
                                style={{
                                    marginBottom: '12px',
                                    background: '#fff',
                                    border: '1px solid #f0f0f0',
                                    borderLeft: (!row.questionType || !row.category) && !loading ? '3px solid #ff4d4f' : '1px solid #f0f0f0',
                                    opacity: loading ? 0.7 : 1
                                }}
                                title={`Dòng ${index + 1}`}
                                extra={
                                    rows.length > 1 && !loading && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRemoveRow(row.id)}
                                            size="small"
                                            disabled={loading}
                                        />
                                    )
                                }
                            >
                                {!isMobileOrTablet ? (
                                    // Desktop layout
                                    <Row gutter={[8, 8]} align="middle">

                                        <Col span={spans.grade}>
                                            <Form.Item label="Khối Lớp" style={{ marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Chọn khối"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.grade}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].grade = value;
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    <Option value="grade6">Khối 6</Option>
                                                    <Option value="grade7">Khối 7</Option>
                                                    <Option value="grade8">Khối 8</Option>
                                                    <Option value="grade9">Khối 9</Option>
                                                    <Option value="grade10">Khối 10</Option>
                                                    <Option value="grade11">Khối 11</Option>
                                                    <Option value="grade12">Khối 12</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.unit}>
                                            <Form.Item label="Unit" style={{ marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Chọn unit"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.unit}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].unit = value;
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    <Option value="unit1">Unit 1</Option>
                                                    <Option value="unit2">Unit 2</Option>
                                                    <Option value="unit3">Unit 3</Option>
                                                    <Option value="unit4">Unit 4</Option>
                                                    <Option value="unit5">Unit 5</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.skill}>
                                            <Form.Item label="Kỹ năng" style={{ marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Chọn kỹ năng"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.skill}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].skill = value;
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    <Option value="reading">Reading</Option>
                                                    <Option value="listening">Listening</Option>
                                                    <Option value="writing">Writing</Option>
                                                    <Option value="speaking">Speaking</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.questionType}>
                                            <Form.Item
                                                label={<span style={{ color: '#ff4d4f' }}>*</span>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Loại câu hỏi"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.questionType}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].questionType = value;
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    status={!row.questionType && !loading ? 'error' : ''}
                                                >
                                                    <Option value="multiple">Multiple Choice (Trắc nghiệm)</Option>
                                                    <Option value="cloze">Fill in the Blank (Điền vào chỗ trống)</Option>
                                                    <Option value="truefalse">True / False / Not Given</Option>
                                                    <Option value="matching">Matching (Nối)</Option>
                                                    <Option value="transformation">Sentence Transformation (Viết lại câu)</Option>
                                                    <Option value="reading">Reading Comprehension (Đọc hiểu)</Option>
                                                    <Option value="essay">Writing / Speaking (Tự luận)</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.category}>
                                            <Form.Item
                                                label={<span style={{ color: '#ff4d4f' }}>*</span>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Loại tuỳ chọn"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.category}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].category = value;
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    status={!row.category && !loading ? 'error' : ''}
                                                >
                                                    <Option value="all">Tất cả</Option>
                                                    <Option value="vocab">Từ vựng</Option>
                                                    <Option value="grammar">Ngữ pháp</Option>
                                                    <Option value="pronunciation">Phát âm</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.difficulty}>
                                            <Form.Item label="Mức độ" style={{ marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Chọn mức độ"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.difficulty}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].difficulty = value;
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    <Option value="easy">Dễ</Option>
                                                    <Option value="medium">Trung bình</Option>
                                                    <Option value="hard">Khó</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.count}>
                                            <Form.Item
                                                label={<span style={{ color: '#ff4d4f' }}>*</span>}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumber
                                                    placeholder="Số câu"
                                                    size="small"
                                                    min={1}
                                                    max={100}
                                                    value={row.count}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].count = value || 0;
                                                        setRows(newRows);
                                                    }}
                                                    style={{ width: '100%' }}
                                                    disabled={loading}
                                                    status={row.count <= 0 && !loading ? 'error' : ''}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ) : (
                                    // Mobile & Tablet layout
                                    <Space direction="vertical" style={{ width: '100%' }} size="small">


                                        <Select
                                            placeholder="Chọn khối lớp"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.grade}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].grade = value;
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            <Option value="grade6">Khối 6</Option>
                                            <Option value="grade7">Khối 7</Option>
                                            <Option value="grade8">Khối 8</Option>
                                            <Option value="grade9">Khối 9</Option>
                                            <Option value="grade10">Khối 10</Option>
                                            <Option value="grade11">Khối 11</Option>
                                            <Option value="grade12">Khối 12</Option>
                                        </Select>

                                        <Select
                                            placeholder="Chọn unit"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.unit}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].unit = value;
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            <Option value="unit1">Unit 1</Option>
                                            <Option value="unit2">Unit 2</Option>
                                            <Option value="unit3">Unit 3</Option>
                                            <Option value="unit4">Unit 4</Option>
                                            <Option value="unit5">Unit 5</Option>
                                        </Select>

                                        <Select
                                            placeholder="Chọn kỹ năng"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.skill}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].skill = value;
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            <Option value="reading">Reading</Option>
                                            <Option value="listening">Listening</Option>
                                            <Option value="writing">Writing</Option>
                                            <Option value="speaking">Speaking</Option>
                                        </Select>

                                        <Select
                                            placeholder="Chọn loại câu hỏi *"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.questionType}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].questionType = value;
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                            status={!row.questionType ? 'error' : ''}
                                        >
                                            <Option value="multiple">Trắc nghiệm</Option>
                                            <Option value="essay">Tự luận</Option>
                                            <Option value="cloze">Điền từ</Option>
                                            <Option value="matching">Ghép cặp</Option>
                                        </Select>

                                        <Select
                                            placeholder="Chọn loại tuỳ chọn *"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.category}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].category = value;
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                            status={!row.category ? 'error' : ''}
                                        >
                                            <Option value="all">Tất cả</Option>
                                            <Option value="vocab">Từ vựng</Option>
                                            <Option value="grammar">Ngữ pháp</Option>
                                            <Option value="pronunciation">Phát âm</Option>
                                        </Select>

                                        <Select
                                            placeholder="Chọn mức độ"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.difficulty}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].difficulty = value;
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            <Option value="easy">Dễ</Option>
                                            <Option value="medium">Trung bình</Option>
                                            <Option value="hard">Khó</Option>
                                        </Select>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <InputNumber
                                                placeholder="Nhập số câu *"
                                                size="small"
                                                min={1}
                                                max={100}
                                                value={row.count}
                                                onChange={(value) => {
                                                    const newRows = [...rows];
                                                    newRows[index].count = value || 0;
                                                    setRows(newRows);
                                                }}
                                                style={{ flex: 1 }}
                                                disabled={loading}
                                                status={row.count <= 0 ? 'error' : ''}
                                            />
                                            {rows.length > 1 && (
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<CloseOutlined />}
                                                    onClick={() => handleRemoveRow(row.id)}
                                                    size="small"
                                                    disabled={loading}
                                                />
                                            )}
                                        </div>
                                    </Space>
                                )}
                            </Card>
                        ))}
                    </div>

                    {/* Nút thêm dòng */}
                    <div style={{
                        display: 'flex',
                        justifyContent: isMobileOrTablet ? 'center' : 'flex-end',
                        marginTop: '8px',
                        marginBottom: '16px'
                    }}>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddRow}
                            size={screens.xs ? 'middle' : 'large'}
                            block={isMobileOrTablet}
                            disabled={loading || rows.length >= 10}
                            style={{
                                borderColor: '#00BCD4',
                                color: '#00BCD4',
                                maxWidth: isMobileOrTablet ? '100%' : '200px'
                            }}
                        >
                            Thêm dòng ({rows.length}/10)
                        </Button>
                    </div>

                    {/* Shuffle Checkbox */}
                    <div style={{ marginTop: '8px' }}>
                        <Checkbox
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            disabled={loading}
                        >
                            <Text style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                                Ngẫu nhiên thứ tự câu hỏi
                            </Text>
                        </Checkbox>
                    </div>

                    {/* Summary */}
                    <div style={{
                        marginTop: '12px',
                        padding: screens.xs ? '10px 12px' : '12px 16px',
                        background: '#e6f7ff',
                        borderRadius: '6px',
                        border: '1px solid #91d5ff'
                    }}>
                        <Row justify="space-between" align="middle">
                            <Col xs={24} md={16}>
                                <Space size={screens.xs ? 4 : 8} direction={screens.xs ? 'vertical' : 'horizontal'}>
                                    <Text strong style={{ fontSize: screens.xs ? '13px' : '14px' }}>
                                        Tổng số câu hỏi:
                                    </Text>
                                    <Tag color="processing" style={{ fontSize: screens.xs ? '14px' : '16px', fontWeight: 'bold' }}>
                                        {rows.reduce((sum, row) => sum + (row.count || 0), 0)}
                                    </Tag>
                                    <Text style={{ color: '#666', fontSize: screens.xs ? '13px' : '14px' }}>
                                        câu
                                    </Text>
                                </Space>
                            </Col>
                            <Col xs={24} md={8} style={{ textAlign: screens.xs ? 'left' : 'right', marginTop: screens.xs ? 4 : 0 }}>
                                <Text type="secondary" style={{ fontSize: screens.xs ? '11px' : '12px' }}>
                                    {rows.filter(r => r.count > 0).length}/{rows.length} dòng có số câu
                                </Text>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Spin>
        </Modal>
    );
};