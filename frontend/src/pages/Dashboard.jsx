import { useState } from 'react';
import {
    ArrowDownOutlined,
    HomeOutlined,
    BookOutlined,
    UserOutlined,
    LogoutOutlined,
    FileTextOutlined,
    TeamOutlined,
    CustomerServiceOutlined,
    SettingOutlined,
    SwitcherOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

export function Dashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


    // Stats data
    const stats = [
        {
            title: 'TỔNG LƯỢT LÀM BÀI THEO THÁNG',
            value: '0',
            change: '100%',
            changeText: 'So với tháng trước',
            icon: '📄',
            bgColor: '#FFE5E5',
            iconBg: '#FF6B6B'
        },
        {
            title: 'TỔNG SỐ BÀI TẬP ĐÃ LÀM THEO THÁNG',
            value: '0',
            change: '100%',
            changeText: 'So với tháng trước',
            icon: '📝',
            bgColor: '#FFE8D6',
            iconBg: '#FF9F43'
        },
        {
            title: 'ĐIỂM TRUNG BÌNH THEO THÁNG',
            value: '0',
            change: '100%',
            changeText: 'So với tháng trước',
            icon: '💰',
            bgColor: '#D4F4F4',
            iconBg: '#00D4D4'
        },
        {
            title: 'TỶ LỆ HOÀN THÀNH BÀI TẬP THEO THÁNG',
            value: '0%',
            change: '100%',
            changeText: 'So với tháng trước',
            icon: '📊',
            bgColor: '#E5E5FF',
            iconBg: '#7C7CFF'
        }
    ];

    // Chart data
    const chartData = [
        { month: 'Tháng 1', value: 0 },
        { month: 'Tháng 2', value: 0 },
        { month: 'Tháng 3', value: 0 },
        { month: 'Tháng 4', value: 0 },
        { month: 'Tháng 5', value: 0 },
        { month: 'Tháng 6', value: 0 },
        { month: 'Tháng 7', value: 0 },
        { month: 'Tháng 8', value: 0 },
        { month: 'Tháng 9', value: 0 },
        { month: 'Tháng 10', value: 0 },
        { month: 'Tháng 11', value: 0 },
        { month: 'Tháng 12', value: 0 }
    ];


    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F2F5' }}>
            {/* sidebar component */}
            <Sidebar
                collapsed={isSidebarCollapsed}
                setCollapsed={setIsSidebarCollapsed}
            />

            {/* main area (shifted right to accommodate fixed sidebar) */}
            <div style={{
                flex: 1,
                marginLeft: isSidebarCollapsed ? 80 : 250,
                transition: 'margin-left 0.3s ease'
            }}>
                <Header title="Dashboard" />


                {/* Content Area */}
                <div style={{
                    flex: 1,
                    padding: 32,
                    backgroundColor: '#F0F2F5'
                }}>
                    {/* Stats Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 24,
                        marginBottom: 32
                    }}>
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 12,
                                    padding: 24,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: '#64748B',
                                            marginBottom: 12,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {stat.title}
                                        </div>
                                        <div style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: '#1E293B',
                                            marginBottom: 8
                                        }}>
                                            {stat.value}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 13,
                                            color: '#FF6B6B'
                                        }}>
                                            <ArrowDownOutlined style={{ fontSize: 12 }} />
                                            <span style={{ fontWeight: 600 }}>{stat.change}</span>
                                            <span style={{ color: '#94A3B8', fontWeight: 400 }}>{stat.changeText}</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 12,
                                        backgroundColor: stat.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 28
                                    }}>
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 10,
                                            backgroundColor: stat.iconBg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div style={{
                        backgroundColor: '#1E3A5F',
                        borderRadius: 12,
                        padding: 32,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#94A3B8',
                            marginBottom: 8,
                            letterSpacing: '0.5px'
                        }}>
                            Bài tập
                        </div>
                        <div style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: 'white',
                            marginBottom: 24
                        }}>
                            TỶ LỆ HOÀN THÀNH BÀI TẬP
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.5)"
                                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                                    domain={[0, 1]}
                                    ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#2D4A6F',
                                        border: 'none',
                                        borderRadius: 8,
                                        color: 'white'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#00D4D4"
                                    strokeWidth={2}
                                    dot={{ fill: '#00D4D4', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
