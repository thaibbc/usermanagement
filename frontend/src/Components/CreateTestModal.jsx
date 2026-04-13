// Components/CreateTestModal.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Modal, Input, Select, Button, Table, Form, Row, Col, Space, Grid, message, Spin, Tag, Checkbox } from 'antd';
import { PlusOutlined, RightOutlined, LeftOutlined, CloseOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchQuestions, deleteQuestion } from '../api/questions';
import CreateQuestionModal from './CreateQuestionModal';
import QuestionPreviewModal from './QuestionPreviewModal';

const { Option } = Select;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

export const CreateTestModal = ({ open, onClose, onSubmit, folderId }) => {
    const [form] = Form.useForm();
    const [testName, setTestName] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [selectedAvailableKeys, setSelectedAvailableKeys] = useState([]);
    const [selectedSelectedKeys, setSelectedSelectedKeys] = useState([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [viewQuestionModalOpen, setViewQuestionModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchId, setSearchId] = useState('');
    const screens = useBreakpoint();

    const [filters, setFilters] = useState({
        grade: '',
        unit: '',
        skill: '',
        questionType: '',
        requirement: '',
        level: ''
    });

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
        if (open && folderId !== currentFolderIdRef.current) {
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
    }, [folderId, open]);

    // Cập nhật điểm khi số lượng câu hỏi thay đổi
    useEffect(() => {
        if (selectedQuestions.length > 0) {
            setSelectedQuestions(prev => updatePointsForQuestions(prev));
        }
    }, [selectedQuestions.length]);

    // Map tên loại câu hỏi để hiển thị đẹp hơn
    const typeLabelMap = {
        'multiple': 'Multiple Choice',
        'truefalse': 'True/False',
        'cloze': 'Cloze',
        'order': 'order'
    };

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

    const loadQuestions = useCallback(async (searchParams = {}) => {
        setIsLoadingQuestions(true);
        try {
            const params = {
                page: 1,
                limit: 100,
                ...searchParams
            };

            // Map UI filters to API params
            if (filters.grade) params.khoiLop = filters.grade;
            if (filters.unit) params.unit = filters.unit;
            if (filters.skill) params.kyNang = filters.skill;
            if (filters.questionType) params.loaiCauHoi = filters.questionType;
            if (filters.level) params.mucDoNhanThuc = filters.level;

            // Add search keyword if provided
            if (searchKeyword) params.search = searchKeyword;

            console.log('Loading questions with params:', params);
            const response = await fetchQuestions(params);
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
            console.log(`Loaded ${normalizedQuestions.length} questions`);

            // Lọc bỏ những câu đã được chọn
            const selectedIds = new Set(selectedQuestions.map(q => q.id));
            const availableOnly = normalizedQuestions.filter(q => !selectedIds.has(q.id));

            setAvailableQuestions(availableOnly);

        } catch (err) {
            console.error('Failed to fetch questions', err);
            message.error('Không thể tải danh sách câu hỏi');
        } finally {
            setIsLoadingQuestions(false);
        }
    }, [filters, searchKeyword]);

    useEffect(() => {
        if (open) {
            loadQuestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);



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
            setQuestionModalOpen(false);
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
            setQuestionModalOpen(false);
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

            setViewQuestionModalOpen(false);
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
                    setViewQuestionModalOpen(false);
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
        // Merge originalData with current UI state like stt
        const displayData = {
            ...question.originalData,
            stt: question.stt
        };
        setCurrentQuestion({ ...displayData, fromSelected });
        setViewQuestionModalOpen(true);
    };

    // Hàm chỉnh sửa câu hỏi
    const handleEditQuestion = (question) => {
        setEditingQuestion(question.originalData);
        setViewQuestionModalOpen(false);
        setQuestionModalOpen(true);
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

    // Hàm tìm kiếm - gọi lại loadQuestions với search params
    const handleSearch = () => {
        loadQuestions();
    };

    // Tính toán danh sách câu hỏi sau khi lọc (để dùng cho checkbox chọn tất cả)
    const filteredAvailableQuestions = useMemo(() =>
        getFilteredQuestions(availableQuestions),
        [availableQuestions, filters, searchKeyword, searchId]);

    // Columns for the question list table (left side)
    const availableColumns = [
        {
            title: (
                <Checkbox
                    checked={filteredAvailableQuestions.length > 0 && selectedAvailableKeys.length === filteredAvailableQuestions.length}
                    indeterminate={selectedAvailableKeys.length > 0 && selectedAvailableKeys.length < filteredAvailableQuestions.length}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedAvailableKeys(filteredAvailableQuestions.map(q => q.id));
                        } else {
                            setSelectedAvailableKeys([]);
                        }
                    }}
                />
            ),
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
            width: 50,
            render: (stt, record, index) => stt || index + 1
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            width: screens.xs ? 150 : 280,
            ellipsis: true,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, textAlign: 'left', height: 'auto', maxWidth: '100%' }}
                    onClick={() => handleViewQuestion(record, false)}
                    title={text || 'Không có tiêu đề'}
                >
                    <div style={{
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
                <span style={{ color: '#333' }}>{typeLabelMap[type] || type || 'Đề thi'}</span>
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
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => handleViewQuestion(record, false)} title="Xem chi tiết" />
                </Space>
            )
        }
    ];

    // Columns for selected questions table (right side)
    const selectedColumns = [
        {
            title: (
                <Checkbox
                    checked={selectedQuestions.length > 0 && selectedSelectedKeys.length === selectedQuestions.length}
                    indeterminate={selectedSelectedKeys.length > 0 && selectedSelectedKeys.length < selectedQuestions.length}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedSelectedKeys(selectedQuestions.map(q => q.id));
                        } else {
                            setSelectedSelectedKeys([]);
                        }
                    }}
                />
            ),
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
            width: 50,
            render: (stt, record, index) => stt || index + 1
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            width: screens.xs ? 150 : 280,
            ellipsis: true,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, textAlign: 'left', height: 'auto', maxWidth: '100%' }}
                    onClick={() => handleViewQuestion(record, true)}
                    title={text || 'Không có tiêu đề'}
                >
                    <div style={{
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
                <span style={{ color: '#333' }}>{typeLabelMap[type] || type || 'Đề thi'}</span>
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
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => handleViewQuestion(record, true)} title="Xem chi tiết" />
                </Space>
            )
        }
    ];



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
                open={open}
                onCancel={handleClose}
                width={getModalWidth()}
                mask={{ closable: !submitLoading }}
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
                                        <Option value="Lớp 1">Lớp 1</Option>
                                        <Option value="Lớp 2">Lớp 2</Option>
                                        <Option value="Lớp 3">Lớp 3</Option>
                                        <Option value="Lớp 4">Lớp 4</Option>
                                        <Option value="Lớp 5">Lớp 5</Option>
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
                                        <Option value="truefalse">True/False</Option>
                                        <Option value="cloze">Cloze</Option>
                                        <Option value="order">order</Option>
                                        <Option value="multiple">Multiple Choice</Option>
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
                                            setQuestionModalOpen(true);
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
                                        pagination={{ pageSize: 15, size: 'small' }}
                                        scroll={{ x: 800, y: 400 }}
                                        locale={{ emptyText: 'Không có câu hỏi' }}
                                        size="small"
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
                                        pagination={{ pageSize: 15, size: 'small' }}
                                        scroll={{ x: 800, y: 400 }}
                                        locale={{ emptyText: 'Chưa chọn câu hỏi' }}
                                        size="small"
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



            {/* Modal tạo/cập nhật câu hỏi */}
            <CreateQuestionModal
                open={questionModalOpen}
                onClose={() => {
                    setQuestionModalOpen(false);
                    setEditingQuestion(null);
                }}
                onSubmit={editingQuestion ? handleQuestionUpdated : handleQuestionCreated}
                initialValues={editingQuestion}
            />
            {/* Modal xem chi tiết câu hỏi */}
            <QuestionPreviewModal
                question={viewQuestionModalOpen ? currentQuestion : null}
                onClose={() => {
                    setViewQuestionModalOpen(false);
                    setCurrentQuestion(null);
                }}
            />
        </>
    );
};