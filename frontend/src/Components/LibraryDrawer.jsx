// Components/LibraryDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Tree,
    Table,
    Input,
    Button,
    Space,
    Tag,
    message,
    Spin,
    Typography,
    Modal,
    Tooltip,
    Grid
} from 'antd';
import {
    FolderOutlined,
    FolderOpenOutlined,
    FileOutlined,
    SearchOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import {
    fetchFolders,
    fetchTests,
    deleteTest,
    fetchTestDetails
} from '../api/library';

const { Text } = Typography;
const { confirm } = Modal;
const { useBreakpoint } = Grid;

const LibraryDrawer = ({ visible, onClose, onSelectTest }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectLoading, setSelectLoading] = useState(false);
    const [showTree, setShowTree] = useState(true);

    // Build tree data từ folders
    const buildTreeData = (folders) => {
        if (!folders || !Array.isArray(folders)) return [];

        const folderMap = {};

        folders.forEach(folder => {
            folderMap[folder._id] = {
                key: folder._id,
                title: folder.title || folder.name || 'Không tên',
                color: folder.color || '#2E3A59',
                order: folder.order || 1,
                parentId: folder.parentId,
                children: [],
                ...folder
            };
        });

        const roots = [];
        folders.forEach(folder => {
            if (folder.parentId && folderMap[folder.parentId]) {
                folderMap[folder.parentId].children.push(folderMap[folder._id]);
            } else {
                roots.push(folderMap[folder._id]);
            }
        });

        const sortByOrder = (nodes) => {
            return nodes.sort((a, b) => (a.order || 1) - (b.order || 1));
        };

        const sortTree = (nodes) => {
            nodes = sortByOrder(nodes);
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    node.children = sortTree(node.children);
                }
            });
            return nodes;
        };

        const sortedTree = sortTree(roots);

        // Mở rộng tất cả folder
        const getAllKeys = (nodes) => {
            let keys = [];
            nodes.forEach(node => {
                keys.push(node.key);
                if (node.children && node.children.length > 0) {
                    keys = [...keys, ...getAllKeys(node.children)];
                }
            });
            return keys;
        };

        setExpandedKeys(getAllKeys(sortedTree));
        return sortedTree;
    };

    // Load folders
    const loadFolders = async () => {
        try {
            setLoading(true);
            const foldersRes = await fetchFolders();
            const folders = Array.isArray(foldersRes) ? foldersRes : (foldersRes?.data || []);
            const tree = buildTreeData(folders);
            setTreeData(tree);
        } catch (err) {
            console.error('Failed to load folders:', err);
            message.error('Không thể tải thư mục');
        } finally {
            setLoading(false);
        }
    };

    // Load tests theo folder
    const loadTests = async (folderId) => {
        if (!folderId) return;

        setLoading(true);
        try {
            const testsRes = await fetchTests({ folderId });
            const tests = testsRes?.tests || testsRes?.data || testsRes || [];
            setTableData(Array.isArray(tests) ? tests : []);
        } catch (err) {
            console.error('Failed to load tests:', err);
            message.error('Không thể tải bài tập');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            loadFolders();
        }
    }, [visible]);

    useEffect(() => {
        if (selectedFolderId) {
            loadTests(selectedFolderId);
        } else {
            setTableData([]);
        }
    }, [selectedFolderId]);

    // Xử lý chọn folder
    const handleTreeSelect = (selectedKeys, info) => {
        const folderId = selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : null;
        setSelectedKeys(selectedKeys);
        setSelectedFolderId(folderId);
        setSelectedTest(null);

        if (isMobile) {
            setShowTree(false);
        }
    };

    const handleTreeExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
    };

    const handleSelectTest = (record) => {
        setSelectedTest(record);
    };

    // Xác nhận chọn bài tập - lấy chi tiết câu hỏi
    const handleConfirmSelect = async () => {
        if (!selectedTest) {
            message.warning('Vui lòng chọn một bài tập');
            return;
        }

        setSelectLoading(true);
        try {
            let testWithDetails = selectedTest;

            // Nếu bài tập có câu hỏi nhưng chưa có chi tiết, fetch thêm
            if (selectedTest.questions && selectedTest.questions.length > 0) {
                // Kiểm tra xem câu hỏi đã có chi tiết chưa
                const firstQuestion = selectedTest.questions[0];
                if (firstQuestion && typeof firstQuestion === 'string') {
                    // Chỉ có ID, cần fetch chi tiết
                    testWithDetails = await fetchTestDetails(selectedTest._id);
                }
            }

            await onSelectTest(testWithDetails);
            message.success(`Đã chọn bài tập: ${selectedTest.name || selectedTest.title}`);
            onClose();
        } catch (err) {
            console.error('Select test error:', err);
            message.error('Có lỗi xảy ra khi chọn bài tập');
        } finally {
            setSelectLoading(false);
        }
    };

    // Xóa bài tập
    const handleDeleteTest = (record, e) => {
        e.stopPropagation();
        confirm({
            title: 'Xác nhận xóa bài tập',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa "${record.name || record.title}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteTest(record._id || record.key);
                    message.success('Đã xóa bài tập thành công');
                    if (selectedFolderId) {
                        await loadTests(selectedFolderId);
                    }
                } catch (err) {
                    console.error('deleteTest error', err);
                    message.error('Xóa bài tập thất bại');
                }
            },
        });
    };

    // Xem chi tiết bài tập
    const handleViewTest = (record, e) => {
        e.stopPropagation();
        Modal.info({
            title: 'Chi tiết bài tập',
            width: isMobile ? '95%' : 600,
            content: (
                <div style={{ marginTop: 16 }}>
                    <p><strong>Tên bài tập:</strong> {record.name || record.title}</p>
                    <p><strong>Loại:</strong> {record.type || 'Đề thi'}</p>
                    <p><strong>Số câu hỏi:</strong> {record.total || record.questions?.length || 0} câu</p>
                    {record.timeLimit && (
                        <p><strong>Thời gian:</strong> {record.timeLimit} phút</p>
                    )}
                    {record.description && (
                        <p><strong>Mô tả:</strong> {record.description}</p>
                    )}
                    {record.createdAt && (
                        <p><strong>Ngày tạo:</strong> {new Date(record.createdAt).toLocaleDateString('vi-VN')}</p>
                    )}
                </div>
            ),
            okText: 'Đóng'
        });
    };

    // Columns cho bảng bài tập
    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Tên bài tập',
            dataIndex: 'name',
            flex: 1,
            render: (text, record) => (
                <Space>
                    <FileOutlined style={{ color: record.starred ? '#faad14' : '#1890ff' }} />
                    <Text strong={record.starred}>{text || record.title}</Text>
                    {record.starred && <Tag color="gold">Nổi bật</Tag>}
                </Space>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: isMobile ? 100 : 120,
            render: (type) => {
                const colors = {
                    'Đề thi': 'blue',
                    'Bài tập': 'green',
                    'Kiểm tra': 'orange',
                    'Quiz': 'purple'
                };
                return <Tag color={colors[type] || 'blue'}>{type || 'Đề thi'}</Tag>;
            }
        },
        {
            title: 'Số câu',
            key: 'questionCount',
            width: isMobile ? 80 : 100,
            align: 'center',
            render: (_, record) => {
                const count = record.total || record.questions?.length || 0;
                return <Tag color="processing">{count}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: isMobile ? 120 : 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={(e) => handleViewTest(record, e)}
                        />
                    </Tooltip>
                    <Tooltip title="Chọn bài tập">
                        <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTest(record);
                            }}
                            style={{ color: selectedTest?._id === record._id ? '#52c41a' : undefined }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={(e) => handleDeleteTest(record, e)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    // Lọc bài tập theo search
    const filteredData = tableData.filter(item =>
        (item.name || item.title || '').toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space>
                        <FolderOutlined style={{ color: '#00bcd4', fontSize: isMobile ? 18 : 20 }} />
                        <Text style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: '#00bcd4' }}>
                            THƯ VIỆN BÀI TẬP
                        </Text>
                    </Space>
                    <CloseOutlined
                        style={{ cursor: 'pointer', color: '#666', fontSize: isMobile ? 14 : 16 }}
                        onClick={onClose}
                    />
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width="100%"
            closable={false}
            maskClosable={false}
            footer={
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8,
                    padding: isMobile ? '12px 16px' : '12px 24px'
                }}>
                    <Button onClick={onClose} size={isMobile ? 'middle' : 'large'}>
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirmSelect}
                        loading={selectLoading}
                        disabled={!selectedTest}
                        size={isMobile ? 'middle' : 'large'}
                        style={{ backgroundColor: '#00bcd4' }}
                    >
                        Chọn bài tập này
                    </Button>
                </div>
            }
            styles={{
                body: {
                    padding: isMobile ? '12px' : '24px',
                    overflowY: 'auto',
                    height: 'calc(100vh - 108px)'
                }
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 12 : 24,
                height: '100%',
                minHeight: 500
            }}>
                {/* Left Panel - Tree */}
                {(!isMobile || showTree) && (
                    <div style={{
                        width: isMobile ? '100%' : '30%',
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        padding: isMobile ? 12 : 16,
                        background: '#fafafa',
                        overflow: 'auto',
                        marginBottom: isMobile ? 12 : 0
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                                📁 THƯ MỤC
                            </Text>
                            {isMobile && (
                                <Button
                                    type="text"
                                    icon={<MenuFoldOutlined />}
                                    onClick={() => setShowTree(false)}
                                    size="small"
                                >
                                    Ẩn
                                </Button>
                            )}
                        </div>

                        <Input
                            placeholder="Tìm thư mục..."
                            prefix={<SearchOutlined />}
                            style={{ marginBottom: 12 }}
                            allowClear
                            size={isMobile ? 'small' : 'middle'}
                        />

                        {loading && !treeData.length ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <Spin />
                                <div style={{ marginTop: 8 }}>Đang tải...</div>
                            </div>
                        ) : (
                            <Tree
                                showIcon
                                icon={(props) => {
                                    if (props.expanded) {
                                        return <FolderOpenOutlined style={{ color: '#00bcd4' }} />;
                                    }
                                    return <FolderOutlined />;
                                }}
                                expandedKeys={expandedKeys}
                                selectedKeys={selectedKeys}
                                onSelect={handleTreeSelect}
                                onExpand={handleTreeExpand}
                                treeData={treeData}
                            />
                        )}
                    </div>
                )}

                {/* Right Panel - Table */}
                <div style={{
                    flex: 1,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    padding: isMobile ? 12 : 16,
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto'
                }}>
                    <div style={{ marginBottom: 16 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                            <Space>
                                {isMobile && !showTree && (
                                    <Button
                                        type="primary"
                                        icon={<MenuUnfoldOutlined />}
                                        onClick={() => setShowTree(true)}
                                        size="small"
                                        style={{ backgroundColor: '#00bcd4' }}
                                    >
                                        Chọn thư mục
                                    </Button>
                                )}
                                <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                                    📄 DANH SÁCH BÀI TẬP
                                    {selectedFolderId && (
                                        <Tag color="blue" style={{ marginLeft: 8 }}>
                                            {filteredData.length} bài
                                        </Tag>
                                    )}
                                </Text>
                            </Space>
                            <Input
                                placeholder="Tìm kiếm bài tập..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: isMobile ? '100%' : 250 }}
                                allowClear
                                size={isMobile ? 'small' : 'middle'}
                            />
                        </Space>
                    </div>

                    {!selectedFolderId ? (
                        <div style={{
                            textAlign: 'center',
                            padding: isMobile ? 40 : 60,
                            color: '#999'
                        }}>
                            <FolderOutlined style={{ fontSize: isMobile ? 32 : 48, marginBottom: 16, color: '#ddd' }} />
                            <div>Vui lòng chọn một thư mục để xem bài tập</div>
                            {isMobile && !showTree && (
                                <Button
                                    type="link"
                                    onClick={() => setShowTree(true)}
                                    style={{ marginTop: 12 }}
                                >
                                    Chọn thư mục
                                </Button>
                            )}
                        </div>
                    ) : loading ? (
                        <div style={{ textAlign: 'center', padding: isMobile ? 40 : 60 }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16 }}>Đang tải bài tập...</div>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: isMobile ? 40 : 60,
                            color: '#999'
                        }}>
                            <FileOutlined style={{ fontSize: isMobile ? 32 : 48, marginBottom: 16, color: '#ddd' }} />
                            <div>Không có bài tập nào trong thư mục này</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Hãy tạo bài tập mới trong mục "Thư viện của tôi"
                            </Text>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            loading={loading}
                            pagination={{
                                pageSize: isMobile ? 5 : 10,
                                showTotal: (total) => `Tổng ${total} bài`,
                                showSizeChanger: !isMobile,
                                pageSizeOptions: ['10', '20', '50']
                            }}
                            scroll={{ y: isMobile ? 'calc(100vh - 350px)' : 'calc(100vh - 300px)', x: 'max-content' }}
                            rowKey={(record) => record._id || record.key}
                            rowClassName={(record) => selectedTest?._id === record._id ? 'selected-test-row' : ''}
                            onRow={(record) => ({
                                onClick: () => handleSelectTest(record),
                                style: { cursor: 'pointer' }
                            })}
                            size={isMobile ? 'small' : 'middle'}
                        />
                    )}
                </div>
            </div>

            <style>{`
                .selected-test-row {
                    background-color: #e6f7ff !important;
                }
                .selected-test-row:hover {
                    background-color: #bae7ff !important;
                }
                .ant-table-tbody > tr.selected-test-row > td {
                    background-color: #e6f7ff !important;
                }
            `}</style>
        </Drawer>
    );
};

export default LibraryDrawer;