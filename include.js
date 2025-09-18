(() => {
    async function inject(whereSelector, url) {
        const slot = document.querySelector(whereSelector);
        if (!slot) return;
        const res = await fetch(url, {cache: 'no-cache'});
        slot.outerHTML = await res.text();
    }

    function markActiveNav() {
        const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const links = document.querySelectorAll('.main-nav__link');
        links.forEach(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            const file = href.split('/').pop().split('#')[0] || '';
            const isHome = path === 'index.html' && href.includes('#home');
            if ((file && file === path) || isHome) {
                a.setAttribute('aria-current', 'page');
                a.classList.add('main-nav__link--active');
            }
            // Mobile: Menü schließen beim Klicken
            a.addEventListener('click', () => {
                const t = document.getElementById('nav-toggle');
                if (t) t.checked = false;
            });
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        // Header zuerst, dann Active-State setzen
        await inject('[data-include="header"]', 'partials/header.html');
        markActiveNav();

        // Unterer Block (Notdienst + Kontakt + Footer)
        await inject('[data-include="bottom"]', 'partials/bottom.html');
    });
})();
