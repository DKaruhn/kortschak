(function () {
    const PARTIALS = 'partials/';

    function $(sel, root = document){ return root.querySelector(sel); }
    function $all(sel, root = document){ return root.querySelectorAll(sel); }

    async function inject(selectorOrKey, file){
        const el =
            document.querySelector(selectorOrKey) ||
            document.querySelector('[data-include="' + selectorOrKey.replace('#','') + '"]');
        if (!el) return;

        const res = await fetch(PARTIALS + file, { cache: 'no-store' });
        el.innerHTML = await res.text();

        if (file === 'header.html'){
            markActiveNav();
            wireMobileMenu();
        }
    }

    /* ---------- ACTIVE NAV (robust für /route und /route.html) ---------- */
    function stripDomainHashQuery(p){
        return (p || '')
            .replace(location.origin,'')
            .replace(/[#?].*$/,'')
            .replace(/\/+$/,'')
            .toLowerCase();
    }
    function baseName(p){
        const clean = stripDomainHashQuery(p);
        const segs = clean.split('/').filter(Boolean);
        const last = segs.length ? segs[segs.length - 1] : '';
        // ohne Extension vergleichen (heizung === heizung.html)
        const noExt = last.replace(/\.(html?|php|asp)$/,'');
        return noExt || 'index';
    }

    function markActiveNav(){
        let current = baseName(location.pathname);

        const currentHash = location.hash || '';

        $all('.main-nav a').forEach(a => {
            const href = a.getAttribute('href') || '';

            // interner Anker auf Startseite (#kontakt)
            if (href.startsWith('#')){
                const isHomeAnchor = (current === 'index' && href === currentHash);
                if (isHomeAnchor) a.setAttribute('data-active','true');
                else a.removeAttribute('data-active');
                return;
            }

            const target = baseName(href);
            const isActive = target === current || (target === 'index' && current === '');
            if (isActive) a.setAttribute('data-active','true');
            else a.removeAttribute('data-active');
        });
    }
    /* ------------------------------------------------------------------- */

    function wireMobileMenu(){
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
        await inject('[data-include="header"]','header.html');
        await inject('[data-include="bottom"]','bottom.html');
        // falls per History-API navigiert wird
        window.addEventListener('popstate', markActiveNav);
    });
})();
