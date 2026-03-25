// Components/StudentResultTab.jsx
import React from 'react';
import { Result, Typography } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StudentResultTab = ({ isPending, isApproved }) => {
    if (isPending) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Result
                    status="info"
                    title="Yêu cầu đang chờ duyệt"
                    subTitle="Yêu cầu tham gia lớp của bạn đang được giáo viên xem xét. Vui lòng kiểm tra lại sau."
                    icon={<ClockCircleOutlined />}
                />
            </div>
        );
    }

    if (isApproved) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Result
                    status="success"
                    title="Đã được duyệt"
                    subTitle="Bạn đã được duyệt tham gia lớp học này."
                    icon={<CheckCircleOutlined />}
                />
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Result
                status="warning"
                title="Chưa tham gia"
                subTitle="Bạn chưa tham gia lớp học này. Vui lòng nhập mã lớp để gửi yêu cầu."
                icon={<InfoCircleOutlined />}
            />
        </div>
    );
};

export default StudentResultTab;