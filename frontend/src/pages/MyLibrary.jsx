// pages/MyLibrary.jsx
import React, { useState, useEffect } from 'react';
import {
    Layout,
    Tabs,
    Button,
    Table,
    Tree,
    Space,
    message,
    Card,
    Typography,
    Input,
    Tag,
    Modal
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    ThunderboltOutlined,
    CloseOutlined,
    SearchOutlined,
    HomeOutlined,
    FileOutlined,
    StarOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import { FolderDrawer } from '../Components/FolderDrawer';
import { CreateTestModal } from '../Components/CreateTestModal';
import { CreateAutoTestModal } from '../Components/CreateAutoTestModal';

const { Content } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

export const MyLibrary = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [expandedKeys, setExpandedKeys] = useState(['khoi-9']);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [showBanner, setShowBanner] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false); // Thêm loading state

    // Modal states
    const [folderModalVisible, setFolderModalVisible] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [createTestModalVisible, setCreateTestModalVisible] = useState(false);
    const [autoTestModalVisible, setAutoTestModalVisible] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tree data for left panel
    const [treeData, setTreeData] = useState([
        {
            title: 'Khối 9',
            key: 'khoi-9',
            icon: <FolderOutlined />,
            color: '#2E3A59',
            children: [
                { title: 'Toán', key: 'khoi-9-toan', icon: <FileOutlined />, color: '#2196F3' },
                { title: 'Văn', key: 'khoi-9-van', icon: <FileOutlined />, color: '#4CAF50' },
                { title: 'Anh', key: 'khoi-9-anh', icon: <FileOutlined />, color: '#FF9800' },
            ]
        },
        {
            title: 'Khối 8',
            key: 'khoi-8',
            icon: <FolderOutlined />,
            color: '#2E3A59',
            children: [
                { title: 'Toán', key: 'khoi-8-toan', icon: <FileOutlined />, color: '#2196F3' },
                { title: 'Văn', key: 'khoi-8-van', icon: <FileOutlined />, color: '#4CAF50' },
            ]
        },
        {
            title: 'Khối 7',
            key: 'khoi-7',
            icon: <FolderOutlined />,
            color: '#2E3A59',
        },
        {
            title: 'Khối 6',
            key: 'khoi-6',
            icon: <FolderOutlined />,
            color: '#2E3A59',
        },
    ]);

    // Table data for right panel
    const [tableData, setTableData] = useState([
        { key: 1, id: 1, name: 'Test 2kỳ/04 - P3', total: 15, type: 'Đề thi', starred: true },
        { key: 2, id: 2, name: 'Test 2kỳ/04 - P2', total: 12, type: 'Đề thi', starred: false },
        { key: 3, id: 3, name: 'test 2kỳ/04', total: 20, type: 'Bài tập', starred: true },
        { key: 4, id: 4, name: 'Test L8 - U1 + 4', total: 25, type: 'Đề thi', starred: false },
        { key: 5, id: 5, name: 'Kiểm tra 15 phút (1)', total: 10, type: 'Kiểm tra', starred: false },
        { key: 6, id: 6, name: 'Kiểm tra 15 phút (1)', total: 10, type: 'Kiểm tra', starred: true },
        { key: 7, id: 7, name: 'Kiểm tra 15 phút (1)', total: 10, type: 'Kiểm tra', starred: false },
        { key: 8, id: 8, name: 'Test Unit 1 + Unit Starter', total: 30, type: 'Bài tập', starred: false },
        { key: 9, id: 9, name: 'Test tạo nhiều đề', total: 40, type: 'Đề thi', starred: true },
        { key: 10, id: 10, name: 'test picture 4', total: 8, type: 'Bài tập', starred: false },
        { key: 11, id: 11, name: 'Test picture 2', total: 8, type: 'Bài tập', starred: false },
        { key: 12, id: 12, name: 'Kiểm tra 15 phút T', total: 10, type: 'Kiểm tra', starred: false },
        { key: 13, id: 13, name: 'Kiểm tra 15 phút T', total: 10, type: 'Kiểm tra', starred: false },
        { key: 14, id: 14, name: 'test Picture', total: 8, type: 'Bài tập', starred: true },
        { key: 15, id: 15, name: 'OTest 3', total: 25, type: 'Đề thi', starred: false },
        { key: 16, id: 16, name: 'OTest 1', total: 25, type: 'Đề thi', starred: false },
        { key: 17, id: 17, name: 'Test', total: 20, type: 'Bài tập', starred: false },
    ]);

    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            width: 60,
            align: 'center'
        },
        {
            title: 'Tên bài tập',
            dataIndex: 'name',
            flex: 1,
            render: (text, record) => (
                <Space>
                    <FileOutlined style={{ color: record.starred ? '#faad14' : '#1890ff' }} />
                    <Text strong={record.starred}>{text}</Text>
                    {record.starred && <StarOutlined style={{ color: '#faad14' }} />}
                </Space>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: 120,
            render: (type) => {
                const colors = {
                    'Đề thi': 'blue',
                    'Bài tập': 'green',
                    'Kiểm tra': 'orange'
                };
                return <Tag color={colors[type]}>{type}</Tag>;
            }
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'total',
            width: 120,
            align: 'center',
            render: (total) => <Tag color="processing">{total} câu</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            message.info(`Chỉnh sửa: ${record.name}`);
                        }}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirm(record);
                        }}
                    />
                </Space>
            )
        }
    ];

    // Helper function to find folder
    const findFolder = (nodes, key) => {
        for (const node of nodes) {
            if (node.key === key) return node;
            if (node.children) {
                const found = findFolder(node.children, key);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper function to find parent key
    const findParentKey = (nodes, childKey, parentKey = null) => {
        for (const node of nodes) {
            if (node.key === childKey) return parentKey;
            if (node.children) {
                const found = findParentKey(node.children, childKey, node.key);
                if (found) return found;
            }
        }
        return null;
    };

    const handleTreeSelect = (selectedKeys, info) => {
        setSelectedKeys(selectedKeys);
        message.info(`Đã chọn: ${info.node.title}`);
    };

    const handleTreeExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
    };

    // Folder handlers
    const handleAddFolder = () => {
        setEditingFolder(null);
        setFolderModalVisible(true);
    };

    const handleEditFolder = () => {
        if (!selectedKeys.length) {
            message.warning('Vui lòng chọn thư mục cần sửa');
            return;
        }

        const folder = findFolder(treeData, selectedKeys[0]);
        if (folder) {
            const parentKey = findParentKey(treeData, folder.key);

            setEditingFolder({
                id: folder.key,
                name: folder.title,
                parent: parentKey || '',
                order: 1,
                color: folder.color || '#2E3A59',
                createdAt: '18/03/2025',
                updatedAt: '18/03/2025'
            });
            setFolderModalVisible(true);
        }
    };

    const handleDeleteFolder = () => {
        if (!selectedKeys.length) {
            message.warning('Vui lòng chọn thư mục cần xóa');
            return;
        }

        const folder = findFolder(treeData, selectedKeys[0]);

        confirm({
            title: 'Xác nhận xóa thư mục',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn xóa thư mục <strong>"{folder?.title}"</strong>?</p>
                    <p style={{ color: '#ff4d4f', fontSize: '13px' }}>
                        Lưu ý: Các thư mục con và bài tập bên trong sẽ bị xóa.
                    </p>
                </div>
            ),
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                // Logic xóa thư mục
                message.success(`Đã xóa thư mục "${folder?.title}" thành công`);
                setSelectedKeys([]);
            },
        });
    };

    const handleFolderSubmit = async (values) => {
        setLoading(true);
        try {
            console.log('Folder data:', values);

            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingFolder) {
                // Cập nhật thư mục
                message.success(`Đã cập nhật thư mục "${values.name}" thành công!`);
            } else {
                // Thêm thư mục mới
                message.success(`Đã tạo thư mục "${values.name}" thành công!`);
            }

            setFolderModalVisible(false);
            setEditingFolder(null);
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    // Test handlers
    const handleCreateTest = () => {
        setCreateTestModalVisible(true);
    };

    const handleCreateAutoTest = () => {
        setAutoTestModalVisible(true);
    };

    const handleTestSubmit = (data) => {
        console.log('Test created:', data);
        message.success('Đã tạo đề kiểm tra thành công!');
        setCreateTestModalVisible(false);
    };

    const handleAutoTestSubmit = (data) => {
        console.log('Auto test created:', data);
        message.success('Đã tạo đề tự động thành công!');
        setAutoTestModalVisible(false);
    };

    const showDeleteConfirm = (record) => {
        confirm({
            title: 'Xác nhận xóa bài tập',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa "${record.name}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                setTableData(tableData.filter(item => item.key !== record.key));
                message.success('Đã xóa bài tập thành công');
            },
        });
    };

    // Filter table data based on search
    const filteredData = tableData.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const tabItems = [
        {
            key: '1',
            label: 'Thư viện đề kiểm tra',
            children: (
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '16px',
                    height: isMobile ? 'auto' : 'calc(100vh - 300px)',
                    padding: '16px 0'
                }}>
                    {/* Left Panel - Tree */}
                    <div style={{
                        width: isMobile ? '100%' : '340px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#fff',
                        overflow: 'auto',
                        maxHeight: isMobile ? '300px' : 'none'
                    }}>
                        {/* Tree Actions */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '16px',
                            paddingBottom: '12px',
                            borderBottom: '1px solid #f0f0f0'
                        }}>
                            <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={handleAddFolder}
                            >
                                Thêm
                            </Button>
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={handleEditFolder}
                            >
                                Sửa
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDeleteFolder}
                            >
                                Xóa
                            </Button>
                        </div>

                        {/* Search in tree */}
                        <Input
                            placeholder="Tìm thư mục..."
                            prefix={<SearchOutlined />}
                            style={{ marginBottom: '12px' }}
                            allowClear
                        />

                        {/* Tree Component */}
                        <Tree
                            showIcon
                            switcherIcon={<FolderOpenOutlined />}
                            defaultExpandedKeys={expandedKeys}
                            expandedKeys={expandedKeys}
                            selectedKeys={selectedKeys}
                            onSelect={handleTreeSelect}
                            onExpand={handleTreeExpand}
                            treeData={treeData}
                        />
                    </div>

                    {/* Right Panel - Table */}
                    <div style={{
                        flex: 1,
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px',
                        background: '#fff',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Action Buttons */}
                        <div style={{
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderBottom: '1px solid #d9d9d9',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Space wrap>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateTest}
                                >
                                    Tạo đề kiểm tra
                                </Button>
                                <Button
                                    icon={<ThunderboltOutlined />}
                                    onClick={handleCreateAutoTest}
                                >
                                    Tạo tự động
                                </Button>
                            </Space>

                            <Input
                                placeholder="Tìm kiếm bài tập..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: isMobile ? '100%' : 250 }}
                                allowClear
                            />
                        </div>

                        {/* Table */}
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                pagination={{
                                    pageSize: 10,
                                    showTotal: (total) => `Tổng ${total} bài tập`
                                }}
                                scroll={{ x: 'max-content', y: isMobile ? 'auto' : 'calc(100vh - 480px)' }}
                                bordered={false}
                                size="middle"
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: 'Lịch sử thao tác',
            children: (
                <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    color: '#999',
                    background: '#fff',
                    borderRadius: '8px',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div>
                        <FileOutlined style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
                        <p>Lịch sử thao tác - Đang phát triển</p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Sidebar */}
            {!isMobile && (
                <Sidebar
                    collapsed={isSidebarCollapsed}
                    setCollapsed={setIsSidebarCollapsed}
                />
            )}

            <Layout style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 250),
                transition: 'margin-left 0.3s ease'
            }}>
                <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

                {/* Breadcrumb */}
                <div style={{
                    background: '#00BCD4',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <HomeOutlined style={{ color: 'white', fontSize: 16 }} />
                    <Text style={{ color: 'white' }}>Thư viện của tôi</Text>
                </div>

                {/* Page Title */}
                <div style={{
                    background: 'white',
                    padding: '16px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Text style={{ fontSize: '16px', fontWeight: 500 }}>
                        Quản lý thư viện đề kiểm tra
                    </Text>
                    <Tag color="blue">Tổng số: {filteredData.length}</Tag>
                </div>

                <Content style={{ padding: '0 24px 24px' }}>
                    {/* Banner Section */}
                    {showBanner && (
                        <Card
                            style={{
                                marginBottom: '24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}
                            styles={{ body: { padding: 0 } }}
                        >
                            <div style={{
                                padding: '32px 48px',
                                position: 'relative',
                                color: 'white'
                            }}>
                                <h2 style={{ color: 'white', marginBottom: 8, fontSize: 24 }}>
                                    📚 Thư viện của tôi
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: 14 }}>
                                    Quản lý và tổ chức thư viện đề kiểm tra của bạn một cách hiệu quả
                                </p>
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={() => setShowBanner(false)}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Main Content */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <Tabs
                            items={tabItems}
                            defaultActiveKey="1"
                            style={{ padding: '0 24px' }}
                            size={isMobile ? 'small' : 'middle'}
                        />
                    </div>
                </Content>
            </Layout>

            {/* Modals */}
            <FolderDrawer
                visible={folderModalVisible}
                onClose={() => {
                    setFolderModalVisible(false);
                    setEditingFolder(null);
                }}
                onSubmit={handleFolderSubmit}
                initialValues={editingFolder}
                parentOptions={treeData.map(item => ({
                    value: item.key,
                    label: item.title
                }))}
            />

            <CreateTestModal
                visible={createTestModalVisible}
                onClose={() => setCreateTestModalVisible(false)}
                onSubmit={handleTestSubmit}
            />

            <CreateAutoTestModal
                visible={autoTestModalVisible}
                onClose={() => setAutoTestModalVisible(false)}
                onSubmit={handleAutoTestSubmit}
            />

            {/* Style tùy chỉnh */}
            <style>{`
                .ant-tree .ant-tree-node-content-wrapper {
                    color: #333;
                }
                .ant-tree .ant-tree-node-content-wrapper:hover {
                    background-color: #e6f7ff;
                }
                .ant-tree .ant-tree-node-selected {
                    background-color: #bae7ff !important;
                }
                .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 600 !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background: #e6f7ff !important;
                }
            `}</style>
        </Layout>
    );
};

export default MyLibrary;