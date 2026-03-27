import React, { useState, useContext, useEffect } from "react";
import { Dropdown, Drawer } from "antd";
import {
    BellOutlined, UserOutlined, LogoutOutlined, MenuOutlined,
    HomeOutlined, BookOutlined, SwitcherOutlined,
    FileTextOutlined, TeamOutlined, CustomerServiceOutlined, SettingOutlined,
    QuestionCircleOutlined, BankOutlined, CheckOutlined, ProfileOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

import useIsMobile from '../hooks/useIsMobile';
import { UserContext } from "../context/UserContext";

function Header({ onMenuClick, sidebarCollapsed }) {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    // Phân biệt mobile và tablet
    const isMobile = useIsMobile(768); // Màn hình < 768px
    const isTablet = useIsMobile(1024); // Màn hình < 1024px

    const [drawerVisible, setDrawerVisible] = useState(false);

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
        if (isMobile) {
            setDrawerVisible(true);
        } else if (onMenuClick) {
            onMenuClick();
        }
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
    };

    const handleDrawerItemClick = (path) => {
        if (path && path !== '#') {
            navigate(path);
        }
        setDrawerVisible(false);
    };

    // Tính toán marginLeft
    const getMarginLeft = () => {
        if (isMobile) {
            // Trên mobile: margin-left = 0 (sidebar đã ẩn hoàn toàn)
            return 0;
        }
        // Trên tablet và desktop: margin-left dựa vào trạng thái sidebar
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
        <div style={{
            backgroundColor: '#1E293B',
            padding: isMobile ? '12px 16px' : (isTablet ? '14px 20px' : '16px 24px'),
            display: 'flex',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
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
            {/* Menu button - chỉ hiển thị trên mobile */}
            {isMobile && (
                <MenuOutlined
                    onClick={handleMenuClick}
                    style={{ fontSize: 20, color: 'white', cursor: 'pointer' }}
                />
            )}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 16 : 24,
                marginLeft: 'auto'
            }}>
                {/* Notification */}
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <BellOutlined style={{ fontSize: isMobile ? 18 : 20, color: 'white' }} />
                    <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 8,
                        height: 8,
                        backgroundColor: '#FF6B6B',
                        borderRadius: '50%',
                        border: '2px solid #1E293B'
                    }} />
                </div>

                {/* Avatar & User Info */}
                <Dropdown menu={{ items: headerMenu }} placement="bottomRight" trigger={['click']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <div style={{
                            width: isMobile ? 32 : 36,
                            height: isMobile ? 32 : 36,
                            borderRadius: '50%',
                            backgroundColor: '#00D4D4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? 14 : 16,
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

                        {!isMobile && (
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

            {/* Drawer chỉ cho mobile */}
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
                open={drawerVisible}
                width="80%"
                styles={{
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

                        // Thêm section title trước một số nhóm menu (tùy chọn)
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
                                        marginLeft: showTitle ? 0 : 0
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
        </div>
    );
}

export default Header;