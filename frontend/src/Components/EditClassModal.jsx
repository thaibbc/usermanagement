// Components/EditClassModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
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
                grade: classData.grade ? Number(classData.grade) : 1,
                note: classData.note || '',
                status: classData.status === 'active' ? 'active' : 'inactive',
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
                grade: Number(values.grade),
                note: values.note,
                status: values.status,
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
                    note: '',
                    status: 'active',
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

                {/* Khối lớp - chỉ lưu data, không hiển thị */}
                <Form.Item
                    name="grade"
                    style={{ display: 'none' }}
                >
                    <Select>
                        <Option value={1}>Khối 1</Option>
                        <Option value={2}>Khối 2</Option>
                        <Option value={3}>Khối 3</Option>
                        <Option value={4}>Khối 4</Option>
                        <Option value={5}>Khối 5</Option>
                        <Option value={6}>Khối 6</Option>
                        <Option value={7}>Khối 7</Option>
                        <Option value={8}>Khối 8</Option>
                        <Option value={9}>Khối 9</Option>
                        <Option value={10}>Khối 10</Option>
                        <Option value={11}>Khối 11</Option>
                        <Option value={12}>Khối 12</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="note"
                    label="Ghi chú"
                >
                    <TextArea
                        rows={3}
                        placeholder="Nhập ghi chú về lớp học"
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái hoạt động"
                >
                    <Select placeholder="Chọn trạng thái">
                        <Option value="active">Đang hoạt động</Option>
                        <Option value="inactive">Ngừng hoạt động</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="completed"
                    label="Trạng thái hoàn thành"
                    tooltip="Đánh dấu lớp học đã hoàn thành chương trình"
                >
                    <Select placeholder="Chọn trạng thái">
                        <Option value={true}>Đã hoàn thành</Option>
                        <Option value={false}>Chưa hoàn thành</Option>
                    </Select>
                </Form.Item>


            </Form>
        </Modal>
    );
};

export default EditClassModal;