// Components/NotificationList.jsx
import React from 'react';
import { List } from 'antd';

const NotificationList = ({ notifications, isMobile }) => {
    return (
        <div style={{ padding: isMobile ? '8px' : '16px' }}>
            <List
                size="small"
                bordered
                locale={{ emptyText: 'Chưa có thông báo nào' }}
                dataSource={notifications}
                renderItem={(item) => <List.Item>{item}</List.Item>}
            />
        </div>
    );
};

export default NotificationList;