import { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    Tabs,
    Space,
    Card,
    Tooltip
} from 'antd';
import FilterPanel from '../Components/FilterPanel';
import UsersTable from '../Components/UsersTable';
import HistoryTable from '../Components/HistoryTable';
import UserModal from '../Components/UserModal';
import DeleteModal from '../Components/DeleteModal';

// api helpers
import { fetchUsers, deleteUser, createUser, updateUser, fetchHistory } from '../api/users';
import {
    SearchOutlined,
    PlusOutlined,
    HomeOutlined,
    HistoryOutlined
} from '@ant-design/icons';



export function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        accountType: '',
        level: '',
        city: '',
        district: '',
        school: '',
        email: '',
        phone: '',
        status: 'active'
    });
    const [activeTab, setActiveTab] = useState('manage');
    const [historyLogs, setHistoryLogs] = useState([]);

    // Filter states
    const [filters, setFilters] = useState({
        accountType: undefined,
        level: undefined,
        city: undefined,
        district: undefined,
        school: '',
        email: '',
        phone: ''
    });

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    // fetch helper
    const loadUsers = async () => {
        try {
            const data = await fetchUsers(filters);
            setUsers(data);
        } catch (err) {
            console.error('failed to load users', err);
        }
    };

    const loadHistory = async () => {
        try {
            const data = await fetchHistory();
            setHistoryLogs(data);
        } catch (err) {
            console.error('failed to load history', err);
        }
    };

    // fetch on mount only
    useEffect(() => {
        (async () => {
            await loadUsers();
            await loadHistory();
        })();
        // we only want to load on mount; loadUsers uses current filters when called manually
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleDeleteConfirm = async () => {
        if (selectedUser) {
            try {
                await deleteUser(selectedUser._id || selectedUser.id);
                // reload list after deletion
                await loadUsers();
            } catch (err) {
                console.error('delete failed', err);
            }
            setDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleAddConfirm = async () => {
        if (!newUser.name) {
            alert('Vui lòng nhập họ và tên');
            return;
        }
        try {
            await createUser(newUser);
            setAddModalOpen(false);
            setNewUser({
                name: '',
                accountType: '',
                level: '',
                city: '',
                district: '',
                email: '',
                phone: '',
                status: 'active'
            });
            await loadUsers();
        } catch (err) {
            console.error('create failed', err);
        }
    };

    const handleEditConfirm = async () => {
        if (!editingUser.name) {
            alert('Vui lòng nhập họ và tên');
            return;
        }
        try {
            // use Mongo _id for update; code is only for display
            const id = editingUser._id || editingUser.id;
            await updateUser(id, editingUser);
            setEditModalOpen(false);
            setEditingUser(null);
            await loadUsers();
        } catch (err) {
            console.error('update failed', err);
        }
    };




    const tabItems = [
        {
            key: 'manage',
            label: 'Quản lý người dùng',
            children: (
                <div>
                    <FilterPanel filters={filters} setFilters={setFilters} onSearch={loadUsers} />

                    {/* Table */}
                    <UsersTable
                        users={users}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onEdit={(record) => {
                            setEditingUser(record);
                            setEditModalOpen(true);
                        }}
                        onDelete={handleDeleteClick}
                    />
                </div>
            ),
        },
        {
            key: 'history',
            label: (
                <span>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    Lịch sử thao tác
                </span>
            ),
            children: (
                <div style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Lịch sử thao tác</h2>
                    <HistoryTable logs={historyLogs} />
                </div>
            ),
        },
    ];

    return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
            {/* colored background extends down half the viewport */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '19vh',
                    background: 'linear-gradient(to right, #22D3EE, #06B6D4)',
                    zIndex: 0
                }}
            >
                <div style={{ padding: '16px 52px' }}>
                    <Space size={12}>
                        <HomeOutlined style={{ fontSize: 20, color: 'white' }} />
                        <h1
                            style={{ fontSize: 20, fontWeight: 600, margin: 0, color: 'white' }}
                        >
                            Administration
                        </h1>
                    </Space>
                </div>
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '81vh',
                    background: 'linear-gradient(to top, #22D3EE, #ebf4f6)',
                    zIndex: 0
                }}
            />

            <div style={{ position: 'relative', zIndex: 1, padding: '74px 22px' }}>
                <Card
                    variant="outlined"
                    style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                    styles={{ body: { padding: 0 } }}
                >
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        tabBarExtraContent={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                style={{
                                    backgroundColor: '#06B6D4',
                                    borderColor: '#06B6D4',
                                    marginRight: 16
                                }}
                                onClick={() => setAddModalOpen(true)}
                            >
                                Thêm người dùng
                            </Button>
                        }
                        style={{
                            padding: '16px 24px 0',
                        }}
                    />
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                visible={deleteModalOpen}
                userName={selectedUser?.name}
                onOk={handleDeleteConfirm}
                onCancel={() => setDeleteModalOpen(false)}
            />

            {/* Add User Modal */}
            <UserModal
                visible={addModalOpen}
                title="Thêm người dùng mới"
                user={newUser}
                setUser={setNewUser}
                onOk={handleAddConfirm}
                onCancel={() => setAddModalOpen(false)}
                okDisabled={!newUser.name}
            />

            {/* Edit User Modal */}
            <UserModal
                visible={editModalOpen}
                title="Sửa thông tin người dùng"
                user={editingUser || {}}
                setUser={setEditingUser}
                onOk={handleEditConfirm}
                onCancel={() => { setEditModalOpen(false); setEditingUser(null); }}
                okDisabled={!editingUser?.name}
            />
        </div>
    );
}

export default AdminDashboard;

