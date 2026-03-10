// API helper functions for communicating with the backend user endpoints

const BASE_URL = '/api/users'; // assuming proxy configured or same host

export async function fetchUsers(filters = {}) {
    // filters is an object where keys match query parameters (e.g. { accountType:'student', name:'Alice' })
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
            params.append(k, v);
        }
    });
    const url = `${BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function createUser(user) {
    // user object should include at least { name, email } plus any other fields
    // derive school from email if not provided
    const payload = { ...user };
    if (!payload.school && payload.email) {
        payload.school = payload.email.split('@')[1] || '';
    }
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
}

export async function updateUser(id, updates) {
    // id should be Mongo _id (backend ignores code field for lookup)
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
}

export async function deleteUser(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
}

export async function getUser(id) {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
}

// fetch recent action logs
export async function fetchHistory() {
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
}
