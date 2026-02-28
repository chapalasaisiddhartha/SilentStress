const API_BASE_URL = 'http://localhost:5001/api';

// Utility for making authenticated requests
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle unauthorized globally
            if (response.status === 401) {
                logout();
            }
            throw new Error(data.msg || 'Something went wrong');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Check authentication status
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Global logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Get user data
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Add logout event listener if button exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
