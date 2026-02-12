import { CONFIG } from './config.js';
import { state } from './state.js';
import { showScreen } from './utils.js';

export async function login(username, password) {
    try {
        const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const payload = await resp.json();
        if (!resp.ok) {
            return { success: false, error: payload.error || 'Invalid credentials' };
        }

        // Update State
        state.currentUser = payload.user;
        state.userToken = payload.token;
        localStorage.setItem('userToken', state.userToken);
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));

        return { success: true, ...payload };
    } catch (err) {
        console.error("Login Error", err);
        return { success: false, error: 'Connection error' };
    }
}

export function logout(reason = null) {
    state.reset();
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');

    if (reason) {
        localStorage.setItem('logoutReason', reason);
    }

    // Reload to clear all listeners and state cleanly
    window.location.reload();
}

export async function fetchWithAuth(url, options = {}) {
    // Ensure headers object exists
    options.headers = options.headers || {};

    // Add Authorization header if token exists
    if (state.userToken) {
        options.headers['Authorization'] = `Bearer ${state.userToken}`;
    }

    try {
        const response = await fetch(url, options);

        if (response.status === 401) {
            // Session expired or unauthorized
            console.warn('Unauthorized (401) detected. Logging out.');
            logout('Session expired. Please login again.');
            throw new Error('Session expired'); // Stop further execution
        }

        return response;
    } catch (error) {
        throw error;
    }
}

export async function createUser(userData) {
    try {
        const resp = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.userToken}` },
            body: JSON.stringify(userData)
        });
        if (resp.ok) return { success: true, message: 'User created successfully' };
        const payload = await resp.json();
        return { success: false, error: payload.error || 'Error creating user' };
    } catch (err) {
        return { success: false, error: 'Connection error' };
    }
}
