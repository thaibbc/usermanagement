// API helper functions for communicating with the backend

const API = "https://usermanagement-vle7.onrender.com";
const USERS_URL = `${API}/api/users`;
const HISTORY_URL = `${API}/api/history`;

// ====================== USERS ======================

// Fetch users with optional filters
export async function fetchUsers(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
        }
    });

    const url = `${USERS_URL}${params.toString() ? `?${params}` : ''}`;

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

    if (!res.ok) throw new Error("Failed to create user");

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

// Fetch recent action logs
export async function fetchHistory() {
    const res = await fetch(HISTORY_URL);

    if (!res.ok) throw new Error("Failed to fetch history");

    return res.json();
}
