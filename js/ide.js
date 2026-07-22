/* =====================================================
   IDE 互動引擎
   - 檔案總管 / 分頁 / breadcrumb / 大綱 / 狀態列
   - 命令面板（Ctrl+P，模糊搜尋 + > 指令 + hire me 彩蛋）
   - 數字 count-up、行疊進、reveal（單次）
   - Mermaid 惰性渲染、年資計算、手機抽屜
   - prefers-reduced-motion / no-js 降級
   ===================================================== */
(function () {
    'use strict';

    var docEl = document.documentElement;
    docEl.classList.remove('no-js');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) docEl.classList.add('no-motion');

    /* ---------- 檔案定義 ---------- */
    var FILES = {
        readme:       { name: 'README.md',        lang: 'Markdown', icon: 'md' },
        about:        { name: 'about.md',         lang: 'Markdown', icon: 'md' },
        skills:       { name: 'skills.json',      lang: 'JSON',     icon: 'json' },
        experience:   { name: 'experience.md',    lang: 'Markdown', icon: 'md' },
        sideprojects: { name: 'side_projects.md', lang: 'Markdown', icon: 'md' },
        notes:        { name: 'notes.md',         lang: 'Markdown', icon: 'md' },
        stats:        { name: 'stats.md',         lang: 'Markdown', icon: 'md' },
        contact:      { name: 'contact.json',     lang: 'JSON',     icon: 'json' }
    };
    var FILE_ORDER = ['readme', 'about', 'skills', 'experience', 'sideprojects', 'notes', 'stats', 'contact'];

    var tabbar = document.getElementById('tabbar');
    var breadcrumb = document.getElementById('breadcrumb');
    var editorBody = document.getElementById('editor-body');
    var sbLang = document.getElementById('sb-lang');
    var sbPos = document.getElementById('sb-pos');
    var outlineBox = document.getElementById('outline');

    var openTabs = [];   // 已開啟的檔案 key 順序
    var activeKey = null;

    /* ---------- 年資（2019/3 起算） ---------- */
    function calcYears() {
        var start = new Date(2019, 2, 1);
        var now = new Date();
        var years = now.getFullYear() - start.getFullYear();
        if (now.getMonth() < start.getMonth()) years--;
        return Math.max(years, 1);
    }
    var years = String(calcYears());
    var yearsEl = document.getElementById('years-experience');
    var sbYears = document.getElementById('sb-years');
    if (yearsEl) yearsEl.textContent = years;
    if (sbYears) sbYears.textContent = years;

    /* ---------- 分頁 ---------- */
    function pageOf(key) { return document.getElementById('page-' + key); }

    function renderTabs() {
        tabbar.innerHTML = '';
        openTabs.forEach(function (key) {
            var f = FILES[key];
            var tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'tab';
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', key === activeKey ? 'true' : 'false');
            tab.dataset.file = key;

            var icon = document.createElement('span');
            icon.className = 'fi fi-' + f.icon;
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = f.icon === 'json' ? '{}' : 'M↓';
            tab.appendChild(icon);
            tab.appendChild(document.createTextNode(f.name));

            if (openTabs.length > 1) {
                var close = document.createElement('span');
                close.className = 'tab-close';
                close.setAttribute('role', 'button');
                close.setAttribute('aria-label', '關閉 ' + f.name);
                close.setAttribute('tabindex', '0');
                close.textContent = '×';
                close.addEventListener('click', function (e) {
                    e.stopPropagation();
                    closeFile(key);
                });
                close.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        closeFile(key);
                    }
                });
                tab.appendChild(close);
            }

            tab.addEventListener('click', function () { openFile(key); });
            tabbar.appendChild(tab);
        });
    }

    function buildOutline(key) {
        if (!outlineBox) return;
        outlineBox.innerHTML = '';
        var page = pageOf(key);
        page.querySelectorAll('[data-outline]').forEach(function (h) {
            var a = document.createElement('a');
            a.href = 'javascript:void(0)';
            a.textContent = h.dataset.outline;
            a.addEventListener('click', function () {
                h.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
            });
            outlineBox.appendChild(a);
        });
    }

    function openFile(key, skipHash) {
        if (!FILES[key]) return;
        if (openTabs.indexOf(key) === -1) openTabs.push(key);

        if (activeKey && activeKey !== key) {
            var prev = pageOf(activeKey);
            if (prev) prev.hidden = true;
        }
        activeKey = key;

        var page = pageOf(key);
        page.hidden = false;
        if (!reducedMotion) {
            page.classList.remove('entering');
            void page.offsetWidth; // 重新觸發動畫
            page.classList.add('entering');
        }
        editorBody.scrollTop = 0;

        // UI 同步
        renderTabs();
        document.querySelectorAll('.tree-file').forEach(function (b) {
            var on = b.dataset.file === key;
            b.classList.toggle('active', on);
            if (on) b.setAttribute('aria-current', 'true');
            else b.removeAttribute('aria-current');
        });
        breadcrumb.textContent = 'tian_portfolio ▸ ' + FILES[key].name;
        if (sbLang) sbLang.textContent = FILES[key].lang;
        document.title = FILES[key].name + ' — Tian Portfolio';
        buildOutline(key);
        if (!skipHash) history.replaceState(null, '', '#' + key);

        playPageEffects(page);
        closeDrawer();
    }

    function closeFile(key) {
        var idx = openTabs.indexOf(key);
        if (idx === -1 || openTabs.length <= 1) return;
        openTabs.splice(idx, 1);
        if (activeKey === key) {
            openFile(openTabs[Math.max(0, idx - 1)]);
        } else {
            renderTabs();
        }
    }

    /* ---------- 頁面特效（單次） ---------- */
    function playPageEffects(page) {
        // reveal group
        page.querySelectorAll('.reveal-group').forEach(function (g) {
            requestAnimationFrame(function () { g.classList.add('in'); });
        });

        // 程式碼行疊進（skills.json / contact.json / bat 區塊，首次一次）
        if (!reducedMotion && !page.dataset.cascaded) {
            page.dataset.cascaded = 'true';
            page.querySelectorAll('.json-view, .codeblock-body').forEach(function (block) {
                block.classList.add('cascade');
                block.querySelectorAll('.ln').forEach(function (ln, i) {
                    ln.style.animationDelay = Math.min(i * 28, 700) + 'ms';
                });
            });
        }

        // 數字 count-up（進入視窗才播，單次）
        page.querySelectorAll('.num[data-count]').forEach(function (el) {
            if (!el.dataset.observed) {
                el.dataset.observed = 'true';
                numIO.observe(el);
            }
        });
    }

    /* ---------- 數字 count-up ---------- */
    function formatNum(n, format) {
        return format === 'comma' ? n.toLocaleString('en-US') : String(n);
    }

    function countUp(el) {
        var target = parseInt(el.dataset.count, 10);
        var format = el.dataset.format;
        if (reducedMotion || !isFinite(target)) {
            el.textContent = formatNum(target, format);
            return;
        }
        var dur = 1100;
        var t0 = performance.now();
        (function frame(now) {
            var p = Math.min((now - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = formatNum(Math.round(target * eased), format);
            if (p < 1) requestAnimationFrame(frame);
        })(performance.now());
    }

    var numIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                countUp(entry.target);
                numIO.unobserve(entry.target);
            }
        });
    }, { root: editorBody, threshold: 0.5 });

    /* ---------- 檔案總管點擊 ---------- */
    document.querySelectorAll('.tree-file').forEach(function (b) {
        b.addEventListener('click', function () { openFile(b.dataset.file); });
    });

    document.querySelectorAll('[data-open]').forEach(function (b) {
        b.addEventListener('click', function () { openFile(b.dataset.open); });
    });

    /* ---------- 狀態列 Ln/Col（隨捲動更新的趣味細節） ---------- */
    if (sbPos) {
        var posRaf = null;
        editorBody.addEventListener('scroll', function () {
            if (posRaf) return;
            posRaf = requestAnimationFrame(function () {
                posRaf = null;
                var ln = Math.max(1, Math.round(editorBody.scrollTop / 24) + 1);
                sbPos.textContent = 'Ln ' + ln + ', Col 1';
            });
        }, { passive: true });
    }

    /* ---------- 手機抽屜 ---------- */
    var sidebar = document.getElementById('sidebar');
    var drawerToggle = document.getElementById('drawer-toggle');
    var backdrop = document.getElementById('drawer-backdrop');

    function openDrawer() {
        sidebar.classList.add('open');
        backdrop.hidden = false;
        drawerToggle.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer() {
        sidebar.classList.remove('open');
        backdrop.hidden = true;
        drawerToggle.setAttribute('aria-expanded', 'false');
    }

    drawerToggle.addEventListener('click', function () {
        if (sidebar.classList.contains('open')) closeDrawer();
        else openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeDrawer();
            drawerToggle.focus();
        }
    });

    /* ---------- 命令面板 ---------- */
    var overlay = document.getElementById('palette-overlay');
    var paletteInput = document.getElementById('palette-input');
    var paletteList = document.getElementById('palette-list');
    var paletteOpenBtn = document.getElementById('palette-open');
    var selectedIdx = 0;
    var currentItems = [];
    var lastFocus = null;

    var COMMANDS = [
        { label: '> Toggle: 開/關側欄', run: function () { sidebar.classList.contains('open') ? closeDrawer() : openDrawer(); } },
        { label: '> Go to: GitHub', run: function () { window.open('https://github.com/tian841224', '_blank', 'noopener'); } },
        { label: '> sudo hire-me', run: function () {
            openFile('contact');
            toast('Permission granted ✓ 已開啟 contact.json — 期待與你聊聊', true);
        } }
    ];

    function buildItems(query) {
        var q = query.trim().toLowerCase();
        var items = [];
        if (q.charAt(0) === '>') {
            var cq = q.slice(1).trim();
            COMMANDS.forEach(function (c) {
                if (!cq || c.label.toLowerCase().indexOf(cq) !== -1) items.push(c);
            });
        } else {
            FILE_ORDER.forEach(function (key) {
                var f = FILES[key];
                if (!q || f.name.toLowerCase().indexOf(q) !== -1 || key.indexOf(q) !== -1) {
                    items.push({ label: f.name, icon: f.icon, desc: f.lang, run: function () { openFile(key); } });
                }
            });
            // 隱藏彩蛋入口：直接輸入 hire 也找得到
            if (q && '> sudo hire-me'.indexOf(q) !== -1) items.push(COMMANDS[2]);
        }
        return items;
    }

    function renderPalette() {
        paletteList.innerHTML = '';
        if (currentItems.length === 0) {
            var empty = document.createElement('li');
            empty.className = 'palette-empty';
            empty.textContent = '找不到符合的檔案或指令（輸入 > 可查看指令）';
            paletteList.appendChild(empty);
            return;
        }
        currentItems.forEach(function (item, i) {
            var li = document.createElement('li');
            li.className = 'palette-item' + (i === selectedIdx ? ' selected' : '');
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', i === selectedIdx ? 'true' : 'false');
            if (item.icon) {
                var ic = document.createElement('span');
                ic.className = 'fi fi-' + item.icon;
                ic.setAttribute('aria-hidden', 'true');
                ic.textContent = item.icon === 'json' ? '{}' : 'M↓';
                li.appendChild(ic);
            }
            li.appendChild(document.createTextNode(item.label));
            if (item.desc) {
                var d = document.createElement('span');
                d.className = 'pi-desc';
                d.textContent = item.desc;
                li.appendChild(d);
            }
            li.addEventListener('click', function () { runItem(item); });
            paletteList.appendChild(li);
        });
    }

    function refreshPalette() {
        currentItems = buildItems(paletteInput.value);
        selectedIdx = 0;
        renderPalette();
    }

    var ideRoot = document.getElementById('ide');

    function openPalette() {
        lastFocus = document.activeElement;
        overlay.hidden = false;
        ideRoot.inert = true; // focus trap：背景整塊移出焦點順序（aria-modal 的實際保證）
        paletteInput.value = '';
        refreshPalette();
        paletteInput.focus();
    }

    function closePalette() {
        overlay.hidden = true;
        ideRoot.inert = false;
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function runItem(item) {
        closePalette();
        item.run();
    }

    paletteOpenBtn.addEventListener('click', openPalette);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePalette();
    });

    paletteInput.addEventListener('input', refreshPalette);
    paletteInput.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = Math.min(selectedIdx + 1, currentItems.length - 1);
            renderPalette();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = Math.max(selectedIdx - 1, 0);
            renderPalette();
        } else if (e.key === 'Enter') {
            if (currentItems[selectedIdx]) runItem(currentItems[selectedIdx]);
        } else if (e.key === 'Escape') {
            closePalette();
        }
    });

    window.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'k')) {
            e.preventDefault();
            if (overlay.hidden) openPalette();
            else closePalette();
        } else if (e.key === 'Escape' && !overlay.hidden) {
            closePalette();
        }
    });

    /* ---------- toast ---------- */
    function toast(msg, success) {
        var t = document.createElement('div');
        t.className = 'ide-toast' + (success ? ' success' : '');
        t.setAttribute('role', 'status');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 4200);
    }

    /* ---------- Mermaid 惰性渲染 ---------- */
    if (window.mermaid) {
        mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'dark' });

        document.querySelectorAll('details[data-mermaid]').forEach(function (det, idx) {
            det.addEventListener('toggle', function () {
                if (!det.open || det.dataset.rendered) return;
                det.dataset.rendered = 'true';
                var srcEl = document.getElementById(det.dataset.mermaid);
                var viewEl = det.querySelector('.mermaid-view');
                if (!srcEl || !viewEl) return;
                viewEl.innerHTML = '<p class="mermaid-loading">渲染架構圖中…</p>';
                mermaid.render('mmd-render-' + idx, srcEl.textContent.trim())
                    .then(function (out) { viewEl.innerHTML = out.svg; })
                    .catch(function (e) {
                        console.error('Mermaid render error:', e);
                        viewEl.innerHTML = '<p class="img-fallback">架構圖渲染失敗，請重新整理頁面再試</p>';
                    });
            });
        });
    }

    /* ---------- 啟動：依 hash 或預設開 README ---------- */
    var initial = (location.hash || '').replace('#', '');
    // 相容舊網址 anchor
    var LEGACY = { home: 'readme', blog: 'notes', projects: 'experience' };
    if (LEGACY[initial]) initial = LEGACY[initial];
    if (!FILES[initial]) initial = 'readme';

    openFile('readme', true);           // README 常駐為第一個分頁
    if (initial !== 'readme') openFile(initial);

    window.addEventListener('hashchange', function () {
        var key = (location.hash || '').replace('#', '');
        if (LEGACY[key]) key = LEGACY[key];
        if (FILES[key] && key !== activeKey) openFile(key, true);
    });
})();
