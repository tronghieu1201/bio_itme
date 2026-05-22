// theme.js – light/dark theme toggle with localStorage persistence
// and pointer-tracking ripple effect on link buttons.
(function () {
    const STORAGE_KEY = 'site-theme';
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    /* ---- Theme application ---- */
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            toggle.textContent = '☀️';
            toggle.setAttribute('aria-label', 'Chuyển sang giao diện sáng');
        } else {
            root.classList.remove('dark');
            toggle.textContent = '🌙';
            toggle.setAttribute('aria-label', 'Chuyển sang giao diện tối');
        }
    }

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    /* ---- Initialise ---- */
    const stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
        applyTheme(stored);
    } else {
        applyTheme(prefersDark.matches ? 'dark' : 'light');
    }

    /* ---- System preference change ---- */
    if (prefersDark.addEventListener) {
        prefersDark.addEventListener('change', function (e) {
            if (!getStoredTheme()) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /* ---- Toggle click ---- */
    if (toggle) {
        toggle.addEventListener('click', function () {
            var isDark = document.documentElement.classList.contains('dark');
            var next = isDark ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) { /* quota exceeded – ignore */ }
            applyTheme(next);
        });
    }

    /* ---- Pointer-tracking ripple on .link-btn ---- */
    document.querySelectorAll('.link-btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--mx', x + '%');
            btn.style.setProperty('--my', y + '%');
        });
    });

    /* ---- QR Lightbox ---- */
    var zaloBtn = document.getElementById('link-zalo');
    var qrClose = document.getElementById('qr-close');
    var lightbox = document.getElementById('qr-lightbox');

    function openLightbox() {
        if (lightbox) {
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
        }
    }

    if (zaloBtn) {
        zaloBtn.addEventListener('click', openLightbox);
    }

    if (qrClose) {
        qrClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.querySelector('.lightbox__backdrop').addEventListener('click', closeLightbox);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    /* ---- Profile Info Card ---- */
    var profileOpenBtn = document.getElementById('profile-info-open');
    var profileCloseBtn = document.getElementById('profile-info-close');
    var profileModal = document.getElementById('profile-info-modal');

    function openProfileModal() {
        if (profileModal) {
            profileModal.classList.add('is-open');
            profileModal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeProfileModal() {
        if (profileModal) {
            profileModal.classList.remove('is-open');
            profileModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (profileOpenBtn) {
        profileOpenBtn.addEventListener('click', openProfileModal);
    }

    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', closeProfileModal);
    }

    if (profileModal) {
        profileModal.querySelector('.profile-modal__backdrop').addEventListener('click', closeProfileModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeProfileModal();
        });
    }

    /* ---- Copy Email to Clipboard ---- */
    var emailBtn = document.getElementById('link-email');
    var toast = document.getElementById('toast');
    var toastTimer = null;

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 2000);
    }

    if (emailBtn) {
        emailBtn.addEventListener('click', function () {
            var email = emailBtn.getAttribute('data-email');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(function () {
                    showToast('Đã copy email: ' + email);
                });
            } else {
                // Fallback cho trình duyệt cũ
                var tmp = document.createElement('textarea');
                tmp.value = email;
                tmp.style.position = 'fixed';
                tmp.style.opacity = '0';
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand('copy');
                document.body.removeChild(tmp);
                showToast('Đã copy email: ' + email);
            }
        });
    }
})();
