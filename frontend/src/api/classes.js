// api/classes.js
import { API_URLS, getAuthHeaders, handleResponse } from './client';

// Fetch classes with optional filters
export async function fetchClasses(params = {}) {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_URLS.CLASSES}?${searchParams.toString()}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Get class by code
export async function getClassByCode(code) {
    const res = await fetch(`${API_URLS.CLASSES}/code/${code}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Create class
export async function createClass(data) {
    const res = await fetch(API_URLS.CLASSES, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Update class
export async function updateClass(id, data) {
    const res = await fetch(`${API_URLS.CLASSES}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Delete class
export async function deleteClass(id) {
    const res = await fetch(`${API_URLS.CLASSES}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Request to join class (pending approval)
export async function joinClass(classId, userId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId })
    });
    return handleResponse(res);
}

// Approve pending request (teacher/admin)
export async function approveClassJoin(classId, userId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/approve/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Reject pending request (teacher/admin)
export async function rejectClassJoin(classId, userId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/reject/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Leave class
export async function leaveClass(classId, userId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/leave`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId })
    });
    return handleResponse(res);
}

// ============ QUẢN LÝ HỌC SINH ============

// Get all students in class (approved and pending)
export async function getClassStudents(classId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/students`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Remove student from class (teacher/admin)
export async function removeStudentFromClass(classId, studentId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Add single student to class (teacher/admin)
export async function addStudentToClass(classId, data) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Import multiple students from file (teacher/admin)
export async function importStudentsToClass(classId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URLS.CLASSES}/${classId}/students/import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
    });
    return handleResponse(res);
}

// Bulk approve pending requests
export async function bulkApproveJoinRequests(classId, userIds) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/approve/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds })
    });
    return handleResponse(res);
}

// Bulk reject pending requests
export async function bulkRejectJoinRequests(classId, userIds) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/reject/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds })
    });
    return handleResponse(res);
}

// Get pending requests count
export async function getPendingRequestsCount(classId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/pending/count`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Check if user is in class (approved or pending)
export async function checkUserInClass(classId, userId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/check-user/${userId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Get class statistics
export async function getClassStats(classId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/stats`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Update class status (active/inactive)
export async function updateClassStatus(classId, status) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
}

// Search students in class
export async function searchClassStudents(classId, query) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/students/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Export class students list
export async function exportClassStudents(classId, format = 'csv') {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/students/export?format=${format}`, {
        headers: getAuthHeaders()
    });

    if (!res.ok) {
        throw new Error('Export failed');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-${classId}-students.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
}

// Get class by ID
export async function getClassById(id) {
    const res = await fetch(`${API_URLS.CLASSES}/${id}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// ============ QUẢN LÝ BÀI TẬP ============

// Fetch assignments of a class
export async function fetchAssignments(classId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Fetch submissions for a class or student
// api/classes.js - Sửa lại function fetchSubmissions

// Fetch submissions for a class or student
export async function fetchSubmissions(classId, studentId = null) {
    try {
        let url = `${API_URLS.CLASSES}/${classId}/submissions`;
        if (studentId) {
            url += `?studentId=${studentId}`;
        }
        const res = await fetch(url, {
            headers: getAuthHeaders()
        });

        // Kiểm tra response trước khi parse
        if (!res.ok) {
            if (res.status === 500) {
                console.warn('Server error when fetching submissions, returning empty array');
                return { submissions: [], data: [] };
            }
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        return handleResponse(res);
    } catch (error) {
        console.error('fetchSubmissions error:', error);
        // Trả về mảng rỗng thay vì throw error
        return { submissions: [], data: [] };
    }
}

// Fetch submissions for a specific assignment
export async function fetchAssignmentSubmissions(classId, assignmentId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments/${assignmentId}/submissions`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Create assignment
export async function createAssignment(classId, data) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Update assignment
export async function updateAssignment(classId, assignmentId, data) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Delete assignment
export async function deleteAssignment(classId, assignmentId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Get assignment by ID
export async function getAssignmentById(classId, assignmentId) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments/${assignmentId}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}

// Submit assignment (for students)
export async function submitAssignment(classId, assignmentId, data) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}

// Grade assignment (for teachers)
export async function gradeAssignment(classId, assignmentId, studentId, data) {
    const res = await fetch(`${API_URLS.CLASSES}/${classId}/assignments/${assignmentId}/grade/${studentId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
}
// Fetch all classes (for admin/teacher to test)
export async function fetchAllClasses(params = {}) {
    // Không filter theo studentId, lấy tất cả lớp học
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_URLS.CLASSES}?${searchParams.toString()}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
}