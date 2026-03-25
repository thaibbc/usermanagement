// api/users.js
export { login, logout, getCurrentUser, isAuthenticated } from './auth';
import { API_URLS, getAuthHeaders, handleResponse } from './client';

// Fetch users with optional filters and pagination
export async function fetchUsers(filters = {}, page = 1, limit = 10) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    params.append('page', page);
    params.append('limit', limit);

    const url = `${API_URLS.USERS}?${params}`;
    const res = await fetch(url, { headers: getAuthHeaders() });

    return handleResponse(res);
}

// Create new user
export async function createUser(user) {
    const payload = { ...user };

    if (!payload.school && payload.email) {
        payload.school = payload.email.split("@")[1] || "";
    }

    const res = await fetch(API_URLS.USERS, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    return handleResponse(res);
}

// Update user
export async function updateUser(id, updates) {
    const res = await fetch(`${API_URLS.USERS}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
    });

    return handleResponse(res);
}

// Change user password
export async function changePassword(id, newPassword) {
    const res = await fetch(`${API_URLS.USERS}/${id}/password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: newPassword })
    });

    return handleResponse(res);
}

// Delete user
export async function deleteUser(id) {
    const res = await fetch(`${API_URLS.USERS}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    return handleResponse(res);
}

// Upload avatar for user
export async function uploadUserAvatar(id, file) {
    const formData = new FormData();
    formData.append('avatar', file);

    // Không set Content-Type khi dùng FormData
    const headers = getAuthHeaders();
    delete headers['Content-Type'];

    const res = await fetch(`${API_URLS.USERS}/${id}/avatar`, {
        method: 'POST',
        headers,
        body: formData
    });

    return handleResponse(res);
}

// Get single user
export async function getUser(id) {
    const res = await fetch(`${API_URLS.USERS}/${id}`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res);
}