// Components/NotificationList.jsx
import React from 'react';
import { List, Spin, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteNotification } from '../api/classes';

const NotificationList = ({ notifications, loading, isMobile, canManage, onRefresh }) => {
    const handleDelete = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            message.success('Đã xóa thông báo');
            onRefresh();
        } catch (error) {
            message.error('Không thể xóa thông báo');
        }
    };

    return (
        <div style={{ padding: isMobile ? '8px' : '16px' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <List
                    size="small"
                    bordered
                    locale={{ emptyText: 'Chưa có thông báo nào' }}
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            actions={canManage ? [
                                <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(item._id)}
                                />
                            ] : []}
                        >
                            <List.Item.Meta
                                title={<strong>{item.title}</strong>}
                                description={
                                    <div
                                        dangerouslySetInnerHTML={{ __html: item.content }}
                                        style={{ marginTop: 8 }}
                                    />
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default NotificationList;