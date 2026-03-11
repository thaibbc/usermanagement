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
    Input,
    Form,
    message
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
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import {
    PersistQueryClientProvider
} from '@tanstack/react-query-persist-client';

// create a client with offline‑friendly defaults
const baseQueryClient = new QueryClient({
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
        // open dialog pre-filled for the selected account
        setPasswordUser(user);
        setNewPassword('');
        setPasswordModalOpen(true);
    };

    const passwordMutation = useMutation({
        mutationFn: ({ id, password }) => changePassword(id, password),
        onSuccess: () => {
            client.invalidateQueries('history');
        }
    });

    const handlePasswordConfirm = async () => {
        if (!passwordUser) return;
        try {
            await passwordMutation.mutateAsync({ id: passwordUser._id, password: newPassword });
            setPasswordModalOpen(false);
            message.success('Mật khẩu đã được cập nhật thành công.');
            // clear selection so modal resets next time
            setPasswordUser(null);
            setNewPassword('');
        } catch (err) {
            console.error('password change failed', err);
            message.error(err.message || 'Đổi mật khẩu thất bại');
        }
    };

    // useQueryClient hook must run before any handlers reference it
    const client = useQueryClient();

    const PAGE_SIZE = 10;

    const {
        data = { users: [], total: 0 },
        refetch: refetchUsers,
        isError: usersError
    } = useQuery({
        queryKey: ['users', filters, currentPage],
        queryFn: () => fetchUsers(filters, currentPage, PAGE_SIZE),
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

    // custom handler invoked by search button so we can display a notice when nothing matches
    const handleSearch = async () => {
        try {
            const res = await refetchUsers();
            // check result payload shape
            let fetched;
            if (res && res.data !== undefined) {
                fetched = res.data;
            } else {
                fetched = res;
            }
            let list = [];
            if (Array.isArray(fetched)) {
                list = fetched;
            } else if (fetched && typeof fetched === 'object') {
                list = fetched.users || [];
            }
            if (list.length === 0) {
                message.info('Không tìm thấy dữ liệu.');
            }
        } catch (err) {
            console.error('search error', err);
        }
    };


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
            client.setQueryData(['users', filters, currentPage], (old) => {
                if (!old) return { users: [created], total: 1 };
                if (Array.isArray(old)) {
                    return [created, ...old];
                }
                return { users: [created, ...(old.users || [])], total: (old.total || 0) + 1 };
            });
            // ensure the list query is refetched in case filters/page changed
            client.invalidateQueries(['users']);
            client.invalidateQueries('history');
        }
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, updates }) => updateUser(id, updates),
        onSuccess: () => {
            client.invalidateQueries(['users']);
            client.invalidateQueries('history');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            // ensure the list is up to date
            client.invalidateQueries(['users']);
            client.invalidateQueries('history');
            refetchUsers();
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
                refetchUsers();
                message.success('Người dùng đã được xóa.');
            } catch (err) {
                console.error('delete failed', err);
                // if user was already removed on the server, just refresh and close modal
                if (err.message && err.message.toLowerCase().includes('not found')) {
                    client.invalidateQueries(['users']);
                    refetchUsers();
                    setDeleteModalOpen(false);
                    setSelectedUser(null);
                    return;
                }
                message.error(err.message || 'Không thể xóa người dùng');
            }
        }
    };

    const handleAddConfirm = async (data) => {
        // data has been validated by the form
        try {
            await createMutation.mutateAsync(data);
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
            setCurrentPage(1);
            // refresh list so the new row appears (mutation onSuccess also invalidates)
            refetchUsers();
            message.success('Tài khoản đã được tạo thành công.');
        } catch (err) {
            console.error('create failed', err);
            message.error(err.message || 'Không thể tạo người dùng');
        }
    };

    const handleEditConfirm = async (data) => {
        try {
            const id = editingUser._id || editingUser.id;
            await updateMutation.mutateAsync({ id, updates: data });
            setEditModalOpen(false);
            setEditingUser(null);
            message.success('Thông tin người dùng đã được cập nhật.');
        } catch (err) {
            console.error('update failed', err);
            message.error(err.message || 'Cập nhật thất bại');
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

                    {/* when user clicks search we call our wrapper so we can show a message if no results */}
                    <FilterPanel filters={filters} setFilters={handleSetFilters} onSearch={handleSearch} />

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
                okDisabled={createMutation.isLoading}
                submitting={createMutation.isLoading}
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
                okDisabled={updateMutation.isLoading}
                submitting={updateMutation.isLoading}
                mask={false}
            />

            {/* change password modal */}
            <Modal
                title={`Đổi mật khẩu cho ${passwordUser?.name || ''}`}
                open={passwordModalOpen}
                onOk={handlePasswordConfirm}
                onCancel={() => setPasswordModalOpen(false)}
                okButtonProps={{ disabled: !newPassword || passwordMutation.isLoading, loading: passwordMutation.isLoading }}
                mask={false}
            >
                {/* show a bit of account info */}
                {passwordUser && (
                    <div style={{ marginBottom: 12, fontSize: 13 }}>
                        <div><strong>Email:</strong> {passwordUser.email}</div>
                        <div><strong>Mã:</strong> {passwordUser.code}</div>
                    </div>
                )}
                <Form
                    layout="inline"
                    onFinish={handlePasswordConfirm}
                    style={{ width: '100%' }}
                >
                    <Form.Item
                        style={{ flex: 1, marginBottom: 0 }}
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                    >
                        <Input.Password
                            placeholder="Mật khẩu mới"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                            onClick={() => {
                                const random = Math.random().toString(36).slice(-8);
                                setNewPassword(random);
                            }}
                        >
                            Pass ngẫu nhiên
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default function WrappedAdminDashboard() {
    return (
        <PersistQueryClientProvider
            client={baseQueryClient}
            persistOptions={{
                persister: localStoragePersistor,
                maxAge: 1000 * 60 * 60 * 24,
            }}
        >
            <AdminDashboard />
        </PersistQueryClientProvider>
    );
}

