// theme.js - handle light/dark preference and toggle
(function(){
    const STORAGE_KEY = 'site-theme';
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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
        try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
    }

    // initialize
    const stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
        applyTheme(stored);
    } else {
        applyTheme(prefersDark.matches ? 'dark' : 'light');
    }

    // respond to system changes only if user hasn't explicitly set
    prefersDark.addEventListener && prefersDark.addEventListener('change', (e)=>{
        if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
    });

    // toggle handler
    if (toggle) {
        toggle.addEventListener('click', ()=>{
            const now = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            try { localStorage.setItem(STORAGE_KEY, now); } catch(e) {}
            applyTheme(now);
        });
    }
})();
