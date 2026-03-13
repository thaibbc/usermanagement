import React, { useState, useEffect } from "react";
import { Dropdown } from "antd";
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

function Header({ title = "Dashboard" }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

    const userName = user ? user.name : "Testbank Admin";

    return (
        <div style={{
            backgroundColor: '#1E293B',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid #E8E8E8',

            position: 'sticky',
            top: 0,
            zIndex: 999
        }}>


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
        </div>
    );
}

export default Header;