// API helper functions for communicating with the backend

// choose local backend when running in development
const API =
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
        ? 'http://localhost:5000'
        : 'https://usermanagement-vle7.onrender.com';

const USERS_URL = `${API}/api/users`;
const HISTORY_URL = `${API}/api/history`;

// ====================== USERS ======================

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

    const res = await fetch(url);
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
            "Content-Type": "application/json"
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
            "Content-Type": "application/json"
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: newPassword })
    });
    if (!res.ok) throw new Error("Failed to change password");
    return res.json();
}

// Delete user
export async function deleteUser(id) {
    const res = await fetch(`${USERS_URL}/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete user");

    return res.json();
}

// Get single user
export async function getUser(id) {
    const res = await fetch(`${USERS_URL}/${id}`);

    if (!res.ok) throw new Error("Failed to fetch user");

    return res.json();
}


// ====================== HISTORY ======================

// Fetch recent action logs with optional pagination
// returns { logs: [...], total: number }
export async function fetchHistory(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${HISTORY_URL}?${params}`);

    if (!res.ok) throw new Error("Failed to fetch history");

    return res.json();
}
