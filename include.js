(async function () {
    const PARTIALS = 'partials/';

    function $(sel, root = document) { return root.querySelector(sel); }
    function $all(sel, root = document) { return root.querySelectorAll(sel); }

    async function inject(selectorOrKey, file) {
        const el =
            document.querySelector(selectorOrKey) ||
            document.querySelector('[data-include="' + selectorOrKey.replace('#', '') + '"]');
        if (!el) return;

        const res = await fetch(PARTIALS + file, { cache: 'no-store' });
        el.innerHTML = await res.text();

        if (file === 'header.html') {
            markActiveNav();
            wireMobileMenu();
        }
    }

    function normalize(href) {
        if (!href) return '';
        return href
            .replace(location.origin, '')
            .replace(/[#?].*$/, '')
            .replace(/^\/+/, '')
            .toLowerCase();
    }

    function markActiveNav() {
        let current = normalize(location.pathname);
        if (current === '' || current === '/') current = 'index.html';

        $all('.main-nav a').forEach(a => {
            const full = a.getAttribute('href') || '';

            if (full.trim().startsWith('#')) {
                a.removeAttribute('aria-current');
                return;
            }
            const base = normalize(full.split('#')[0]);
            const isActive = base === current;

            if (isActive) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
    }

    function wireMobileMenu() {
        const toggle = $('#nav-toggle');
        const scrim = $('.nav-scrim');
        $all('.main-nav a').forEach(a => a.addEventListener('click', () => {
            if (toggle) toggle.checked = false;
        }));
        if (scrim) scrim.addEventListener('click', () => {
            if (toggle) toggle.checked = false;
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await inject('[data-include="header"]', 'header.html');
        await inject('[data-include="bottom"]', 'bottom.html');
    });
})();
