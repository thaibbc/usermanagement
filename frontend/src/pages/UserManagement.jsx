import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Modal,
    Tabs,
    Space,
    Card,
    Tooltip,
    Alert,
    Input
} from 'antd';
import FilterPanel from '../Components/FilterPanel';
import UsersTable from '../Components/UsersTable';
import HistoryTable from '../Components/HistoryTable';
import UserModal from '../Components/UserModal';
import DeleteModal from '../Components/DeleteModal';

// api helpers
import { fetchUsers, deleteUser, createUser, updateUser, fetchHistory, changePassword } from '../api/users';
import {
    SearchOutlined,
    PlusOutlined,
    HomeOutlined,
    HistoryOutlined
} from '@ant-design/icons';

// react-query (now @tanstack/react-query) with persistence
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import {
    PersistQueryClientProvider
} from '@tanstack/react-query-persist-client';

// create a client with offline‑friendly defaults
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 1000 * 60 * 60, // keep data fresh for 1h
            cacheTime: 1000 * 60 * 60 * 24, // keep in cache for a day
        }
    }
});

// persist cache to localStorage so it survives reloads/offline
const LOCAL_STORAGE_KEY = 'react_query_cache';
const localStoragePersistor = {
    persistClient: async (client) => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(client));
        } catch {
            // ignore storage write errors (quota, private mode)
        }
    },
    restoreClient: async () => {
        try {
            const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : undefined;
        } catch {
            // parsing or access error; treat as empty cache
            return undefined;
        }
    },
    removeClient: async () => {
        try {
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {
            // ignore removal errors
        }
    }
};
// persistence will be handled by the provider below


// stable empty filter object reused across renders
const INITIAL_FILTERS = {
    accountType: undefined,
    level: undefined,
    city: undefined,
    district: undefined,
    school: '',
    email: '',
    phone: ''
};

export function AdminDashboard() {
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
    // password change
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordUser, setPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    // determine tab based on current route
    const activeTab = location.pathname === '/history' ? 'history' : 'manage';

    // Filter states
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // wrapped so we can also reset the page when filters change
    const handleSetFilters = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handlePasswordClick = (user) => {
        console.log('opening password dialog for', user);
        // open dialog pre-filled for the selected account
        setPasswordUser(user);
        setNewPassword('');
        setPasswordModalOpen(true);
    };

    const handlePasswordConfirm = async () => {
        if (!passwordUser) return;
        try {
            await changePassword(passwordUser._id, newPassword);
            setPasswordModalOpen(false);
            Modal.success({
                title: 'Thành công',
                content: `Mật khẩu mới đã được gửi tới ${passwordUser.email || ''}`,
            });
            // refresh history log
            queryClient.invalidateQueries('history');
            // clear selection so modal resets next time
            setPasswordUser(null);
            setNewPassword('');
        } catch (err) {
            console.error('password change failed', err);
            Alert.error('Đổi mật khẩu thất bại');
        }
    };

    const queryClient = useQueryClient();

    const PAGE_SIZE = 10;

    const {
        data = { users: [], total: 0 },
        refetch: refetchUsers,
        isError: usersError
    } = useQuery({
        queryKey: ['users', filters, currentPage],
        queryFn: () => {
            console.log('fetching users with', filters, currentPage);
            return fetchUsers(filters, currentPage, PAGE_SIZE);
        },
        keepPreviousData: true,
        onError: (err) => console.error('users query error', err)
    });
    // react-query v5 may return the raw response; support both new and old shapes
    let users = [];
    let totalUsers = 0;
    if (data) {
        if (Array.isArray(data)) {
            users = data;
        } else {
            users = data.users || [];
            totalUsers = data.total || 0;
        }
    }


    const [historyPage, setHistoryPage] = useState(1);

    const {
        data: historyData = { logs: [], total: 0 },
        isError: historyError
    } = useQuery({
        queryKey: ['history', historyPage],
        queryFn: () => fetchHistory(historyPage, PAGE_SIZE),
        // polling removed; we will invalidate manually when actions occur
    });
    const historyLogs = historyData.logs || [];
    const historyTotal = historyData.total || 0;

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (created) => {
            // add the new user to cache for current filters/page to avoid blank state
            queryClient.setQueryData(['users', filters, currentPage], (old) => {
                if (!old) return { users: [created], total: 1 };
                if (Array.isArray(old)) {
                    return [created, ...old];
                }
                return { users: [created, ...(old.users || [])], total: (old.total || 0) + 1 };
            });
            queryClient.invalidateQueries('history');
        }
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => updateUser(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries('history');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries('history');
        }
    });

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedUser) {
            try {
                await deleteMutation.mutateAsync(selectedUser._id || selectedUser.id);
                setDeleteModalOpen(false);
                setSelectedUser(null);
            } catch (err) {
                console.error('delete failed', err);
            }
        }
    };

    const handleAddConfirm = async () => {
        if (!newUser.name) {
            alert('Vui lòng nhập họ và tên');
            return;
        }
        if (!newUser.email) {
            alert('Vui lòng nhập email');
            return;
        }
        // ensure users is really an array before calling .some
        if (Array.isArray(users)) {
            if (users.some(u => u.email === newUser.email)) {
                alert('Email đã tồn tại trong danh sách');
                return;
            }
        } else if (users) {
            // unexpected shape, log for debugging
            console.warn('unexpected users value when adding', users);
        }
        try {
            await createMutation.mutateAsync(newUser);
            setAddModalOpen(false);
            setNewUser({
                name: '',
                accountType: '',
                level: '',
                city: '',
                district: '',
                school: '',
                email: '',
                phone: '',
                status: 'active',
                password: ''
            });
            // reset filters/page to ensure result appears
            setCurrentPage(1);
            // show success message
            Modal.success({
                title: 'Thành công',
                content: 'Tài khoản đã được tạo và thông tin đăng nhập đã được gửi qua email.',
            });
        } catch (err) {
            console.error('create failed', err);
            alert(err.message || 'Failed to create user');
        }
    };

    const handleEditConfirm = async () => {
        if (!editingUser.name) {
            alert('Vui lòng nhập họ và tên');
            return;
        }
        try {
            const id = editingUser._id || editingUser.id;
            await updateMutation.mutateAsync({ id, updates: editingUser });
            setEditModalOpen(false);
            setEditingUser(null);
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
                    {usersError && (
                        <div style={{ marginBottom: 16 }}>
                            <Alert
                                type="warning"
                                message="Không thể tải dữ liệu người dùng - đang hiển thị dữ liệu đã lưu"
                            />
                        </div>
                    )}

                    <FilterPanel filters={filters} setFilters={handleSetFilters} onSearch={refetchUsers} />

                    {/* Table */}
                    <UsersTable
                        users={Array.isArray(users) ? users : []}
                        total={totalUsers}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onEdit={(record) => {
                            setEditingUser(record);
                            setEditModalOpen(true);
                        }}
                        onDelete={handleDeleteClick}
                        onChangePassword={handlePasswordClick}
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
                    {historyError && (
                        <div style={{ marginBottom: 16 }}>
                            <Alert
                                type="warning"
                                message="Không thể tải lịch sử - đang hiển thị dữ liệu đã lưu"
                            />
                        </div>
                    )}
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Lịch sử thao tác</h2>
                    <HistoryTable
                        logs={historyLogs}
                        total={historyTotal}
                        currentPage={historyPage}
                        setCurrentPage={setHistoryPage}
                    />
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
                        onChange={(key) => navigate(key === 'history' ? '/history' : '/')}
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
                mask={false}
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
                mask={false}
            />

            {/* change password modal */}
            <Modal
                title={`Đổi mật khẩu cho ${passwordUser?.name || ''}`}
                open={passwordModalOpen}
                onOk={handlePasswordConfirm}
                onCancel={() => setPasswordModalOpen(false)}
                okButtonProps={{ disabled: !newPassword }}
                mask={false}
            >
                {/* show a bit of account info */}
                {passwordUser && (
                    <div style={{ marginBottom: 12, fontSize: 13 }}>
                        <div><strong>Email:</strong> {passwordUser.email}</div>
                        <div><strong>Mã:</strong> {passwordUser.code}</div>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Input.Password
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <Button
                        onClick={() => {
                            const random = Math.random().toString(36).slice(-8);
                            setNewPassword(random);
                        }}
                    >
                        Pass ngẫu nhiên
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default function WrappedAdminDashboard() {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: localStoragePersistor,
                maxAge: 1000 * 60 * 60 * 24,
            }}
        >
            <AdminDashboard />
        </PersistQueryClientProvider>
    );
}

