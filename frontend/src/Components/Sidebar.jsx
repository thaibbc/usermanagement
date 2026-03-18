import React, { useState, useEffect } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    BookOutlined,
    UserOutlined,
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
    const { user, loading } = useUser();

    // SỬA: Chỉ ẩn trên mobile (<768px)
    const isMobile = useIsMobile(768); // Màn hình < 768px
    const isTablet = useIsMobile(1024); // Màn hình < 1024px (bao gồm cả mobile)

    // internal collapse state
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const isSidebarCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
    const setIsSidebarCollapsed = setCollapsed || setInternalCollapsed;

    // Khi ở mobile (<768px), tự động ẩn sidebar
    useEffect(() => {
        if (isMobile) {
            setIsSidebarCollapsed(true);
        }
    }, [isMobile, setIsSidebarCollapsed]);

    const isAdmin = user?.accountType === 'admin';

    const userMenuItems = [
        {
            icon: <HomeOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Trang chủ',
            path: '/dashboard'
        },
        {
            icon: <BookOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Lớp học',
            path: '/student-class'
        },
        {
            icon: <FileTextOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Bài tập',
            path: '/assignments'
        },
        {
            icon: <TeamOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Phòng thi',
            path: '/exam-rooms'
        },
        {
            icon: <CheckOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Thư viện của tôi',
            path: '/my-library'
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Hỗ trợ',
            path: '/support'
        },
        {
            icon: <SettingOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Cài đặt',
            path: '/settings'
        }
    ];

    const adminMenuItems = [
        {
            icon: <SwitcherOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Quản lý người dùng',
            path: '/users'
        },
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
            icon: <BankOutlined style={{ fontSize: isSidebarCollapsed ? 20 : 18 }} />,
            label: 'Quản lý ngân hàng',
            path: '/bank-management'
        }
    ];

    if (loading) {
        return (
            <div style={{
                width: isSidebarCollapsed ? (isMobile ? 0 : 80) : 250,
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

    // QUAN TRỌNG: Tính toán width
    const getSidebarWidth = () => {
        if (isMobile) {
            // Trên mobile (<768px): width = 0 (ẩn hoàn toàn)
            return 0;
        }
        // Trên tablet và desktop (>=768px)
        return isSidebarCollapsed ? 80 : 250;
    };

    // Tính toán vị trí left
    const getSidebarLeft = () => {
        if (isMobile) {
            return -getSidebarWidth(); // Đưa ra ngoài màn hình
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
                onClick={() => {
                    if (item.path && item.path !== '#') {
                        navigate(item.path);
                        // Tự động đóng sidebar trên mobile sau khi chọn
                        if (isMobile) {
                            setIsSidebarCollapsed(true);
                        }
                    }
                }}
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

                {/* Tooltip khi collapsed - chỉ trên tablet/desktop */}
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
                boxShadow: isMobile && !isSidebarCollapsed ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
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
                        }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
                                {isAdmin ? 'Quản trị viên' : 'Học viên'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <div style={{
                    flex: 1,
                    padding: isSidebarCollapsed ? '16px 0' : '16px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    {userMenuItems.map((item, index) =>
                        renderMenuItem(item, `user-${index}`)
                    )}

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
                                        ADMINISTRATORS
                                    </div>
                                </div>
                            )}

                            {adminMenuItems.map((item, index) =>
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
                    div:hover > .sidebar-tooltip {
                        opacity: 1 !important;
                    }
                `}
            </style>
        </>
    );
}

export default Sidebar;