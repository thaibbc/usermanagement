// pages/MyLibrary.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
    Modal,
    Spin
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
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import { FolderDrawer } from '../Components/FolderDrawer';
import { CreateTestModal } from '../Components/CreateTestModal';
import { CreateAutoTestModal } from '../Components/CreateAutoTestModal';
import {
    fetchFolders,
    fetchTests,
    createFolder,
    updateFolder,
    deleteFolder,
    createTest,
    deleteTest
} from '../api/library';
import { fetchQuestions } from '../api/questions';

const { Content } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

export const MyLibrary = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [showBanner, setShowBanner] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState(null);

    // Modal states
    const [folderModalOpen, setFolderModalOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [createTestModalOpen, setCreateTestModalOpen] = useState(false);
    const [autoTestModalOpen, setAutoTestModalOpen] = useState(false);
    const [selectedFolderForAutoTest, setSelectedFolderForAutoTest] = useState(null);

    // Data states
    const [treeData, setTreeData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [questionsData, setQuestionsData] = useState([]);
    const [activeTab, setActiveTab] = useState('1');

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Convert API folder data to Tree format với màu sắc và icon động
    // pages/MyLibrary.jsx - Cập nhật buildTreeData

    const buildTreeData = (folders) => {
        if (!folders || !Array.isArray(folders)) return [];

        const folderMap = {};

        // Log để debug
        console.log('Building tree from folders:', folders);

        // Tạo map các folder
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

        // Xây dựng cây
        const roots = [];
        folders.forEach(folder => {
            if (folder.parentId && folderMap[folder.parentId]) {
                // Nếu có parent, thêm vào children của parent
                folderMap[folder.parentId].children.push(folderMap[folder._id]);
                console.log(`Folder ${folder.title} added to parent ${folderMap[folder.parentId].title}`);
            } else {
                // Nếu không có parent, là root
                roots.push(folderMap[folder._id]);
                console.log(`Folder ${folder.title} is root`);
            }
        });

        // Sắp xếp theo order
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
        console.log('Final tree:', sortedTree);
        return sortedTree;
    };

    // Load tests theo folder được chọn
    const loadTests = useCallback(async (folderId = null) => {
        try {
            setLoading(true);
            const params = folderId ? { folderId } : {};
            const testsRes = await fetchTests(params);
            const tests = testsRes?.tests || testsRes?.data || testsRes || [];
            setTableData(Array.isArray(tests) ? tests : []);
        } catch (err) {
            console.error('Failed to load tests', err);
            message.error(err.message || 'Không thể tải danh sách bài tập');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load questions theo folder được chọn
    const loadQuestions = useCallback(async (folderId = null) => {
        try {
            setLoading(true);
            const params = folderId ? { folderId } : {};
            const questionsRes = await fetchQuestions(params);
            const questions = questionsRes?.questions || questionsRes?.data || questionsRes || [];
            setQuestionsData(Array.isArray(questions) ? questions : []);
        } catch (err) {
            console.error('Failed to load questions', err);
            message.error(err.message || 'Không thể tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load toàn bộ dữ liệu
    const loadLibraryData = useCallback(async () => {
        try {
            setLoading(true);
            const foldersRes = await fetchFolders();
            const folders = Array.isArray(foldersRes) ? foldersRes : (foldersRes?.data || []);

            const tree = buildTreeData(folders);
            setTreeData(tree);

            // Nếu có folder đang chọn, load tests và questions của folder đó
            if (selectedFolderId) {
                await loadTests(selectedFolderId);
                await loadQuestions(selectedFolderId);
            } else {
                setTableData([]);
                setQuestionsData([]);
            }
        } catch (err) {
            console.error('Failed to load library data', err);
            message.error(err.message || 'Không thể tải thư viện đề kiểm tra');
        } finally {
            setLoading(false);
        }
    }, [loadTests, loadQuestions, selectedFolderId]);

    useEffect(() => {
        loadLibraryData();
    }, [loadLibraryData]);

    // Columns cho bảng bài tập
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
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
                return <Tag color={colors[type] || 'blue'}>{type || 'Đề thi'}</Tag>;
            }
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'total',
            width: 120,
            align: 'center',
            render: (total) => <Tag color="processing">{total || 0} câu</Tag>
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
                            message.info(`Chỉnh sửa: ${record.name || record.title}`);
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

    // Columns cho bảng câu hỏi
    const questionColumns = [
        {
            title: '#',
            dataIndex: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'cauHoi',
            flex: 1,
            render: (text) => (
                <Text ellipsis={{ tooltip: text }}>
                    {text || 'Không có nội dung'}
                </Text>
            )
        },
        {
            title: 'Khối lớp',
            dataIndex: 'khoiLop',
            width: 100,
            render: (khoiLop) => <Tag color="blue">{khoiLop || 'N/A'}</Tag>
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            width: 100,
            render: (unit) => <Tag color="green">{unit || 'N/A'}</Tag>
        },
        {
            title: 'Kỹ năng',
            dataIndex: 'kyNang',
            width: 100,
            render: (kyNang) => <Tag color="orange">{kyNang || 'N/A'}</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            message.info(`Chỉnh sửa câu hỏi: ${record.cauHoi?.substring(0, 20)}...`);
                        }}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            showDeleteQuestionConfirm(record);
                        }}
                    />
                </Space>
            )
        }
    ];

    // Tìm folder trong tree
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

    // Tìm parent key của folder
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

    // Xử lý chọn folder
    const handleTreeSelect = async (selectedKeys, info) => {
        const folderId = selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : null;
        setSelectedKeys(selectedKeys);
        setSelectedFolderId(folderId);

        // Tự động mở rộng folder cha
        if (folderId) {
            const parentKey = findParentKey(treeData, folderId);
            if (parentKey) {
                setExpandedKeys(prev => [...new Set([...prev, parentKey])]);
            }
        }

        if (info.node?.title) {
            message.info(`Đã chọn: ${info.node.title}`);
        }

        await loadTests(folderId);
        await loadQuestions(folderId);
    };

    // Xử lý mở rộng/thu gọn folder
    const handleTreeExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
    };

    // Xử lý click ra ngoài để bỏ chọn folder
    const handleClickOutside = useCallback((e) => {
        // Không auto clear khi đang mở modal
        if (folderModalOpen || createTestModalOpen || autoTestModalOpen) return;

        const treeElement = document.querySelector('.ant-tree');
        const modalElement = e.target.closest('.ant-modal') || document.querySelector('.ant-modal');
        const drawerElement = e.target.closest('.ant-drawer') || document.querySelector('.ant-drawer');
        const buttonElement = e.target.closest('.ant-btn');

        if (buttonElement) return;

        if (treeElement && !treeElement.contains(e.target) &&
            !modalElement?.contains(e.target) &&
            !drawerElement?.contains(e.target)) {
            setSelectedKeys([]);
            setSelectedFolderId(null);
            setTableData([]);
        }
    }, [folderModalOpen, createTestModalOpen, autoTestModalOpen]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);

    // Folder handlers
    const handleAddFolder = () => {
        setEditingFolder(null);
        const defaultParent = selectedKeys.length > 0 ? selectedKeys[0] : null;

        if (defaultParent) {
            const folder = findFolder(treeData, defaultParent);
            if (folder) {
                message.info(`Sẽ tạo thư mục con bên trong "${folder.title}"`);
            }
        }

        setFolderModalOpen(true);
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
                order: folder.order || 1,
                color: folder.color || '#2E3A59',
                createdAt: folder.createdAt || '18/03/2025',
                updatedAt: folder.updatedAt || '18/03/2025'
            });
            setFolderModalOpen(true);
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
            onOk: async () => {
                try {
                    await deleteFolder(folder?.key || folder?._id);
                    message.success(`Đã xóa thư mục "${folder?.title}" thành công`);
                    setSelectedKeys([]);
                    setSelectedFolderId(null);
                    await loadLibraryData();
                } catch (err) {
                    console.error('deleteFolder error', err);
                    message.error('Xóa thư mục thất bại');
                }
            },
        });
    };

    // pages/MyLibrary.jsx - Sửa handleFolderSubmit

    const handleFolderSubmit = async (values) => {
        setLoading(true);
        try {
            const folderData = {
                name: values.name,
                title: values.name,
                parentId: values.parent || null, // parent là ID của folder cha
                color: values.color || '#2E3A59',
                order: values.order || 1
            };

            console.log('Sending to API:', folderData);

            let response;
            if (editingFolder?.id) {
                response = await updateFolder(editingFolder.id, folderData);
                message.success(`Đã cập nhật thư mục "${values.name}" thành công!`);
            } else {
                response = await createFolder(folderData);
                message.success(`Đã tạo thư mục "${values.name}" thành công!`);
            }

            setFolderModalOpen(false);
            setEditingFolder(null);

            // Load lại dữ liệu
            await loadLibraryData();

            // Mở rộng thư mục cha nếu có
            if (values.parent) {
                setExpandedKeys(prev => [...new Set([...prev, values.parent])]);

                // Nếu đang tạo thư mục con, tự động chọn folder cha để hiển thị
                if (!editingFolder) {
                    setSelectedKeys([values.parent]);
                    setSelectedFolderId(values.parent);
                }
            }

            console.log('Folder created/updated:', response);
        } catch (err) {
            console.error('handleFolderSubmit error:', err);
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };
    // Test handlers
    const handleCreateTest = () => {
        if (!selectedKeys.length) {
            message.warning('Vui lòng chọn một thư mục để thêm bài tập');
            return;
        }
        setCreateTestModalOpen(true);
    };

    const handleCreateAutoTest = () => {
        if (!selectedKeys.length) {
            message.warning('Vui lòng chọn một thư mục để thêm bài tập');
            return;
        }
        const selectedFolder = findFolder(treeData, selectedKeys[0]);
        if (selectedFolder) {
            const parentKey = findParentKey(treeData, selectedKeys[0]);
            const parentFolder = parentKey ? findFolder(treeData, parentKey) : null;
            setSelectedFolderForAutoTest({
                folder: selectedFolder,
                parent: parentFolder
            });
        }
        setAutoTestModalOpen(true);
    };

    const handleTestSubmit = async (data) => {
        try {
            const testData = {
                name: data.testName || 'Tên đề',
                type: 'Đề thi',
                total: data.selectedQuestions?.length || 0,
                starred: false,
                folderId: selectedKeys[0] || null,
                questions: (data.selectedQuestions || []).map(q => q.id)
            };

            await createTest(testData);
            message.success('Đã tạo đề kiểm tra thành công!');
            setCreateTestModalOpen(false);
            await loadLibraryData();
        } catch (err) {
            console.error('handleTestSubmit error', err);
            message.error('Tạo đề kiểm tra thất bại');
        }
    };

    const handleAutoTestSubmit = async (data) => {
        try {
            // Fetch all questions from question bank
            const questionsRes = await fetchQuestions({ limit: 10000 });
            const allQuestions = questionsRes.questions || [];

            let selectedQuestions = [];
            let totalSelected = 0;

            // Process each row to select questions
            for (const row of data.rows || []) {
                // Filter questions by criteria
                let filtered = allQuestions.filter(q => {
                    return (!row.grade || q.khoiLop === row.grade) &&
                        (!row.unit || q.unit === row.unit) &&
                        (!row.skill || q.kyNang === row.skill) &&
                        (!row.questionType || q.loaiCauHoi === row.questionType) &&
                        (!row.difficulty || q.mucDoNhanThuc === row.difficulty);
                });

                // Shuffle and select the required count
                const shuffled = filtered.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, row.count || 0);

                selectedQuestions = selectedQuestions.concat(selected);
                totalSelected += selected.length;
            }

            if (totalSelected === 0) {
                message.error('Không tìm thấy đủ câu hỏi phù hợp với tiêu chí đã chọn');
                return;
            }

            const autoTestData = {
                name: data.testName || 'Đề tự động',
                type: data.testType || 'Đề thi',
                total: totalSelected,
                starred: false,
                folderId: selectedKeys[0] || null,
                questions: selectedQuestions.map(q => q._id)
            };

            await createTest(autoTestData);
            message.success(`Đã tạo đề tự động thành công với ${totalSelected} câu hỏi!`);
            setAutoTestModalOpen(false);
            await loadLibraryData();
        } catch (err) {
            console.error('handleAutoTestSubmit error', err);
            message.error('Tạo đề tự động thất bại');
        }
    };

    const showDeleteConfirm = (record) => {
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
                    await loadLibraryData();
                } catch (err) {
                    console.error('deleteTest error', err);
                    message.error('Xóa bài tập thất bại');
                }
            },
        });
    };

    const showDeleteQuestionConfirm = (record) => {
        confirm({
            title: 'Xác nhận xóa câu hỏi',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa câu hỏi "${record.cauHoi?.substring(0, 50)}..."?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    // Assuming deleteQuestion is imported
                    // await deleteQuestion(record._id);
                    message.success('Đã xóa câu hỏi thành công');
                    await loadLibraryData();
                } catch (err) {
                    console.error('deleteQuestion error', err);
                    message.error('Xóa câu hỏi thất bại');
                }
            },
        });
    };

    // Refresh dữ liệu
    const handleRefresh = async () => {
        await loadLibraryData();
        message.success('Đã làm mới dữ liệu');
    };

    // Filter table data based on search
    const filteredData = tableData.filter(item =>
        (item.name || item.title || '').toLowerCase().includes(searchText.toLowerCase())
    );

    // pages/MyLibrary.jsx - Cập nhật phần Tree Actions

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
                                {selectedKeys.length > 0 ? 'Thêm thư mục con' : 'Thêm thư mục'}
                            </Button>
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={handleEditFolder}
                                disabled={selectedKeys.length === 0}
                            >
                                Sửa
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDeleteFolder}
                                disabled={selectedKeys.length === 0}
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
                        {loading && !treeData.length ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                <Spin size="small" />
                                <div style={{ marginTop: 8 }}>Đang tải...</div>
                            </div>
                        ) : (
                            <Tree
                                showIcon
                                icon={(props) => {
                                    let nodeColor = '#2E3A59';
                                    if (props.data && props.data[props.pos]) {
                                        nodeColor = props.data[props.pos].color || '#2E3A59';
                                    } else if (props.color) {
                                        nodeColor = props.color;
                                    }

                                    if (props.expanded) {
                                        return <FolderOpenOutlined style={{ color: nodeColor, fontSize: '16px' }} />;
                                    }
                                    return <FolderOutlined style={{ color: nodeColor, fontSize: '16px' }} />;
                                }}
                                switcherIcon={<FolderOpenOutlined />}
                                expandedKeys={expandedKeys}
                                selectedKeys={selectedKeys}
                                onSelect={handleTreeSelect}
                                onExpand={handleTreeExpand}
                                treeData={treeData}
                            />
                        )}
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
                                    disabled={!selectedKeys.length}
                                >
                                    Tạo đề kiểm tra
                                </Button>
                                <Button
                                    icon={<ThunderboltOutlined />}
                                    onClick={handleCreateAutoTest}
                                    disabled={!selectedKeys.length}
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
                            {!selectedKeys.length ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: '#999'
                                }}>
                                    <FolderOutlined style={{ fontSize: 48, marginBottom: 16, color: '#ddd' }} />
                                    <div>Vui lòng chọn một thư mục để xem bài tập</div>
                                </div>
                            ) : (
                                <Table
                                    columns={columns}
                                    dataSource={filteredData}
                                    loading={loading}
                                    pagination={{
                                        pageSize: 10,
                                        showTotal: (total) => `Tổng ${total} bài tập`
                                    }}
                                    scroll={{ x: 'max-content', y: isMobile ? 'auto' : 'calc(100vh - 480px)' }}
                                    bordered={false}
                                    size="middle"
                                    rowKey={(record) => record._id || record.key || Math.random()}
                                    locale={{ emptyText: 'Chưa có bài tập nào trong thư mục này' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        
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
                key={editingFolder?.id || 'new-folder'}
                open={folderModalOpen}
                onClose={() => {
                    setFolderModalOpen(false);
                    setEditingFolder(null);
                }}
                onSubmit={handleFolderSubmit}
                initialValues={editingFolder ? editingFolder : {
                    parent: selectedKeys.length > 0 ? selectedKeys[0] : null
                }}
                parentOptions={treeData.map(item => ({
                    value: item.key,
                    label: item.title
                }))}
            />

            <CreateTestModal
                open={createTestModalOpen}
                onClose={() => setCreateTestModalOpen(false)}
                onSubmit={handleTestSubmit}
            />

            <CreateAutoTestModal
                open={autoTestModalOpen}
                onClose={() => {
                    setAutoTestModalOpen(false);
                    setSelectedFolderForAutoTest(null);
                }}
                onSubmit={handleAutoTestSubmit}
                selectedFolder={selectedFolderForAutoTest}
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