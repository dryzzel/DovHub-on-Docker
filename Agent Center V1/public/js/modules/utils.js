export function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const displayType = (id === 'appScreen') ? 'grid' : (id === 'loginScreen' ? 'flex' : 'block');
    const screen = document.getElementById(id);
    if (screen) {
        screen.style.display = displayType;
        if (window.feather) feather.replace();
    }
}

export function showToast(message, type = 'info') {
    let backgroundColor;
    if (type === 'success') backgroundColor = "var(--success)";
    else if (type === 'error') backgroundColor = "var(--danger)";
    else backgroundColor = "var(--accent)";

    if (window.Toastify) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: backgroundColor,
            stopOnFocus: true,
            className: "notification",
            style: {
                background: backgroundColor,
                color: "#fff",
                boxShadow: "var(--shadow-lg)"
            }
        }).showToast();
    } else {
        console.log(`[Toast ${type}]: ${message}`);
        alert(message); // Fallback
    }
}

export function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.textContent = isLight ? '☀️' : '🌙';

    // Dispatch event for charts to update
    window.dispatchEvent(new Event('themeChanged'));
}

export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.textContent = '☀️';
    }
}

export function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

export function phoneTelHref(raw) {
    const digits = (raw || "").toString().replace(/[^+0-9]/g, '');
    return `tel:${encodeURIComponent(digits)}`;
}

export function showLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (container.querySelector('.loader-overlay')) return;

    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = '<div class="spinner"></div>';
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    container.appendChild(loader);
}

export function hideLoader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const loader = container.querySelector('.loader-overlay');
    if (loader) loader.remove();
}
