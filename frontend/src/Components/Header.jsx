import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import { Dropdown, Drawer, Badge, Spin, Empty } from "antd";
import {
    BellOutlined, UserOutlined, LogoutOutlined, MenuOutlined,
    HomeOutlined, BookOutlined, SwitcherOutlined,
    FileTextOutlined, TeamOutlined, CustomerServiceOutlined, SettingOutlined,
    QuestionCircleOutlined, BankOutlined, CheckOutlined, ProfileOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

import { UserContext } from "../context/UserContext";
import { getUserNotifications, markNotificationAsRead } from "../api/classes";

function Header({ onMenuClick, sidebarCollapsed }) {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    // Sử dụng state để theo dõi kích thước màn hình thực tế
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    const isDesktop = windowWidth >= 1024;
    // Chỉ hiển thị nút menu trên mobile và tablet (dưới 1024px)
    const showMenuButton = isMobile || isTablet;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const pollingRef = useRef(null);

    // Load notifications: gọi API /notifications/me một lần duy nhất (hiệu quả)
    const loadNotifications = useCallback(async () => {
        if (!user) return;
        setNotificationLoading(true);
        try {
            const data = await getUserNotifications(20);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount ?? 0);
        } catch (error) {
            // Không throw để tránh làm crash app
            console.warn('Could not load notifications:', error);
        } finally {
            setNotificationLoading(false);
        }
    }, [user]);

    // Theo dõi resize window
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load notifications khi user thay đổi + polling 15 giây
    useEffect(() => {
        if (!user) return;

        loadNotifications();

        // Polling mọi 15 giây
        pollingRef.current = setInterval(loadNotifications, 15000);
        return () => clearInterval(pollingRef.current);
    }, [user, loadNotifications]);

    // Lắng nghe khi user quay lại tab (Page Visibility API)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                loadNotifications();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, loadNotifications]);

    // Lắng nghe khi window được focus lại (Alt+Tab, click từ phần mềm khác)
    useEffect(() => {
        const handleFocus = () => { if (user) loadNotifications(); };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user, loadNotifications]);

    // Lắng nghe event khi giáo viên tạo bài tập/thông báo → cập nhật badge ngay lập tức
    useEffect(() => {
        const handleNewNotification = () => loadNotifications();
        window.addEventListener('notificationCreated', handleNewNotification);
        return () => window.removeEventListener('notificationCreated', handleNewNotification);
    }, [loadNotifications]);

    const isAdmin = user?.accountType === 'admin';
    const isTeacher = user?.accountType === 'teacher';

    // Menu items cho tất cả user
    const commonDrawerItems = [
        {
            icon: <HomeOutlined style={{ fontSize: 18 }} />,
            label: 'Trang chủ',
            path: '/dashboard'
        },
        {
            icon: <BookOutlined style={{ fontSize: 18 }} />,
            label: 'Lớp học',
            path: '/student-class'
        },
        {
            icon: <FileTextOutlined style={{ fontSize: 18 }} />,
            label: 'Bài tập',
            path: '/assignments'
        },
        {
            icon: <TeamOutlined style={{ fontSize: 18 }} />,
            label: 'Phòng thi',
            path: '/exam-rooms'
        },
        {
            icon: <CheckOutlined style={{ fontSize: 18 }} />,
            label: 'Thư viện của tôi',
            path: '/my-library'
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: 18 }} />,
            label: 'Hỗ trợ',
            path: '/support'
        },
        {
            icon: <SettingOutlined style={{ fontSize: 18 }} />,
            label: 'Cài đặt',
            path: '/settings'
        }
    ];

    // Menu items cho giáo viên và admin (quản lý)
    const managementDrawerItems = [
        {
            icon: <ProfileOutlined style={{ fontSize: 18 }} />,
            label: 'Quản lý lớp học',
            path: '/classes'
        },
        {
            icon: <QuestionCircleOutlined style={{ fontSize: 18 }} />,
            label: 'Ngân hàng câu hỏi',
            path: '/question-bank'
        },
        {
            icon: <BankOutlined style={{ fontSize: 18 }} />,
            label: 'Quản lý ngân hàng',
            path: '/bank-management'
        }
    ];

    // Menu items chỉ cho admin
    const adminOnlyDrawerItems = [
        {
            icon: <SwitcherOutlined style={{ fontSize: 18 }} />,
            label: 'Quản lý người dùng',
            path: '/users'
        }
    ];

    // Xây dựng drawer items dựa trên role
    const drawerItems = [
        ...commonDrawerItems,
        // Thêm divider nếu có menu quản lý
        ...((isTeacher || isAdmin) ? [{ type: 'divider' }] : []),
        // Menu quản lý cho giáo viên và admin
        ...((isTeacher || isAdmin) ? managementDrawerItems : []),
        // Menu admin chỉ cho admin
        ...(isAdmin ? [{ type: 'divider' }, ...adminOnlyDrawerItems] : [])
    ];

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const headerMenu = [
        {
            key: 'profile',
            icon: <UserOutlined style={{ fontSize: 16 }} />,
            label: 'Hồ sơ',
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ fontSize: 16 }} />,
            label: 'Đăng xuất',
            onClick: handleLogout
        }
    ];

    const userName = user ? (user.name || user.email || "Người dùng") : "Sách Số";
    const userAvatar = user ? (user.avatar || user.avatarUrl || null) : null;

    const [headerName, setHeaderName] = useState(userName);
    const [headerNameKey, setHeaderNameKey] = useState(0);
    const [avatarCacheKey, setAvatarCacheKey] = useState(0);

    useEffect(() => {
        setHeaderName(userName);
        setHeaderNameKey(prev => prev + 1);
    }, [userName]);

    useEffect(() => {
        setAvatarCacheKey(Date.now());
    }, [userAvatar]);

    useEffect(() => {
        const onUserUpdated = () => {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const latestUser = JSON.parse(stored);
                    if (latestUser) {
                        setUser(latestUser);
                        setHeaderName(latestUser.name || latestUser.email || 'Người dùng');
                    }
                } catch (err) {
                    console.error('Failed to parse updated user', err);
                }
            }
            setAvatarCacheKey(Date.now());
        };

        window.addEventListener('userUpdated', onUserUpdated);
        return () => window.removeEventListener('userUpdated', onUserUpdated);
    }, [setUser]);

    const headerAvatarSrc = userAvatar ? (
        userAvatar.startsWith('data:')
            ? userAvatar
            : `${userAvatar}${userAvatar.includes('?') ? '&' : '?'}t=${avatarCacheKey}`
    ) : null;

    const handleMenuClick = () => {
        // Trên mobile và tablet, mở drawer
        if (showMenuButton) {
            setDrawerOpen(true);
        } else if (onMenuClick) {
            onMenuClick();
        }
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const handleDrawerItemClick = (path) => {
        if (path && path !== '#') {
            navigate(path);
        }
        setDrawerOpen(false);
    };

    // Notification dropdown menu — sử dụng Ant Design components
    const userId = user?._id || user?.id || '';

    const handleNotificationClick = async (notification) => {
        // Chỉ đánh dấu đã đọc — không điều hướng
        const classObj = notification.classId;
        const classMongoId = classObj?._id || (typeof classObj === 'string' ? classObj : null);

        try {
            setNotifications(prev => prev.map(n =>
                n._id === notification._id
                    ? { ...n, isRead: { ...(n.isRead || {}), [userId]: true } }
                    : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (classMongoId) {
                await markNotificationAsRead(classMongoId, notification._id);
            }
        } catch (err) {
            console.warn('markNotificationAsRead failed (ignored):', err?.message);
        }
    };


    // Helper render nội dung dropdown thông báo (inline, không dùng sub-component)
    const renderNotificationBody = () => {
        if (notificationLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin description="Đang tải..." />
                </div>
            );
        }

        if (notifications.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có thông báo nào"
                    style={{ padding: '40px 20px' }}
                />
            );
        }

        return (
            <>
                <div style={{
                    maxHeight: 190,
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {notifications.map((notification) => {
                        const isRead = notification.isRead?.[userId] === true;
                        return (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '12px 16px',
                                    backgroundColor: isRead ? '#fff' : '#f0f7ff',
                                    transition: 'background 0.2s',
                                    borderLeft: `3px solid ${isRead ? '#d9d9d9' : '#1890ff'}`,
                                    borderBottom: '1px solid #f5f5f5',
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'flex-start'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isRead ? '#fff' : '#f0f7ff'; }}
                            >
                                {/* Icon */}
                                {/* <div style={{
                                    position: 'relative', flexShrink: 0,
                                    width: 36, height: 36, borderRadius: '50%',
                                    backgroundColor: isRead ? '#f0f0f0' : '#e6f7ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16
                                }}>
                                    {notification.type === 'assignment' ? '📚' : notification.type === 'reminder' ? '⏰' : '🔔'}
                                    {!isRead && (
                                        <div style={{
                                            position: 'absolute', top: 0, right: 0,
                                            width: 8, height: 8, borderRadius: '50%',
                                            backgroundColor: '#1890ff',
                                            border: '2px solid #fff'
                                        }} />
                                    )}
                                </div> */}

                                {/* Nội dung */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                                        <span style={{
                                            fontWeight: isRead ? 500 : 700,
                                            fontSize: 13,
                                            color: isRead ? '#555' : '#1a1a2e',
                                            flex: 1
                                        }}>
                                            {notification.title}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: isRead ? '#888' : '#555', lineHeight: 1.5, marginBottom: 4 }}>
                                        {(notification.content || '').replace(/<[^>]*>/g, '').slice(0, 100)}
                                        {(notification.content || '').length > 100 ? '...' : ''}
                                    </div>
                                    {notification.classId?.name && (
                                        <span style={{
                                            fontSize: 10, color: '#1890ff',
                                            backgroundColor: '#e6f7ff',
                                            padding: '1px 6px', borderRadius: 10
                                        }}>
                                            {notification.classId.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                    <span style={{ fontSize: 12, color: '#1890ff', fontWeight: 500, cursor: 'default' }}>
                        Xem tất cả thông báo
                    </span>
                </div>
            </>
        );
    };

    // Tính toán marginLeft
    const getMarginLeft = () => {
        // Trên mobile và tablet, không cần margin left vì sidebar không hiển thị
        if (showMenuButton) {
            return 0;
        }
        // Trên desktop: margin-left dựa vào trạng thái sidebar
        if (sidebarCollapsed !== undefined) {
            return sidebarCollapsed ? 80 : 250;
        }
        return 0;
    };

    const marginLeft = getMarginLeft();

    // Helper để render section title trong drawer
    const renderSectionTitle = (title) => {
        return (
            <div style={{
                padding: '12px 20px 4px 20px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
            }}>
                {title}
            </div>
        );
    };

    return (
        <>
            <div style={{
                backgroundColor: '#1E293B',
                padding: showMenuButton ? '12px 16px' : (isTablet ? '14px 20px' : '16px 24px'),
                display: 'flex',
                justifyContent: showMenuButton ? 'space-between' : 'flex-end',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 999,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginLeft: marginLeft,
                width: `calc(100% - ${marginLeft}px)`,
                transition: 'margin-left 0.3s ease, width 0.3s ease'
            }}>
                {/* Menu button - hiển thị trên mobile và tablet */}
                {showMenuButton && (
                    <MenuOutlined
                        onClick={handleMenuClick}
                        style={{ fontSize: 20, color: 'white', cursor: 'pointer' }}
                    />
                )}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: showMenuButton ? 16 : 24,
                    marginLeft: showMenuButton ? 0 : 'auto'
                }}>
                    {/* Notification Dropdown */}
                    <Dropdown
                        popupRender={() => (
                            <div style={{
                                width: 400,
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>Thông báo</span>
                                    {unreadCount > 0 && (
                                        <Badge
                                            count={unreadCount}
                                            style={{ backgroundColor: '#1890ff' }}
                                        />
                                    )}
                                </div>
                                {renderNotificationBody()}
                            </div>
                        )}
                        trigger={['click']}
                        placement="bottomRight"
                        onOpenChange={(open) => { if (open) loadNotifications(); }}
                    >
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <BellOutlined style={{ fontSize: showMenuButton ? 18 : 20, color: 'white' }} />
                            {unreadCount > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -4,
                                    width: 16,
                                    height: 16,
                                    backgroundColor: '#FF6B6B',
                                    borderRadius: '50%',
                                    border: '2px solid #1E293B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </div>
                    </Dropdown>

                    {/* Avatar & User Info */}
                    <Dropdown menu={{ items: headerMenu }} placement="bottomRight" trigger={['click']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <div style={{
                                width: showMenuButton ? 32 : 36,
                                height: showMenuButton ? 32 : 36,
                                borderRadius: '50%',
                                backgroundColor: '#00D4D4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: showMenuButton ? 14 : 16,
                                border: '2px solid white',
                                overflow: 'hidden',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {userAvatar ? (
                                    <img
                                        key={avatarCacheKey}
                                        src={headerAvatarSrc}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>

                            {/* Trên desktop mới hiển thị tên, trên mobile/tablet chỉ hiển thị avatar */}
                            {!showMenuButton && (
                                <span
                                    key={`header-name-${headerNameKey}`}
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: 'white',
                                        maxWidth: 150,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {headerName}
                                </span>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </div>

            {/* Drawer cho mobile và tablet */}
            <Drawer
                title={
                    <div style={{
                        color: '#00D4D4',
                        fontSize: 16,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span>📚</span>
                        <span>Sách Số</span>
                    </div>
                }
                placement="left"
                onClose={handleDrawerClose}
                open={drawerOpen}
                styles={{
                    wrapper: { width: isMobile ? "80%" : "320px" },
                    body: { padding: 0, backgroundColor: '#1E293B' },
                    header: {
                        backgroundColor: '#1E293B',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        color: 'white'
                    }
                }}
            >
                <div style={{ backgroundColor: '#1E293B', minHeight: '100%', paddingBottom: 60 }}>
                    {/* User info trong drawer */}
                    {user && (
                        <div style={{
                            padding: '20px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#00D4D4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 18,
                                overflow: 'hidden'
                            }}>
                                {userAvatar ? (
                                    <img
                                        src={headerAvatarSrc}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div>
                                <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>
                                    {user?.name || 'Người dùng'}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                                    {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : 'Học viên'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu items */}
                    {drawerItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return (
                                <div key={`divider-${index}`} style={{
                                    margin: '12px 16px',
                                    borderTop: '1px solid rgba(255,255,255,0.1)'
                                }} />
                            );
                        }

                        // Thêm section title trước một số nhóm menu
                        let showTitle = false;
                        let titleText = '';

                        // Kiểm tra nếu là item đầu tiên của menu quản lý
                        if ((isTeacher || isAdmin) &&
                            managementDrawerItems.some(mItem => mItem.path === item.path) &&
                            drawerItems[index - 1]?.type === 'divider') {
                            showTitle = true;
                            titleText = 'QUẢN LÝ';
                        }

                        // Kiểm tra nếu là item đầu tiên của menu admin
                        if (isAdmin &&
                            adminOnlyDrawerItems.some(aItem => aItem.path === item.path) &&
                            drawerItems[index - 1]?.type === 'divider') {
                            showTitle = true;
                            titleText = 'HỆ THỐNG';
                        }

                        return (
                            <React.Fragment key={index}>
                                {showTitle && renderSectionTitle(titleText)}
                                <div
                                    onClick={() => handleDrawerItemClick(item.path)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 20px',
                                        cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.8)',
                                        transition: 'all 0.2s ease',
                                        borderLeft: '3px solid transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.borderLeftColor = '#00D4D4';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                    }}
                                >
                                    {item.icon}
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                                        {item.label}
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* Version info */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: 12,
                        textAlign: 'center'
                    }}>
                        Version 1.0.0
                    </div>
                </div>
            </Drawer>
        </>
    );
}

export default Header;