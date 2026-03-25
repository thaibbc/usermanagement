// api/library/folders.js
import { API_URLS, getAuthHeaders, handleResponse } from '../client';

// Fetch all folders
export async function fetchFolders() {
    const res = await fetch(`${API_URLS.LIBRARY}/folders`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Create folder
export async function createFolder(data) {
    const payload = {
        name: data.name,
        title: data.name,
        parentId: data.parent || data.parentId || null,
        color: data.color || '#2E3A59',
        order: data.order || 1
    };

    const res = await fetch(`${API_URLS.LIBRARY}/folders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    return handleResponse(res);
}

// Update folder
export async function updateFolder(id, data) {
    const payload = {
        name: data.name,
        title: data.name,
        parentId: data.parent || data.parentId || null,
        color: data.color,
        order: data.order
    };

    const res = await fetch(`${API_URLS.LIBRARY}/folders/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    return handleResponse(res);
}

// Delete folder
export async function deleteFolder(id) {
    const res = await fetch(`${API_URLS.LIBRARY}/folders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    return handleResponse(res);
}