// context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            try {
                const token = localStorage.getItem("authToken");
                const storedUser = localStorage.getItem("user");

                console.log("Loading user:", { token, storedUser });

                if (token && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error("Error loading user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const updateUser = (newUser, token) => {
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        if (token) {
            localStorage.setItem("authToken", token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
    };

    // Helper functions để kiểm tra role
    const isAdmin = user?.accountType === 'admin';
    const isTeacher = user?.accountType === 'teacher';
    const isStudent = user?.accountType === 'student';

    return (
        <UserContext.Provider value={{
            user,
            loading,
            setUser: updateUser,
            logout,
            // Thêm các helper
            isAdmin,
            isTeacher,
            isStudent,
            // Thêm function để kiểm tra role cụ thể
            hasRole: (roles) => {
                if (!user) return false;
                if (Array.isArray(roles)) {
                    return roles.includes(user.accountType);
                }
                return user.accountType === roles;
            }
        }}>
            {children}
        </UserContext.Provider>
    );
};

// Export useUser hook
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};