// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useUser();

    console.log('ProtectedRoute - user:', user, 'loading:', loading); // Debug

    if (loading) {
        return <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '16px',
            color: '#1890ff'
        }}>
            Đang tải...
        </div>;
    }

    if (!user) {
        console.log('No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.accountType !== requiredRole) {
        console.log(`User role ${user.accountType} not authorized, required ${requiredRole}`);
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;