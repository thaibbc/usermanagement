import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Alert, Spin, Avatar, Typography, Tag, Descriptions, Button, Tabs, Table, Space, Row, Col } from 'antd';
import { UserAddOutlined, UserOutlined, EditOutlined, FileExcelOutlined, UploadOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import useIsMobile from '../hooks/useIsMobile';
import { getStudents } from '../api/users';

const { TextArea } = Input;
const { Title, Text } = Typography;

export const AddStudentModal = ({ open, onCancel, onSubmit, loading, email, setEmail, name, setName, phone, setPhone, note, setNote, onAddSelected }) => {
    const isMobile = useIsMobile(768);
    const [activeTab, setActiveTab] = useState('list');
    const [students, setStudents] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (open && activeTab === 'list') {
            fetchStudentList();
        }
    }, [open, activeTab, currentPage]);

    const fetchStudentList = async () => {
        setTableLoading(true);
        try {
            const res = await getStudents({ search: searchText, page: currentPage, limit: 10 });
            let list = [];
            let tot = 0;
            if (res && res.data) {
                list = res.data.users || res.data;
                tot = res.data.total || list.length;
            } else if (res && res.users) {
                list = res.users;
                tot = res.total || list.length;
            } else if (Array.isArray(res)) {
                list = res;
                tot = res.length;
            }
            setStudents(Array.isArray(list) ? list : []);
            setTotal(tot);
        } catch (error) {
            console.error('Lỗi khi tải danh sách học sinh:', error);
        } finally {
            setTableLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchStudentList();
    };

    const handleAddSelectedClick = () => {
        if (onAddSelected && selectedKeys.length > 0) {
            onAddSelected(selectedRows);
            setSelectedKeys([]);
            setSelectedRows([]);
        }
    };

    // Row selection configuration with state
    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: (newSelectedRowKeys, selectedRows) => {
            setSelectedKeys(newSelectedRowKeys);
            setSelectedRows(selectedRows);
        },
        preserveSelectedRowKeys: true,
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: isMobile ? 80 : 100,
            render: (code, record) => {
                const displayCode = code || record.studentCode || '';
                return <span style={{ fontWeight: 'bold' }}>{displayCode}</span>;
            }
        },
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            width: isMobile ? 120 : undefined,
            render: (name, record) => name || record.email?.split('@')[0] || '—'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: isMobile ? 150 : undefined,
            ellipsis: true
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: isMobile ? 100 : undefined,
            render: (phone) => phone || '—'
        }
    ];

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <UserAddOutlined style={{ color: '#00bcd4' }} />
                    <span style={{ fontSize: isMobile ? 16 : 18 }}>THÊM HỌC SINH VÀO LỚP</span>
                </div>
            }
            open={open}
            onCancel={() => {
                setSelectedKeys([]);
                setSelectedRows([]);
                onCancel();
            }}
            footer={null}
            width={isMobile ? '95%' : 850}
            style={{
                maxWidth: '100%',
                top: isMobile ? 20 : undefined
            }}
            styles={{
                body: { padding: isMobile ? 16 : 24 }
            }}
            destroyOnHidden
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size={isMobile ? 'small' : 'middle'}
                items={[
                    {
                        key: 'list',
                        label: 'Chọn từ danh sách',
                        children: (
                            <div style={{ padding: isMobile ? '4px 0' : '8px 0' }}>
                                {/* Search bar - responsive */}
                                <div style={{
                                    marginBottom: 16,
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: 8
                                }}>
                                    <Input
                                        placeholder="Tìm kiếm theo tên, email, mã..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onPressEnter={handleSearch}
                                        style={{ width: isMobile ? '100%' : 300 }}
                                        allowClear
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleSearch}
                                        style={{ backgroundColor: '#00bcd4', width: isMobile ? '100%' : 'auto' }}
                                    >
                                        Tìm kiếm
                                    </Button>
                                </div>

                                {/* Table - responsive */}
                                <div style={{ overflowX: 'auto' }}>
                                    <Table
                                        rowSelection={rowSelection}
                                        columns={columns}
                                        dataSource={students}
                                        rowKey={(record) => record._id || record.id}
                                        loading={tableLoading}
                                        pagination={{
                                            current: currentPage,
                                            onChange: setCurrentPage,
                                            pageSize: 10,
                                            total: total,
                                            showTotal: (tot) => `Tổng ${tot} học sinh`,
                                            showSizeChanger: false,
                                            size: isMobile ? 'small' : 'default',
                                            responsive: true
                                        }}
                                        size={isMobile ? 'small' : 'middle'}
                                        bordered
                                        scroll={{ x: isMobile ? 500 : undefined }}
                                    />
                                </div>

                                {/* Action buttons - responsive */}
                                <div style={{
                                    textAlign: 'right',
                                    marginTop: 16,
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column-reverse' : 'row',
                                    gap: 8,
                                    justifyContent: 'flex-end'
                                }}>
                                    <Button
                                        onClick={onCancel}
                                        style={{ width: isMobile ? '100%' : 'auto' }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={handleAddSelectedClick}
                                        loading={loading}
                                        disabled={selectedKeys.length === 0}
                                        style={{
                                            backgroundColor: '#00bcd4',
                                            width: isMobile ? '100%' : 'auto'
                                        }}
                                    >
                                        Thêm đã chọn ({selectedKeys.length})
                                    </Button>
                                </div>
                            </div>
                        )
                    },
                ]}
            />
        </Modal>
    );
};

export const ImportStudentModal = ({ open, onCancel, onSubmit, loading, importFile, setImportFile, onDownloadTemplate }) => {
    const isMobile = useIsMobile(768);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <FileExcelOutlined style={{ color: '#00bcd4' }} />
                    <span style={{ fontSize: isMobile ? 16 : 18 }}>NHẬP HỌC SINH TỪ FILE</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} style={{ width: isMobile ? '100%' : 'auto' }}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={onSubmit}
                    loading={loading}
                    disabled={!importFile}
                    style={{ backgroundColor: '#00bcd4', width: isMobile ? '100%' : 'auto' }}
                >
                    Import
                </Button>
            ]}
            width={isMobile ? '95%' : 600}
            style={{
                maxWidth: '100%',
                top: isMobile ? 20 : undefined
            }}
            styles={{
                body: { padding: isMobile ? 16 : 24 },
                footer: { display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', gap: 8 }
            }}
        >
            <Spin spinning={loading}>
                <div style={{ padding: isMobile ? '12px 0' : '20px 0' }}>
                    <Alert
                        title="Yêu cầu file import"
                        description={
                            <ul style={{ marginTop: 8, paddingLeft: 20, marginBottom: 0 }}>
                                <li>File định dạng .xlsx, .xls hoặc .csv</li>
                                <li>Cột bắt buộc: email</li>
                                <li>Cột tùy chọn: name, phone, note</li>
                                <li>Dòng đầu tiên là tiêu đề cột</li>
                            </ul>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    {/* Upload area - responsive */}
                    <div
                        style={{
                            border: '2px dashed #d9d9d9',
                            borderRadius: 8,
                            padding: isMobile ? 24 : 40,
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#fafafa'
                        }}
                        onClick={() => document.getElementById('fileInput').click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) setImportFile(file);
                        }}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            style={{ display: 'none' }}
                            onChange={(e) => setImportFile(e.target.files[0])}
                        />
                        <UploadOutlined style={{ fontSize: isMobile ? 32 : 48, color: '#00bcd4', marginBottom: 16 }} />
                        <div>
                            {importFile ?
                                <Text strong>{importFile.name}</Text> :
                                <Text style={{ fontSize: isMobile ? 13 : 14 }}>
                                    Kéo thả file vào đây hoặc <Button type="link" style={{ padding: 0 }}>chọn file</Button>
                                </Text>
                            }
                        </div>
                        {importFile && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">{(importFile.size / 1024).toFixed(2)} KB</Text>
                            </div>
                        )}
                    </div>

                    {/* Download template button */}
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={onDownloadTemplate}
                            style={{ fontSize: isMobile ? 13 : 14 }}
                        >
                            Tải file mẫu
                        </Button>
                    </div>
                </div>
            </Spin>
        </Modal>
    );
};

export const StudentDetailModal = ({ open, onCancel, student }) => {
    const isMobile = useIsMobile(768);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <UserOutlined style={{ color: '#00bcd4' }} />
                    <span style={{ fontSize: isMobile ? 16 : 18 }}>THÔNG TIN HỌC SINH</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel} style={{ width: isMobile ? '100%' : 'auto' }}>
                    Đóng
                </Button>
            ]}
            width={isMobile ? '95%' : 500}
            style={{
                maxWidth: '100%',
                top: isMobile ? 20 : undefined
            }}
            styles={{
                body: { padding: isMobile ? 16 : 24 },
                footer: { display: 'flex', justifyContent: 'flex-end' }
            }}
        >
            {student && (
                <div style={{ padding: isMobile ? '12px 0' : '20px 0' }}>
                    {/* Avatar section */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar
                            size={isMobile ? 64 : 80}
                            src={student.avatar}
                            icon={<UserOutlined />}
                        />
                        <Title level={isMobile ? 5 : 4} style={{ marginTop: 16, marginBottom: 4 }}>
                            {student.name}
                        </Title>
                        <Tag color={student.status === 'Đã duyệt' ? 'green' : 'orange'} style={{ fontSize: isMobile ? 12 : 14 }}>
                            {student.status}
                        </Tag>
                    </div>

                    {/* Student info - responsive */}
                    <Descriptions
                        column={1}
                        bordered
                        size={isMobile ? 'small' : 'default'}
                        labelStyle={{ width: isMobile ? '40%' : '120px' }}
                    >
                        <Descriptions.Item label="Mã học sinh">
                            <Text style={{ wordBreak: 'break-word' }}>{student.code}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <Text style={{ wordBreak: 'break-word' }}>{student.email}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {student.phone || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tham gia">
                            {student.joinDate || student.requestDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                            {student.note || 'Không có ghi chú'}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
        </Modal>
    );
};

export const EditStudentModal = ({ open, onCancel, onSubmit, loading, name, setName, email, setEmail, phone, setPhone, note, setNote }) => {
    const isMobile = useIsMobile(768);

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <EditOutlined style={{ color: '#00bcd4' }} />
                    <span style={{ fontSize: isMobile ? 16 : 18 }}>CHỈNH SỬA HỌC SINH</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} style={{ width: isMobile ? '100%' : 'auto' }}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={onSubmit}
                    loading={loading}
                    style={{ backgroundColor: '#00bcd4', width: isMobile ? '100%' : 'auto' }}
                >
                    Cập nhật
                </Button>
            ]}
            width={isMobile ? '95%' : 600}
            style={{
                maxWidth: '100%',
                top: isMobile ? 20 : undefined
            }}
            styles={{
                body: { padding: isMobile ? 16 : 24 },
                footer: { display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', gap: 8 }
            }}
        >
            <Spin spinning={loading}>
                <div style={{ padding: isMobile ? '12px 0' : '20px 0' }}>
                    <Form layout="vertical" size={isMobile ? 'small' : 'middle'}>
                        <Form.Item label="Họ và tên" required>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nhập họ tên học sinh"
                            />
                        </Form.Item>
                        <Form.Item label="Email" required>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                                placeholder="Email học sinh"
                            />
                        </Form.Item>
                        <Form.Item label="Số điện thoại">
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại"
                            />
                        </Form.Item>
                        <Form.Item label="Ghi chú">
                            <TextArea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={isMobile ? 3 : 4}
                                placeholder="Nhập ghi chú (nếu có)"
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        </Modal>
    );
};