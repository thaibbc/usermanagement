// Components/ClassInfoCard.jsx
import React from 'react';
import { Card, Typography, Row, Col, Button, Space, Tag, Dropdown, message, Modal } from 'antd';
import { CopyOutlined, MoreOutlined, ArrowLeftOutlined, EditOutlined, SwapOutlined, DeleteOutlined, ExclamationCircleOutlined, ExperimentOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { confirm } = Modal;

const ClassInfoCard = ({
    classData,
    teacherInfo,
    totalStudents,
    onCopyCode,
    onBack,
    onUpdateStatus,
    onEdit,
    isMobile,
    isTestMode = false,
    hideMenu = false // Thêm prop hideMenu mặc định là false
}) => {
    const handleDeleteClass = () => {
        confirm({
            title: 'Xác nhận xóa lớp',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa lớp "${classData.name}"? Hành động này sẽ xóa tất cả dữ liệu liên quan.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                message.success('Đã xóa lớp thành công');
                onBack();
            }
        });
    };

    // Các menu items chính
    let menuItems = [
        {
            key: 'back',
            label: 'Quay lại',
            icon: <ArrowLeftOutlined />,
            onClick: onBack
        }
    ];

    // Nếu không phải chế độ test, thêm các mục quản lý
    if (!isTestMode) {
        menuItems.push(
            {
                key: 'edit',
                label: 'Chỉnh sửa lớp',
                icon: <EditOutlined />,
                onClick: onEdit
            },
            {
                key: 'delete',
                label: 'Xóa lớp',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: handleDeleteClass
            }
        );
    }

    // Nếu hideMenu = true thì không hiển thị menu gì cả
    if (hideMenu) {
        menuItems = [];
    }

    return (
        <Card
            title={
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '12px' : 0
                }}>
                    <Space>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 600, textTransform: 'uppercase' }}>
                            Thông tin lớp học: {classData.name}
                        </Text>
                        {isTestMode && (
                            <Tag icon={<ExperimentOutlined />} color="gold">
                                Chế độ test
                            </Tag>
                        )}
                    </Space>

                    {/* Chỉ hiển thị dropdown khi có menu items */}
                    {menuItems.length > 0 && (
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                icon={<MoreOutlined />}
                                size={isMobile ? 'small' : 'middle'}
                            />
                        </Dropdown>
                    )}
                </div>
            }
            style={{ backgroundColor: 'white' }}
            variant="borderless"
        >
            <Row gutter={[isMobile ? 16 : 24, isMobile ? 12 : 16]} style={{ marginBottom: isMobile ? 24 : 32 }}>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                        <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                            Mã lớp học
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                                {classData.code}
                            </Text>
                            <CopyOutlined
                                style={{
                                    cursor: 'pointer',
                                    color: '#00bcd4',
                                    fontSize: isMobile ? '14px' : '16px'
                                }}
                                onClick={onCopyCode}
                            />
                        </div>
                    </div>
                    <div>
                        <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                            Giáo viên
                        </Text>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                            {teacherInfo.name}
                        </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Tag color={classData.status === 'active' ? 'green' : classData.status === 'pending' ? 'orange' : 'red'}>
                            {classData.status === 'active' ? 'ĐANG HOẠT ĐỘNG' : classData.status === 'pending' ? 'CHỜ DUYỆT' : 'NGỪNG HOẠT ĐỘNG'}
                        </Tag>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                        <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                            Tên lớp học
                        </Text>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                            {classData.name}
                        </Text>
                    </div>
                    <div>
                        <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                            Điện thoại
                        </Text>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                            {teacherInfo.phone}
                        </Text>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                        <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                            Sĩ số
                        </Text>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                            {totalStudents} học sinh
                        </Text>
                    </div>
                    <div>
                        <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                            Email
                        </Text>
                        <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                            {teacherInfo.email}
                        </Text>
                    </div>
                </Col>
            </Row>

            {/* Hiển thị thêm thông tin nếu có */}
            {(classData.subject || classData.grade || classData.schoolYear) && (
                <Row gutter={[isMobile ? 16 : 24, isMobile ? 12 : 16]} style={{ marginTop: 8, marginBottom: 16 }}>
                    {classData.subject && (
                        <Col xs={24} sm={12} md={8}>
                            <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                Môn học
                            </Text>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                                {classData.subject}
                            </Text>
                        </Col>
                    )}
                    {classData.grade && (
                        <Col xs={24} sm={12} md={8}>
                            <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                Khối lớp
                            </Text>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                                {classData.grade}
                            </Text>
                        </Col>
                    )}
                    {classData.schoolYear && (
                        <Col xs={24} sm={12} md={8}>
                            <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                                Năm học
                            </Text>
                            <Text style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500 }}>
                                {classData.schoolYear}
                            </Text>
                        </Col>
                    )}
                </Row>
            )}

            {/* Hiển thị mô tả nếu có */}
            {classData.description && (
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                    <Text style={{ fontSize: isMobile ? '12px' : '13px', color: '#666', display: 'block', marginBottom: 4 }}>
                        Mô tả
                    </Text>
                    <Text style={{ fontSize: isMobile ? '13px' : '14px' }}>
                        {classData.description}
                    </Text>
                </div>
            )}

            {/* Thêm thông báo chế độ test nếu cần */}
            {isTestMode && (
                <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    backgroundColor: '#fff7e6',
                    borderRadius: 8,
                    border: '1px solid #ffd666'
                }}>
                    <Space>
                        <ExperimentOutlined style={{ color: '#faad14' }} />
                        <Text style={{ fontSize: 12, color: '#ad6800' }}>
                            🔬 Bạn đang ở chế độ test. Bạn có thể xem và làm bài tập như học sinh, nhưng không thể quản lý lớp.
                        </Text>
                    </Space>
                </div>
            )}
        </Card>
    );
};

export default ClassInfoCard;