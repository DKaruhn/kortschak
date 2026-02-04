const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav__link');

const setActiveLink = () => {
    const sections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const scrollPos = window.scrollY + 200;
    let currentId = 'home';

    sections.forEach((section) => {
        if (scrollPos >= section.offsetTop) {
            currentId = section.id;
        }
    });

    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('is-active', isActive);
    });
};

const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
    setActiveLink();
};

if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
}

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) {
            nav.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

window.addEventListener('scroll', onScroll);
window.addEventListener('load', onScroll);
