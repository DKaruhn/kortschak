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
            .replace(location.origin, '')   // Domain entfernen
            .replace(/[#?].*$/, '')        // Hash & Query entfernen
            .replace(/^\/+/, '')           // führende Slashes entfernen
            .toLowerCase();
    }

    function markActiveNav() {
        let current = normalize(location.pathname);
        if (current === '' || current === '/') current = 'index.html';

        const currentHash = location.hash || '';

        $all('.main-nav a').forEach(a => {
            const full = a.getAttribute('href') || '';
            const base = normalize(full.split('#')[0]);

            let isActive = base === current;

            // Spezialfall: #kontakt auf der Startseite
            if (current === 'index.html' && full === '#kontakt' && currentHash === '#kontakt') {
                isActive = true;
            }

            if (isActive) {
                a.setAttribute('data-active', 'true');
            } else {
                a.removeAttribute('data-active');
            }
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
