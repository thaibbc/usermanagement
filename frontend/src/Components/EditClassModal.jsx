// Components/EditClassModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message, Space, Divider } from 'antd';
import { updateClass } from '../api/classes';

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
                description: classData.description || '',
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
                description: values.description,
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
            title="Chỉnh sửa thông tin lớp học"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    name: '',
                    grade: '',
                    description: '',
                    status: true,
                    completed: false,
                }}
            >
                <Form.Item
                    name="name"
                    label="Tên lớp học"
                    rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
                >
                    <Input placeholder="Nhập tên lớp học" />
                </Form.Item>

                <Form.Item
                    name="grade"
                    label="Khối lớp"
                    rules={[{ required: true, message: 'Vui lòng chọn khối lớp' }]}
                >
                    <Select placeholder="Chọn khối lớp">
                        <Option value="10">Khối 10</Option>
                        <Option value="11">Khối 11</Option>
                        <Option value="12">Khối 12</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Ghi chú"
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập ghi chú về lớp học"
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Divider />

                <Form.Item
                    name="status"
                    label="Trạng thái hoạt động"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Đang hoạt động"
                        unCheckedChildren="Ngừng hoạt động"
                    />
                </Form.Item>

                <Form.Item
                    name="completed"
                    label="Trạng thái hoàn thành"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Đã hoàn thành"
                        unCheckedChildren="Chưa hoàn thành"
                    />
                </Form.Item>
            </Form>

            {/* Thông tin không thể chỉnh sửa */}
            {/* <div style={{
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: 6,
                fontSize: 12,
                color: '#666'
            }}>
                <div><strong>Thông tin không thể chỉnh sửa:</strong></div>
                <div style={{ marginTop: 8 }}>
                    <div>• Mã lớp học: <strong>{classData?.code}</strong></div>
                    <div>• Giáo viên: <strong>{classData?.teacherName || 'Đang tải...'}</strong></div>
                    <div>• Môn học: <strong>{classData?.subject || 'Chưa cập nhật'}</strong></div>
                    <div>• Năm học: <strong>{classData?.schoolYear || 'Chưa cập nhật'}</strong></div>
                </div>
            </div> */}
        </Modal>
    );
};

export default EditClassModal;