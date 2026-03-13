import React, { useState, useEffect } from "react";
import { Dropdown, Drawer, Space } from "antd";
import {
    BellOutlined, UserOutlined, LogoutOutlined, MenuOutlined,
    HomeOutlined, BookOutlined, SwitcherOutlined, UserOutlined as PersonOutlined,
    FileTextOutlined, TeamOutlined, CustomerServiceOutlined, SettingOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

import useIsMobile from '../hooks/useIsMobile';

function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const isMobile = useIsMobile(1350);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // build same sidebar items for drawer menu
    const sidebarItems = [
        { icon: <HomeOutlined style={{ fontSize: 18 }} />, label: 'Trang chủ', path: '/dashboard' },
        ...(user && user.accountType === 'admin' ? [{ icon: <SwitcherOutlined style={{ fontSize: 18 }} />, label: 'Quản Lý người dùng', path: '/users' }] : []),
        { icon: <BookOutlined style={{ fontSize: 18 }} />, label: 'Lớp học', path: '#' },
        { icon: <PersonOutlined style={{ fontSize: 18 }} />, label: 'Câu hỏi', path: '#' },
        { icon: <FileTextOutlined style={{ fontSize: 18 }} />, label: 'Bài tập', path: '#' },
        { icon: <TeamOutlined style={{ fontSize: 18 }} />, label: 'Phòng thi', path: '#' },
        { icon: <CustomerServiceOutlined style={{ fontSize: 18 }} />, label: 'Hỗ trợ', path: '#' },
        { icon: <SettingOutlined style={{ fontSize: 18 }} />, label: 'Cài đặt', path: '#' }
    ];

    // Load user from localStorage
    useEffect(() => {
        const storedUser = typeof window !== 'undefined' && localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    const headerMenu = [
        {
            key: 'profile',
            icon: <UserOutlined style={{ fontSize: 16 }} />,
            label: 'Profile',
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ fontSize: 16 }} />,
            label: 'Logout',
            onClick: handleLogout
        }
    ];

    const userName = user ? (user.name || user.email || "User") : "Testbank Admin";

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

    return (
        <div style={{
            backgroundColor: '#1E293B',
            padding: isMobile ? '12px 16px' : '16px 32px',
            display: 'flex',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid #E8E8E8',

            position: 'sticky',
            top: 0,
            zIndex: 999
        }}>
            {isMobile && (
                <MenuOutlined
                    onClick={handleMenuClick}
                    style={{ fontSize: 20, color: 'white', cursor: 'pointer' }}
                />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <BellOutlined style={{ fontSize: 20, color: 'white' }} />
                    <div style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 8,
                        height: 8,
                        backgroundColor: '#FF6B6B',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }} />
                </div>

                {/* User Avatar and Name */}
                <Dropdown menu={{ items: headerMenu }} placement="bottomRight" trigger={['click']}>
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
                            👤
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{userName}</span>
                    </div>
                </Dropdown>
            </div>

            {/* mobile drawer containing sidebar links */}
            <Drawer
                placement="left"
                closable={false}
                onClose={handleDrawerClose}
                open={drawerVisible}
                bodyStyle={{ padding: 0 }}
                width={250}
            >
                <div style={{ backgroundColor: '#1E293B', height: '100%', color: 'white' }}>
                    {sidebarItems.map((it, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleDrawerItemClick(it.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {it.icon}
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</span>
                        </div>
                    ))}
                </div>
            </Drawer>
        </div>
    );
}

export default Header;