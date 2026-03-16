import React, { useState, useContext } from "react";
import { Dropdown, Drawer } from "antd";
import {
    BellOutlined, UserOutlined, LogoutOutlined, MenuOutlined,
    HomeOutlined, BookOutlined, SwitcherOutlined, UserOutlined as PersonOutlined,
    FileTextOutlined, TeamOutlined, CustomerServiceOutlined, SettingOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

import useIsMobile from '../hooks/useIsMobile';
import { UserContext } from "../context/UserContext";

function Header({ onMenuClick }) {

    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    const isMobile = useIsMobile(1350);
    const [drawerVisible, setDrawerVisible] = useState(false);

    // sidebar menu items
    const sidebarItems = [
        { icon: <HomeOutlined style={{ fontSize: 18 }} />, label: 'Trang chủ', path: '/dashboard' },

        ...(user && user.accountType === 'admin'
            ? [{ icon: <SwitcherOutlined style={{ fontSize: 18 }} />, label: 'Quản Lý người dùng', path: '/users' }]
            : []
        ),

        { icon: <BookOutlined style={{ fontSize: 18 }} />, label: 'Lớp học', path: '#' },
        { icon: <PersonOutlined style={{ fontSize: 18 }} />, label: 'Câu hỏi', path: '#' },
        { icon: <FileTextOutlined style={{ fontSize: 18 }} />, label: 'Bài tập', path: '#' },
        { icon: <TeamOutlined style={{ fontSize: 18 }} />, label: 'Phòng thi', path: '#' },
        { icon: <CustomerServiceOutlined style={{ fontSize: 18 }} />, label: 'Hỗ trợ', path: '#' },
        { icon: <SettingOutlined style={{ fontSize: 18 }} />, label: 'Cài đặt', path: '#' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
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
    const userAvatar = user ? (user.avatar || user.avatarUrl || null) : null;

    const [headerName, setHeaderName] = useState(userName);
    const [headerNameKey, setHeaderNameKey] = useState(0);
    const [avatarCacheKey, setAvatarCacheKey] = useState(0);

    React.useEffect(() => {
        setHeaderName(userName);
        setHeaderNameKey(prev => prev + 1);
    }, [userName]);

    React.useEffect(() => {
        setAvatarCacheKey(Date.now());
    }, [userAvatar]);

    React.useEffect(() => {
        const onUserUpdated = () => {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            if (stored) {
                try {
                    const latestUser = JSON.parse(stored);
                    console.log('[Header] userUpdated event received; profile should be:', (latestUser.avatar || latestUser.avatarUrl) || null, latestUser.name || latestUser.email);
                    if (latestUser) {
                        setUser(latestUser);
                        setHeaderName(latestUser.name || latestUser.email || 'User');
                        const latestAvatar = latestUser.avatar || latestUser.avatarUrl || null;
                        const currentAvatar = user ? (user.avatar || user.avatarUrl || null) : null;
                        if (latestAvatar !== currentAvatar) {
                            console.warn('[Header] avatar mismatch after userUpdated: header:', currentAvatar, 'profile:', latestAvatar);
                        } else {
                            console.log('[Header] avatar in header now matches profile avatar:', latestAvatar);
                        }
                        const currentName = user ? (user.name || user.email || 'User') : 'Testbank Admin';
                        const latestName = latestUser.name || latestUser.email || 'User';
                        if (currentName !== latestName) {
                            console.warn('[Header] name mismatch after userUpdated: header:', currentName, 'profile:', latestName);
                        } else {
                            console.log('[Header] name in header now matches profile name:', latestName);
                        }
                    }
                } catch (err) {
                    console.error('Failed to parse updated user', err);
                }
            }
            setAvatarCacheKey(Date.now());
        };

        window.addEventListener('userUpdated', onUserUpdated);
        return () => window.removeEventListener('userUpdated', onUserUpdated);
    }, [setUser, user]);

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

                {/* Notification */}
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

                {/* Avatar */}
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
                            border: '2px solid white',
                            overflow: 'hidden'
                        }}>

                            {userAvatar ? (
                                <img
                                    key={avatarCacheKey}
                                    src={headerAvatarSrc}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                '👤'
                            )}

                        </div>

                        <span
                            key={`header-name-${headerNameKey}`}
                            style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'white'
                            }}
                        >
                            {headerName}
                        </span>

                    </div>

                </Dropdown>

            </div>

            {/* Drawer mobile */}
            <Drawer
                placement="left"
                closable={false}
                onClose={handleDrawerClose}
                open={drawerVisible}
                styles={{ body: { padding: 0 } }}
                size={250}
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
                            <span style={{ fontSize: 14, fontWeight: 500 }}>
                                {it.label}
                            </span>
                        </div>
                    ))}

                </div>

            </Drawer>

        </div>
    );
}

export default Header;