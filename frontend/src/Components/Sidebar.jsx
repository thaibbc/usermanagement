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
    SwitcherOutlined
} from '@ant-design/icons';

function Sidebar({
    collapsed,
    setCollapsed,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // internal collapse state used when parent doesn't control it
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const isSidebarCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
    const setIsSidebarCollapsed = setCollapsed || setInternalCollapsed;

    // Load user from localStorage
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('authToken');
        const storedUser = typeof window !== 'undefined' && localStorage.getItem('user');
        if (!token) {
            navigate('/login');
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    // sidebar menu items for navigation - only show admin items if user is admin
    const sidebarItems = [
        {
            icon: <HomeOutlined style={{ fontSize: 18 }} />,
            label: 'Trang chủ',
            path: '/dashboard'
        },
        ...(user && user.accountType === 'admin' ? [{
            icon: <SwitcherOutlined style={{ fontSize: 18 }} />,
            label: 'Quản Lý người dùng',
            path: '/users'
        }] : []),
        {
            icon: <BookOutlined style={{ fontSize: 18 }} />,
            label: 'Lớp học',
            path: '#'
        },
        {
            icon: <UserOutlined style={{ fontSize: 18 }} />,
            label: 'Câu hỏi',
            path: '#'
        },
        {
            icon: <FileTextOutlined style={{ fontSize: 18 }} />,
            label: 'Bài tập',
            path: '#'
        },
        {
            icon: <TeamOutlined style={{ fontSize: 18 }} />,
            label: 'Phòng thi',
            path: '#'
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: 18 }} />,
            label: 'Hỗ trợ',
            path: '#'
        },
        {
            icon: <SettingOutlined style={{ fontSize: 18 }} />,
            label: 'Cài đặt',
            path: '#'
        }
    ];

    // ensure we always have an array when rendering
    const items = sidebarItems;

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
            flexDirection: 'column'
        }}>
            {/* Logo */}
            <div style={{
                padding: isSidebarCollapsed ? '20px 10px' : '20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between'
            }}>
                {!isSidebarCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20
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
                        cursor: 'pointer'
                    }}
                />
            </div>

            {/* Menu Items */}
            <div style={{
                flex: 1,
                padding: isSidebarCollapsed ? '20px 10px' : '20px',
                overflowY: 'auto'
            }}>
                {items.map((item, index) => {
                    const active = location.pathname === item.path;
                    return (
                        <div
                            key={index}
                            onClick={() => item.path && item.path !== '#' && navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: isSidebarCollapsed ? '12px 0' : '12px 16px',
                                marginBottom: 8,
                                borderRadius: 8,
                                cursor: 'pointer',
                                backgroundColor: active ? 'rgba(0, 212, 212, 0.2)' : 'transparent',
                                color: active ? '#00D4D4' : 'rgba(255,255,255,0.7)',
                                transition: 'all 0.3s ease',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                }
                            }}
                        >
                            {item.icon}
                            {!isSidebarCollapsed && (
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Sidebar;