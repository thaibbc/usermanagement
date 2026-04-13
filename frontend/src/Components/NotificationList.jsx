// Components/NotificationList.jsx
import React, { useState } from 'react';
import { Table, Spin, Button, message, Popconfirm, Typography, Modal, Form, Input, Space } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { deleteNotification, updateNotification } from '../api/classes';

const { Text } = Typography;

const quillModules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean']
    ]
};
const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'link'];

const NotificationList = ({ notifications, loading, isMobile, canManage, onRefresh, classId }) => {
    const [editingRecord, setEditingRecord] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [form] = Form.useForm();

    const handleDelete = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            message.success('Đã xóa thông báo');
            onRefresh();
        } catch (error) {
            message.error('Không thể xóa thông báo');
        }
    };

    const handleEditOpen = (record) => {
        setEditingRecord(record);
        setEditContent(record.content || '');
        form.setFieldsValue({ title: record.title });
    };

    const handleEditSave = async () => {
        try {
            const values = await form.validateFields();
            if (!editContent.trim()) {
                message.error('Vui lòng nhập nội dung');
                return;
            }
            setEditLoading(true);
            await updateNotification(classId, editingRecord._id, {
                title: values.title,
                content: editContent
            });
            message.success('Đã cập nhật thông báo');
            setEditingRecord(null);
            onRefresh();
        } catch (err) {
            console.error('Update notification error:', err);
            message.error(err?.message || 'Có lỗi khi cập nhật thông báo');
        } finally {
            setEditLoading(false);
        }
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: 55,
            align: 'center',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Nội dung',
            key: 'content',
            render: (text, record) => (
                <div>
                    <Text strong style={{ fontSize: '15px', color: '#1890ff', display: 'block', marginBottom: 4 }}>
                        {record.title}
                    </Text>
                    <div
                        dangerouslySetInnerHTML={{ __html: record.content }}
                        style={{ color: '#555' }}
                    />
                </div>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (text) => text ? new Date(text).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }) : '-',
        },
    ];

    if (canManage) {
        columns.push({
            title: 'Thao tác',
            key: 'action',
            width: 110,
            align: 'center',
            render: (text, record) => (
                <Space>
                    {/* Nút Chỉnh sửa */}
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        style={{ color: '#1890ff' }}
                        title="Chỉnh sửa"
                        onClick={() => handleEditOpen(record)}
                    />
                    {/* Nút Xóa */}
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa thông báo này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
                    </Popconfirm>
                </Space>
            ),
        });
    }

    return (
        <div style={{ padding: isMobile ? '8px 0' : '16px 0' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" description="Đang tải thông báo..." />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={notifications}
                    rowKey="_id"
                    pagination={{ pageSize: 10, position: ['bottomCenter'], showSizeChanger: false }}
                    locale={{ emptyText: 'Chưa có thông báo nào' }}
                    bordered
                    size={isMobile ? 'small' : 'middle'}
                    scroll={{ x: 'max-content' }}
                    className="notification-table"
                />
            )}

            {/* Modal chỉnh sửa thông báo */}
            <Modal
                title="Chỉnh sửa thông báo"
                open={!!editingRecord}
                onCancel={() => setEditingRecord(null)}
                onOk={handleEditSave}
                confirmLoading={editLoading}
                okText="Lưu"
                cancelText="Hủy"
                width={700}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề thông báo" />
                    </Form.Item>
                    <Form.Item label="Nội dung" required>
                        <ReactQuill
                            theme="snow"
                            value={editContent}
                            onChange={setEditContent}
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ minHeight: '180px' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NotificationList;