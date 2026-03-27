// Sidebar.jsx - Đã sửa để hoạt động đúng trên desktop
import React, { useState, useEffect } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    BookOutlined,
    FileTextOutlined,
    TeamOutlined,
    CustomerServiceOutlined,
    SettingOutlined,
    SwitcherOutlined,
    QuestionCircleOutlined,
    CheckOutlined,
    ProfileOutlined,
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';

function Sidebar({ collapsed, setCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, isAdmin, isTeacher } = useUser();

    // Sử dụng state để theo dõi kích thước màn hình
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    const isDesktop = windowWidth >= 1024;
    const useDrawerMode = isMobile || isTablet; // Chỉ dùng drawer trên mobile và tablet

    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Theo dõi resize window
    useEffect(() => {
        const handleResize = () => {
            const newWidth = window.innerWidth;
            setWindowWidth(newWidth);

            // Nếu chuyển từ mobile/tablet sang desktop, đóng drawer
            if (newWidth >= 1024 && isDrawerOpen) {
                setIsDrawerOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isDrawerOpen]);

    const userAvatar = user ? (user.avatar || user.avatarUrl || null) : null;
    const [avatarCacheKey, setAvatarCacheKey] = useState(Date.now());

    useEffect(() => {
        setAvatarCacheKey(Date.now());
    }, [userAvatar]);

    useEffect(() => {
        const onUserUpdated = () => {
            setAvatarCacheKey(Date.now());
        };
        window.addEventListener('userUpdated', onUserUpdated);
        return () => window.removeEventListener('userUpdated', onUserUpdated);
    }, []);

    const sidebarAvatarSrc = userAvatar ? (
        userAvatar.startsWith('data:')
            ? userAvatar
            : `${userAvatar}${userAvatar.includes('?') ? '&' : '?'}t=${avatarCacheKey}`
    ) : null;

    // Sử dụng state từ props hoặc internal
    const isSidebarCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
    const setIsSidebarCollapsed = setCollapsed || setInternalCollapsed;

    // Lắng nghe sự kiện toggle từ Header (chỉ cho mobile/tablet)
    useEffect(() => {
        const handleToggleSidebar = () => {
            if (useDrawerMode) {
                setIsDrawerOpen(prev => !prev);
            }
        };

        window.addEventListener('toggleSidebar', handleToggleSidebar);
        return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
    }, [useDrawerMode]);

    // Xử lý đóng sidebar khi click vào link
    const handleMenuClick = (path) => {
        if (path !== '#') {
            navigate(path);
        }
        if (useDrawerMode) {
            setIsDrawerOpen(false);
        }
    };

    // Menu items cho tất cả người dùng
    const commonMenuItems = [
        {
            icon: <HomeOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Trang chủ',
            path: '/dashboard'
        },
        {
            icon: <BookOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Lớp học',
            path: '/student-class'
        },
        {
            icon: <FileTextOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Bài tập',
            path: '#'
        },
        {
            icon: <TeamOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Phòng thi',
            path: '#'
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Hỗ trợ',
            path: '#'
        },
        {
            icon: <SettingOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Cài đặt',
            path: '#'
        }
    ];

    // Menu items dành cho giáo viên và admin (quản lý)
    const managementMenuItems = [
        {
            icon: <ProfileOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Quản lý lớp học',
            path: '/classes'
        },
        {
            icon: <QuestionCircleOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Ngân hàng câu hỏi',
            path: '/question-bank'
        },
        {
            icon: <CheckOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Thư viện của tôi',
            path: '/my-library'
        }
    ];

    // Menu items chỉ dành riêng cho admin
    const adminOnlyMenuItems = [
        {
            icon: <SwitcherOutlined style={{ fontSize: (!useDrawerMode && isSidebarCollapsed) ? 20 : 18 }} />,
            label: 'Quản lý người dùng',
            path: '/users'
        }
    ];

    if (loading) {
        return (
            <div style={{
                width: useDrawerMode ? 0 : (isSidebarCollapsed ? 80 : 250),
                backgroundColor: '#1E293B',
                transition: 'width 0.3s ease',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: 'white' }}>Loading...</div>
            </div>
        );
    }

    const getSidebarWidth = () => {
        if (useDrawerMode) {
            // Trên mobile/tablet, sidebar chỉ hiện khi isDrawerOpen = true
            if (!isDrawerOpen) return 0;
            return isMobile ? '80%' : '320px';
        }
        // Trên desktop
        return isSidebarCollapsed ? 80 : 250;
    };

    const sidebarWidth = getSidebarWidth();

    const renderMenuItem = (item, keyPrefix, isInDrawer = false) => {
        const active = location.pathname === item.path;
        const isDisabled = item.path === '#';
        const isCompact = !useDrawerMode && isSidebarCollapsed && !isInDrawer;

        return (
            <div
                key={keyPrefix}
                onClick={() => !isDisabled && handleMenuClick(item.path)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCompact ? 0 : 12,
                    padding: isCompact ? '14px 0' : '12px 16px',
                    marginBottom: 4,
                    borderRadius: 8,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    backgroundColor: active ? 'rgba(0, 212, 212, 0.2)' : 'transparent',
                    color: active ? '#00D4D4' : (isDisabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)'),
                    transition: 'all 0.3s ease',
                    justifyContent: isCompact ? 'center' : 'flex-start',
                    position: 'relative',
                    opacity: isDisabled ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                    if (!active && !isMobile && !isDisabled && isDesktop) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!active && !isMobile && !isDisabled && isDesktop) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }
                }}
            >
                {item.icon}
                {(!isCompact || isInDrawer) && (
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                )}

                {isCompact && !isMobile && !isInDrawer && isDesktop && (
                    <div style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#1E293B',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 4,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        zIndex: 1001,
                        marginLeft: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease',
                    }}
                        className="sidebar-tooltip">
                        {item.label}
                    </div>
                )}
            </div>
        );
    };

    // Helper để render section với title
    const renderSection = (title, items, keyPrefix, isInDrawer = false) => {
        if (!items.length) return null;
        const showTitle = (!useDrawerMode && !isSidebarCollapsed) || isInDrawer;

        return (
            <>
                {showTitle && (
                    <div style={{ marginTop: 16, marginBottom: 16 }}>
                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: 12
                        }} />
                        <div style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            paddingLeft: 8
                        }}>
                            {title}
                        </div>
                    </div>
                )}
                {items.map((item, index) =>
                    renderMenuItem(item, `${keyPrefix}-${index}`, isInDrawer)
                )}
            </>
        );
    };

    // Nội dung menu chính
    const MenuContent = ({ isInDrawer = false }) => (
        <div style={{
            flex: 1,
            padding: (useDrawerMode || (!useDrawerMode && !isSidebarCollapsed)) ? '16px' : '16px 0',
            overflowY: 'auto',
            overflowX: 'hidden',
        }}>
            {/* Common menu cho tất cả user */}
            {commonMenuItems.map((item, index) =>
                renderMenuItem(item, `common-${index}`, isInDrawer)
            )}

            {/* Management menu cho giáo viên và admin */}
            {(isTeacher || isAdmin) && (
                renderSection('QUẢN LÝ', managementMenuItems, 'management', isInDrawer)
            )}

            {/* Admin only menu */}
            {isAdmin && (
                renderSection('HỆ THỐNG', adminOnlyMenuItems, 'admin', isInDrawer)
            )}
        </div>
    );

    // Trên mobile/tablet, render sidebar dạng drawer
    if (useDrawerMode) {
        return (
            <>
                {/* Overlay */}
                {isDrawerOpen && (
                    <div
                        onClick={() => setIsDrawerOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 999,
                            backdropFilter: 'blur(2px)',
                            transition: 'all 0.3s ease',
                        }}
                    />
                )}

                {/* Sidebar Drawer */}
                <div style={{
                    width: sidebarWidth,
                    backgroundColor: '#1E293B',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease',
                }}>
                    {/* Logo */}
                    <div style={{
                        padding: '20px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 64,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18
                            }}>
                                📚
                            </div>
                            <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                                Sách Số
                            </span>
                        </div>
                        <MenuOutlined
                            onClick={() => setIsDrawerOpen(false)}
                            style={{
                                color: 'white',
                                fontSize: 18,
                                cursor: 'pointer',
                                padding: 4,
                            }}
                        />
                    </div>

                    {/* User Info */}
                    {user && (
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#00D4D4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 16,
                                flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                {sidebarAvatarSrc ? (
                                    <img
                                        key={avatarCacheKey}
                                        src={sidebarAvatarSrc}
                                        alt="avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {user?.name || 'Người dùng'}
                                </div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: 12,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : 'Học viên'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items */}
                    <MenuContent isInDrawer={true} />

                    {/* Version info */}
                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: 12,
                        textAlign: 'center'
                    }}>
                        Version 1.0.0
                    </div>
                </div>
            </>
        );
    }

    // Render sidebar cho desktop
    return (
        <div style={{
            width: sidebarWidth,
            backgroundColor: '#1E293B',
            transition: 'width 0.3s ease',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
        }}>
            {/* Logo */}
            <div style={{
                padding: isSidebarCollapsed ? '20px 0' : '20px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                minHeight: 64,
            }}>
                {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18
                        }}>
                            📚
                        </div>
                        <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                            Sách Số
                        </span>
                    </div>
                )}
                <MenuOutlined
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    style={{
                        color: 'white',
                        fontSize: 18,
                        cursor: 'pointer',
                        padding: 4,
                    }}
                />
            </div>

            {/* User Info */}
            {!isSidebarCollapsed && user && (
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#00D4D4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 16,
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                        {sidebarAvatarSrc ? (
                            <img
                                key={avatarCacheKey}
                                src={sidebarAvatarSrc}
                                alt="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{
                            color: 'white',
                            fontSize: 14,
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {user?.name || 'Người dùng'}
                        </div>
                        <div style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giáo viên' : 'Học viên'}
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <MenuContent isInDrawer={false} />

            {/* Version info */}
            {!isSidebarCollapsed && (
                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 12,
                    textAlign: 'center'
                }}>
                    Version 1.0.0
                </div>
            )}

            <style>
                {`
                    /* Tooltip hiển thị khi hover vào icon */
                    div:hover > .sidebar-tooltip {
                        opacity: 1 !important;
                    }
                    
                    /* Custom scrollbar */
                    ::-webkit-scrollbar {
                        width: 4px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: rgba(255,255,255,0.1);
                        border-radius: 4px;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: rgba(255,255,255,0.3);
                        border-radius: 4px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: rgba(255,255,255,0.5);
                    }
                `}
            </style>
        </div>
    );
}

export default Sidebar;