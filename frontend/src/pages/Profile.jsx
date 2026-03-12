import { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Input, Form, Select, DatePicker, Badge, Modal, message, Dropdown, Spin } from 'antd';
import { getUser, updateUser, changePassword } from '../api/users';
import { useQueryClient } from '@tanstack/react-query';
import {
    HomeOutlined,
    BookOutlined,
    UserOutlined,
    LockOutlined,
    SettingOutlined,
    BellOutlined,
    FileTextOutlined,
    TeamOutlined,
    CustomerServiceOutlined,
    MenuOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CameraOutlined,
    LogoutOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';

// use a public placeholder banner image instead of figma asset
const profileBanner = 'https://via.placeholder.com/1200x300.png?text=Profile+Banner';

const { Option } = Select;

export function Profile() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [collapsed, setCollapsed] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    // password visibility no longer needed
    // const [showNewPassword, setShowNewPassword] = useState(false);
    // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [fileInputRef, setFileInputRef] = useState(null);

    // User data from login (stored in localStorage)
    const stored = typeof window !== 'undefined' && localStorage.getItem('user');
    const loginUser = useMemo(() => {
        if (stored) {
            try { return JSON.parse(stored); } catch { return null; }
        }
        return null;
    }, [stored]);
    const initialUser = useMemo(() => {
        if (stored) {
            try { return JSON.parse(stored); } catch { return null; }
        }
        return {
            email: 'testitdn@gmail.com',
            fullName: 'Testbank',
            firstName: 'Admin',
            gender: 'Nữ',
            dateOfBirth: '03/07/2024',
            school: 'ABC',
            grade: 'Giáo viên Cấp 1',
            phone: '',
            friends: 22,
            photos: 10,
            comments: 89
        };
    }, [stored]);
    const [userData, setUserData] = useState(initialUser);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const queryClient = useQueryClient();

    const handleUpdate = async (values) => {
        console.log('Update values:', values);
        if (!loginUser || !loginUser.id && !loginUser._id) {
            message.error('Không thể xác định người dùng để cập nhật');
            return;
        }
        const id = loginUser.id || loginUser._id;
        try {
            const updated = await updateUser(id, {
                name: values.fullName,
                email: values.email,
                phone: values.phone,
                gender: values.gender,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('DD/MM/YYYY') : undefined,
                school: values.school,
                grade: values.grade,
                city: values.city,
                district: values.district
            });
            setUserData(updated);
            localStorage.setItem('user', JSON.stringify(updated));
            // make sure any cached user lists reflect the change
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries('history');
            message.success('Thông tin đã được cập nhật.');
        } catch (err) {
            console.error('update failed', err);
            message.error(err.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    // fetch full profile once for the current login user id
    const fetchedIdRef = useRef(null);
    useEffect(() => {
        async function load() {
            const id = loginUser && (loginUser.id || loginUser._id);
            if (id && id !== fetchedIdRef.current) {
                fetchedIdRef.current = id;
                setLoadingProfile(true);
                try {
                    console.log('fetching full profile for', id);
                    const full = await getUser(id);
                    console.log('profile payload', full);
                    setUserData(full);
                    localStorage.setItem('user', JSON.stringify(full));
                } catch (err) {
                    console.error('failed to load profile', err);
                } finally {
                    setLoadingProfile(false);
                }
            }
        }
        load();
    }, [loginUser]);

    // whenever userData changes (after fetch) update form fields
    useEffect(() => {
        if (userData) {
            form.setFieldsValue({
                email: userData.email,
                phone: userData.phone,
                fullName: userData.name || userData.fullName || '',
                firstName: (userData.name || userData.fullName || '').split(' ').slice(-1)[0] || '',
                gender: userData.gender,
                dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : undefined,
                school: userData.school,
                grade: userData.grade,
                city: userData.city,
                district: userData.district
            });
        }
    }, [userData, form]);

    const handleChangePassword = () => {
        setIsPasswordModalVisible(true);
    };

    const handlePasswordModalOk = () => {
        passwordForm.validateFields().then(async values => {
            console.log('Password values:', values);
            if (!loginUser || (!loginUser.id && !loginUser._id)) {
                message.error('Không thể xác định người dùng');
                return;
            }
            const id = loginUser.id || loginUser._id;
            try {
                await changePassword(id, values.newPassword);
                message.success('Đổi mật khẩu thành công!');
                setIsPasswordModalVisible(false);
                passwordForm.resetFields();
            } catch (err) {
                console.error('password change failed', err);
                message.error(err.message || 'Đổi mật khẩu thất bại');
            }
        }).catch(errorInfo => {
            console.log('Password validation failed:', errorInfo);
        });
    };

    const handlePasswordModalCancel = () => {
        setIsPasswordModalVisible(false);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        if (fileInputRef) {
            fileInputRef.click();
        }
    };

    const handleLogout = () => {
        // clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        message.success('Đã đăng xuất!');
        navigate('/login');
    };

    // Dropdown menu items
    const menuItems = [
        {
            key: 'header',
            label: (
                <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#333',
                    padding: '8px 12px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #E8E8E8',
                    marginBottom: 4
                }}>
                    TÀI KHOẢN HỌC SINH
                </div>
            ),
            disabled: true
        },
        {
            key: 'account',
            icon: <UserOutlined style={{ fontSize: 16 }} />,
            label: 'Tài khoản',
            onClick: () => {
                console.log('Navigate to account');
            }
        },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ fontSize: 16 }} />,
            label: 'Thoát',
            onClick: handleLogout
        }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
            {/* Sidebar */}
            <div style={{
                width: collapsed ? 60 : 240,
                backgroundColor: '#00BCD4',
                color: 'white',
                transition: 'width 0.3s',
                position: 'relative',
                minHeight: '100vh',
                zIndex: 2 /* keep above header */
            }}>
                {/* Toggle Button */}
                <div style={{
                    padding: 16,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                }}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <MenuOutlined style={{ fontSize: 20 }} />
                </div>

                {/* Menu Items */}
                <div style={{ padding: '16px 0' }}>
                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                        onClick={() => navigate('/profile')}
                    >
                        <HomeOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Sách số</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <BookOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Thư viện</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <UserOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Người dùng</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <FileTextOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Bài viết</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <BellOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Thông báo</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <TeamOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Nhóm</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <CustomerServiceOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Hỗ trợ</span>}
                    </div>

                    <div style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <SettingOutlined style={{ fontSize: 18 }} />
                        {!collapsed && <span>Cài đặt</span>}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#00BCD4',
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    color: 'white',
                    position: 'absolute',
                    top: 0,
                    left: collapsed ? 60 : 240,
                    right: 0,
                    zIndex: 10
                }}>
                    {/* Left - Logo/Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HomeOutlined style={{ fontSize: 18 }} />
                        <span style={{ fontSize: 15, fontWeight: 500 }}>Sách số</span>
                    </div>

                    {/* Right - Notifications and User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Notification Badge */}
                        <Badge count="99+" style={{ backgroundColor: '#FF4D4F' }}>
                            <BellOutlined style={{ fontSize: 20, color: 'white' }} />
                        </Badge>

                        {/* User Avatar and Name */}
                        <Dropdown
                            menu={{ items: menuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                            getPopupContainer={() => document.body} // avoid clipping by header overflow
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    border: '2px solid white'
                                }}>
                                    <UserOutlined />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{userData.fullName || userData.name || 'Người dùng'}</span>
                            </div>
                        </Dropdown>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 40, position: 'relative', zIndex: 0, paddingTop: 90 }}>
                    {loadingProfile && <Spin tip="Đang tải..." />}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 30 }}>
                        {/* Left - Profile Form */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: 8,
                            padding: 40,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>

                            <h2 style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: '#333',
                                marginTop: 0,
                                marginBottom: 32,
                                textTransform: 'uppercase'
                            }}>
                                TRANG CÁ NHÂN
                            </h2>

                            <h3 style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#999',
                                marginTop: 0,
                                marginBottom: 24,
                                textTransform: 'uppercase'
                            }}>
                                THÔNG TIN NGƯỜI DÙNG
                            </h3>

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleUpdate}
                                initialValues={{
                                    email: userData.email,
                                    phone: userData.phone,
                                    fullName: userData.fullName,
                                    firstName: userData.firstName,
                                    gender: userData.gender,
                                    dateOfBirth: dayjs(userData.dateOfBirth, 'DD/MM/YYYY'),
                                    school: userData.school,
                                    grade: userData.grade
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Email (dùng để đăng nhập)</span>}
                                        name="email"
                                    >
                                        <Input
                                            size="large"
                                            disabled
                                            style={{
                                                borderRadius: 4,
                                                fontSize: 14,
                                                backgroundColor: '#F5F5F5'
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Số điện thoại</span>}
                                        name="phone"
                                    >
                                        <Input
                                            size="large"
                                            style={{
                                                borderRadius: 4,
                                                fontSize: 14
                                            }}
                                        />
                                    </Form.Item>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Họ và tên đệm</span>}
                                        name="fullName"
                                    >
                                        <Input
                                            size="large"
                                            style={{
                                                borderRadius: 4,
                                                fontSize: 14
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Tên</span>}
                                        name="firstName"
                                    >
                                        <Input
                                            size="large"
                                            style={{
                                                borderRadius: 4,
                                                fontSize: 14
                                            }}
                                        />
                                    </Form.Item>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Giới tính</span>}
                                        name="gender"
                                    >
                                        <Select
                                            size="large"
                                            style={{ fontSize: 14 }}
                                        >
                                            <Option value="Nam">Nam</Option>
                                            <Option value="Nữ">Nữ</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Ngày sinh</span>}
                                        name="dateOfBirth"
                                    >
                                        <DatePicker
                                            size="large"
                                            format="DD/MM/YYYY"
                                            style={{
                                                width: '100%',
                                                borderRadius: 4,
                                                fontSize: 14
                                            }}
                                        />
                                    </Form.Item>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Trường học</span>}
                                        name="school"
                                    >
                                        <Input
                                            size="large"
                                            style={{
                                                borderRadius: 4,
                                                fontSize: 14
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span style={{ fontSize: 13, color: '#666' }}>Cấp dạy</span>}
                                        name="grade"
                                    >
                                        <Select
                                            size="large"
                                            style={{ fontSize: 14 }}
                                        >
                                            <Option value="Giáo viên Cấp 1">Giáo viên Cấp 1</Option>
                                            <Option value="Giáo viên Cấp 2">Giáo viên Cấp 2</Option>
                                            <Option value="Giáo viên Cấp 3">Giáo viên Cấp 3</Option>
                                        </Select>
                                    </Form.Item>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        style={{
                                            backgroundColor: '#1890FF',
                                            borderColor: '#1890FF',
                                            height: 40,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            paddingLeft: 24,
                                            paddingRight: 24,
                                            borderRadius: 4
                                        }}
                                    >
                                        <EditOutlined /> Cập nhật
                                    </Button>
                                    <Button
                                        onClick={handleChangePassword}
                                        style={{
                                            backgroundColor: '#1890FF',
                                            borderColor: '#1890FF',
                                            color: 'white',
                                            height: 40,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            paddingLeft: 24,
                                            paddingRight: 24,
                                            borderRadius: 4
                                        }}
                                    >
                                        <LockOutlined /> Đổi mật khẩu
                                    </Button>
                                </div>
                            </Form>
                        </div>

                        {/* Right - Profile Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: 8,
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            height: 'fit-content'
                        }}>
                            {/* Banner */}
                            <div style={{
                                height: 200,
                                background: `url(${profileBanner}) center/cover`,
                                position: 'relative'
                            }}>
                                {/* Avatar Container */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: -50,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 120,
                                    height: 120
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        border: '4px solid white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 80,
                                        overflow: 'hidden'
                                    }}>
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <UserOutlined style={{ fontSize: 80, color: '#ccc' }} />
                                        )}
                                    </div>

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        ref={ref => setFileInputRef(ref)}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />

                                    {/* Camera Icon Button */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 5,
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            backgroundColor: '#1890FF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            border: '3px solid white',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                            transition: 'all 0.3s'
                                        }}
                                        onClick={handleAvatarClick}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#40a9ff';
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1890FF';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <CameraOutlined style={{ color: 'white', fontSize: 18 }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ paddingTop: 70, paddingBottom: 30, textAlign: 'center' }}>
                                {/* Stats */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    padding: '0 30px',
                                    marginBottom: 20
                                }}>
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{userData.friends}</div>
                                        <div style={{ fontSize: 12, color: '#999' }}>Friends</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{userData.photos}</div>
                                        <div style={{ fontSize: 12, color: '#999' }}>Photos</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>{userData.comments}</div>
                                        <div style={{ fontSize: 12, color: '#999' }}>Comments</div>
                                    </div>
                                </div>

                                {/* Name */}
                                <h3 style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: '#333',
                                    marginTop: 20,
                                    marginBottom: 8
                                }}>
                                    {userData.fullName} {userData.firstName}
                                </h3>

                                {/* Email */}
                                <div style={{
                                    fontSize: 13,
                                    color: '#999',
                                    marginBottom: 20
                                }}>
                                    {userData.email}
                                </div>

                                {/* Role Badge */}
                                <div style={{
                                    display: 'inline-block',
                                    backgroundColor: '#F0F0F0',
                                    color: '#666',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    padding: '6px 20px',
                                    borderRadius: 4,
                                    letterSpacing: 1
                                }}>
                                    {userData.accountType ? userData.accountType.toUpperCase() : 'USER'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            <Modal
                title={<span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>ĐỔI MẬT KHẨU</span>}
                open={isPasswordModalVisible}
                onOk={handlePasswordModalOk}
                onCancel={handlePasswordModalCancel}
                okText="Cập nhật"
                cancelText="Hủy"
                mask={{ closable: false }}
                width={500}
                okButtonProps={{
                    style: {
                        backgroundColor: '#1890FF',
                        borderColor: '#1890FF',
                        fontWeight: 600
                    }
                }}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        label={
                            <span style={{ fontSize: 13, color: '#666' }}>
                                <span style={{ color: 'red' }}>* </span>Mật khẩu mới
                            </span>
                        }
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            size="large"
                            style={{
                                borderRadius: 4,
                                fontSize: 14
                            }}
                            iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontSize: 13, color: '#666' }}>
                                <span style={{ color: 'red' }}>* </span>Xác nhận khẩu mới
                            </span>
                        }
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                }
                            })
                        ]}
                    >
                        <Input.Password
                            size="large"
                            style={{
                                borderRadius: 4,
                                fontSize: 14
                            }}
                            iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
export default Profile;