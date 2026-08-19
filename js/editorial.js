(function () {
    'use strict';

    var doc = document.documentElement;
    var overlay = document.getElementById('desktop-overlay');
    var skipButton = document.getElementById('intro-skip');
    var launchButton = document.getElementById('intro-launch');
    var introKey = 'tian-portfolio-intro-seen';
    var isLeaving = false;

    doc.classList.add('js-ready');

    function finishIntro(immediate) {
        if (isLeaving || !overlay) return;
        isLeaving = true;
        try { window.sessionStorage.setItem(introKey, '1'); } catch (error) { /* storage can be disabled */ }
        overlay.classList.add('is-leaving');
        if (immediate) overlay.style.display = 'none';
        else window.setTimeout(function () { overlay.style.display = 'none'; }, 400);
    }

    function hasSeenIntro() {
        try { return window.sessionStorage.getItem(introKey) === '1'; } catch (error) { return false; }
    }

    if (overlay) {
        if (hasSeenIntro() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            finishIntro(true);
        } else {
            window.setTimeout(function () { finishIntro(false); }, 1500);
        }
    }
    if (skipButton) skipButton.addEventListener('click', function () { finishIntro(false); });
    if (launchButton) launchButton.addEventListener('click', function () { finishIntro(false); });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && overlay && !isLeaving) finishIntro(false);
        if (event.key === 'Escape' && overlay && !isLeaving) finishIntro(false);
    });

    var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
        revealItems.forEach(function (item) { revealObserver.observe(item); });
    } else {
        revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }

    var navItems = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
    function setActive(id) {
        navItems.forEach(function (item) {
            if (item.getAttribute('data-nav') === id) item.setAttribute('aria-current', 'true');
            else item.removeAttribute('aria-current');
        });
    }
    function updateActiveFromScroll() {
        if (!sections.length) return;
        var marker = window.scrollY + Math.min(window.innerHeight * 0.3, 260);
        var current = sections[0].id;
        sections.forEach(function (section) {
            if (section.offsetTop <= marker) current = section.id;
        });
        setActive(current);
    }
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    window.addEventListener('resize', updateActiveFromScroll);
    updateActiveFromScroll();

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            var target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        });
    });
}());
