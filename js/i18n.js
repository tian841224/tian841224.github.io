(function () {
    'use strict';

    var STORAGE_KEY = 'site-lang';
    var root = document.documentElement;
    /* 電腦版（CONTACT 清單）與手機版（姓名列圖示）各有一顆切換鈕，需同步狀態；
       只有 .lang-toggle-label 那顆會顯示文字，圖示版維持純圖示不放文字。 */
    var toggles = document.querySelectorAll('.lang-toggle');
    var labels = document.querySelectorAll('.lang-toggle-label');

    function apply(lang) {
        var isEn = lang === 'en';
        root.dataset.lang = lang;
        document.querySelectorAll('.t-zh').forEach(function (el) { el.hidden = isEn; });
        document.querySelectorAll('.t-en').forEach(function (el) { el.hidden = !isEn; });
        document.querySelectorAll('[data-aria-zh]').forEach(function (el) {
            el.setAttribute('aria-label', isEn ? el.dataset.ariaEn : el.dataset.ariaZh);
        });
        labels.forEach(function (el) { el.textContent = isEn ? '中文' : 'EN'; });
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 無法存取 localStorage（例如隱私模式）則忽略，改用預設語言 */ }
    apply(saved === 'en' ? 'en' : 'zh');

    toggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var next = root.dataset.lang === 'en' ? 'zh' : 'en';
            apply(next);
            try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* 無法寫入則單純不記住選擇 */ }
        });
    });
}());
