// Components/EditClassModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message, Space, Divider, Typography, Tag, Row, Col, Card } from 'antd';
import {
    EditOutlined,
    BookOutlined,
    UserOutlined,
    BankOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { updateClass } from '../api/classes';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditClassModal = ({ visible, onCancel, classData, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && classData) {
            form.setFieldsValue({
                name: classData.name,
                grade: classData.grade || '',
                note: classData.note || '',
                status: classData.status === 'active',
                completed: classData.completed || false,
            });
        }
    }, [visible, classData, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const updateData = {
                name: values.name,
                grade: values.grade,
                note: values.note,
                status: values.status ? 'active' : 'inactive',
                completed: values.completed || false,
            };

            await updateClass(classData._id, updateData);
            message.success('Cập nhật thông tin lớp học thành công');
            onSuccess();
            onCancel();
        } catch (error) {
            console.error('Update class error:', error);
            message.error(error?.message || 'Có lỗi xảy ra khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#00bcd4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <EditOutlined style={{ fontSize: 20, color: 'white' }} />
                    </div>
                    <div>
                        <Title level={4} style={{ margin: 0, color: '#1E293B' }}>
                            Chỉnh sửa thông tin lớp học
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Cập nhật thông tin chi tiết của lớp
                        </Text>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={700}
            destroyOnClose
            okButtonProps={{
                style: {
                    backgroundColor: '#00bcd4',
                    borderColor: '#00bcd4'
                }
            }}
            styles={{
                body: {
                    padding: '24px',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    name: '',
                    grade: '',
                    note: '',
                    status: true,
                    completed: false,
                }}
            >
                {/* Thông tin cơ bản */}
                <Card
                    size="small"
                    style={{
                        marginBottom: 20,
                        backgroundColor: '#f8fafc',
                        borderLeft: `4px solid #00bcd4`
                    }}
                    styles={{ body: { padding: '16px' } }}
                >
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <InfoCircleOutlined style={{ color: '#00bcd4' }} />
                            <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                                Thông tin cơ bản
                            </Text>
                        </Space>
                    </div>

                    <Form.Item
                        name="name"
                        label={
                            <span>
                                Tên lớp học <span style={{ color: '#ff4d4f' }}>*</span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
                    >
                        <Input
                            placeholder="Nhập tên lớp học"
                            size="large"
                            prefix={<BookOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="grade"
                        label="Khối lớp"
                        rules={[{ required: true, message: 'Vui lòng chọn khối lớp' }]}
                    >
                        <Select
                            placeholder="Chọn khối lớp"
                            size="large"
                            prefix={<BankOutlined style={{ color: '#bfbfbf' }} />}
                        >
                            <Option value="10">Khối 10</Option>
                            <Option value="11">Khối 11</Option>
                            <Option value="12">Khối 12</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="note"
                        label="Ghi chú"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Nhập ghi chú về lớp học"
                            showCount
                            maxLength={500}
                            style={{ resize: 'none' }}
                        />
                    </Form.Item>
                </Card>

                {/* Thông tin không thể chỉnh sửa */}
                <Card
                    size="small"
                    style={{
                        marginBottom: 20,
                        backgroundColor: '#fff9e6',
                        borderLeft: `4px solid #faad14`
                    }}
                    styles={{ body: { padding: '16px' } }}
                >
                    <div style={{ marginBottom: 12 }}>
                        <Space>
                            <InfoCircleOutlined style={{ color: '#faad14' }} />
                            <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                                Thông tin lớp học
                            </Text>
                            <Tag color="gold" style={{ fontSize: 10 }}>Không thể chỉnh sửa</Tag>
                        </Space>
                    </div>

                    <Row gutter={[16, 12]}>
                        <Col xs={24} sm={12}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Mã lớp học</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <Text strong style={{ fontSize: 14, color: '#00bcd4' }}>
                                        {classData?.code}
                                    </Text>
                                    <Tag color="cyan" style={{ fontSize: 10 }}>Mã duy nhất</Tag>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Giáo viên</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <UserOutlined style={{ color: '#00bcd4' }} />
                                    <Text strong style={{ fontSize: 14 }}>
                                        {classData?.teacherName || 'Đang tải...'}
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Môn học</Text>
                                <div style={{ marginTop: 4 }}>
                                    <Tag color="blue">{classData?.subject || 'Chưa cập nhật'}</Tag>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Năm học</Text>
                                <div style={{ marginTop: 4 }}>
                                    <Tag color="purple">{classData?.schoolYear || 'Chưa cập nhật'}</Tag>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Cài đặt lớp học */}
                <Card
                    size="small"
                    style={{
                        marginBottom: 20,
                        borderLeft: `4px solid #52c41a`
                    }}
                    styles={{ body: { padding: '16px' } }}
                >
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <ClockCircleOutlined style={{ color: '#52c41a' }} />
                            <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                                Cài đặt lớp học
                            </Text>
                        </Space>
                    </div>

                    <Form.Item
                        name="status"
                        label="Trạng thái hoạt động"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren={
                                <Space>
                                    <CheckCircleOutlined />
                                    <span>Đang hoạt động</span>
                                </Space>
                            }
                            unCheckedChildren={
                                <Space>
                                    <CloseCircleOutlined />
                                    <span>Ngừng hoạt động</span>
                                </Space>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="completed"
                        label="Trạng thái hoàn thành"
                        valuePropName="checked"
                        tooltip="Đánh dấu lớp học đã hoàn thành chương trình"
                    >
                        <Switch
                            checkedChildren={
                                <Space>
                                    <CheckCircleOutlined />
                                    <span>Đã hoàn thành</span>
                                </Space>
                            }
                            unCheckedChildren={
                                <Space>
                                    <ClockCircleOutlined />
                                    <span>Chưa hoàn thành</span>
                                </Space>
                            }
                        />
                    </Form.Item>
                </Card>

                {/* Thông tin thống kê nhanh */}
                {classData && (
                    <Card
                        size="small"
                        style={{
                            backgroundColor: '#f0f7ff',
                            borderLeft: `4px solid #1890ff`
                        }}
                        styles={{ body: { padding: '16px' } }}
                    >
                        <div style={{ marginBottom: 12 }}>
                            <Space>
                                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                <Text strong style={{ fontSize: 14, color: '#1E293B' }}>
                                    Thống kê nhanh
                                </Text>
                            </Space>
                        </div>

                        <Row gutter={[16, 12]}>
                            <Col xs={12} sm={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Sĩ số</Text>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                                        {classData.students?.length || 0}
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Bài tập</Text>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                                        {classData.assignments?.length || 0}
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Đang chờ duyệt</Text>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                                        {classData.pendingStudents?.length || 0}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}
            </Form>
        </Modal>
    );
};

export default EditClassModal;