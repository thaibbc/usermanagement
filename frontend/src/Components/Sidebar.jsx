// Sidebar.jsx - Chỉ cần sửa phần commonMenuItems
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
    BankOutlined,
    CheckOutlined,
    ProfileOutlined,
} from '@ant-design/icons';
import { useUser } from '../context/UserContext';
import useIsMobile from '../hooks/useIsMobile';

function Sidebar({ collapsed, setCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, isAdmin, isTeacher, isStudent } = useUser();

    const isMobile = useIsMobile(768);
    const [internalCollapsed, setInternalCollapsed] = useState(false);

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

    // Xử lý đóng sidebar khi click vào link trên mobile
    const handleMenuClick = (path) => {
        navigate(path);
        if (isMobile) {
            setIsSidebarCollapsed(true);
        }
    };

    // Menu items cho tất cả người dùng (học sinh, giáo viên, admin)
    const commonMenuItems = [
        {
            icon: <HomeOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Trang chủ',
            path: '/dashboard'
        },
        {
            icon: <BookOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Lớp học',
            // QUAN TRỌNG: Admin và Teacher cũng dùng StudentClass để test bài
            path: '/student-class'
        },
        {
            icon: <FileTextOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Bài tập',
            path: '#'
        },
        {
            icon: <TeamOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Phòng thi',
            path: '#'
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Hỗ trợ',
            path: '#'
        },
        {
            icon: <SettingOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Cài đặt',
            path: '#'
        }
    ];

    // Menu items dành cho giáo viên và admin (quản lý)
    const managementMenuItems = [
        {
            icon: <ProfileOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Quản lý lớp học',
            path: '/classes'
        },
        {
            icon: <QuestionCircleOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Ngân hàng câu hỏi',
            path: '/question-bank'
        },

        {
            icon: <CheckOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Thư viện của tôi',
            path: '/my-library'
        }
    ];

    // Menu items chỉ dành riêng cho admin
    const adminOnlyMenuItems = [
        {
            icon: <SwitcherOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Quản lý người dùng',
            path: '/users'
        }
    ];

    if (loading) {
        return (
            <div style={{
                width: isSidebarCollapsed ? 80 : 250,
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

    // Tìm hàm getSidebarWidth (khoảng dòng 150-160) và sửa lại:

    const getSidebarWidth = () => {
        if (isMobile) {
            return 0;
        }
        // Trên desktop/tablet: margin dựa vào trạng thái sidebar
        // isSidebarCollapsed = true -> sidebar thu gọn (80px)
        // isSidebarCollapsed = false -> sidebar mở rộng (250px)
        return isSidebarCollapsed ? 80 : 250;  // ← SỬA: sidebarCollapsed -> isSidebarCollapsed
    };

    const getSidebarLeft = () => {
        // Trên mobile, khi collapsed thì ẩn, khi mở thì hiện
        if (isMobile && isSidebarCollapsed) {
            return -getSidebarWidth();
        }
        return 0;
    };

    const sidebarWidth = getSidebarWidth();
    const sidebarLeft = getSidebarLeft();

    const renderMenuItem = (item, keyPrefix) => {
        const active = location.pathname === item.path;
        return (
            <div
                key={keyPrefix}
                onClick={() => handleMenuClick(item.path)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isSidebarCollapsed ? 0 : 12,
                    padding: isSidebarCollapsed ? '14px 0' : '12px 16px',
                    marginBottom: 4,
                    borderRadius: 8,
                    cursor: 'pointer',
                    backgroundColor: active ? 'rgba(0, 212, 212, 0.2)' : 'transparent',
                    color: active ? '#00D4D4' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.3s ease',
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                    position: 'relative',
                }}
                onMouseEnter={(e) => {
                    if (!active && !isMobile) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!active && !isMobile) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }
                }}
            >
                {item.icon}
                {!isSidebarCollapsed && (
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                )}

                {isSidebarCollapsed && !isMobile && (
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

    return (
        <>
            {/* Overlay cho mobile khi sidebar mở */}
            {isMobile && !isSidebarCollapsed && (
                <div
                    onClick={() => setIsSidebarCollapsed(true)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* Nút toggle sidebar cho mobile (chỉ hiện khi sidebar đóng) */}
            {isMobile && isSidebarCollapsed && (
                <div
                    onClick={() => setIsSidebarCollapsed(false)}
                    style={{
                        position: 'fixed',
                        left: 16,
                        top: 16,
                        zIndex: 1001,
                        backgroundColor: '#1E293B',
                        borderRadius: 8,
                        padding: 10,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <MenuOutlined style={{ color: 'white', fontSize: 18 }} />
                </div>
            )}

            <div style={{
                width: sidebarWidth,
                backgroundColor: '#1E293B',
                transition: 'width 0.3s ease, left 0.3s ease',
                position: 'fixed',
                height: '100vh',
                left: sidebarLeft,
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
                <div style={{
                    flex: 1,
                    padding: isSidebarCollapsed ? '16px 0' : '16px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}>
                    {/* Common menu cho tất cả user */}
                    {commonMenuItems.map((item, index) =>
                        renderMenuItem(item, `common-${index}`)
                    )}

                    {/* Management menu cho giáo viên và admin */}
                    {(isTeacher || isAdmin) && (
                        <>
                            {!isSidebarCollapsed && (
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
                                        QUẢN LÝ
                                    </div>
                                </div>
                            )}
                            {managementMenuItems.map((item, index) =>
                                renderMenuItem(item, `management-${index}`)
                            )}
                        </>
                    )}

                    {/* Admin only menu */}
                    {isAdmin && (
                        <>
                            {!isSidebarCollapsed && (
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
                                        HỆ THỐNG
                                    </div>
                                </div>
                            )}
                            {adminOnlyMenuItems.map((item, index) =>
                                renderMenuItem(item, `admin-${index}`)
                            )}
                        </>
                    )}
                </div>

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
            </div>

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
                    
                    /* Hiệu ứng transition cho menu items */
                    .menu-item {
                        transition: all 0.3s ease;
                    }
                    
                    /* Đảm bảo menu hiển thị đầy đủ trên mobile khi mở */
                    @media (max-width: 768px) {
                        .ant-menu {
                            background-color: #1E293B;
                        }
                    }
                `}
            </style>
        </>
    );
}

export default Sidebar;