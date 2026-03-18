// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Spin } from 'antd';

function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <div style={{ color: '#00BCD4' }}>Đang tải...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.accountType !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;