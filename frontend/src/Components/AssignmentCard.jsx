// Components/AssignmentCard.jsx
import React from 'react';
import { Card, Typography, Tag, Button, Space, Divider, Tooltip } from 'antd';
import {
    FileTextOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const AssignmentCard = ({
    assignment,
    onView,
    onEdit,
    onDelete,
    isTeacher = false,
    isStudent = false,
    submissionStatus = null // 'submitted', 'graded', 'not_submitted'
}) => {
    const getStatusTag = () => {
        if (submissionStatus === 'graded') {
            return <Tag icon={<CheckCircleOutlined />} color="success">Đã chấm điểm</Tag>;
        }
        if (submissionStatus === 'submitted') {
            return <Tag icon={<ClockCircleOutlined />} color="processing">Đã nộp - Chờ chấm</Tag>;
        }
        if (submissionStatus === 'not_submitted') {
            return <Tag icon={<CloseCircleOutlined />} color="default">Chưa nộp</Tag>;
        }
        return null;
    };

    const formatDate = (date) => {
        if (!date) return 'Chưa cập nhật';
        return new Date(date).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card
            style={{
                marginBottom: 16,
                borderRadius: 8,
                borderLeft: `4px solid ${assignment.color || '#00bcd4'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
            }}
            hoverable
            styles={{
                body: { padding: '16px' }
            }}
        >
            {/* Header với tiêu đề và các tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                    <Space align="center" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                        <FileTextOutlined style={{ color: assignment.color || '#00bcd4', fontSize: 16 }} />
                        <Text strong style={{ fontSize: 16, color: '#1E293B' }}>
                            {assignment.title || 'Bài tập không có tiêu đề'}
                        </Text>
                        {getStatusTag()}
                    </Space>
                    {assignment.type && (
                        <div style={{ marginTop: 4 }}>
                            <Tag color={assignment.type === 'quiz' ? 'blue' : assignment.type === 'code' ? 'purple' : 'green'}>
                                {assignment.type === 'quiz' ? 'Trắc nghiệm' : assignment.type === 'code' ? 'Lập trình' : 'Bài tập thường'}
                            </Tag>
                            {assignment.points && (
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                    {assignment.points} điểm
                                </Tag>
                            )}
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <Space>
                    {isStudent && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => onView(assignment)}
                            style={{ backgroundColor: '#00bcd4', borderColor: '#00bcd4' }}
                        >
                            {submissionStatus === 'graded' ? 'Xem kết quả' : 'Làm bài'}
                        </Button>
                    )}
                    {isTeacher && (
                        <>
                            <Tooltip title="Xem chi tiết">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    onClick={() => onView(assignment)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit(assignment)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onDelete(assignment)}
                                    size="small"
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            </div>

            {/* Yêu cầu / Hướng dẫn */}
            {assignment.requirements && (
                <Paragraph
                    type="secondary"
                    style={{
                        marginBottom: 12,
                        fontSize: 13,
                        backgroundColor: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: 6,
                        lineHeight: 1.5
                    }}
                    ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
                >
                    {assignment.requirements}
                </Paragraph>
            )}

            <Divider style={{ margin: '12px 0' }} />

            {/* Thông tin thời gian */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {assignment.openTime && (
                    <Space size={4}>
                        <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Mở: {formatDate(assignment.openTime)}
                        </Text>
                    </Space>
                )}
                {assignment.closeTime && (
                    <Space size={4}>
                        <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Đóng: {formatDate(assignment.closeTime)}
                        </Text>
                    </Space>
                )}
                {assignment.createdAt && (
                    <Space size={4}>
                        <FileTextOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Ngày tạo: {formatDate(assignment.createdAt)}
                        </Text>
                    </Space>
                )}
            </div>

            {/* Thông tin số câu hỏi */}
            {assignment.questions && assignment.questions.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Số câu hỏi: {assignment.questions.length} câu
                    </Text>
                </div>
            )}
        </Card>
    );
};

export default AssignmentCard;