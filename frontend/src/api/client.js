// api/client.js
const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000'
        : 'https://usermanagement-vle7.onrender.com';

export const API_URLS = {
    USERS: `${API_BASE}/api/users`,
    HISTORY: `${API_BASE}/api/history`,
    LIBRARY: `${API_BASE}/api/library`,
    QUESTIONS: `${API_BASE}/api/questions`,
    CLASSES: `${API_BASE}/api/classes`,
};

export function getAuthHeaders() {
    const token = typeof window !== 'undefined' && localStorage.getItem('authToken');
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
}

// api/client.js - Cập nhật handleResponse để xử lý lỗi tốt hơn

export async function handleResponse(res) {
    // Nếu response không ok
    if (!res.ok) {
        // Xử lý chung lỗi 401 Unauthorized (Invalid token)
        if (res.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            // Nếu không parse được JSON, dùng status text
            errorMessage = res.statusText || errorMessage;
        }
        const error = new Error(errorMessage);
        error.status = res.status;
        throw error;
    }

    // Nếu response ok nhưng không có nội dung
    const text = await res.text();
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse JSON response:', text);
        return {};
    }
}