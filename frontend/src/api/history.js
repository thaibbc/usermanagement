// api/history.js
import { API_URLS, getAuthHeaders, handleResponse } from './client';

// Fetch history with pagination
export async function fetchHistory(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${API_URLS.HISTORY}?${params}`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res);
}

// Fetch history by user (backend uses userCode filter)
export async function fetchUserHistory(userCode, page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });
    if (userCode !== undefined && userCode !== null && userCode !== '') {
        params.append('userCode', userCode);
    }
    const res = await fetch(`${API_URLS.HISTORY}?${params}`, {
        headers: getAuthHeaders()
    });

    return handleResponse(res);
}