/* =====================================================
   互動指令列
   - help / ls / whoami / clear / 區塊跳轉 / sudo hire-me
   - Tab 自動補完、↑↓ 歷史指令、`/` 快捷聚焦
   - 手機：預設收合，浮動鈕 >_ 展開
   ===================================================== */
(function () {
    'use strict';

    const bar = document.getElementById('cmd-bar');
    const input = document.getElementById('cmd-input');
    const feedback = document.getElementById('cmd-feedback');
    const toggle = document.getElementById('cmd-bar-toggle');
    if (!bar || !input || !feedback || !toggle) return;

    const SECTIONS = ['home', 'about', 'skills', 'experience', 'projects', 'note', 'stats', 'contact'];
    const SECTION_IDS = { note: 'blog' }; // note 對應 #blog

    const history = [];
    let histPos = -1;

    function print(html, cls) {
        const line = document.createElement('div');
        if (cls) line.className = cls;
        line.innerHTML = html;
        feedback.appendChild(line);
        feedback.scrollTop = feedback.scrollHeight;
    }

    function echoCmd(cmd) {
        print('$ ' + escapeHtml(cmd), 'dim');
    }

    function escapeHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function goto(name) {
        const id = SECTION_IDS[name] || name;
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            print('<span class="ok">→ 跳轉到 ' + name + '</span>');
        }
    }

    const COMMANDS = {
        help: function () {
            print('可用指令：');
            print('  ' + SECTIONS.join(' · ') + '  — 跳轉到對應區塊');
            print('  whoami   — 我是誰');
            print('  ls       — 列出所有區塊');
            print('  clear    — 清除輸出');
            print('  help     — 顯示本說明');
            print('  （聽說輸入 sudo hire-me 會發生好事）', 'dim');
        },
        ls: function () {
            print(SECTIONS.map(function (s) { return s + '/'; }).join('  '));
        },
        whoami: function () {
            print('<span class="ok">Tian ── Backend Engineer</span>');
            print('Go · C# (.NET) · TypeScript ｜ Clean Architecture');
            print('高流量訊息系統重構：TPS 由 50-100 提升至 1000+');
        },
        clear: function () {
            feedback.innerHTML = '';
        },
        'sudo hire-me': function () {
            print('<span class="ok">[sudo] Permission granted. Redirecting to contact...</span>');
            setTimeout(function () { goto('contact'); }, 600);
        }
    };

    SECTIONS.forEach(function (s) {
        COMMANDS[s] = function () { goto(s); };
    });

    function run(raw) {
        const cmd = raw.trim();
        if (!cmd) return;
        echoCmd(cmd);
        history.push(cmd);
        histPos = history.length;

        const fn = COMMANDS[cmd.toLowerCase()];
        if (fn) {
            fn();
        } else if (cmd.toLowerCase().indexOf('sudo') === 0) {
            print('<span class="err">sudo: 權限不足（試試 sudo hire-me）</span>');
        } else {
            print('<span class="err">command not found: ' + escapeHtml(cmd) + '</span>，輸入 help 查看可用指令');
        }
    }

    /* Tab 補完 */
    function complete() {
        const val = input.value.trim().toLowerCase();
        if (!val) return;
        const names = Object.keys(COMMANDS);
        const hits = names.filter(function (n) { return n.indexOf(val) === 0; });
        if (hits.length === 1) {
            input.value = hits[0];
        } else if (hits.length > 1) {
            print(hits.join('  '), 'dim');
        }
    }

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            run(input.value);
            input.value = '';
        } else if (e.key === 'Tab') {
            e.preventDefault();
            complete();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histPos > 0) {
                histPos--;
                input.value = history[histPos];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histPos < history.length - 1) {
                histPos++;
                input.value = history[histPos];
            } else {
                histPos = history.length;
                input.value = '';
            }
        } else if (e.key === 'Escape') {
            closeBar();
        }
    });

    /* `/` 快捷鍵聚焦（桌機） */
    window.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement !== input &&
            (!document.activeElement || document.activeElement.tagName !== 'INPUT')) {
            e.preventDefault();
            openBar();
        }
    });

    /* 手機浮動鈕開合 */
    function openBar() {
        bar.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', '關閉終端機指令列');
        toggle.textContent = '✕';
        input.focus();
    }

    function closeBar() {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        if (isDesktop) { input.blur(); return; } // 桌機常駐，只失焦
        bar.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '開啟終端機指令列');
        toggle.textContent = '>_';
    }

    toggle.addEventListener('click', function () {
        if (toggle.getAttribute('aria-expanded') === 'true') closeBar();
        else openBar();
    });

    /* 桌機直接顯示（CSS 已處理 hidden 覆蓋，這裡同步 DOM 狀態） */
    if (window.matchMedia('(min-width: 1024px)').matches) {
        bar.hidden = false;
    }
})();
