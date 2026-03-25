// api/library/tests.js
import { API_URLS, getAuthHeaders, handleResponse } from '../client';

// Fetch tests with optional filters
export async function fetchTests(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_URLS.LIBRARY}/tests?${searchParams.toString()}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Fetch single test
export async function fetchTest(id) {
    const res = await fetch(`${API_URLS.LIBRARY}/tests/${id}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Create test
export async function createTest(data) {
    const payload = {
        name: data.name,
        type: data.type || 'de-kiem-tra',
        total: data.total || 0,
        starred: data.starred || false,
        folderId: data.folderId || null,
        questions: data.questions || []
    };

    const res = await fetch(`${API_URLS.LIBRARY}/tests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    return handleResponse(res);
}

// Update test
export async function updateTest(id, data) {
    const res = await fetch(`${API_URLS.LIBRARY}/tests/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });

    return handleResponse(res);
}

// Delete test
export async function deleteTest(id) {
    const res = await fetch(`${API_URLS.LIBRARY}/tests/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    return handleResponse(res);
}

// Toggle starred
export async function toggleTestStar(id, starred) {
    const res = await fetch(`${API_URLS.LIBRARY}/tests/${id}/star`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ starred })
    });

    return handleResponse(res);
}

// Bulk create tests
export async function bulkCreateTests(tests) {
    const res = await fetch(`${API_URLS.LIBRARY}/tests/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tests })
    });

    return handleResponse(res);
}

// Bulk delete tests
export async function bulkDeleteTests(testIds) {
    const res = await fetch(`${API_URLS.LIBRARY}/tests/bulk`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ testIds })
    });

    return handleResponse(res);
}

// Compatibility alias
export const fetchTestDetails = fetchTest;