// Components/StudentTable.jsx
import React from 'react';
import { Table, Input, Select, Button, Space, Tag, Avatar, Typography, Tooltip, Modal, message, Row, Col } from 'antd';
import { SearchOutlined, UserAddOutlined, FileExcelOutlined, DeleteOutlined, CheckCircleOutlined, EyeOutlined, EditOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const StudentTable = ({
    students,
    loading,
    selectedRowKeys,
    onSelectChange,
    searchText,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onAddStudent,
    onImportStudent,
    onDeleteSelected,
    onApproveAll,
    onApproveStudent,
    onRejectStudent,
    onViewStudent,
    onEditStudent,
    canManage,
    isMobile,
    pendingCount
}) => {
    const columns = [
        { title: 'STT', key: 'stt', width: 60, align: 'center', render: (text, record, index) => index + 1 },
        {
            title: 'Học sinh', key: 'student', width: 280,
            render: (_, record) => (
                <Space direction="vertical" size={2} style={{ width: '100%' }}>
                    <Space><Avatar src={record.avatar} icon={<UserAddOutlined />} size="small" /><Text strong>{record.name}</Text></Space>
                    <Space size={4}><IdcardOutlined style={{ color: '#999', fontSize: 12 }} /><Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text></Space>
                </Space>
            )
        },
        {
            title: 'Thông tin liên lạc', key: 'contact', width: 280,
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Space size={4}><MailOutlined style={{ color: '#999', fontSize: 12 }} /><Text>{record.email}</Text></Space>
                    <Space size={4}><PhoneOutlined style={{ color: '#999', fontSize: 12 }} /><Text>{record.phone || 'Chưa cập nhật'}</Text></Space>
                </Space>
            )
        },
        { title: 'Ghi chú', dataIndex: 'note', key: 'note', width: 200, render: (note) => <Tooltip title={note}><Text ellipsis style={{ maxWidth: 180 }}>{note || '-'}</Text></Tooltip> },
        { title: 'Ngày tham gia', key: 'joinDate', width: 120, render: (_, record) => <Text>{record.status === 'Đã duyệt' ? record.joinDate : record.requestDate}</Text> },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120, render: (status) => <Tag color={status === 'Đã duyệt' ? 'green' : 'orange'}>{status}</Tag> },
        {
            title: 'Hoạt động', key: 'action', width: 280, fixed: 'right',
            render: (_, record) => {
                if (record.status === 'Chờ duyệt') {
                    return (
                        <Space size="small">
                            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => onApproveStudent(record)} loading={loading} style={{ backgroundColor: '#52c41a' }}>Duyệt</Button>
                            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => onRejectStudent(record)} loading={loading}>Từ chối</Button>
                            <Button size="small" icon={<EyeOutlined />} onClick={() => onViewStudent(record)} />
                        </Space>
                    );
                }
                return (
                    <Space size="small">
                        <Button size="small" icon={<EyeOutlined />} onClick={() => onViewStudent(record)}>Xem</Button>
                        <Button size="small" icon={<EditOutlined />} onClick={() => onEditStudent(record)}>Sửa</Button>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => {
                            confirm({
                                title: 'Xác nhận xóa',
                                icon: <ExclamationCircleOutlined />,
                                content: `Xóa học sinh ${record.name} khỏi lớp?`,
                                onOk: () => onDeleteSelected([record.key])
                            });
                        }}>Xóa</Button>
                    </Space>
                );
            }
        }
    ];

    return (
        <div>
            {canManage && (
                <Space size={[8, 8]} wrap style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<UserAddOutlined />} onClick={onAddStudent} style={{ backgroundColor: '#00bcd4' }}>Thêm học sinh</Button>
                    <Button icon={<FileExcelOutlined />} onClick={onImportStudent}>Nhập học sinh</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => onDeleteSelected()} disabled={selectedRowKeys.length === 0}>Xóa ({selectedRowKeys.length})</Button>
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={onApproveAll} disabled={pendingCount === 0} style={{ backgroundColor: '#52c41a' }}>Duyệt ({pendingCount})</Button>
                </Space>
            )}

            <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={18}>
                    <Input placeholder="Tìm kiếm học sinh theo mã, họ tên, email, điện thoại..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => onSearchChange(e.target.value)} allowClear />
                </Col>
                <Col xs={24} sm={6}>
                    <Select placeholder="Lọc theo trạng thái" style={{ width: '100%' }} value={statusFilter} onChange={onStatusFilterChange}>
                        <Option value="all">Tất cả</Option>
                        <Option value="approved">Đã duyệt</Option>
                        <Option value="pending">Chờ duyệt</Option>
                    </Select>
                </Col>
            </Row>

            <Table
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedRowKeys,
                    onChange: onSelectChange,
                    getCheckboxProps: (record) => ({ disabled: record.status === 'Chờ duyệt' })
                }}
                dataSource={students}
                pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} học sinh` }}
                size={isMobile ? 'small' : 'middle'}
                loading={loading}
                scroll={{ x: 'max-content' }}
                columns={columns}
            />
        </div>
    );
};

export default StudentTable;