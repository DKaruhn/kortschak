(function () {
    const PARTIALS = 'partials/';
    const INTRO_SEEN_KEY = 'vk@intro-shown-session';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => root.querySelectorAll(sel);

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

    /* ---------- ACTIVE NAV ---------- */
    const stripDomainHashQuery = (p='') =>
        p.replace(location.origin,'').replace(/[#?].*$/,'').replace(/\/+$/,'').toLowerCase();

    const baseName = (p) => {
        const clean = stripDomainHashQuery(p);
        const segs = clean.split('/').filter(Boolean);
        const last = segs.length ? segs[segs.length - 1] : '';
        const noExt = last.replace(/\.(html?|php|asp)$/,'');
        return noExt || 'index';
    };

    function markActiveNav(){
        const currentPage = baseName(location.pathname);
        const isHome = currentPage === 'index';
        const currentHash = location.hash || '';

        $$('.main-nav a').forEach(a => {
            a.removeAttribute('data-active');
            a.removeAttribute('aria-current');

            const href = a.getAttribute('href') || '';

            if (href.startsWith('#')){
                const active = isHome && href === currentHash && href !== '';
                if (active){
                    a.setAttribute('data-active','true');
                    a.setAttribute('aria-current','page');
                }
                return;
            }

            const target = baseName(href);
            const active = target === currentPage || (target === 'index' && isHome);
            if (active){
                a.setAttribute('data-active','true');
                a.setAttribute('aria-current','page');
            }
        });
    }
    /* -------------------------------- */

    function wireMobileMenu(){
        const toggle = $('#nav-toggle');
        const scrim = $('.nav-scrim');
        $$('.main-nav a').forEach(a => a.addEventListener('click', () => {
            if (toggle) toggle.checked = false;
        }));
        if (scrim) scrim.addEventListener('click', () => {
            if (toggle) toggle.checked = false;
        });
    }

    /* ------ */
    /* Loader */
    /* ------ */
    function addLoaderOnce(){
        const skip = sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
        if (skip){
            document.documentElement.classList.add('is-ready');
            return;
        }

        sessionStorage.setItem(INTRO_SEEN_KEY, '1');

        document.documentElement.classList.remove('is-ready');

        const el = document.createElement('div');
        el.id = 'app-loader';
        el.innerHTML = `
            <div class="app-loader__inner" role="status" aria-label="Laden">
                <img src="assets/img/logo/kortschak_icon.png" alt="" />
            </div>`;
        document.body.appendChild(el);

        const MIN_SHOW = 800; // ms Mindestdauer sichtbar
        const start = performance.now();

        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            el.classList.add('is-done');
            setTimeout(() => {
                el.remove();
                document.documentElement.classList.add('is-ready'); // triggert Hero-Fadein
            }, 320);
        };

        const onWindowLoad = () => {
            const elapsed = performance.now() - start;
            const delay = Math.max(0, MIN_SHOW - elapsed);
            setTimeout(finish, delay);
        };

        window.addEventListener('load', onWindowLoad, { once:true });
        setTimeout(finish, 4000); // Fallback
    }

    /* ----------------------- */
    /* Parallax + Text-Fadein  */
    /* ----------------------- */
    function heroParallax(){
        const hero = $('.hero');
        const media = hero && hero.querySelector('.hero__media');
        if (!hero || !media) return;

        let raf = null, mx = 0, my = 0;
        const onMove = (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            mx = (x - 0.5);
            my = (y - 0.5);
            if (!raf) {
                raf = requestAnimationFrame(() => {
                    media.style.setProperty('--mx', mx.toFixed(4));
                    media.style.setProperty('--my', my.toFixed(4));
                    raf = null;
                });
            }
        };

        if (matchMedia('(pointer:fine)').matches){
            hero.addEventListener('mousemove', onMove);
            hero.addEventListener('mouseleave', () => {
                media.style.setProperty('--mx', '0');
                media.style.setProperty('--my', '0');
            });
        }
    }

    function heroTextFadeIn(){
        if (!document.getElementById('app-loader')){
            document.documentElement.classList.add('is-ready');
        }
    }

    // Loader
    addLoaderOnce();

    async function boot(){
        await inject('[data-include="header"]','header.html');
        await inject('[data-include="bottom"]','bottom.html');

        heroParallax();
        heroTextFadeIn();

        window.addEventListener('popstate', markActiveNav);
    }

    document.addEventListener('DOMContentLoaded', boot);
})();
