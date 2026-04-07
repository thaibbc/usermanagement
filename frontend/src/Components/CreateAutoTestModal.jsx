// Components/CreateAutoTestModal.jsx
import React, { useState, useEffect } from 'react';
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
import { fetchQuestions } from '../api/questions';

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Text } = Typography;

export const CreateAutoTestModal = ({ visible, onClose, onSubmit, selectedFolder }) => {
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

    // Options for selects
    const [gradeOptions, setGradeOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [skillOptions, setSkillOptions] = useState([]);
    const [questionTypeOptions, setQuestionTypeOptions] = useState([]);
    const [difficultyOptions, setDifficultyOptions] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);

    // Load question options when modal opens
    useEffect(() => {
        if (visible) {
            loadQuestionOptions();
        }
    }, [visible]);

    // Pre-fill first row when selectedFolder changes
    useEffect(() => {
        if (selectedFolder && selectedFolder.parent && selectedFolder.folder) {
            setRows(prevRows => {
                const newRows = [...prevRows];
                if (newRows.length > 0) {
                    newRows[0] = {
                        ...newRows[0],
                        grade: selectedFolder.parent.title || '',
                        unit: selectedFolder.folder.title || ''
                    };
                }
                return newRows;
            });
        }
    }, [selectedFolder]);

    const loadQuestionOptions = async () => {
        try {
            const response = await fetchQuestions({ limit: 1000 });
            const questions = response.questions || [];
            setAllQuestions(questions);

            const grades = [...new Set(questions.map(q => q.khoiLop).filter(Boolean))];
            const units = [...new Set(questions.map(q => q.unit).filter(Boolean))];
            const skills = [...new Set(questions.map(q => q.kyNang).filter(Boolean))];
            const questionTypes = [...new Set(questions.map(q => q.loaiCauHoi).filter(Boolean))];
            const difficulties = [...new Set(questions.map(q => q.mucDoNhanThuc).filter(Boolean))];

            setGradeOptions(grades.map(g => ({ label: g, value: g })));
            setUnitOptions(units.map(u => ({ label: u, value: u })));
            setSkillOptions(skills.map(s => ({ label: s, value: s })));
            setQuestionTypeOptions(questionTypes.map(qt => ({ label: qt, value: qt })));
            setDifficultyOptions(difficulties.map(d => ({ label: d, value: d })));
        } catch (error) {
            console.error('Failed to load question options:', error);
            message.error('Không thể tải tùy chọn câu hỏi');
        }
    };

    const getMatchingQuestionCount = (row) => {
        return allQuestions.filter(question => {
            // Check each criteria - if a field is set, it must match
            if (row.grade && question.khoiLop !== row.grade) return false;
            if (row.unit && question.unit !== row.unit) return false;
            if (row.skill && question.kyNang !== row.skill) return false;
            if (row.questionType && question.loaiCauHoi !== row.questionType) return false;
            if (row.difficulty && question.mucDoNhanThuc !== row.difficulty) return false;

            // Note: Category filtering is not implemented since categories are not stored in the database
            // The category field in the UI is for future use

            return true;
        }).length;
    };

    const updateRowCount = (rows, index) => {
        const availableCount = getMatchingQuestionCount(rows[index]);
        if (availableCount === 0) {
            rows[index].count = 0;
        } else if (rows[index].count > availableCount) {
            rows[index].count = availableCount;
        } else if (rows[index].count === 0 && availableCount > 0) {
            // Don't auto-set, let user choose
            rows[index].count = 0;
        }
        // If current count is still valid, keep it
    };

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

    const validateRows = () => {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row.questionType) {
                message.error(`Dòng ${i + 1}: Vui lòng chọn Loại câu hỏi`);
                return false;
            }
            if (!row.category) {
                message.error(`Dòng ${i + 1}: Vui lòng chọn Loại tuỳ chọn`);
                return false;
            }

            const availableCount = getMatchingQuestionCount(row);
            if (availableCount === 0) {
                message.error(`Dòng ${i + 1}: Không có câu hỏi nào phù hợp với tiêu chí đã chọn`);
                return false;
            }

            if (row.count <= 0) {
                message.error(`Dòng ${i + 1}: Vui lòng nhập số câu`);
                return false;
            }
            if (row.count > availableCount) {
                message.error(`Dòng ${i + 1}: Số câu không được vượt quá ${availableCount} (số câu có sẵn)`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            if (!testType) {
                message.error('Vui lòng chọn Loại đề');
                setLoading(false);
                return;
            }

            if (testCount < 1 || testCount > 100) {
                message.error('Số lượng đề phải từ 1 đến 100');
                setLoading(false);
                return;
            }

            if (!validateRows()) {
                setLoading(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            onSubmit({
                testType,
                testCount,
                shuffleQuestions,
                rows
            });

            message.success('Tạo đề tự động thành công!');

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

    const getModalWidth = () => {
        if (!screens.md) return '95%';
        if (!screens.lg) return '90%';
        return 1200;
    };

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
    const isMobileOrTablet = !screens.lg;

    return (
        <Modal
            title="Tạo đề tự động"
            open={visible}
            onCancel={handleClose}
            width={getModalWidth()}
            mask={{ closable: !loading }}
            closable={!loading}
            footer={[
                <Button key="close" onClick={handleClose} disabled={loading}>
                    Đóng
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} loading={loading} disabled={loading}>
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
            <Spin spinning={loading} tip="Đang xử lý...">
                <Form form={form} layout="vertical">
                    <Row gutter={[screens.xs ? 8 : 16, 12]}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Loại đề" required>
                                <Select
                                    placeholder="Chọn loại đề"
                                    value={testType}
                                    onChange={setTestType}
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
                            <Form.Item label="Số lượng đề">
                                <InputNumber
                                    min={1}
                                    max={100}
                                    value={testCount}
                                    onChange={setTestCount}
                                    style={{ width: screens.xs ? '100%' : '200px' }}
                                    disabled={loading}
                                    placeholder="Nhập số lượng"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

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
                                    border: '1px solid #f0f0f0'
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
                                                        updateRowCount(newRows, index);
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    {gradeOptions.map(option => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
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
                                                        updateRowCount(newRows, index);
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    {unitOptions.map(option => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
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
                                                        updateRowCount(newRows, index);
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    {skillOptions.map(option => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.questionType}>
                                            <Form.Item label="Loại câu hỏi" required style={{ marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Loại câu hỏi"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.questionType}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].questionType = value;
                                                        updateRowCount(newRows, index);
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    status={!row.questionType && !loading ? 'error' : ''}
                                                >
                                                    {questionTypeOptions.map(option => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.category}>
                                            <Form.Item label="Loại tuỳ chọn" required style={{ marginBottom: 0 }}>
                                                <Select
                                                    placeholder="Loại tuỳ chọn"
                                                    style={{ width: '100%' }}
                                                    size="small"
                                                    value={row.category}
                                                    onChange={(value) => {
                                                        const newRows = [...rows];
                                                        newRows[index].category = value;
                                                        updateRowCount(newRows, index);
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
                                                        updateRowCount(newRows, index);
                                                        setRows(newRows);
                                                    }}
                                                    disabled={loading}
                                                    allowClear
                                                >
                                                    {difficultyOptions.map(option => (
                                                        <Option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={spans.count}>
                                            <Form.Item label={`Số câu ${(() => {
                                                const availableCount = getMatchingQuestionCount(row);
                                                return availableCount > 0 ? `(Tối đa ${availableCount})` : '(0)';
                                            })()}`} required style={{ marginBottom: 0 }}>
                                                <InputNumber
                                                    placeholder="Nhập số câu"
                                                    size="small"
                                                    min={1}
                                                    max={getMatchingQuestionCount(row) || 1}
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
                                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                                        <Select
                                            placeholder="Chọn khối lớp"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.grade}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].grade = value;
                                                updateRowCount(newRows, index);
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            {gradeOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Select
                                            placeholder="Chọn unit"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.unit}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].unit = value;
                                                updateRowCount(newRows, index);
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            {unitOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Select
                                            placeholder="Chọn kỹ năng"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.skill}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].skill = value;
                                                updateRowCount(newRows, index);
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            {skillOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Select
                                            placeholder="Chọn loại câu hỏi *"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.questionType}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].questionType = value;
                                                updateRowCount(newRows, index);
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                            status={!row.questionType ? 'error' : ''}
                                        >
                                            {questionTypeOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Select
                                            placeholder="Chọn loại tuỳ chọn *"
                                            style={{ width: '100%' }}
                                            size="small"
                                            value={row.category}
                                            onChange={(value) => {
                                                const newRows = [...rows];
                                                newRows[index].category = value;
                                                updateRowCount(newRows, index);
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
                                                updateRowCount(newRows, index);
                                                setRows(newRows);
                                            }}
                                            disabled={loading}
                                        >
                                            {difficultyOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {(() => {
                                                const availableCount = getMatchingQuestionCount(row);
                                                return (
                                                    <InputNumber
                                                        placeholder="Nhập số câu *"
                                                        size="small"
                                                        min={1}
                                                        max={availableCount || 1}
                                                        value={row.count}
                                                        onChange={(value) => {
                                                            const newRows = [...rows];
                                                            newRows[index].count = value || 0;
                                                            setRows(newRows);
                                                        }}
                                                        style={{ flex: 1 }}
                                                        disabled={loading}
                                                        status={row.count <= 0 ? 'error' : ''}
                                                        addonAfter={availableCount > 0 ? `Tối đa ${availableCount}` : 'không có'}
                                                    />
                                                );
                                            })()}
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
                            block={isMobileOrTablet}
                            disabled={loading || rows.length >= 10}
                        >
                            Thêm dòng ({rows.length}/10)
                        </Button>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <Checkbox
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            disabled={loading}
                        >
                            Ngẫu nhiên thứ tự câu hỏi
                        </Checkbox>
                    </div>

                    <div style={{
                        marginTop: '12px',
                        padding: screens.xs ? '10px 12px' : '12px 16px',
                        background: '#f5f5f5',
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9'
                    }}>
                        <Row justify="space-between" align="middle">
                            <Col xs={24} md={16}>
                                <Space size={screens.xs ? 4 : 8} direction={screens.xs ? 'vertical' : 'horizontal'}>
                                    <Text strong>Tổng số câu hỏi:</Text>
                                    <Tag color="blue">
                                        {rows.reduce((sum, row) => sum + (row.count || 0), 0)}
                                    </Tag>
                                    <Text type="secondary">câu</Text>
                                </Space>
                            </Col>
                            <Col xs={24} md={8} style={{ textAlign: screens.xs ? 'left' : 'right', marginTop: screens.xs ? 4 : 0 }}>
                                <Text type="secondary">
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