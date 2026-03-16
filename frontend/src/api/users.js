// API helper functions for communicating with the backend

// choose local backend when running in development
const API =
    import.meta.env.VITE_API_URL ||
        (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? 'http://localhost:5000'
        : 'https://usermanagement-vle7.onrender.com';

const USERS_URL = `${API}/api/users`;
const HISTORY_URL = `${API}/api/history`;

function authHeaders() {
    const token = typeof window !== 'undefined' && localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ====================== USERS ======================

// authentication helper
export async function login(credentials) {
    const res = await fetch(`${USERS_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!res.ok) {
        let msg = 'Login failed';
        let data = null;
        try {
            data = await res.json();
            if (data && data.message) msg = data.message;
        } catch { /* ignore parsing error */ }
        // log for debugging
        console.error('login() error', res.status, data);
        throw new Error(msg);
    }
    return res.json(); // { token, user }
}

// Fetch users with optional filters and pagination
// returns an object { users: [...], total: number }
export async function fetchUsers(filters = {}, page = 1, limit = 10) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    params.append('page', page);
    params.append('limit', limit);

    const url = `${USERS_URL}?${params}`;

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch users");

    return res.json();
}

// Create new user
export async function createUser(user) {
    const payload = { ...user };

    // derive school from email
    if (!payload.school && payload.email) {
        payload.school = payload.email.split("@")[1] || "";
    }

    const res = await fetch(USERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        let msg = `Failed to create user: ${res.status}`;
        try {
            const data = await res.json();
            if (data && data.message) msg = data.message;
        } catch {
            // ignore JSON parsing errors
        }
        throw new Error(msg);
    }

    return res.json();
}

// Update user
export async function updateUser(id, updates) {
    const res = await fetch(`${USERS_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error("Failed to update user");

    return res.json();
}

// change user password
export async function changePassword(id, newPassword) {
    const res = await fetch(`${USERS_URL}/${id}/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ password: newPassword })
    });
    if (!res.ok) {
        let msg = `Failed to change password (${res.status})`;
        try {
            const data = await res.json();
            if (data && data.message) msg = data.message;
        } catch {
            /* ignore parse errors */
        }
        throw new Error(msg);
    }
    return res.json();
}

// Delete user
export async function deleteUser(id) {
    const res = await fetch(`${USERS_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });

    if (!res.ok) {
        let msg = `Failed to delete user (${res.status})`;
        try {
            const data = await res.json();
            if (data && data.message) msg = data.message;
        } catch {
            /* ignore parse errors */
        }
        throw new Error(msg);
    }

    return res.json();
}

// Upload avatar for user
export async function uploadUserAvatar(id, file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await fetch(`${USERS_URL}/${id}/avatar`, {
            method: 'POST',
            headers: authHeaders(),
            body: formData
        });

        if (!res.ok) {
            let msg = `Failed to upload avatar (${res.status})`;
            try {
                const data = await res.json();
                if (data && data.message) msg = data.message;
            } catch {
                // ignore parse errors
            }
            throw new Error(msg);
        }

        return res.json();
    } catch (err) {
        console.error('uploadUserAvatar network/error', err);
        throw new Error(err.message || 'Failed to upload avatar: network or unknown error');
    }
}

// Get single user
export async function getUser(id) {
    console.log('api/users.getUser', { id });
    const res = await fetch(`${USERS_URL}/${id}`, { headers: authHeaders() });
    console.log('api/users.getUser response status', res.status);
    if (!res.ok) {
        let msg = `Failed to fetch user (${res.status})`;
        try {
            const data = await res.json();
            console.log('api/users.getUser error body', data);
            if (data && data.message) msg = data.message;
        } catch (err) {
            console.warn('could not parse error body', err);
        }
        throw new Error(msg);
    }

    const body = await res.json();
    console.log('api/users.getUser success', body);
    return body;
}


// ====================== HISTORY ======================

// Fetch recent action logs with optional pagination
// returns { logs: [...], total: number }
export async function fetchHistory(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${HISTORY_URL}?${params}`, { headers: authHeaders() });

    if (!res.ok) throw new Error("Failed to fetch history");

    return res.json();
}
