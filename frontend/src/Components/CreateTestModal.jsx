// Components/CreateTestModal.jsx
import React, { useState } from 'react';
import { Modal, Input, Select, Button, Table, Checkbox, Form, Row, Col, Space, InputNumber, Grid, message } from 'antd';
import { PlusOutlined, DeleteOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';

const { Option } = Select;
const { useBreakpoint } = Grid;

export const CreateTestModal = ({ visible, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const [testName, setTestName] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [availableQuestions] = useState([]);
    const screens = useBreakpoint();
    const [filters, setFilters] = useState({
        grade: '',
        unit: '',
        skill: '',
        questionType: '',
        requirement: '',
        level: ''
    });

    // Mock data for available questions
    const mockQuestions = [
        { id: 1, question: 'What is the capital of Vietnam?', type: 'Multiple choice', category: 'Geography', level: 'Easy' },
        { id: 2, question: 'Choose the correct answer: _____ is your name?', type: 'Fill blank', category: 'Grammar', level: 'Medium' },
        { id: 3, question: 'Read the passage and answer the questions', type: 'Reading', category: 'Comprehension', level: 'Hard' },
        { id: 4, question: 'What is the largest city in Vietnam?', type: 'Multiple choice', category: 'Geography', level: 'Easy' },
        { id: 5, question: 'Complete the sentence: I _____ a student', type: 'Fill blank', category: 'Grammar', level: 'Easy' },
    ];

    const handleSubmit = () => {
        // Validate tiêu đề
        if (!testName.trim()) {
            message.error('Vui lòng nhập tiêu đề');
            return;
        }
        if (testName.length < 3) {
            message.error('Tiêu đề phải có ít nhất 3 ký tự');
            return;
        }
        if (testName.length > 200) {
            message.error('Tiêu đề không được vượt quá 200 ký tự');
            return;
        }

        // Validate thời gian
        if (!timeLimit) {
            message.error('Vui lòng nhập thời gian làm bài');
            return;
        }
        const timeNum = parseInt(timeLimit);
        if (isNaN(timeNum) || timeNum < 1) {
            message.error('Thời gian phải là số và lớn hơn 0');
            return;
        }
        if (timeNum > 180) {
            message.error('Thời gian không được vượt quá 180 phút');
            return;
        }

        // Validate số lượng câu hỏi đã chọn
        if (selectedQuestions.length === 0) {
            message.warning('Bạn chưa chọn câu hỏi nào');
            return;
        }

        onSubmit({
            testName,
            timeLimit: timeNum,
            selectedQuestions
        });

        // Reset form
        setTestName('');
        setTimeLimit('');
        setSelectedQuestions([]);
    };

    const handleClose = () => {
        setTestName('');
        setTimeLimit('');
        setSelectedQuestions([]);
        setFilters({
            grade: '',
            unit: '',
            skill: '',
            questionType: '',
            requirement: '',
            level: ''
        });
        onClose();
    };

    const moveToSelected = () => {
        // Logic to move selected questions to right panel
        message.info('Chức năng đang phát triển');
    };

    const moveToAvailable = () => {
        // Logic to move selected questions back to left panel
        message.info('Chức năng đang phát triển');
    };

    // Responsive width
    const getModalWidth = () => {
        if (!screens.md) return '95%'; // Mobile
        if (!screens.lg) return '90%'; // Tablet
        return 1400; // Desktop
    };

    // Columns for the question list table (left side)
    const availableColumns = [
        {
            title: '',
            key: 'checkbox',
            width: 40,
            render: () => <Checkbox />
        },
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            flex: 1,
            render: (text) => (
                <div style={{
                    maxWidth: screens.xs ? '150px' : '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {text}
                </div>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: screens.xs ? 80 : 120,
        },
        {
            title: 'Lựa chọn',
            dataIndex: 'category',
            width: screens.xs ? 80 : 120,
        },
        {
            title: 'Mức độ',
            dataIndex: 'level',
            width: screens.xs ? 70 : 150,
        },
        {
            title: 'Xem',
            width: screens.xs ? 50 : 100,
            render: () => (
                <Button type="link" size="small">
                    {screens.xs ? '👁️' : 'Xem'}
                </Button>
            )
        }
    ];

    // Columns for selected questions table (right side)
    const selectedColumns = [
        {
            title: '',
            key: 'checkbox',
            width: 40,
            render: () => <Checkbox />
        },
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            flex: 1,
            render: (text) => (
                <div style={{
                    maxWidth: screens.xs ? '150px' : '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {text}
                </div>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: screens.xs ? 80 : 120,
        },
        {
            title: 'Lựa chọn',
            dataIndex: 'category',
            width: screens.xs ? 80 : 120,
        },
        {
            title: 'Mức độ',
            dataIndex: 'level',
            width: screens.xs ? 70 : 150,
        },
        {
            title: 'Xem',
            width: screens.xs ? 50 : 100,
            render: () => (
                <Button type="link" size="small">
                    {screens.xs ? '👁️' : 'Xem'}
                </Button>
            )
        }
    ];

    return (
        <Modal
            title={
                <div style={{
                    fontSize: screens.xs ? '14px' : '16px',
                    fontWeight: 600,
                    color: '#00BCD4',
                    padding: screens.xs ? '4px 0' : '8px 0'
                }}>
                    TẠO ĐỀ KIỂM TRA
                </div>
            }
            open={visible}
            onCancel={handleClose}
            width={getModalWidth()}
            footer={[
                <Button key="close" onClick={handleClose} size={screens.xs ? 'middle' : 'large'}>
                    Đóng
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    size={screens.xs ? 'middle' : 'large'}
                    style={{ background: '#00BCD4' }}
                >
                    Lưu
                </Button>,
            ]}
            styles={{
                body: {
                    padding: screens.xs ? '16px' : '24px',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }
            }}
        >
            <Form form={form} layout="vertical" size={screens.xs ? 'middle' : 'large'}>
                {/* Header Form */}
                <Row gutter={[screens.xs ? 12 : 24, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={
                                <span style={{ fontSize: screens.xs ? '13px' : '14px', fontWeight: 500 }}>
                                    <span style={{ color: '#ff4d4f' }}>* </span>
                                    Tiêu đề:
                                </span>
                            }
                            required
                            validateStatus={testName && testName.length < 3 ? 'error' : ''}
                            help={testName && testName.length < 3 ? 'Tiêu đề phải có ít nhất 3 ký tự' : ''}
                        >
                            <Input
                                placeholder="Nhập tiêu đề"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                status={testName && testName.length < 3 ? 'error' : ''}
                                showCount
                                maxLength={200}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={
                                <span style={{ fontSize: screens.xs ? '13px' : '14px', fontWeight: 500 }}>
                                    Cấu trúc đề
                                </span>
                            }
                        >
                            <Row gutter={4}>
                                <Col span={8}>
                                    <div style={{
                                        padding: screens.xs ? '6px 8px' : '8px 12px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px',
                                        background: '#f5f5f5',
                                        textAlign: 'center',
                                        fontSize: screens.xs ? '12px' : '14px'
                                    }}>
                                        Mục/Phần
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{
                                        padding: screens.xs ? '6px 8px' : '8px 12px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px',
                                        background: '#f5f5f5',
                                        textAlign: 'center',
                                        fontSize: screens.xs ? '12px' : '14px'
                                    }}>
                                        Số câu
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{
                                        padding: screens.xs ? '6px 8px' : '8px 12px',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px',
                                        background: '#f5f5f5',
                                        textAlign: 'center',
                                        fontSize: screens.xs ? '12px' : '14px'
                                    }}>
                                        Điểm
                                    </div>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[screens.xs ? 12 : 24, 16]}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={
                                <span style={{ fontSize: screens.xs ? '13px' : '14px', fontWeight: 500 }}>
                                    <span style={{ color: '#ff4d4f' }}>* </span>
                                    Thời gian (phút):
                                </span>
                            }
                            required
                            validateStatus={timeLimit && (isNaN(parseInt(timeLimit)) || parseInt(timeLimit) < 1) ? 'error' : ''}
                            help={timeLimit && (isNaN(parseInt(timeLimit)) || parseInt(timeLimit) < 1) ? 'Thời gian phải là số và lớn hơn 0' : ''}
                        >
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    placeholder="Nhập thời gian"
                                    value={timeLimit}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Chỉ cho phép nhập số
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setTimeLimit(value);
                                        }
                                    }}
                                    style={{ width: 'calc(100% - 70px)' }}
                                    status={timeLimit && (isNaN(parseInt(timeLimit)) || parseInt(timeLimit) < 1) ? 'error' : ''}
                                />
                                <Button>phút</Button>
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <div style={{
                            padding: screens.xs ? '10px 12px' : '12px 16px',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            background: '#fafafa',
                            marginTop: screens.xs ? '0' : '30px'
                        }}>
                            <Row justify="space-between" align="middle">
                                <span style={{ fontWeight: 'bold', fontSize: screens.xs ? '13px' : '14px' }}>TỔNG CỘNG</span>
                                <Space size={screens.xs ? 'middle' : 'large'}>
                                    <span style={{ fontSize: screens.xs ? '13px' : '14px' }}>{selectedQuestions.length}</span>
                                    <span style={{ fontSize: screens.xs ? '13px' : '14px' }}>0</span>
                                </Space>
                            </Row>
                        </div>
                    </Col>
                </Row>

                {/* Question List Section */}
                <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: screens.xs ? '16px' : '20px',
                    background: '#fafafa',
                    marginTop: '24px'
                }}>
                    <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: screens.xs ? '14px' : '15px',
                        fontWeight: 600,
                        color: '#00BCD4'
                    }}>
                        DANH SÁCH CÂU HỎI
                    </h3>

                    {/* Filters Row */}
                    <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
                        <Col xs={12} sm={8} md={8} lg={4}>
                            <Select
                                placeholder="Khối lớp"
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, grade: value })}
                                allowClear
                                size={screens.xs ? 'middle' : 'default'}
                            >
                                <Option value="6">Lớp 6</Option>
                                <Option value="7">Lớp 7</Option>
                                <Option value="8">Lớp 8</Option>
                                <Option value="9">Lớp 9</Option>
                            </Select>
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={4}>
                            <Select
                                placeholder="Unit"
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, unit: value })}
                                allowClear
                                size={screens.xs ? 'middle' : 'default'}
                            >
                                <Option value="1">Unit 1</Option>
                                <Option value="2">Unit 2</Option>
                                <Option value="3">Unit 3</Option>
                            </Select>
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={4}>
                            <Select
                                placeholder="Kỹ năng"
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, skill: value })}
                                allowClear
                                size={screens.xs ? 'middle' : 'default'}
                            >
                                <Option value="reading">Reading</Option>
                                <Option value="listening">Listening</Option>
                                <Option value="writing">Writing</Option>
                            </Select>
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={4}>
                            <Select
                                placeholder="Dạng câu hỏi"
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, questionType: value })}
                                allowClear
                                size={screens.xs ? 'middle' : 'default'}
                            >
                                <Option value="multiple">Trắc nghiệm</Option>
                                <Option value="essay">Tự luận</Option>
                                <Option value="cloze">Điền từ</Option>
                            </Select>
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={4}>
                            <Select
                                placeholder="Yêu cầu"
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, requirement: value })}
                                allowClear
                                size={screens.xs ? 'middle' : 'default'}
                            >
                                <Option value="read">Đọc hiểu</Option>
                                <Option value="choose">Chọn đáp án</Option>
                            </Select>
                        </Col>
                        <Col xs={12} sm={8} md={8} lg={4}>
                            <Select
                                placeholder="Mức độ"
                                style={{ width: '100%' }}
                                onChange={(value) => setFilters({ ...filters, level: value })}
                                allowClear
                                size={screens.xs ? 'middle' : 'default'}
                            >
                                <Option value="easy">Dễ</Option>
                                <Option value="medium">Trung bình</Option>
                                <Option value="hard">Khó</Option>
                            </Select>
                        </Col>
                    </Row>

                    {/* Search Row */}
                    <Row gutter={[8, 8]} style={{ marginBottom: '16px' }} align="bottom">
                        <Col xs={24} sm={24} md={8}>
                            <Form.Item label="Câu hỏi" style={{ marginBottom: 0 }}>
                                <Input placeholder="Nhập nội dung câu hỏi" size={screens.xs ? 'middle' : 'default'} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <Form.Item label="ID (Mã câu hỏi)" style={{ marginBottom: 0 }}>
                                <Input placeholder="Nhập mã câu hỏi" size={screens.xs ? 'middle' : 'default'} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8}>
                            <Space wrap style={{ width: '100%', justifyContent: screens.xs ? 'space-between' : 'flex-start' }}>
                                <Button type="primary" style={{ background: '#00BCD4' }} block={screens.xs}>
                                    Tìm kiếm
                                </Button>
                                <Button icon={<PlusOutlined />} block={screens.xs}>
                                    Thêm
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    {/* Two Panel Tables */}
                    <Row gutter={[16, 16]}>
                        {/* Left Table - Available Questions */}
                        <Col xs={24} md={11}>
                            <Table
                                columns={availableColumns}
                                dataSource={mockQuestions}
                                pagination={false}
                                scroll={{ x: 'max-content', y: screens.xs ? 200 : 250 }}
                                locale={{ emptyText: 'Không có câu hỏi' }}
                                size={screens.xs ? 'small' : 'small'}
                                bordered
                                rowKey="id"
                            />
                        </Col>

                        {/* Middle - Arrow Buttons */}
                        {!screens.xs && (
                            <Col md={2} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={moveToSelected}
                                    block
                                />
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={moveToAvailable}
                                    block
                                />
                            </Col>
                        )}

                        {/* Right Table - Selected Questions */}
                        <Col xs={24} md={11}>
                            <Table
                                columns={selectedColumns}
                                dataSource={selectedQuestions}
                                pagination={false}
                                scroll={{ x: 'max-content', y: screens.xs ? 200 : 250 }}
                                locale={{ emptyText: 'Chưa chọn câu hỏi' }}
                                size={screens.xs ? 'small' : 'small'}
                                bordered
                                rowKey="id"
                            />
                        </Col>
                    </Row>

                    {/* Mobile arrow buttons */}
                    {screens.xs && (
                        <Row gutter={8} style={{ marginTop: '16px' }}>
                            <Col span={12}>
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={moveToSelected}
                                    block
                                >
                                    Chọn
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={moveToAvailable}
                                    block
                                >
                                    Bỏ chọn
                                </Button>
                            </Col>
                        </Row>
                    )}

                    {/* Summary */}
                    <div style={{
                        marginTop: '16px',
                        padding: screens.xs ? '10px 12px' : '12px 16px',
                        background: selectedQuestions.length > 0 ? '#e6f7ff' : '#fff1f0',
                        borderRadius: '4px',
                        border: selectedQuestions.length > 0 ? '1px solid #91d5ff' : '1px solid #ffccc7',
                        display: 'flex',
                        flexDirection: screens.xs ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: screens.xs ? 'stretch' : 'center',
                        gap: screens.xs ? '8px' : '0'
                    }}>
                        <span style={{
                            fontWeight: 500,
                            fontSize: screens.xs ? '13px' : '14px',
                            color: selectedQuestions.length > 0 ? '#000' : '#ff4d4f'
                        }}>
                            {selectedQuestions.length > 0
                                ? `Đã chọn: ${selectedQuestions.length} câu hỏi`
                                : 'Chưa chọn câu hỏi nào'
                            }
                        </span>
                        <span style={{
                            fontWeight: 500,
                            fontSize: screens.xs ? '13px' : '14px',
                            color: selectedQuestions.length > 0 ? '#000' : '#ff4d4f'
                        }}>
                            Tổng điểm: 0
                        </span>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};