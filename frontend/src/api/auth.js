// api/auth.js
import { API_URLS } from './client';

export async function login(credentials) {
    const res = await fetch(`${API_URLS.USERS}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    if (!res.ok) {
        let msg = 'Login failed';
        try {
            const data = await res.json();
            if (data && data.message) msg = data.message;
        } catch { /* ignore parsing error */ }
        throw new Error(msg);
    }

    const data = await res.json();

    // Lưu token và user
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

export function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}