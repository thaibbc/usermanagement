// components/CreateQuestionModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
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
    Spin,
    Tag,
    Radio,
    InputNumber,
    Divider,
    Card
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    CloseOutlined,
    AudioOutlined,
    PictureOutlined,
    LoadingOutlined,
    EditOutlined,
    FileTextOutlined,
    CheckSquareOutlined,
    FormOutlined,
    AlignLeftOutlined,
    LinkOutlined,
    BookOutlined
} from '@ant-design/icons';
import { createQuestion, updateQuestion } from '../api/questions';
import { fetchFolders } from '../api/library/folders';

const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const CreateQuestionModal = ({ open, onClose, onSubmit, initialValues = null }) => {
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectedQuestionType, setSelectedQuestionType] = useState('');
    const [questions, setQuestions] = useState([]);
    const [folders, setFolders] = useState([]);
    const [classOptions, setClassOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);

    const isEditMode = !!initialValues;

    // Load folders khi component mount
    useEffect(() => {
        const loadFolders = async () => {
            try {
                const folderData = await fetchFolders();
                setFolders(folderData);
                // Lọc folders cha (parentId = null) làm options cho KHỐI LỚP
                const parentFolders = folderData.filter(f => !f.parentId);
                setClassOptions(parentFolders.map(f => ({ label: f.title, value: f._id })));
            } catch (error) {
                console.error('Failed to load folders:', error);
            }
        };

        if (open) {
            loadFolders();
        }
    }, [open]);

    // Update unit options khi chọn class
    useEffect(() => {
        if (selectedClassId) {
            const childFolders = folders.filter(f => f.parentId === selectedClassId);
            setUnitOptions(childFolders.map(f => ({ label: f.title, value: f._id })));
        } else {
            setUnitOptions([]);
        }
    }, [selectedClassId, folders]);

    // Định nghĩa các dạng câu hỏi
    const questionTypes = {
        multiple: {
            name: 'Multiple Choice (Trắc nghiệm)',
            icon: <CheckSquareOutlined />,
            hasOptions: true,
            hasSubQuestions: true,
            description: 'Chọn đáp án đúng từ A, B, C, D'
        },
        cloze: {
            name: 'Fill in the Blank (Điền vào chỗ trống)',
            icon: <FormOutlined />,
            hasOptions: false,
            hasSubQuestions: true,
            description: 'Điền từ/cụm từ vào chỗ trống'
        },
        truefalse: {
            name: 'True / False / Not Given',
            icon: <CheckSquareOutlined />,
            hasOptions: true,
            hasSubQuestions: true,
            description: 'Xác định câu đúng/sai/không có thông tin'
        },
        order: {
            name: 'Order (Sắp xếp câu)',
            icon: <LinkOutlined />,
            hasOptions: false,
            hasSubQuestions: true,
            description: 'Sắp xếp các từ để hoàn thành câu'
        },
        transformation: {
            name: 'Sentence Transformation (Viết lại câu)',
            icon: <EditOutlined />,
            hasOptions: false,
            hasSubQuestions: true,
            description: 'Viết lại câu theo yêu cầu'
        },
        reading: {
            name: 'Reading Comprehension (Đọc hiểu)',
            icon: <BookOutlined />,
            hasOptions: true,
            hasSubQuestions: true,
            description: 'Đọc đoạn văn và trả lời câu hỏi'
        },
        essay: {
            name: 'Writing / Speaking (Tự luận)',
            icon: <AlignLeftOutlined />,
            hasOptions: false,
            hasSubQuestions: false,
            description: 'Viết đoạn văn hoặc bài luận'
        }
    };

    // Reset questions khi đổi loại câu hỏi
    useEffect(() => {
        if (selectedQuestionType && selectedQuestionType !== 'essay') {
            const newQuestion = createEmptyQuestion(selectedQuestionType);
            setQuestions([newQuestion]);
        } else if (selectedQuestionType === 'essay') {
            setQuestions([]);
        }
    }, [selectedQuestionType]);

    // Tạo câu hỏi rỗng theo loại
    const createEmptyQuestion = (type) => {
        const baseId = Date.now();
        switch (type) {
            case 'multiple':
                return {
                    id: baseId,
                    questionContent: '',
                    answerType: 'Chọn đáp án đúng nhất',
                    answers: [
                        { id: 'A', label: 'A', content: '', isCorrect: false },
                        { id: 'B', label: 'B', content: '', isCorrect: false },
                        { id: 'C', label: 'C', content: '', isCorrect: false },
                        { id: 'D', label: 'D', content: '', isCorrect: false }
                    ]
                };
            case 'cloze':
                return {
                    id: baseId,
                    questionContent: '',
                    correctAnswer: '',
                    blankCount: 1,
                    hint: ''
                };
            case 'truefalse':
                return {
                    id: baseId,
                    questionContent: '',
                    correctAnswer: '',
                    options: ['True', 'False', 'Not Given'],
                    explanation: ''
                };
            case 'matching':
                return {
                    id: baseId,
                    questionContent: '',
                    matches: [
                        { id: 'A', left: '', right: '' },
                        { id: 'B', left: '', right: '' },
                        { id: 'C', left: '', right: '' }
                    ]
                };
            case 'transformation':
                return {
                    id: baseId,
                    questionContent: '',
                    sampleAnswer: '',
                    keyWords: []
                };
            case 'reading':
                return {
                    id: baseId,
                    questionContent: '',
                    correctAnswer: '',
                    options: ['A', 'B', 'C', 'D'],
                    explanation: ''
                };
            case 'order':
                return {
                    id: baseId,
                    questionContent: 'Sắp xếp các từ để hoàn thành câu',
                    correctAnswer: '',
                };
            default:
                return null;
        }
    };

    // Parse dữ liệu câu hỏi từ API
    const parseQuestionData = (data) => {
        if (!data) return null;

        const parsedQuestions = [];

        if (data.loaiCauHoi === 'multiple' && data.cauHoi) {
            const cauHoiArray = data.cauHoi.split('\n').filter(q => q.trim());
            const dapAnArray = data.answer ? data.answer.split(' ; ') : [];

            cauHoiArray.forEach((cauHoi, index) => {
                const dapAn = dapAnArray[index] || '';
                const correctAnswers = dapAn.split(', ').filter(d => d.trim());

                parsedQuestions.push({
                    id: Date.now() + index,
                    questionContent: cauHoi,
                    answerType: 'Chọn đáp án đúng nhất',
                    answers: [
                        { id: 'A', label: 'A', content: data.dapAnA || '', isCorrect: correctAnswers.includes('A') },
                        { id: 'B', label: 'B', content: data.dapAnB || '', isCorrect: correctAnswers.includes('B') },
                        { id: 'C', label: 'C', content: data.dapAnC || '', isCorrect: correctAnswers.includes('C') },
                        { id: 'D', label: 'D', content: data.dapAnD || '', isCorrect: correctAnswers.includes('D') }
                    ]
                });
            });
        }
        else if (data.loaiCauHoi === 'cloze' && data.cauHoi) {
            const cauHoiArray = data.cauHoi.split('\n').filter(q => q.trim());
            const dapAnArray = data.answer ? data.answer.split(' ; ') : [];

            cauHoiArray.forEach((cauHoi, index) => {
                parsedQuestions.push({
                    id: Date.now() + index,
                    questionContent: cauHoi,
                    answerType: 'Điền vào chỗ trống',
                    correctAnswer: dapAnArray[index] || '',
                    blankCount: (cauHoi.match(/_{3,}/g) || []).length || 1,
                    hint: ''
                });
            });
        }
        else if (data.loaiCauHoi === 'truefalse' && data.cauHoi) {
            const cauHoiArray = data.cauHoi.split('\n').filter(q => q.trim());
            const dapAnArray = data.answer ? data.answer.split(' ; ') : [];

            cauHoiArray.forEach((cauHoi, index) => {
                const correctAnswer = dapAnArray[index] || '';
                parsedQuestions.push({
                    id: Date.now() + index,
                    questionContent: cauHoi,
                    answerType: 'True/False/Not Given',
                    correctAnswer: correctAnswer,
                    options: ['True', 'False', 'Not Given'],
                    explanation: data.giaiThich || ''
                });
            });
        }
        else if (data.loaiCauHoi === 'matching' && data.cauHoi) {
            const cauHoiArray = data.cauHoi.split('\n').filter(q => q.trim());
            const dapAnArray = data.answer ? data.answer.split(' ; ') : [];

            cauHoiArray.forEach((cauHoi, index) => {
                const matches = dapAnArray[index] ? dapAnArray[index].split(', ') : [];
                parsedQuestions.push({
                    id: Date.now() + index,
                    questionContent: cauHoi,
                    answerType: 'Nối',
                    matches: matches.map((match, idx) => ({
                        id: String.fromCharCode(65 + idx),
                        left: match.split(' - ')[0] || '',
                        right: match.split(' - ')[1] || ''
                    }))
                });
            });
        }
        else if (data.loaiCauHoi === 'transformation' && data.cauHoi) {
            const cauHoiArray = data.cauHoi.split('\n').filter(q => q.trim());
            const dapAnArray = data.answer ? data.answer.split(' ; ') : [];

            cauHoiArray.forEach((cauHoi, index) => {
                parsedQuestions.push({
                    id: Date.now() + index,
                    questionContent: cauHoi,
                    answerType: 'Viết lại câu',
                    sampleAnswer: dapAnArray[index] || '',
                    keyWords: data.keyWords ? data.keyWords.split(', ') : []
                });
            });
        }
        else if (data.loaiCauHoi === 'reading' && data.cauHoi) {
            const cauHoiArray = data.cauHoi.split('\n').filter(q => q.trim());
            const dapAnArray = data.answer ? data.answer.split(' ; ') : [];

            cauHoiArray.forEach((cauHoi, index) => {
                parsedQuestions.push({
                    id: Date.now() + index,
                    questionContent: cauHoi,
                    answerType: 'Đọc hiểu',
                    correctAnswer: dapAnArray[index] || '',
                    options: ['A', 'B', 'C', 'D'],
                    explanation: ''
                });
            });
        }
        else if (data.loaiCauHoi === 'essay') {
            parsedQuestions.push({
                id: 1,
                questionContent: data.cauHoi || '',
                answerType: 'Tự luận',
                maxWords: data.maxWords || 300,
                minWords: data.minWords || 100,
                rubric: data.rubric || ''
            });
        }

        return {
            khoiLop: data.khoiLop || '',
            unit: data.unit || '',
            kyNang: typeof data.kyNang === 'string' ? data.kyNang.split(',').map(s => s.trim()).filter(Boolean) : (data.kyNang || []),
            dangCauHoi: data.loaiCauHoi || '',
            yeuCauDeBai: data.yeuCauDeBai || '',
            mucDoNhanThuc: data.mucDoNhanThuc || '',
            linkAudio: data.linkAudio || '',
            linkHinhAnh: data.linkHinhAnh || '',
            noiDungBaiDoc: data.noiDungBaiDoc || '',
            questions: parsedQuestions.length > 0 ? parsedQuestions : []
        };
    };

    // Set form values khi có initialValues
    useEffect(() => {
        if (open && initialValues) {
            const parsedData = parseQuestionData(initialValues);

            form.setFieldsValue({
                stt: initialValues.stt || 1,
                khoiLop: parsedData.khoiLop,
                unit: parsedData.unit,
                kyNang: parsedData.kyNang,
                dangCauHoi: parsedData.dangCauHoi,
                yeuCauDeBai: parsedData.yeuCauDeBai,
                mucDoNhanThuc: parsedData.mucDoNhanThuc,
                linkAudio: parsedData.linkAudio,
                linkHinhAnh: parsedData.linkHinhAnh,
                noiDungBaiDoc: parsedData.noiDungBaiDoc,
            });

            setSelectedQuestionType(parsedData.dangCauHoi);
            setQuestions(parsedData.questions);
        }
    }, [open, initialValues, form]);

    // Reset form khi đóng modal
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setSelectedQuestionType('');
            setQuestions([]);
        }
    }, [open, form]);

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            let isValid = true;

            if (selectedQuestionType === 'essay') {
                if (!values.cauHoiTuLuan) {
                    message.error('Vui lòng nhập nội dung câu hỏi tự luận');
                    isValid = false;
                }
            } else {
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const questionContent = values[`noiDungCauHoi_${q.id}`] || q.questionContent;

                    if (!questionContent) {
                        message.error(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`);
                        isValid = false;
                        break;
                    }

                    if (selectedQuestionType === 'multiple') {
                        let hasCorrectAnswer = false;
                        for (let j = 0; j < q.answers.length; j++) {
                            const a = q.answers[j];
                            const answerContent = values[`dapAn_${q.id}_${a.id}`];
                            const isCorrect = values[`dapAn_${q.id}_${a.id}_dung`];

                            if (!answerContent) {
                                message.error(`Câu hỏi ${i + 1}: Vui lòng nhập đáp án ${a.label}`);
                                isValid = false;
                                break;
                            }

                            if (isCorrect) {
                                hasCorrectAnswer = true;
                            }
                        }
                        if (!hasCorrectAnswer) {
                            message.error(`Câu hỏi ${i + 1}: Vui lòng chọn ít nhất 1 đáp án đúng`);
                            isValid = false;
                            break;
                        }
                    }
                    else if (selectedQuestionType === 'cloze') {
                        const correctAnswer = values[`dapAnDung_${q.id}`];
                        if (!correctAnswer) {
                            message.error(`Câu hỏi ${i + 1}: Vui lòng nhập đáp án đúng`);
                            isValid = false;
                            break;
                        }
                    }
                    else if (selectedQuestionType === 'truefalse') {
                        const correctAnswer = values[`dapAnDung_${q.id}`];
                        if (!correctAnswer) {
                            message.error(`Câu hỏi ${i + 1}: Vui lòng chọn đáp án đúng`);
                            isValid = false;
                            break;
                        }
                    }
                    else if (selectedQuestionType === 'matching') {
                        for (let j = 0; j < q.matches.length; j++) {
                            const match = q.matches[j];
                            const leftValue = values[`matchLeft_${q.id}_${match.id}`];
                            const rightValue = values[`matchRight_${q.id}_${match.id}`];
                            if (!leftValue || !rightValue) {
                                message.error(`Câu hỏi ${i + 1}: Vui lòng nhập đầy đủ nội dung ghép nối`);
                                isValid = false;
                                break;
                            }
                        }
                    }
                    else if (selectedQuestionType === 'transformation') {
                        const sampleAnswer = values[`dapAnMau_${q.id}`];
                        if (!sampleAnswer) {
                            message.error(`Câu hỏi ${i + 1}: Vui lòng nhập đáp án mẫu`);
                            isValid = false;
                            break;
                        }
                    }
                    else if (selectedQuestionType === 'reading') {
                        const correctAnswer = values[`dapAnDung_${q.id}`];
                        if (!correctAnswer) {
                            message.error(`Câu hỏi ${i + 1}: Vui lòng chọn đáp án đúng`);
                            isValid = false;
                            break;
                        }
                    }
                }
            }

            if (!isValid) {
                setSubmitLoading(false);
                return;
            }

            let payload = {
                folderId: selectedUnitId || selectedClassId, // Lưu vào folder unit nếu có, nếu không thì folder class
                khoiLop: classOptions.find(opt => opt.value === selectedClassId)?.label || '',
                unit: unitOptions.find(opt => opt.value === selectedUnitId)?.label || '',
                kyNang: Array.isArray(values.kyNang) ? values.kyNang.join(', ') : values.kyNang,
                loaiCauHoi: selectedQuestionType,
                mucDoNhanThuc: values.mucDoNhanThuc,
                yeuCauDeBai: values.yeuCauDeBai || '',
                linkAudio: values.linkAudio || '',
                linkHinhAnh: values.linkHinhAnh || '',
                noiDungBaiDoc: values.noiDungBaiDoc || ''
            };

            if (selectedQuestionType === 'essay') {
                payload.cauHoi = values.cauHoiTuLuan;
                payload.minWords = values.minWords;
                payload.maxWords = values.maxWords;
                payload.rubric = values.rubric;
                payload.answer = '';
            }
            else {
                const cauHoiArray = [];
                const dapAnArray = [];

                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const questionContent = values[`noiDungCauHoi_${q.id}`] || q.questionContent;
                    cauHoiArray.push(questionContent);

                    if (selectedQuestionType === 'multiple') {
                        const correctAnswers = q.answers
                            .filter(a => values[`dapAn_${q.id}_${a.id}_dung`])
                            .map(a => a.id);

                        dapAnArray.push(correctAnswers.join(', '));

                        payload.dapAnA = values[`dapAn_${q.id}_A`];
                        payload.dapAnB = values[`dapAn_${q.id}_B`];
                        payload.dapAnC = values[`dapAn_${q.id}_C`];
                        payload.dapAnD = values[`dapAn_${q.id}_D`];
                    }
                    else if (selectedQuestionType === 'cloze' || selectedQuestionType === 'order') {
                        dapAnArray.push(values[`dapAnDung_${q.id}`]);
                    }
                    else if (selectedQuestionType === 'truefalse') {
                        dapAnArray.push(values[`dapAnDung_${q.id}`]);
                        if (values[`giaiThich_${q.id}`]) {
                            payload.giaiThich = values[`giaiThich_${q.id}`];
                        }
                    }
                    else if (selectedQuestionType === 'matching') {
                        const matches = q.matches.map(m => {
                            const leftValue = values[`matchLeft_${q.id}_${m.id}`];
                            const rightValue = values[`matchRight_${q.id}_${m.id}`];
                            return `${leftValue} - ${rightValue}`;
                        });
                        dapAnArray.push(matches.join(', '));
                    }
                    else if (selectedQuestionType === 'transformation') {
                        dapAnArray.push(values[`dapAnMau_${q.id}`]);
                        if (values[`tuKhoa_${q.id}`]) {
                            payload.keyWords = values[`tuKhoa_${q.id}`];
                        }
                    }
                    else if (selectedQuestionType === 'reading') {
                        dapAnArray.push(values[`dapAnDung_${q.id}`]);
                        if (values[`giaiThich_${q.id}`]) {
                            payload[`giaiThich_${q.id}`] = values[`giaiThich_${q.id}`];
                        }
                    }
                }

                payload.cauHoi = cauHoiArray.join('\n');
                payload.answer = dapAnArray.join(' ; ');
            }

            console.log('Payload gửi lên API:', payload);

            let response;
            if (isEditMode && initialValues?._id) {
                response = await updateQuestion(initialValues._id, payload);
                message.success('Cập nhật câu hỏi thành công!');
                console.log('Cập nhật câu hỏi thành công:', response);
            } else {
                response = await createQuestion(payload);
                message.success('Tạo câu hỏi thành công!');
                console.log('Tạo câu hỏi thành công:', response);
            }

            if (onSubmit) {
                await onSubmit(response);
            }

            handleClose();
        } catch (error) {
            console.error('Submit error:', error);
            message.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleClose = () => {
        if (submitLoading) return;
        form.resetFields();
        setQuestions([]);
        setSelectedQuestionType('');
        setSelectedClassId(null);
        setSelectedUnitId(null);
        if (onClose) onClose();
    };

    const handleAddQuestion = () => {
        if (questions.length >= 10) {
            message.warning('Chỉ có thể thêm tối đa 10 câu hỏi');
            return;
        }
        const newQuestion = createEmptyQuestion(selectedQuestionType);
        if (newQuestion) {
            newQuestion.id = Date.now();
            setQuestions([...questions, newQuestion]);
        }
    };

    const handleRemoveQuestion = (id) => {
        if (questions.length <= 1) {
            message.warning('Phải có ít nhất 1 câu hỏi');
            return;
        }
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Multiple Choice Form
    const renderMultipleChoiceForm = () => {
        const handleAddAnswer = (questionId) => {
            setQuestions(questions.map(q => {
                if (q.id === questionId) {
                    if (q.answers.length >= 6) {
                        message.warning('Chỉ có thể thêm tối đa 6 đáp án');
                        return q;
                    }
                    const nextLabel = String.fromCharCode(65 + q.answers.length);
                    return {
                        ...q,
                        answers: [...q.answers, { id: nextLabel, label: nextLabel, content: '', isCorrect: false }]
                    };
                }
                return q;
            }));
        };

        const handleRemoveAnswer = (questionId, answerId) => {
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

        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Nội dung câu hỏi"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                        >
                            <TextArea rows={3} disabled={submitLoading} />
                        </Form.Item>

                        <div style={{ marginTop: 16 }}>
                            <Text strong>Đáp án</Text>
                            {question.answers.map(answer => (
                                <Row key={answer.id} gutter={8} style={{ marginTop: 12 }} align="middle">
                                    <Col span={2}>
                                        <Text strong style={{ color: '#00bcd4' }}>{answer.label}.</Text>
                                    </Col>
                                    <Col span={18}>
                                        <Form.Item
                                            name={`dapAn_${question.id}_${answer.id}`}
                                            initialValue={answer.content}
                                            style={{ marginBottom: 0 }}
                                            rules={[{ required: true, message: 'Vui lòng nhập đáp án' }]}
                                        >
                                            <Input disabled={submitLoading} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Form.Item
                                            name={`dapAn_${question.id}_${answer.id}_dung`}
                                            valuePropName="checked"
                                            initialValue={answer.isCorrect}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Checkbox disabled={submitLoading}>Đúng</Checkbox>
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        {question.answers.length > 2 && (
                                            <Button
                                                type="text"
                                                icon={<CloseOutlined />}
                                                onClick={() => handleRemoveAnswer(question.id, answer.id)}
                                                disabled={submitLoading}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            ))}
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => handleAddAnswer(question.id)}
                                style={{ marginTop: 12, width: '100%' }}
                                disabled={submitLoading}
                            >
                                Thêm đáp án
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    // Cloze Form
    const renderClozeForm = () => {
        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Nội dung câu hỏi (sử dụng ___ để tạo chỗ trống)"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                            extra="Ví dụ: She ___ to school every day. (go/goes)"
                        >
                            <TextArea rows={3} disabled={submitLoading} />
                        </Form.Item>

                        <Form.Item
                            label="Đáp án đúng"
                            name={`dapAnDung_${question.id}`}
                            initialValue={question.correctAnswer}
                            rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng' }]}
                        >
                            <Input disabled={submitLoading} />
                        </Form.Item>

                        <Form.Item
                            label="Gợi ý (tùy chọn)"
                            name={`goiY_${question.id}`}
                            initialValue={question.hint}
                        >
                            <TextArea rows={2} disabled={submitLoading} placeholder="Gợi ý giúp học sinh trả lời..." />
                        </Form.Item>
                    </Card>
                ))}
            </div>
        );
    };

    // Order Form
    const renderOrderForm = () => {
        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Yêu cầu (mặc định: Sắp xếp các từ để hoàn thành câu)"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập yêu cầu' }]}
                        >
                            <Input disabled={submitLoading} />
                        </Form.Item>

                        <Form.Item
                            label="Câu trả lời đúng (nguyên câu hoàn chỉnh)"
                            name={`dapAnDung_${question.id}`}
                            initialValue={question.correctAnswer}
                            rules={[{ required: true, message: 'Vui lòng nhập câu hoàn chỉnh' }]}
                            extra="Hệ thống sẽ tự động tách câu này thành các từ để học sinh sắp xếp"
                        >
                            <TextArea rows={3} disabled={submitLoading} placeholder="Ví dụ: She goes to school every day." />
                        </Form.Item>
                    </Card>
                ))}
            </div>
        );
    };

    // True/False Form
    const renderTrueFalseForm = () => {
        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Nội dung câu hỏi"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                        >
                            <TextArea rows={2} disabled={submitLoading} placeholder="Ví dụ: The Earth is flat." />
                        </Form.Item>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 12 }}>Đáp án đúng</Text>
                            <Form.Item
                                name={`dapAnDung_${question.id}`}
                                initialValue={question.correctAnswer}
                                rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Radio.Group
                                    disabled={submitLoading}
                                    buttonStyle="solid"
                                    size={screens.xs ? 'middle' : 'large'}
                                    style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                                >
                                    <Radio.Button
                                        value="True"
                                        style={{
                                            minWidth: 100,
                                            textAlign: 'center',
                                            height: 40,
                                            lineHeight: '38px',
                                            borderRadius: 6
                                        }}
                                    >
                                        True
                                    </Radio.Button>
                                    <Radio.Button
                                        value="False"
                                        style={{
                                            minWidth: 100,
                                            textAlign: 'center',
                                            height: 40,
                                            lineHeight: '38px',
                                            borderRadius: 6
                                        }}
                                    >
                                        False
                                    </Radio.Button>

                                </Radio.Group>
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Giải thích (tùy chọn)"
                            name={`giaiThich_${question.id}`}
                            initialValue={question.explanation}
                            extra="Giải thích giúp học sinh hiểu rõ hơn về câu trả lời đúng"
                        >
                            <TextArea rows={2} disabled={submitLoading} placeholder="Ví dụ: Vì Trái Đất có dạng hình cầu, không phải phẳng..." />
                        </Form.Item>
                    </Card>
                ))}
            </div>
        );
    };

    // Matching Form
    const renderMatchingForm = () => {
        const handleAddMatch = (questionId) => {
            setQuestions(questions.map(q => {
                if (q.id === questionId) {
                    if (q.matches.length >= 6) {
                        message.warning('Chỉ có thể thêm tối đa 6 cặp ghép');
                        return q;
                    }
                    const nextId = String.fromCharCode(65 + q.matches.length);
                    return {
                        ...q,
                        matches: [...q.matches, { id: nextId, left: '', right: '' }]
                    };
                }
                return q;
            }));
        };

        const handleRemoveMatch = (questionId, matchId) => {
            setQuestions(questions.map(q => {
                if (q.id === questionId) {
                    if (q.matches.length <= 2) {
                        message.warning('Phải có ít nhất 2 cặp ghép');
                        return q;
                    }
                    return {
                        ...q,
                        matches: q.matches.filter(m => m.id !== matchId)
                    };
                }
                return q;
            }));
        };

        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Hướng dẫn / Yêu cầu"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập yêu cầu' }]}
                        >
                            <TextArea rows={2} disabled={submitLoading} placeholder="Ví dụ: Match the words with their meanings." />
                        </Form.Item>

                        {/* <div style={{ marginTop: 16 }}>
                            <Text strong>Danh sách ghép nối</Text>
                            <div style={{ marginTop: 12 }}>
                                {question.matches.map(match => (
                                    <Row key={match.id} gutter={8} style={{ marginBottom: 12 }} align="middle">
                                        <Col span={2}>
                                            <Text strong style={{ color: '#00bcd4' }}>{match.id}.</Text>
                                        </Col>
                                        <Col span={10}>
                                            <Form.Item
                                                name={`matchLeft_${question.id}_${match.id}`}
                                                initialValue={match.left}
                                                style={{ marginBottom: 0 }}
                                                rules={[{ required: true, message: 'Vui lòng nhập nội dung cột A' }]}
                                            >
                                                <Input placeholder="Cột A" disabled={submitLoading} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={1} style={{ textAlign: 'center' }}>
                                            <LinkOutlined />
                                        </Col>
                                        <Col span={9}>
                                            <Form.Item
                                                name={`matchRight_${question.id}_${match.id}`}
                                                initialValue={match.right}
                                                style={{ marginBottom: 0 }}
                                                rules={[{ required: true, message: 'Vui lòng nhập nội dung cột B' }]}
                                            >
                                                <Input placeholder="Cột B" disabled={submitLoading} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            {question.matches.length > 2 && (
                                                <Button
                                                    type="text"
                                                    icon={<CloseOutlined />}
                                                    onClick={() => handleRemoveMatch(question.id, match.id)}
                                                    disabled={submitLoading}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                ))}
                            </div>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => handleAddMatch(question.id)}
                                style={{ marginTop: 12, width: '100%' }}
                                disabled={submitLoading}
                            >
                                Thêm cặp ghép
                            </Button>
                        </div> */}
                    </Card>
                ))}
            </div>
        );
    };

    // Transformation Form
    const renderTransformationForm = () => {
        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Câu gốc"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập câu gốc' }]}
                        >
                            <TextArea rows={2} disabled={submitLoading} placeholder="Ví dụ: She started learning English 5 years ago." />
                        </Form.Item>

                        <Form.Item
                            label="Đáp án mẫu"
                            name={`dapAnMau_${question.id}`}
                            initialValue={question.sampleAnswer}
                            rules={[{ required: true, message: 'Vui lòng nhập đáp án mẫu' }]}
                        >
                            <TextArea rows={2} disabled={submitLoading} placeholder="Ví dụ: She has learned English for 5 years." />
                        </Form.Item>

                        <Form.Item
                            label="Từ khóa (cách nhau bằng dấu phẩy)"
                            name={`tuKhoa_${question.id}`}
                            initialValue={question.keyWords ? question.keyWords.join(', ') : ''}
                            extra="Ví dụ: although, however, despite"
                        >
                            <Input disabled={submitLoading} />
                        </Form.Item>
                    </Card>
                ))}
            </div>
        );
    };

    // Reading Form
    const renderReadingForm = () => {
        return (
            <div>
                {questions.map((question, idx) => (
                    <Card
                        key={question.id}
                        style={{ marginBottom: 16, borderRadius: 8 }}
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <Space>
                                    <Tag color="#00bcd4">Câu hỏi {idx + 1}</Tag>
                                    {questions.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveQuestion(question.id)}
                                            size="small"
                                        />
                                    )}
                                </Space>
                                {idx === questions.length - 1 && (
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="small"
                                        disabled={submitLoading}
                                        style={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                                    >
                                        Thêm câu hỏi
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        <Form.Item
                            label="Nội dung câu hỏi"
                            name={`noiDungCauHoi_${question.id}`}
                            initialValue={question.questionContent}
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                        >
                            <TextArea rows={3} disabled={submitLoading} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Đáp án đúng"
                                    name={`dapAnDung_${question.id}`}
                                    initialValue={question.correctAnswer}
                                    rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng' }]}
                                >
                                    <Select disabled={submitLoading}>
                                        <Option value="A">A</Option>
                                        <Option value="B">B</Option>
                                        <Option value="C">C</Option>
                                        <Option value="D">D</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Giải thích (tùy chọn)"
                                    name={`giaiThich_${question.id}`}
                                    initialValue={question.explanation}
                                >
                                    <TextArea rows={2} disabled={submitLoading} placeholder="Giải thích tại sao đáp án này đúng..." />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </div>
        );
    };

    // Essay Form
    const renderEssayForm = () => {
        return (
            <div>
                <Form.Item
                    label="Nội dung câu hỏi tự luận"
                    name="cauHoiTuLuan"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                >
                    <TextArea rows={5} disabled={submitLoading} placeholder="Nhập đề bài tự luận..." />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Số từ tối thiểu"
                            name="minWords"
                            initialValue={100}
                        >
                            <InputNumber min={50} max={500} style={{ width: '100%' }} disabled={submitLoading} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Số từ tối đa"
                            name="maxWords"
                            initialValue={300}
                        >
                            <InputNumber min={100} max={1000} style={{ width: '100%' }} disabled={submitLoading} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Tiêu chí chấm điểm (rubric)"
                    name="rubric"
                    extra="Hướng dẫn chấm điểm cho giáo viên"
                >
                    <TextArea rows={4} disabled={submitLoading} placeholder="Ví dụ: Nội dung (40%), Ngữ pháp (30%), Từ vựng (20%), Bố cục (10%)" />
                </Form.Item>
            </div>
        );
    };

    const renderQuestionForm = () => {
        switch (selectedQuestionType) {
            case 'multiple':
                return renderMultipleChoiceForm();
            case 'cloze':
                return renderClozeForm();
            case 'truefalse':
                return renderTrueFalseForm();
            case 'order':
                return renderOrderForm();
            case 'matching':
                return renderMatchingForm();
            case 'transformation':
                return renderTransformationForm();
            case 'reading':
                return renderReadingForm();
            case 'essay':
                return renderEssayForm();
            default:
                return null;
        }
    };

    const getModalWidth = () => {
        if (!screens.md) return '95%';
        if (!screens.lg) return '90%';
        return 1200;
    };

    return (
        <Modal
            title={
                <div style={{
                    fontSize: screens.xs ? '14px' : '16px',
                    fontWeight: 600,
                    color: '#00bcd4',
                    padding: screens.xs ? '4px 0' : '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Space>
                        {isEditMode ? <EditOutlined /> : <FileTextOutlined />}
                        <span>{isEditMode ? 'CẬP NHẬT CÂU HỎI' : 'TẠO CÂU HỎI MỚI'}</span>
                        {isEditMode && initialValues?._id && (
                            <Tag color="processing" style={{ marginLeft: 8 }}>
                                ID: {initialValues._id.substring(0, 6)}...
                            </Tag>
                        )}
                    </Space>
                    {submitLoading && <LoadingOutlined style={{ color: '#00bcd4' }} />}
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
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    size={screens.xs ? 'middle' : 'large'}
                    style={{ backgroundColor: '#00bcd4' }}
                    loading={submitLoading}
                    disabled={submitLoading}
                >
                    {submitLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Lưu câu hỏi')}
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
            <Spin spinning={submitLoading} tip="Đang xử lý...">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onValuesChange={(changedValues) => {
                        if (changedValues.dangCauHoi) {
                            setSelectedQuestionType(changedValues.dangCauHoi);
                        }
                    }}
                >
                    <Row gutter={[24, 16]}>
                        <Col xs={24} md={8} lg={7}>
                            <Form.Item
                                label={<Text strong style={{ color: '#00bcd4' }}>STT</Text>}
                                name="stt"
                                initialValue={1}
                            >
                                <Select disabled={submitLoading}>
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
                                    onChange={(value) => {
                                        setSelectedClassId(value);
                                        setSelectedUnitId(null); // Reset unit khi đổi class
                                        form.setFieldsValue({ unit: undefined }); // Reset form field
                                    }}
                                >
                                    {classOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
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
                                    disabled={submitLoading || !selectedClassId}
                                    onChange={(value) => setSelectedUnitId(value)}
                                >
                                    {unitOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<Text strong style={{ color: '#00bcd4' }}>KỸ NĂNG</Text>}
                                name="kyNang"
                                rules={[{ required: true, message: 'Vui lòng chọn kỹ năng' }]}
                            >
                                <Select 
                                    mode="multiple" 
                                    placeholder="Chọn kỹ năng" 
                                    disabled={submitLoading}
                                    allowClear
                                >
                                    <Option value="Reading">Reading - Đọc</Option>
                                    <Option value="Writing">Writing - Viết</Option>
                                    <Option value="Listening">Listening - Nghe</Option>
                                    <Option value="Speaking">Speaking - Nói</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<Text strong style={{ color: '#00bcd4' }}>DẠNG CÂU HỎI</Text>}
                                name="dangCauHoi"
                                rules={[{ required: true, message: 'Vui lòng chọn dạng câu hỏi' }]}
                            >
                                <Select placeholder="Chọn dạng câu hỏi" disabled={submitLoading}>
                                    {Object.entries(questionTypes)
                                        .filter(([key]) => ['multiple', 'cloze', 'truefalse', 'order'].includes(key))
                                        .map(([key, type]) => (
                                            <Option key={key} value={key}>
                                                <Space>
                                                    {type.icon}
                                                    {type.name}
                                                </Space>
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>

                            {selectedQuestionType && questionTypes[selectedQuestionType] && (
                                <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: '#f0f9ff', borderRadius: 6 }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {questionTypes[selectedQuestionType].description}
                                    </Text>
                                </div>
                            )}

                            <Form.Item
                                label={<Text strong style={{ color: '#00bcd4' }}>YÊU CẦU ĐỀ BÀI</Text>}
                                name="yeuCauDeBai"
                            >
                                <Select placeholder="Chọn yêu cầu đề bài" allowClear disabled={submitLoading}>
                                    <Option value="read_passage">Read the following passage, choose TRUE/FALSE and choose the correct answers A-B-C-D.</Option>
                                    <Option value="choose_answer">Choose the correct answer A, B, C, or D.</Option>
                                    <Option value="fill_blank">Fill in the blank with the correct word.</Option>
                                    <Option value="match">Match the items in column A with column B.</Option>
                                    <Option value="rewrite">Rewrite the following sentences as directed.</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label={<Text strong style={{ color: '#00bcd4' }}>MỨC ĐỘ NHẬN THỨC</Text>}
                                name="mucDoNhanThuc"
                                rules={[{ required: true, message: 'Vui lòng chọn mức độ nhận thức' }]}
                            >
                                <Select placeholder="Chọn mức độ nhận thức" disabled={submitLoading}>
                                    <Option value="Nhận biết">Nhận biết</Option>
                                    <Option value="Thông hiểu">Thông hiểu</Option>
                                    <Option value="Vận dụng">Vận dụng</Option>
                                    <Option value="Vận dụng cao">Vận dụng cao</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={16} lg={17}>
                            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Link audio" name="linkAudio">
                                        <Input
                                            placeholder="https://example.com/audio.mp3"
                                            suffix={<Button type="text" icon={<AudioOutlined />} size="small" disabled={submitLoading}>Upload</Button>}
                                            disabled={submitLoading}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Link hình ảnh" name="linkHinhAnh">
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            suffix={<Button type="text" icon={<PictureOutlined />} size="small" disabled={submitLoading}>Upload</Button>}
                                            disabled={submitLoading}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Nội dung bài đọc (đoạn văn)"
                                name="noiDungBaiDoc"
                                extra={
                                    <Text style={{ fontSize: '11px', color: '#999' }}>
                                        Hỗ trợ định dạng: Ctrl+B (In đậm), Ctrl+I (Nghiêng), Ctrl+U (Gạch chân)
                                    </Text>
                                }
                            >
                                <TextArea
                                    rows={screens.xs ? 3 : 5}
                                    placeholder="Nhập nội dung bài đọc..."
                                    style={{ fontFamily: 'monospace', backgroundColor: '#fafafa' }}
                                    disabled={submitLoading}
                                />
                            </Form.Item>

                            <Divider />

                            {selectedQuestionType && renderQuestionForm()}
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
};

export default CreateQuestionModal;