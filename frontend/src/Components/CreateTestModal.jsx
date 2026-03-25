// Components/CreateTestModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Input, Select, Button, Table, Form, Row, Col, Space, Grid, message, Spin, Tag, Typography, Checkbox } from 'antd';
import { PlusOutlined, RightOutlined, LeftOutlined, CloseOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchQuestions, deleteQuestion } from '../api/questions';
import CreateQuestionModal from './CreateQuestionModal';

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

export const CreateTestModal = ({ visible, onClose, onSubmit, folderId }) => {
    const [form] = Form.useForm();
    const [testName, setTestName] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [selectedAvailableKeys, setSelectedAvailableKeys] = useState([]);
    const [selectedSelectedKeys, setSelectedSelectedKeys] = useState([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [viewQuestionModalVisible, setViewQuestionModalVisible] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchId, setSearchId] = useState('');
    const screens = useBreakpoint();

    // Ref để lưu folderId hiện tại
    const currentFolderIdRef = useRef(null);

    // Hàm tính điểm cho mỗi câu hỏi dựa trên tổng số câu
    const calculatePointsPerQuestion = (totalQuestions) => {
        if (totalQuestions === 0) return 0;
        // Tổng điểm luôn là 10
        const points = 10 / totalQuestions;
        // Làm tròn đến 1 chữ số thập phân
        return Math.round(points * 10) / 10;
    };

    // Hàm tính tổng điểm
    const calculateTotalPoints = (questions) => {
        const total = questions.length;
        if (total === 0) return 0;
        return 10;
    };

    // Hàm cập nhật điểm cho danh sách câu hỏi
    const updatePointsForQuestions = (questions) => {
        const pointsPerQuestion = calculatePointsPerQuestion(questions.length);
        return questions.map(q => ({
            ...q,
            points: pointsPerQuestion
        }));
    };

    // Reset state khi folderId thay đổi
    useEffect(() => {
        if (visible && folderId !== currentFolderIdRef.current) {
            console.log('Folder changed, resetting questions:', {
                oldFolder: currentFolderIdRef.current,
                newFolder: folderId
            });

            // Reset tất cả state liên quan đến câu hỏi
            setSelectedQuestions([]);
            setSelectedAvailableKeys([]);
            setSelectedSelectedKeys([]);
            setTestName('');
            setTimeLimit('');
            setSearchKeyword('');
            setSearchId('');

            // Cập nhật ref
            currentFolderIdRef.current = folderId;
        }
    }, [folderId, visible]);

    // Cập nhật điểm khi số lượng câu hỏi thay đổi
    useEffect(() => {
        if (selectedQuestions.length > 0) {
            setSelectedQuestions(prev => updatePointsForQuestions(prev));
        }
    }, [selectedQuestions.length]);

    // Hàm chuẩn hóa dữ liệu câu hỏi từ API
    const normalizeQuestionData = (questions) => {
        if (!questions || !Array.isArray(questions)) return [];

        return questions.map((q, index) => ({
            id: q._id || q.id || Math.random().toString(),
            stt: index + 1,
            question: q.cauHoi || q.question || q.title || 'Không có tiêu đề',
            type: q.loaiCauHoi || q.type || 'Đề thi',
            category: q.yeuCauDeBai || q.category || q.dangCauHoi || 'Tất cả',
            level: q.mucDoNhanThuc || q.level || 'Easy',
            points: 0, // Sẽ được cập nhật sau khi có số lượng câu hỏi
            khoiLop: q.khoiLop || '',
            unit: q.unit || '',
            kyNang: q.kyNang || '',
            answer: q.answer || '',
            originalData: q
        }));
    };

    const loadQuestions = useCallback(async () => {
        setIsLoadingQuestions(true);
        try {
            const response = await fetchQuestions({ page: 1, limit: 200 });
            console.log('Raw questions response:', response);

            let rawQuestions = [];
            if (response?.questions && Array.isArray(response.questions)) {
                rawQuestions = response.questions;
            } else if (response?.data && Array.isArray(response.data)) {
                rawQuestions = response.data;
            } else if (Array.isArray(response)) {
                rawQuestions = response;
            }

            const normalizedQuestions = normalizeQuestionData(rawQuestions);
            console.log('Normalized questions:', normalizedQuestions);

            setAvailableQuestions(normalizedQuestions);

        } catch (err) {
            console.error('Failed to fetch questions', err);
            message.error('Không thể tải danh sách câu hỏi');
        } finally {
            setIsLoadingQuestions(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            loadQuestions();
        }
    }, [visible, loadQuestions]);

    const [filters, setFilters] = useState({
        grade: '',
        unit: '',
        skill: '',
        questionType: '',
        requirement: '',
        level: ''
    });

    const handleSubmit = async () => {
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

        setSubmitLoading(true);
        try {
            console.log('--- BẮT ĐẦU TẠO BÀI TẬP TỪ ĐỀ ---');
            console.log('Tiêu đề:', testName);
            console.log('Thời gian:', timeNum);
            console.log('Các câu hỏi đã chọn:', selectedQuestions);
            console.log('Thư mục ID:', folderId);

            await onSubmit({
                testName,
                timeLimit: timeNum,
                selectedQuestions,
                folderId
            });

            // Reset form
            setTestName('');
            setTimeLimit('');
            setSelectedQuestions([]);
            setSelectedAvailableKeys([]);
            setSelectedSelectedKeys([]);
            setSearchKeyword('');
            setSearchId('');
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            message.error('Có lỗi xảy ra khi tạo đề');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleClose = () => {
        if (submitLoading) return;

        // Reset tất cả state khi đóng modal
        setTestName('');
        setTimeLimit('');
        setSelectedQuestions([]);
        setSelectedAvailableKeys([]);
        setSelectedSelectedKeys([]);
        setFilters({
            grade: '',
            unit: '',
            skill: '',
            questionType: '',
            requirement: '',
            level: ''
        });
        setSearchKeyword('');
        setSearchId('');

        // Reset ref
        currentFolderIdRef.current = null;

        onClose();
    };

    const moveToSelected = () => {
        if (selectedAvailableKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một câu hỏi để thêm');
            return;
        }

        const toMove = availableQuestions.filter(q => selectedAvailableKeys.includes(q.id));
        const remaining = availableQuestions.filter(q => !selectedAvailableKeys.includes(q.id));

        setSelectedQuestions(prev => {
            const existingIds = new Set(prev.map(q => q.id));
            const merged = [...prev];
            toMove.forEach(q => {
                if (!existingIds.has(q.id)) {
                    merged.push({ ...q, points: 0 });
                }
            });
            // Cập nhật STT và điểm
            const updated = merged.map((q, idx) => ({ ...q, stt: idx + 1 }));
            return updatePointsForQuestions(updated);
        });

        setAvailableQuestions(remaining);
        setSelectedAvailableKeys([]);
    };

    const moveToAvailable = () => {
        if (selectedSelectedKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một câu hỏi để loại bỏ');
            return;
        }

        const toReturn = selectedQuestions.filter(q => selectedSelectedKeys.includes(q.id));
        const remaining = selectedQuestions.filter(q => !selectedSelectedKeys.includes(q.id));

        setAvailableQuestions(prev => [...prev, ...toReturn.map(({ points, ...rest }) => rest)]);
        setSelectedQuestions(prev => {
            const updated = prev.filter(q => !selectedSelectedKeys.includes(q.id));
            const withStt = updated.map((q, idx) => ({ ...q, stt: idx + 1 }));
            return updatePointsForQuestions(withStt);
        });
        setSelectedSelectedKeys([]);
    };

    // Hàm xử lý khi tạo câu hỏi mới thành công
    const handleQuestionCreated = async (newQuestion) => {
        try {
            message.success('Câu hỏi mới đã được tạo thành công!');
            setQuestionModalVisible(false);
            setEditingQuestion(null);

            await loadQuestions();
            console.log('Question created and list refreshed:', newQuestion);
        } catch (err) {
            console.error('Failed to refresh questions', err);
            message.error('Không thể cập nhật danh sách câu hỏi');
        }
    };

    // Hàm xử lý khi cập nhật câu hỏi thành công
    const handleQuestionUpdated = async (updatedQuestion) => {
        try {
            message.success('Cập nhật câu hỏi thành công!');
            setQuestionModalVisible(false);
            setEditingQuestion(null);

            await loadQuestions();

            if (currentQuestion?.fromSelected) {
                setSelectedQuestions(prev =>
                    prev.map(q => q.id === updatedQuestion._id ? {
                        ...q,
                        ...normalizeQuestionData([updatedQuestion])[0]
                    } : q)
                );
            }

            setViewQuestionModalVisible(false);
            setCurrentQuestion(null);
        } catch (err) {
            console.error('Failed to update question', err);
            message.error('Không thể cập nhật câu hỏi');
        }
    };

    // Hàm xử lý xóa câu hỏi
    const handleDeleteQuestion = (question, fromSelected = false) => {
        confirm({
            title: 'Xác nhận xóa câu hỏi',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
                    <p><strong>Nội dung:</strong> {question.question}</p>
                    <p style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '8px' }}>
                        Lưu ý: Hành động này không thể hoàn tác.
                    </p>
                </div>
            ),
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteQuestion(question.id);

                    setAvailableQuestions(prev => prev.filter(q => q.id !== question.id));

                    if (fromSelected) {
                        setSelectedQuestions(prev => {
                            const updated = prev.filter(q => q.id !== question.id);
                            const withStt = updated.map((q, idx) => ({ ...q, stt: idx + 1 }));
                            return updatePointsForQuestions(withStt);
                        });
                        setSelectedSelectedKeys(prev => prev.filter(key => key !== question.id));
                    }

                    message.success('Xóa câu hỏi thành công!');
                    setViewQuestionModalVisible(false);
                    setCurrentQuestion(null);
                } catch (error) {
                    console.error('Delete question error:', error);
                    message.error('Không thể xóa câu hỏi');
                }
            },
        });
    };

    // Hàm xem chi tiết câu hỏi
    const handleViewQuestion = (question, fromSelected = false) => {
        setCurrentQuestion({ ...question, fromSelected });
        setViewQuestionModalVisible(true);
    };

    // Hàm chỉnh sửa câu hỏi
    const handleEditQuestion = (question) => {
        setEditingQuestion(question.originalData);
        setViewQuestionModalVisible(false);
        setQuestionModalVisible(true);
    };

    // Tính tổng số câu và tổng điểm
    const totalQuestions = selectedQuestions.length;
    const totalPoints = 10; // Luôn là 10 điểm
    const pointsPerQuestion = calculatePointsPerQuestion(totalQuestions);

    // Responsive width
    const getModalWidth = () => {
        if (!screens.md) return '95%';
        if (!screens.lg) return '90%';
        return 1400;
    };

    // Lọc câu hỏi theo filters và search
    const getFilteredQuestions = (questions) => {
        return questions.filter(q => {
            if (filters.grade && q.khoiLop !== filters.grade) return false;
            if (filters.unit && q.unit !== filters.unit) return false;
            if (filters.skill && q.kyNang !== filters.skill) return false;
            if (filters.questionType && q.type !== filters.questionType) return false;
            if (filters.level && q.level !== filters.level) return false;

            if (searchKeyword && !q.question.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
            if (searchId && !q.id.toLowerCase().includes(searchId.toLowerCase())) return false;

            return true;
        });
    };

    const handleSearch = () => {
        setFilters({ ...filters });
    };

    // Columns for the question list table (left side)
    const availableColumns = [
        {
            title: '',
            key: 'checkbox',
            width: 50,
            render: (_, record) => (
                <Checkbox
                    checked={selectedAvailableKeys.includes(record.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedAvailableKeys([...selectedAvailableKeys, record.id]);
                        } else {
                            setSelectedAvailableKeys(selectedAvailableKeys.filter(key => key !== record.id));
                        }
                    }}
                />
            )
        },
        {
            title: 'STT',
            dataIndex: 'stt',
            width: 60,
            render: (stt) => stt || 'N/A'
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            flex: 1,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, textAlign: 'left', height: 'auto' }}
                    onClick={() => handleViewQuestion(record, false)}
                >
                    <div style={{
                        maxWidth: screens.xs ? '150px' : '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#1890ff'
                    }}>
                        {text || 'Không có tiêu đề'}
                    </div>
                </Button>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: screens.xs ? 80 : 120,
            render: (type) => (
                <span style={{ color: '#333' }}>{type || 'Đề thi'}</span>
            )
        },
        {
            title: 'Mức độ',
            dataIndex: 'level',
            width: screens.xs ? 70 : 150,
            render: (level) => {
                const colors = {
                    'Easy': 'green',
                    'Medium': 'orange',
                    'Hard': 'red',
                    'Dễ': 'green',
                    'Trung bình': 'orange',
                    'Khó': 'red',
                    'Nhận biết': 'green',
                    'Thông hiểu': 'orange',
                    'Vận dụng': 'red',
                    'Vận dụng cao': 'purple'
                };
                const levelText = level || 'Easy';
                return <Tag color={colors[levelText] || 'blue'}>{levelText}</Tag>;
            }
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            width: 80,
            align: 'center',
            render: () => <Tag color="processing">{pointsPerQuestion}</Tag>
        },
        {
            title: 'Thao tác',
            width: screens.xs ? 100 : 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewQuestion(record, false)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditQuestion(record)}
                        title="Chỉnh sửa"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDeleteQuestion(record, false)}
                        title="Xóa"
                    />
                </Space>
            )
        }
    ];

    // Columns for selected questions table (right side)
    const selectedColumns = [
        {
            title: '',
            key: 'checkbox',
            width: 50,
            render: (_, record) => (
                <Checkbox
                    checked={selectedSelectedKeys.includes(record.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedSelectedKeys([...selectedSelectedKeys, record.id]);
                        } else {
                            setSelectedSelectedKeys(selectedSelectedKeys.filter(key => key !== record.id));
                        }
                    }}
                />
            )
        },
        {
            title: 'STT',
            dataIndex: 'stt',
            width: 60,
            render: (stt) => stt || 'N/A'
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            flex: 1,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, textAlign: 'left', height: 'auto' }}
                    onClick={() => handleViewQuestion(record, true)}
                >
                    <div style={{
                        maxWidth: screens.xs ? '150px' : '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#1890ff'
                    }}>
                        {text || 'Không có tiêu đề'}
                    </div>
                </Button>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: screens.xs ? 80 : 120,
            render: (type) => (
                <span style={{ color: '#333' }}>{type || 'Đề thi'}</span>
            )
        },
        {
            title: 'Mức độ',
            dataIndex: 'level',
            width: screens.xs ? 70 : 150,
            render: (level) => {
                const colors = {
                    'Easy': 'green',
                    'Medium': 'orange',
                    'Hard': 'red',
                    'Dễ': 'green',
                    'Trung bình': 'orange',
                    'Khó': 'red',
                    'Nhận biết': 'green',
                    'Thông hiểu': 'orange',
                    'Vận dụng': 'red',
                    'Vận dụng cao': 'purple'
                };
                const levelText = level || 'Easy';
                return <Tag color={colors[levelText] || 'blue'}>{levelText}</Tag>;
            }
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            width: 80,
            align: 'center',
            render: (_, record) => <Tag color="processing">{record.points || pointsPerQuestion}</Tag>
        },
        {
            title: 'Thao tác',
            width: screens.xs ? 100 : 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewQuestion(record, true)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditQuestion(record)}
                        title="Chỉnh sửa"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDeleteQuestion(record, true)}
                        title="Xóa"
                    />
                </Space>
            )
        }
    ];

    // Lọc dữ liệu cho bảng bên trái
    const filteredAvailableQuestions = getFilteredQuestions(availableQuestions);

    return (
        <>
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
                        <span>TẠO ĐỀ KIỂM TRA</span>
                        {submitLoading && <span style={{ fontSize: '14px', color: '#00BCD4' }}>Đang xử lý...</span>}
                    </div>
                }
                open={visible}
                onCancel={handleClose}
                width={getModalWidth()}
                maskClosable={!submitLoading}
                closable={!submitLoading}
                footer={[
                    <Button
                        key="close"
                        onClick={handleClose}
                        size={screens.xs ? 'middle' : 'large'}
                        disabled={submitLoading}
                    >
                        Đóng
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleSubmit}
                        size={screens.xs ? 'middle' : 'large'}
                        style={{ background: '#00BCD4' }}
                        loading={submitLoading}
                        disabled={submitLoading}
                    >
                        {submitLoading ? 'Đang lưu...' : 'Lưu'}
                    </Button>,
                ]}
                styles={{
                    body: {
                        padding: screens.xs ? '12px' : '20px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }
                }}
            >
                <Spin spinning={submitLoading} description="Đang xử lý...">
                    <Form form={form} layout="vertical" size={screens.xs ? 'middle' : 'large'}>
                        {/* Header Form với 2 cột */}
                        <Row gutter={[24, 16]}>
                            {/* Cột trái - Tiêu đề và Thời gian */}
                            <Col xs={24} md={12}>
                                {/* Tiêu đề */}
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
                                        disabled={submitLoading}
                                    />
                                </Form.Item>

                                {/* Thời gian */}
                                <Form.Item
                                    label={
                                        <span style={{ fontSize: screens.xs ? '13px' : '14px', fontWeight: 500 }}>
                                            <span style={{ color: '#ff4d4f' }}>* </span>
                                            Thời gian:
                                        </span>
                                    }
                                    required
                                >
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input
                                            placeholder="Nhập thời gian"
                                            value={timeLimit}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || /^\d+$/.test(value)) {
                                                    setTimeLimit(value);
                                                }
                                            }}
                                            style={{ width: 'calc(100% - 70px)' }}
                                            disabled={submitLoading}
                                        />
                                        <Button disabled={submitLoading}>phút</Button>
                                    </Space.Compact>
                                </Form.Item>
                            </Col>

                            {/* Cột phải - Cấu trúc đề */}
                            <Col xs={24} md={12}>
                                <div style={{
                                    background: '#f9f9f9',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid #f0f0f0'
                                }}>
                                    <div style={{
                                        fontSize: screens.xs ? '13px' : '14px',
                                        fontWeight: 600,
                                        marginBottom: '12px',
                                        color: '#00BCD4',
                                        textAlign: 'center'
                                    }}>
                                        CẤU TRÚC ĐỀ
                                    </div>

                                    {/* Bảng cấu trúc đề */}
                                    <div style={{
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        background: '#fff'
                                    }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: '#f0f0f0' }}>
                                                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #d9d9d9', fontWeight: 600 }}>Mục/Phần</th>
                                                    <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #d9d9d9', fontWeight: 600 }}>Số câu</th>
                                                    <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #d9d9d9', fontWeight: 600 }}>Điểm</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ background: '#fafafa', fontWeight: 'bold' }}>
                                                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                                        Tổng cộng
                                                    </td>
                                                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#00BCD4' }}>
                                                        {totalQuestions}
                                                    </td>
                                                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#00BCD4' }}>
                                                        {totalPoints}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 12px' }}>
                                                        Mỗi câu hỏi
                                                    </td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                        1
                                                    </td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                        {pointsPerQuestion} điểm
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    {totalQuestions > 0 && (
                                        <div style={{ marginTop: 8, fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                            * Điểm được chia đều: {totalPoints} điểm / {totalQuestions} câu = {pointsPerQuestion} điểm/câu
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* Question List Section */}
                        <div style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: '8px',
                            padding: screens.xs ? '12px' : '16px',
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
                                        disabled={submitLoading || isLoadingQuestions}
                                    >
                                        <Option value="Lớp 6">Lớp 6</Option>
                                        <Option value="Lớp 7">Lớp 7</Option>
                                        <Option value="Lớp 8">Lớp 8</Option>
                                        <Option value="Lớp 9">Lớp 9</Option>
                                        <Option value="Lớp 10">Lớp 10</Option>
                                        <Option value="Lớp 11">Lớp 11</Option>
                                        <Option value="Lớp 12">Lớp 12</Option>
                                    </Select>
                                </Col>
                                <Col xs={12} sm={8} md={8} lg={4}>
                                    <Select
                                        placeholder="Unit"
                                        style={{ width: '100%' }}
                                        onChange={(value) => setFilters({ ...filters, unit: value })}
                                        allowClear
                                        size={screens.xs ? 'middle' : 'default'}
                                        disabled={submitLoading || isLoadingQuestions}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                            <Option key={num} value={`Unit ${num}`}>Unit {num}</Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col xs={12} sm={8} md={8} lg={4}>
                                    <Select
                                        placeholder="Kỹ năng"
                                        style={{ width: '100%' }}
                                        onChange={(value) => setFilters({ ...filters, skill: value })}
                                        allowClear
                                        size={screens.xs ? 'middle' : 'default'}
                                        disabled={submitLoading || isLoadingQuestions}
                                    >
                                        <Option value="Reading">Reading - Đọc</Option>
                                        <Option value="Writing">Writing - Viết</Option>
                                        <Option value="Listening">Listening - Nghe</Option>
                                        <Option value="Speaking">Speaking - Nói</Option>
                                        <Option value="Pronunciation">Pronunciation - Phát âm</Option>
                                    </Select>
                                </Col>
                                <Col xs={12} sm={8} md={8} lg={4}>
                                    <Select
                                        placeholder="Dạng câu hỏi"
                                        style={{ width: '100%' }}
                                        onChange={(value) => setFilters({ ...filters, questionType: value })}
                                        allowClear
                                        size={screens.xs ? 'middle' : 'default'}
                                        disabled={submitLoading || isLoadingQuestions}
                                    >
                                        <Option value="multiple">Multiple Choice (Trắc nghiệm)</Option>
                                        <Option value="cloze">Fill in the Blank (Điền vào chỗ trống)</Option>
                                        <Option value="truefalse">True / False / Not Given</Option>
                                        <Option value="matching">Matching (Nối)</Option>
                                        <Option value="transformation">Sentence Transformation (Viết lại câu)</Option>
                                        <Option value="reading">Reading Comprehension (Đọc hiểu)</Option>
                                        <Option value="essay">Writing / Speaking (Tự luận)</Option>
                                    </Select>
                                </Col>
                                <Col xs={12} sm={8} md={8} lg={4}>
                                    <Select
                                        placeholder="Mức độ"
                                        style={{ width: '100%' }}
                                        onChange={(value) => setFilters({ ...filters, level: value })}
                                        allowClear
                                        size={screens.xs ? 'middle' : 'default'}
                                        disabled={submitLoading || isLoadingQuestions}
                                    >
                                        <Option value="Nhận biết">Nhận biết</Option>
                                        <Option value="Thông hiểu">Thông hiểu</Option>
                                        <Option value="Vận dụng">Vận dụng</Option>
                                        <Option value="Vận dụng cao">Vận dụng cao</Option>
                                    </Select>
                                </Col>
                                <Col xs={12} sm={8} md={8} lg={4}>
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            setEditingQuestion(null);
                                            setQuestionModalVisible(true);
                                        }}
                                        block
                                        disabled={submitLoading || isLoadingQuestions}
                                        style={{ background: '#00BCD4', color: 'white' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                </Col>
                            </Row>

                            {/* Search Row */}
                            <Row gutter={[8, 8]} style={{ marginBottom: '16px' }} align="bottom">
                                <Col xs={24} sm={24} md={8}>
                                    <Form.Item label="Câu hỏi" style={{ marginBottom: 0 }}>
                                        <Input
                                            placeholder="Nhập nội dung câu hỏi"
                                            size={screens.xs ? 'middle' : 'default'}
                                            disabled={submitLoading || isLoadingQuestions}
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            onPressEnter={handleSearch}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={8}>
                                    <Form.Item label="ID (Mã câu hỏi)" style={{ marginBottom: 0 }}>
                                        <Input
                                            placeholder="Nhập mã câu hỏi"
                                            size={screens.xs ? 'middle' : 'default'}
                                            disabled={submitLoading || isLoadingQuestions}
                                            value={searchId}
                                            onChange={(e) => setSearchId(e.target.value)}
                                            onPressEnter={handleSearch}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={8}>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        style={{ background: '#00BCD4' }}
                                        block={screens.xs}
                                        disabled={submitLoading || isLoadingQuestions}
                                        onClick={handleSearch}
                                    >
                                        Tìm kiếm
                                    </Button>
                                </Col>
                            </Row>

                            {/* Two Panel Tables */}
                            <Row gutter={[16, 16]}>
                                {/* Left Table - Available Questions */}
                                <Col xs={24} md={11}>
                                    <Table
                                        columns={availableColumns}
                                        dataSource={filteredAvailableQuestions}
                                        loading={isLoadingQuestions}
                                        pagination={false}
                                        scroll={{ x: 'max-content', y: screens.xs ? 200 : 300 }}
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
                                            disabled={submitLoading || isLoadingQuestions || selectedAvailableKeys.length === 0}
                                            style={{ background: '#00BCD4', color: 'white' }}
                                        >
                                            Thêm
                                        </Button>
                                        <Button
                                            icon={<LeftOutlined />}
                                            onClick={moveToAvailable}
                                            block
                                            disabled={submitLoading || isLoadingQuestions || selectedSelectedKeys.length === 0}
                                        >
                                            Loại bỏ
                                        </Button>
                                    </Col>
                                )}

                                {/* Right Table - Selected Questions */}
                                <Col xs={24} md={11}>
                                    <Table
                                        columns={selectedColumns}
                                        dataSource={selectedQuestions}
                                        pagination={false}
                                        scroll={{ x: 'max-content', y: screens.xs ? 200 : 300 }}
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
                                            disabled={submitLoading || isLoadingQuestions || selectedAvailableKeys.length === 0}
                                            style={{ background: '#00BCD4', color: 'white' }}
                                        >
                                            Thêm
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            icon={<LeftOutlined />}
                                            onClick={moveToAvailable}
                                            block
                                            disabled={submitLoading || isLoadingQuestions || selectedSelectedKeys.length === 0}
                                        >
                                            Loại bỏ
                                        </Button>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    </Form>
                </Spin>
            </Modal>

            {/* Modal xem chi tiết câu hỏi */}
            <Modal
                title={
                    <div style={{
                        fontSize: screens.xs ? '14px' : '16px',
                        fontWeight: 600,
                        color: '#00BCD4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <EyeOutlined />
                        <span>CHI TIẾT CÂU HỎI</span>
                    </div>
                }
                open={viewQuestionModalVisible}
                onCancel={() => {
                    setViewQuestionModalVisible(false);
                    setCurrentQuestion(null);
                }}
                width={screens.xs ? '95%' : 800}
                footer={[
                    <Button key="close" onClick={() => {
                        setViewQuestionModalVisible(false);
                        setCurrentQuestion(null);
                    }}>
                        Đóng
                    </Button>,
                    currentQuestion && (
                        <Button
                            key="edit"
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditQuestion(currentQuestion)}
                            style={{ background: '#00BCD4' }}
                        >
                            Chỉnh sửa
                        </Button>
                    )
                ]}
            >
                {currentQuestion && (
                    <div style={{ padding: '8px 0' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                                    <Text strong style={{ color: '#00BCD4', display: 'block', marginBottom: '8px' }}>
                                        Nội dung câu hỏi:
                                    </Text>
                                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {currentQuestion.question}
                                    </Paragraph>
                                </div>
                            </Col>

                            <Col xs={24} sm={12}>
                                <div style={{ background: '#fafafa', padding: '10px', borderRadius: '6px' }}>
                                    <Text type="secondary">Khối lớp:</Text>
                                    <div><Tag color="blue">{currentQuestion.khoiLop || 'Chưa có'}</Tag></div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12}>
                                <div style={{ background: '#fafafa', padding: '10px', borderRadius: '6px' }}>
                                    <Text type="secondary">Unit:</Text>
                                    <div><Tag color="cyan">{currentQuestion.unit || 'Chưa có'}</Tag></div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12}>
                                <div style={{ background: '#fafafa', padding: '10px', borderRadius: '6px' }}>
                                    <Text type="secondary">Kỹ năng:</Text>
                                    <div><Tag color="green">{currentQuestion.kyNang || 'Chưa có'}</Tag></div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12}>
                                <div style={{ background: '#fafafa', padding: '10px', borderRadius: '6px' }}>
                                    <Text type="secondary">Loại câu hỏi:</Text>
                                    <div><Tag color="purple">{currentQuestion.type || 'Chưa có'}</Tag></div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12}>
                                <div style={{ background: '#fafafa', padding: '10px', borderRadius: '6px' }}>
                                    <Text type="secondary">Mức độ nhận thức:</Text>
                                    <div>
                                        <Tag color={
                                            currentQuestion.level === 'Nhận biết' ? 'green' :
                                                currentQuestion.level === 'Thông hiểu' ? 'orange' :
                                                    currentQuestion.level === 'Vận dụng' ? 'red' :
                                                        currentQuestion.level === 'Vận dụng cao' ? 'purple' : 'blue'
                                        }>
                                            {currentQuestion.level || 'Chưa có'}
                                        </Tag>
                                    </div>
                                </div>
                            </Col>

                            <Col span={24}>
                                <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                                    <Text strong style={{ color: '#00BCD4', display: 'block', marginBottom: '8px' }}>
                                        Đáp án:
                                    </Text>
                                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {currentQuestion.answer || 'Chưa có đáp án'}
                                    </Paragraph>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>

            {/* Modal tạo/cập nhật câu hỏi */}
            <CreateQuestionModal
                visible={questionModalVisible}
                onClose={() => {
                    setQuestionModalVisible(false);
                    setEditingQuestion(null);
                }}
                onSubmit={editingQuestion ? handleQuestionUpdated : handleQuestionCreated}
                initialValues={editingQuestion}
            />
        </>
    );
};