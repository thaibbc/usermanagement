// Components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, loading } = useUser();
    const location = useLocation();

    // Đang tải thông tin user
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '16px',
                color: '#666'
            }}>
                <Spin size="large" description="Đang tải..." />
            </div>
        );
    }

    // Chưa đăng nhập
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Kiểm tra role nếu có yêu cầu
    if (requiredRole) {
        let hasRequiredRole = false;

        // Nếu requiredRole là mảng
        if (Array.isArray(requiredRole)) {
            hasRequiredRole = requiredRole.includes(user.accountType);
        }
        // Nếu requiredRole là string
        else {
            hasRequiredRole = user.accountType === requiredRole;
        }

        if (!hasRequiredRole) {
            // Chuyển hướng về dashboard nếu không có quyền
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;