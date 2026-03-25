// api/questions.js
import { API_URLS, getAuthHeaders, handleResponse } from './client';

// Fetch questions with optional filters
export async function fetchQuestions(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_URLS.QUESTIONS}?${searchParams.toString()}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Fetch single question
export async function fetchQuestion(id) {
    const res = await fetch(`${API_URLS.QUESTIONS}/${id}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Create question
export async function createQuestion(data) {
    const res = await fetch(API_URLS.QUESTIONS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Update question
export async function updateQuestion(id, data) {
    const res = await fetch(`${API_URLS.QUESTIONS}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Delete question
export async function deleteQuestion(id) {
    const res = await fetch(`${API_URLS.QUESTIONS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}