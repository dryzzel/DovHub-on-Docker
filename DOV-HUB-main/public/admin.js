

let currentEditingUserId = null;

const searchInput = document.getElementById('searchInput');
const createUserBtn = document.getElementById('createUserBtn');
const usersTableBody = document.getElementById('usersTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const userModal = document.getElementById('userModal');
const deleteModal = document.getElementById('deleteModal');
const userForm = document.getElementById('userForm');
const notification = document.getElementById('notification');

const modalTitle = document.getElementById('modalTitle');
const closeModal = document.querySelector('.close');
const closeDeleteModal = document.querySelector('.close-delete');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const passwordOptional = document.getElementById('passwordOptional');

const userIdInput = document.getElementById('userId');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const teamInput = document.getElementById('team');
const rankSelect = document.getElementById('rank');
const statusSelect = document.getElementById('status');
const rcExtensionInput = document.getElementById('rcExtension');
const codeInput = document.getElementById('code');

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    createUserBtn.addEventListener('click', openCreateModal);
    closeModal.addEventListener('click', closeUserModal);
    closeDeleteModal.addEventListener('click', closeDeleteConfirmModal);
    cancelBtn.addEventListener('click', closeUserModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
    userForm.addEventListener('submit', handleFormSubmit);

    window.addEventListener('click', (e) => {
        if (e.target === userModal) closeUserModal();
        if (e.target === deleteModal) closeDeleteConfirmModal();
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function loadUsers(searchQuery = '') {
    showLoading(true);
    try {
        const url = searchQuery
            ? `/api/users?search=${encodeURIComponent(searchQuery)}`
            : '/api/users';

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showNotification('Access denied', 'error');
                setTimeout(() => window.location.href = '/', 2000);
                return;
            }
            throw new Error('Error loading users');
        }

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading users', 'error');
        usersTableBody.innerHTML = '<tr><td colspan="9" class="empty-state"><h3>Error loading data</h3></td></tr>';
    } finally {
        showLoading(false);
    }
}

function displayUsers(users) {
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <h3>No users found</h3>
                    <p>Create a new user to get started</p>
                </td>
            </tr>
        `;
        return;
    }

    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${escapeHtml(user.user || '')}</td>
            <td>${escapeHtml(user.fullName || 'N/A')}</td>
            <td>${escapeHtml(user.email || 'N/A')}</td>
            <td>${escapeHtml(user.team || 'N/A')}</td>
            <td>${escapeHtml(user.rank || 'Agent')}</td>
            <td>${escapeHtml(user.status || 'Active')}</td>
            <td>${escapeHtml(user.rcExtension || 'N/A')}</td>
            <td>${escapeHtml(user.code || '000')}</td>
            <td>
                <button class="btn-primary btn-edit" data-user-id="${user._id}">Edit</button>
                <button class="btn-danger btn-delete" data-user-id="${user._id}" data-username="${escapeHtml(user.user)}">Delete</button>
            </td>
        </tr>
    `).join('');


    attachButtonListeners();
}

function handleSearch(e) {
    const query = e.target.value.trim();
    loadUsers(query);
}

function attachButtonListeners() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            openEditModal(userId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.getAttribute('data-user-id');
            const username = btn.getAttribute('data-username');
            openDeleteModal(userId, username);
        });
    });
}

function openCreateModal() {
    currentEditingUserId = null;
    modalTitle.textContent = 'Create User';
    passwordOptional.style.display = 'none';
    passwordInput.required = true;
    userForm.reset();
    userModal.style.display = 'block';
}

async function openEditModal(userId) {
    currentEditingUserId = userId;
    modalTitle.textContent = 'Edit User';
    passwordOptional.style.display = 'inline';
    passwordInput.required = false;

    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Error loading user');

        const users = await response.json();
        const user = users.find(u => u._id === userId);

        if (!user) {
            showNotification('User not found', 'error');
            return;
        }

        userIdInput.value = user._id;
        usernameInput.value = user.user || '';
        passwordInput.value = '';
        fullNameInput.value = user.fullName || '';
        emailInput.value = user.email || '';
        teamInput.value = user.team || '';
        rankSelect.value = user.rank || 'Agent';
        statusSelect.value = user.status || 'Active';
        rcExtensionInput.value = user.rcExtension || '';
        codeInput.value = user.code || '000';

        userModal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading user', 'error');
    }
}

function closeUserModal() {
    userModal.style.display = 'none';
    userForm.reset();
    currentEditingUserId = null;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const userData = {
        user: usernameInput.value.trim(),
        pass: passwordInput.value.trim(),
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        team: teamInput.value.trim(),
        rank: rankSelect.value,
        status: statusSelect.value,
        rcExtension: rcExtensionInput.value.trim(),
        code: codeInput.value.trim() || '000'
    };

    if (!userData.user) {
        showNotification('Username is required', 'error');
        return;
    }

    if (!currentEditingUserId && !userData.pass) {
        showNotification('Password is required for new users', 'error');
        return;
    }

    try {
        let response;

        if (currentEditingUserId) {
            response = await fetch(`/api/users/${currentEditingUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } else {
            response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error saving user');
        }

        showNotification(
            currentEditingUserId ? 'User updated successfully' : 'User created successfully',
            'success'
        );

        closeUserModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
}

function openDeleteModal(userId, username) {
    currentEditingUserId = userId;
    document.getElementById('deleteUsername').textContent = username;
    deleteModal.style.display = 'block';
}

function closeDeleteConfirmModal() {
    deleteModal.style.display = 'none';
    currentEditingUserId = null;
}

confirmDeleteBtn.addEventListener('click', async () => {
    if (!currentEditingUserId) return;

    try {
        const response = await fetch(`/api/users/${currentEditingUserId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error deleting user');
        }

        showNotification('User deleted successfully', 'success');
        closeDeleteConfirmModal();
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    }
});

function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
