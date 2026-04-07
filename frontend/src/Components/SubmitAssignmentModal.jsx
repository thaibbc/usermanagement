// Components/SubmitAssignmentModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Input, Radio, Space, Typography, Divider, message, Spin, Tag, Card, Alert, Progress, Select, Checkbox, Image } from 'antd';
import { submitAssignment } from '../api/classes';
import { EyeOutlined, CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined, LinkOutlined, SoundOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

// Helper hiển thị nội dung (text hoặc hình ảnh)
const RenderContent = ({ content, style = {} }) => {
    if (isUrl(content)) {
        return (
            <Image
                src={content}
                alt="Hình ảnh nội dung"
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: '4px', ...style }}
                fallback="https://via.placeholder.com/150?text=Link"
                preview={{ mask: 'Xem ảnh' }}
            />
        );
    }
    return <span>{content}</span>;
};

const SubmitAssignmentModal = ({
    visible,
    onCancel,
    assignment,
    currentUserId,
    onSubmitSuccess,
    isViewMode = false,
    existingSubmission = null
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible && assignment) {
            console.log('SubmitAssignmentModal - assignment:', assignment);

            // Nếu đang ở chế độ xem kết quả và có submission, hiển thị đáp án đã chọn
            if (isViewMode && existingSubmission?.answers) {
                setAnswers(existingSubmission.answers);
            }
            // Nếu là chế độ nộp bài và có câu hỏi, khởi tạo answers
            else if (assignment.questions && assignment.questions.length > 0) {
                const initialAnswers = assignment.questions.map(question => ({
                    questionId: question._id || question.id,
                    answer: '',
                    matchingAnswers: [] // Cho dạng matching
                }));
                setAnswers(initialAnswers);
            }

            // Reset current question index
            setCurrentQuestionIndex(0);
        }
    }, [visible, assignment, isViewMode, existingSubmission]);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => prev.map(a =>
            a.questionId === questionId ? { ...a, answer } : a
        ));
    };

    const handleMatchingAnswerChange = (questionId, matchId, value) => {
        setAnswers(prev => prev.map(a => {
            if (a.questionId === questionId) {
                const matchingAnswers = a.matchingAnswers || [];
                const existingIndex = matchingAnswers.findIndex(m => m.matchId === matchId);
                if (existingIndex >= 0) {
                    matchingAnswers[existingIndex].answer = value;
                } else {
                    matchingAnswers.push({ matchId, answer: value });
                }
                return { ...a, matchingAnswers };
            }
            return a;
        }));
    };

    const handleSubmit = async (values) => {
        if (!assignment || !currentUserId) return;

        setIsSubmitting(true);
        setLoading(true);
        try {
            const submitData = {
                userId: currentUserId,
                answers: answers,
                content: values.content || '',
                files: []
            };

            console.log('--- BẮT ĐẦU NỘP BÀI ---');
            console.log('Thông tin bài tập (assignment):', assignment);
            console.log('Dữ liệu submitData (gửi lên API):', submitData);

            await submitAssignment(assignment.classId || assignment.classroomId, assignment._id, submitData);
            message.success('Nộp bài thành công!');
            if (onSubmitSuccess) onSubmitSuccess();
            onCancel();
            form.resetFields();
        } catch (err) {
            console.error('Submit assignment error:', err);
            message.error(err?.message || 'Có lỗi xảy ra khi nộp bài');
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < getQuestionsList().length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const getQuestionsList = () => {
        let questionsList = [];
        if (assignment?.questions && Array.isArray(assignment.questions)) {
            questionsList = assignment.questions;
        }
        return questionsList;
    };

    const getCurrentAnswer = (questionId, matchId = null) => {
        const answer = answers.find(a => a.questionId === questionId);
        if (matchId && answer?.matchingAnswers) {
            const match = answer.matchingAnswers.find(m => m.matchId === matchId);
            return match?.answer || '';
        }
        return answer?.answer || '';
    };

    const isCurrentQuestionAnswered = () => {
        const currentQuestion = getQuestionsList()[currentQuestionIndex];
        if (!currentQuestion) return false;
        const questionId = currentQuestion._id || currentQuestion.id;

        if (currentQuestion.loaiCauHoi === 'matching') {
            // Kiểm tra matching: tất cả các cặp phải được trả lời
            const answer = answers.find(a => a.questionId === questionId);
            const matches = currentQuestion.matches || [];
            if (!answer?.matchingAnswers) return false;
            return matches.length > 0 && answer.matchingAnswers.length === matches.length;
        }

        const answer = getCurrentAnswer(questionId);
        return answer && answer.trim() !== '';
    };

    const getAnsweredCount = () => {
        const questionsList = getQuestionsList();
        let count = 0;
        questionsList.forEach(question => {
            const questionId = question._id || question.id;
            if (question.loaiCauHoi === 'matching') {
                const answer = answers.find(a => a.questionId === questionId);
                const matches = question.matches || [];
                if (answer?.matchingAnswers && answer.matchingAnswers.length === matches.length) {
                    count++;
                }
            } else {
                const answer = getCurrentAnswer(questionId);
                if (answer && answer.trim() !== '') count++;
            }
        });
        return count;
    };

    // Render đáp án theo dạng câu hỏi
    const renderAnswerInput = (question, questionId, currentAnswer, isReadOnly) => {
        const { loaiCauHoi, type } = question;
        const questionType = loaiCauHoi || type;

        switch (questionType) {
            case 'multiple':
                return (
                    <Radio.Group
                        onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                        value={currentAnswer}
                        disabled={isReadOnly}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            {[
                                { key: 'A', content: question.dapAnA || question.answerA },
                                { key: 'B', content: question.dapAnB || question.answerB },
                                { key: 'C', content: question.dapAnC || question.answerC },
                                { key: 'D', content: question.dapAnD || question.answerD }
                            ].map(opt => (opt.content !== undefined && opt.content !== null && opt.content !== '') && (
                                <Radio
                                    key={opt.key}
                                    value={opt.key}
                                    style={{
                                        marginBottom: 4,
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        backgroundColor: currentAnswer === opt.key ? '#e6f7ff' : 'transparent',
                                        border: currentAnswer === opt.key ? '1px solid #00BCD4' : '1px solid transparent'
                                    }}
                                >
                                    <Text strong style={{ marginRight: 6, fontSize: '13px' }}>{opt.key}.</Text>
                                    <RenderContent content={opt.content} style={{ maxHeight: 100 }} />
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                );

            case 'truefalse':
                return (
                    <Radio.Group
                        onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                        value={currentAnswer}
                        disabled={isReadOnly}
                        buttonStyle="solid"
                        style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                    >
                        <Radio.Button value="True" style={{ minWidth: 100, textAlign: 'center' }}>
                            True
                        </Radio.Button>
                        <Radio.Button value="False" style={{ minWidth: 100, textAlign: 'center' }}>
                            False
                        </Radio.Button>
                    </Radio.Group>
                );

            case 'cloze':
                return (
                    <div style={{ marginTop: 4 }}>
                        {isReadOnly && isUrl(currentAnswer) ? (
                            <RenderContent content={currentAnswer} style={{ maxHeight: 150 }} />
                        ) : (
                            <TextArea
                                placeholder="Nhập đáp án của bạn vào chỗ trống"
                                value={currentAnswer}
                                onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                                rows={3}
                                style={{ fontSize: '13px' }}
                                disabled={isReadOnly}
                            />
                        )}
                    </div>
                );

            case 'matching':
                const matches = question.matches || [];
                return (
                    <div style={{ marginTop: 8 }}>
                        {matches.map(match => (
                            <div key={match.id} style={{ marginBottom: 16, padding: 12, backgroundColor: '#fafafa', borderRadius: 6 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>{match.id}. </Text>
                                    <RenderContent content={match.left} style={{ maxHeight: 100 }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <LinkOutlined style={{ color: '#00BCD4' }} />
                                    <Select
                                        placeholder="Chọn đáp án ghép nối"
                                        value={getCurrentAnswer(questionId, match.id)}
                                        onChange={(value) => handleMatchingAnswerChange(questionId, match.id, value)}
                                        disabled={isReadOnly}
                                        style={{ flex: 1 }}
                                        allowClear
                                    >
                                        {matches.map(m => (
                                            <Option key={m.id} value={m.right}>{m.right}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'transformation':
                return (
                    <TextArea
                        placeholder="Viết lại câu theo yêu cầu"
                        value={currentAnswer}
                        onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                        rows={4}
                        style={{ marginTop: 4, fontSize: '13px' }}
                        disabled={isReadOnly}
                    />
                );

            case 'reading':
                return (
                    <Radio.Group
                        onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                        value={currentAnswer}
                        disabled={isReadOnly}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" size="middle">
                            <Radio value="A">A. <RenderContent content={question.dapAnA || question.answerA || 'Option A'} style={{ maxHeight: 100 }} /></Radio>
                            <Radio value="B">B. <RenderContent content={question.dapAnB || question.answerB || 'Option B'} style={{ maxHeight: 100 }} /></Radio>
                            <Radio value="C">C. <RenderContent content={question.dapAnC || question.answerC || 'Option C'} style={{ maxHeight: 100 }} /></Radio>
                            <Radio value="D">D. <RenderContent content={question.dapAnD || question.answerD || 'Option D'} style={{ maxHeight: 100 }} /></Radio>
                        </Space>
                    </Radio.Group>
                );

            case 'essay':
                return (
                    <TextArea
                        placeholder="Nhập bài làm của bạn..."
                        value={currentAnswer}
                        onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                        rows={6}
                        style={{ marginTop: 4, fontSize: '13px' }}
                        disabled={isReadOnly}
                        showCount
                        maxLength={question.maxWords ? question.maxWords * 10 : 1000}
                    />
                );

            default:
                return (
                    <TextArea
                        placeholder="Nhập đáp án của bạn"
                        value={currentAnswer}
                        onChange={(e) => !isReadOnly && handleAnswerChange(questionId, e.target.value)}
                        rows={3}
                        style={{ marginTop: 4, fontSize: '13px' }}
                        disabled={isReadOnly}
                    />
                );
        }
    };

    // Hiển thị đáp án đúng cho chế độ xem kết quả
    const renderCorrectAnswer = (question) => {
        const { loaiCauHoi, type, dapAnDung, answer, giaiThich } = question;
        const questionType = loaiCauHoi || type;

        const correctAnswerKey = dapAnDung || answer || '';
        let correctAnswerContent = correctAnswerKey;

        if (questionType === 'multiple' && correctAnswerKey) {
            const answerMap = {
                'A': question.dapAnA,
                'B': question.dapAnB,
                'C': question.dapAnC,
                'D': question.dapAnD
            };
            correctAnswerContent = answerMap[correctAnswerKey] || '';

            return (
                <div style={{
                    marginTop: 12,
                    padding: 10,
                    backgroundColor: '#f6ffed',
                    borderRadius: 8,
                    border: '1px solid #b7eb8f'
                }}>
                    <Text strong style={{ fontSize: '13px', color: '#52c41a' }}>Đáp án đúng: </Text>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Tag color="success" style={{ fontWeight: 'bold' }}>{correctAnswerKey}</Tag>
                        <RenderContent content={correctAnswerContent} style={{ maxHeight: 200 }} />
                    </div>
                    {giaiThich && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #b7eb8f' }}>
                            <Text strong style={{ fontSize: '12px' }}>Giải thích: </Text>
                            <Text style={{ fontSize: '12px' }}>{giaiThich}</Text>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div style={{
                marginTop: 12,
                padding: 10,
                backgroundColor: '#f6ffed',
                borderRadius: 8,
                border: '1px solid #b7eb8f'
            }}>
                <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>Đáp án đúng: </Text>
                <div style={{ marginTop: 6 }}>
                    <RenderContent content={correctAnswerContent} style={{ maxHeight: 200 }} />
                </div>
                {giaiThich && (
                    <div style={{ marginTop: 6 }}>
                        <Text strong style={{ fontSize: '12px' }}>Giải thích: </Text>
                        <Text style={{ fontSize: '12px' }}>{giaiThich}</Text>
                    </div>
                )}
            </div>
        );
    };

    // Hiển thị một câu hỏi duy nhất
    const renderCurrentQuestion = () => {
        const questionsList = getQuestionsList();

        if (questionsList.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                    <Text>Không có câu hỏi nào trong bài tập này.</Text>
                </div>
            );
        }

        const currentQuestion = questionsList[currentQuestionIndex];
        const questionId = currentQuestion._id || currentQuestion.id || currentQuestionIndex;
        const currentAnswer = getCurrentAnswer(questionId);
        const isReadOnly = isViewMode;
        const questionType = currentQuestion.loaiCauHoi || currentQuestion.type;

        return (
            <Card
                style={{
                    marginBottom: 16,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
                bodyStyle={{ padding: '16px' }}
            >
                {/* Header với số câu và điểm */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Space size="small">
                        <Tag color="#00BCD4" style={{ fontSize: '12px', padding: '2px 8px', margin: 0 }}>
                            Câu {currentQuestionIndex + 1}/{questionsList.length}
                        </Tag>
                        <Tag color="processing" style={{ fontSize: '12px', padding: '2px 8px', margin: 0 }}>
                            Điểm: {currentQuestion.diem || 10}
                        </Tag>
                        {questionType && (
                            <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px', margin: 0 }}>
                                {questionType === 'multiple' && 'Trắc nghiệm'}
                                {questionType === 'truefalse' && 'True/False'}
                                {questionType === 'cloze' && 'Điền vào chỗ trống'}
                                {questionType === 'matching' && 'Ghép nối'}
                                {questionType === 'transformation' && 'Viết lại câu'}
                                {questionType === 'reading' && 'Đọc hiểu'}
                                {questionType === 'essay' && 'Tự luận'}
                            </Tag>
                        )}
                    </Space>
                    {!isViewMode && (
                        <Tag color={isCurrentQuestionAnswered() ? 'success' : 'default'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                            {isCurrentQuestionAnswered() ? '✓ Đã trả lời' : 'Chưa trả lời'}
                        </Tag>
                    )}
                </div>

                {/* Yêu cầu đề bài (nếu có) */}
                {currentQuestion.yeuCauDeBai && (
                    <div style={{ marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Yêu cầu: </Text>
                        <Text strong style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{currentQuestion.yeuCauDeBai}</Text>
                    </div>
                )}

                {/* Hình ảnh & Âm thanh */}
                {(currentQuestion.linkHinhAnh || currentQuestion.linkAudio) && (
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        {currentQuestion.linkHinhAnh && (
                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                                {isUrl(currentQuestion.linkHinhAnh) ? (
                                    <Image
                                        src={currentQuestion.linkHinhAnh}
                                        alt="Hình ảnh câu hỏi"
                                        style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: '8px' }}
                                        fallback="https://via.placeholder.com/400?text=Lỗi+tải+ảnh+hoặc+Link+không+phải+ảnh"
                                        preview={{ mask: 'Xem ảnh' }}
                                    />
                                ) : (
                                    <Text type="secondary">{currentQuestion.linkHinhAnh}</Text>
                                )}
                            </div>
                        )}
                        {currentQuestion.linkAudio && (
                            <div style={{ textAlign: 'center' }}>
                                <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                <audio controls src={currentQuestion.linkAudio} style={{ width: '100%', maxWidth: 400, marginTop: 8 }}>
                                    Trình duyệt của bạn không hỗ trợ audio.
                                </audio>
                                {isUrl(currentQuestion.linkAudio) && (
                                    <div style={{ marginTop: 8, fontSize: '13px' }}>
                                        <a href={currentQuestion.linkAudio} target="_blank" rel="noopener noreferrer">
                                            🔗 Click vào đây để mở Audio (Nếu trình duyệt lỗi)
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Nội dung câu hỏi chính */}
                <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.5 }}>
                        <RenderContent content={currentQuestion.cauHoi || currentQuestion.question || currentQuestion.title || currentQuestion.questionContent || 'Không có nội dung'} />
                    </div>
                </div>

                {/* Bài đọc nếu có */}
                {currentQuestion.noiDungBaiDoc && (
                    <div style={{
                        marginBottom: 12,
                        padding: 10,
                        backgroundColor: '#fafafa',
                        borderRadius: 6,
                        borderLeft: '3px solid #00BCD4',
                        fontSize: '13px'
                    }}>
                        <Text strong style={{ display: 'block', marginBottom: 4, color: '#00BCD4', fontSize: '12px' }}>
                            Nội dung bài đọc:
                        </Text>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{currentQuestion.noiDungBaiDoc}</div>
                    </div>
                )}

                {/* Mức độ nhận thức */}
                {currentQuestion.mucDoNhanThuc && (
                    <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ marginRight: 8, fontSize: '12px' }}>Mức độ:</Text>
                        <Tag
                            color={
                                currentQuestion.mucDoNhanThuc === 'Nhận biết' ? 'green' :
                                    currentQuestion.mucDoNhanThuc === 'Thông hiểu' ? 'orange' :
                                        currentQuestion.mucDoNhanThuc === 'Vận dụng' ? 'red' :
                                            currentQuestion.mucDoNhanThuc === 'Vận dụng cao' ? 'purple' : 'default'
                            }
                            style={{ fontSize: '12px', padding: '2px 8px' }}
                        >
                            {currentQuestion.mucDoNhanThuc}
                        </Tag>
                    </div>
                )}

                {/* Phần đáp án */}
                <div>
                    <Text strong style={{ display: 'block', marginBottom: 8, fontSize: '13px' }}>
                        Đáp án:
                    </Text>
                    {renderAnswerInput(currentQuestion, questionId, currentAnswer, isReadOnly)}
                </div>

                {/* Hiển thị đáp án đúng và giải thích trong chế độ xem kết quả */}
                {isViewMode && renderCorrectAnswer(currentQuestion)}
            </Card>
        );
    };

    // Hiển thị phần điều hướng
    const renderNavigation = () => {
        const questionsList = getQuestionsList();
        const answeredCount = getAnsweredCount();
        const totalQuestions = questionsList.length;

        return (
            <div style={{ marginTop: 16 }}>
                <Divider style={{ margin: '12px 0' }} />

                {/* Progress bar */}
                {!isViewMode && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Tiến độ làm bài</Text>
                            <Text strong style={{ color: '#00BCD4', fontSize: '12px' }}>
                                {answeredCount}/{totalQuestions} câu
                            </Text>
                        </div>
                        <Progress
                            percent={Math.round((answeredCount / totalQuestions) * 100)}
                            strokeColor="#00BCD4"
                            showInfo={false}
                            size="small"
                        />
                    </div>
                )}

                {/* Navigation buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: 12,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Button
                        onClick={goToPrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        icon={<ArrowLeftOutlined />}
                        size="small"
                    >
                        Câu trước
                    </Button>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Array.from({ length: totalQuestions }, (_, idx) => (
                            <Button
                                key={idx}
                                type={idx === currentQuestionIndex ? 'primary' : 'default'}
                                style={{
                                    backgroundColor: idx === currentQuestionIndex ? '#00BCD4' : undefined,
                                    borderColor: '#d9d9d9',
                                    minWidth: '28px',
                                    height: '28px',
                                    padding: '0 4px',
                                    fontSize: '12px',
                                    fontWeight: idx === currentQuestionIndex ? 600 : 400
                                }}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                size="small"
                            >
                                {idx + 1}
                            </Button>
                        ))}
                    </div>

                    <Button
                        onClick={goToNextQuestion}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                        size="small"
                    >
                        Câu tiếp
                    </Button>
                </div>

                {/* Submit button */}
                {!isViewMode && totalQuestions > 0 && (
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <Button
                            type="primary"
                            size="middle"
                            icon={<SaveOutlined />}
                            onClick={() => form.submit()}
                            loading={isSubmitting}
                            disabled={answeredCount === 0}
                            style={{
                                background: '#00BCD4',
                                borderColor: '#00BCD4',
                                minWidth: 160,
                                height: 36
                            }}
                        >
                            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                        </Button>
                        {answeredCount === 0 && (
                            <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    Vui lòng trả lời ít nhất một câu hỏi
                                </Text>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const questionsList = getQuestionsList();
    const totalQuestions = questionsList.length;
    const answeredCount = getAnsweredCount();

    return (
        <Modal
            title={
                <Space size="small">
                    {isViewMode ? <EyeOutlined /> : <CheckCircleOutlined />}
                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                        {isViewMode ? `Kết quả: ${assignment?.title}` : `Nộp bài: ${assignment?.title}`}
                    </span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            width={900}
            footer={null}
            styles={{
                body: {
                    padding: '16px 20px',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                },
                header: {
                    padding: '12px 20px',
                    marginBottom: 0
                }
            }}
        >
            <Spin spinning={loading}>
                {/* Nếu là chế độ xem kết quả, hiển thị điểm và nhận xét */}
                {isViewMode && existingSubmission && (
                    <Alert
                        message="Kết quả bài làm"
                        description={
                            <div>
                                <div style={{ marginBottom: 6 }}>
                                    <Text strong>Điểm số: </Text>
                                    <Text strong style={{ fontSize: 16, color: existingSubmission.score >= (assignment?.points * 0.7) ? '#52c41a' : '#ff4d4f' }}>
                                        {existingSubmission.score} / {assignment?.points}
                                    </Text>
                                </div>
                                {existingSubmission.feedback && (
                                    <div>
                                        <Text strong>Nhận xét: </Text>
                                        <Text>{existingSubmission.feedback}</Text>
                                    </div>
                                )}
                                <div style={{ marginTop: 6 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Ngày nộp: {existingSubmission.submittedAt ? new Date(existingSubmission.submittedAt).toLocaleString('vi-VN') : 'Chưa có'}
                                    </Text>
                                </div>
                            </div>
                        }
                        type={existingSubmission.score >= (assignment?.points * 0.7) ? 'success' : 'warning'}
                        showIcon
                        style={{ marginBottom: 12, padding: '8px 12px' }}
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {assignment?.requirements && (
                        <Alert
                            message="Yêu cầu bài tập"
                            description={assignment.requirements}
                            type="info"
                            showIcon
                            style={{ marginBottom: 12, padding: '8px 12px' }}
                        />
                    )}

                    {assignment?.type === 'quiz' || (questionsList.length > 0) ? (
                        <div>
                            <Title level={5} style={{ marginBottom: 12, color: '#00BCD4', fontSize: '15px' }}>
                                Danh sách câu hỏi
                            </Title>

                            {/* Hiển thị một câu hỏi */}
                            {renderCurrentQuestion()}

                            {/* Điều hướng */}
                            {totalQuestions > 0 && renderNavigation()}
                        </div>
                    ) : (
                        <Form.Item
                            name="content"
                            label="Nội dung bài làm"
                            style={{ marginBottom: 12 }}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Nhập nội dung bài làm của bạn..."
                                disabled={isViewMode}
                                style={{ fontSize: '13px' }}
                            />
                        </Form.Item>
                    )}

                    {!isViewMode && questionsList.length === 0 && (
                        <div style={{ marginTop: 12 }}>
                            <Button
                                type="primary"
                                size="middle"
                                icon={<SaveOutlined />}
                                onClick={() => form.submit()}
                                loading={isSubmitting}
                                style={{
                                    background: '#00BCD4',
                                    borderColor: '#00BCD4',
                                    width: '100%',
                                    height: 36
                                }}
                            >
                                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
                            </Button>
                        </div>
                    )}

                    <Divider style={{ margin: '12px 0' }} />

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Điểm tối đa: {assignment?.points} điểm
                    </Text>
                </Form>
            </Spin>
        </Modal>
    );
};

export default SubmitAssignmentModal;