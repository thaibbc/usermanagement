// Components/CreateNotificationModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createNotification } from '../api/classes';

const CreateNotificationModal = ({ open, onCancel, onSuccess, classId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!content.trim()) {
                message.error('Vui lòng nhập nội dung thông báo');
                return;
            }

            setLoading(true);
            console.log('[CreateNotification] Bắt đầu tạo thông báo, classId:', classId);

            const result = await createNotification(classId, {
                title: values.title,
                content: content
            });

            console.log('[CreateNotification] API trả về:', result);

            message.success('Tạo thông báo thành công');
            form.resetFields();
            setContent('');

            // Trả về notification vừa tạo để ClassDetail cập nhật bảng ngay
            console.log('[CreateNotification] Gọi onSuccess với result._id:', result?._id);
            await onSuccess(result);

            // Dispatch event SAU khi onSuccess hoàn thành (tránh race condition)
            console.log('[CreateNotification] Dispatch notificationCreated event');
            window.dispatchEvent(new Event('notificationCreated'));
        } catch (error) {
            console.error('[CreateNotification] Lỗi:', error);
            message.error(error?.message || 'Có lỗi xảy ra khi tạo thông báo');
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent', 'link', 'image'
    ];

    return (
        <Modal
            title="Tạo thông báo"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Tạo thông báo"
            cancelText="Hủy"
            width={800}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    title: '',
                }}
            >
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                    <Input placeholder="Nhập tiêu đề thông báo" />
                </Form.Item>

                <Form.Item
                    label="Nội dung"
                    required
                >
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                        placeholder="Nhập nội dung thông báo..."
                        style={{ minHeight: '200px' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateNotificationModal;