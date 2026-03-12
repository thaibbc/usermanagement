import React from "react";
import { Dropdown } from "antd";
import { BellOutlined } from "@ant-design/icons";

function Header({ menuItems = [], userName = "Testbank Admin" }) {
    return (
        <div style={{
            backgroundColor: 'white',
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
                    <BellOutlined style={{ fontSize: 20, color: '#64748B' }} />
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
                {menuItems && menuItems.length > 0 ? (
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
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
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{userName}</span>
                        </div>
                    </Dropdown>
                ) : (
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
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{userName}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;