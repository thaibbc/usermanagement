// context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

// Export UserContext để có thể dùng useContext trực tiếp nếu muốn
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
                    setUser(JSON.parse(storedUser));
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

    // For testing: set a default admin user if no user exists
    useEffect(() => {
        if (!loading && !user) {
            const testUser = {
                id: 1,
                name: "Admin User",
                email: "admin@example.com",
                accountType: "admin"
            };
            localStorage.setItem("authToken", "test-token");
            localStorage.setItem("user", JSON.stringify(testUser));
            setUser(testUser);
        }
    }, [loading, user]);

    return (
        <UserContext.Provider value={{ user, loading, setUser: updateUser, logout }}>
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