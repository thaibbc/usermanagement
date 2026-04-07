// Components/QuestionPreviewModal.jsx
// Modal xem chi tiết câu hỏi được đọc từ file Excel
import React from 'react';
import { Modal, Button, Card, Row, Col, Typography, Divider, Image } from 'antd';
import { CheckCircleOutlined, SoundOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const TYPE_LABELS = {
    multiple: 'Multiple Choice',
    truefalse: 'Tick / Cross',
    cloze: 'Gap-filling',
    order: 'Order',
};

// Hàm kiểm tra xem text có phải là link hình ảnh hay không
const isImageUrl = (text) => {
    if (typeof text !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
    return text.startsWith('http') && imageExtensions.test(text);
};

// Hàm kiểm tra xem text có phải là link chung hay không
const isUrl = (text) => {
    if (typeof text !== 'string') return false;
    return text.startsWith('http://') || text.startsWith('https://');
};

// Component hiển thị nội dung (text hoặc hình ảnh)
const RenderContent = ({ content }) => {
    if (isImageUrl(content)) {
        return (
            <Image
                src={content}
                alt="Hình ảnh đáp án"
                style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                fallback="https://via.placeholder.com/150?text=Không+thể+tải+ảnh"
                preview={{ mask: 'Xem ảnh' }}
            />
        );
    }
    if (isUrl(content)) {
        return (
            <a href={content} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                {content}
            </a>
        );
    }
    return <span>{content}</span>;
};

const QuestionPreviewModal = ({ question, onClose }) => {
    if (!question) return null;

    const renderAnswerCards = () => {
        if (question.loaiCauHoi === 'multiple') {
            const options = ['A', 'B', 'C', 'D', 'E', 'F']
                .map(label => ({ label, text: question.options[label] }))
                .filter(opt => opt.text);

            return (
                <Row gutter={[16, 16]}>
                    {options.map(opt => {
                        const isCorrect = question.answer === opt.label;
                        return (
                            <Col span={12} key={opt.label}>
                                <Card
                                    size="small"
                                    style={{
                                        borderColor: isCorrect ? '#52c41a' : '#d9d9d9',
                                        backgroundColor: isCorrect ? '#f6ffed' : '#fff',
                                    }}
                                >
                                    <Text strong style={{ color: isCorrect ? '#52c41a' : 'inherit' }}>
                                        {opt.label}.
                                    </Text>
                                    <RenderContent content={opt.text} />
                                    {isCorrect && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />}
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            );
        }

        if (question.loaiCauHoi === 'cloze') {
            const answers = question.answer.split(' | ');
            return (
                <Row gutter={[16, 16]}>
                    {answers.map((ans, idx) => (
                        <Col span={12} key={idx}>
                            <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a' }}>
                                <Text strong style={{ color: '#52c41a' }}>
                                    Vị trí {idx + 1}:
                                </Text>
                                <RenderContent content={ans} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            );
        }

        if (question.loaiCauHoi === 'truefalse' && question.statements?.length) {
            return (
                <Row gutter={[16, 16]}>
                    {question.statements.map((stmt, idx) => {
                        const isCorrect = stmt.answer === 'Đúng' || stmt.answer === 'True';
                        return (
                            <Col span={12} key={idx}>
                                <Card
                                    size="small"
                                    style={{
                                        borderColor: isCorrect ? '#52c41a' : '#ff4d4f',
                                        backgroundColor: isCorrect ? '#f6ffed' : '#fff2f0',
                                    }}
                                >
                                    <RenderContent content={stmt.statement} />
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ color: isCorrect ? '#52c41a' : '#ff4d4f' }}>
                                            {stmt.answer}
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            );
        }

        // Dạng đáp án đơn
        return (
            <Card style={{ backgroundColor: '#f6ffed', borderColor: '#52c41a', textAlign: 'center' }}>
                <RenderContent content={question.answer} />
            </Card>
        );
    };

    return (
        <Modal
            title={<span style={{ color: '#00BCD4', fontWeight: 'bold' }}>Xem Trước</span>}
            open={!!question}
            onCancel={onClose}
            footer={[<Button key="close" onClick={onClose}>Đóng</Button>]}
            width="90vw"  // Chiều rộng chiếm 90% viewport width
            style={{ top: 20 }}  // Khoảng cách từ đỉnh màn hình
            bodyStyle={{
                maxHeight: 'calc(100vh - 150px)',  // Chiều cao tối đa trừ đi header + footer + margin
                overflowY: 'auto',                 // Thêm thanh cuộn dọc khi nội dung vượt quá
                padding: '20px 24px'
            }}
            centered
        >
            <div style={{ padding: '10px 0' }}>
                {/* Card 1: STT + Nội dung yêu cầu */}
                <Card style={{ marginBottom: 16, textAlign: 'center' }}>
                    {/* STT trong vòng tròn */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: '#00BCD4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 24,
                                fontWeight: 'bold',
                            }}
                        >
                            {question.stt}
                        </div>
                    </div>

                    {/* Yêu cầu đề bài */}
                    <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: '16px', marginBottom: 0 }}>
                        {question.yeuCauDeBai}
                    </Paragraph>

                    {/* Bài đọc (nếu có) */}
                    {question.readingContent && (
                        <>
                            <Divider style={{ margin: '16px 0' }} />
                            <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                                {question.readingContent}
                            </Paragraph>
                        </>
                    )}
                </Card>

                {/* Card 2 gộp: Hình ảnh & Âm thanh + Câu hỏi + Đáp án */}
                <Card>
                    {/* Hình ảnh & Âm thanh - căn giữa */}
                    {(question.imageLink || question.audioLink) && (
                        <>
                            <div style={{ marginBottom: 16, textAlign: 'center' }}>
                                <div style={{ marginTop: 12 }}>
                                    {question.imageLink && (
                                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                                            {isImageUrl(question.imageLink) ? (
                                                <Image
                                                    src={question.imageLink}
                                                    alt="Hình ảnh câu hỏi"
                                                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                                                    fallback="https://via.placeholder.com/300?text=Không+thể+tải+ảnh"
                                                    preview={{ mask: 'Xem ảnh' }}
                                                />
                                            ) : isUrl(question.imageLink) ? (
                                                <div style={{ padding: '16px', border: '1px dashed #d9d9d9', borderRadius: '8px', background: '#fafafa' }}>
                                                    <a href={question.imageLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        🔗 Mở link Hình ảnh / Tài liệu
                                                    </a>
                                                </div>
                                            ) : (
                                                <span>{question.imageLink}</span>
                                            )}
                                        </div>
                                    )}
                                    {question.audioLink && (
                                        <div style={{ textAlign: 'center' }}>
                                            <SoundOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                            <audio controls src={question.audioLink} style={{ width: '100%', maxWidth: 400, marginTop: 8 }}>
                                                Trình duyệt của bạn không hỗ trợ audio.
                                            </audio>
                                            {isUrl(question.audioLink) && (
                                                <div style={{ marginTop: 8, fontSize: '13px' }}>
                                                    <a href={question.audioLink} target="_blank" rel="noopener noreferrer">
                                                        🔗 Click vào đây để mở Audio (Nếu trình nghe không hoạt động)
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Câu hỏi */}
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: '16px', marginBottom: 0 }}>
                            {question.cauHoi}
                        </Paragraph>
                    </div>

                    {/* Đáp án */}
                    <div>
                        <div style={{ marginTop: 12 }}>
                            {renderAnswerCards()}
                        </div>
                    </div>
                </Card>
            </div>
        </Modal>
    );
};

export default QuestionPreviewModal;