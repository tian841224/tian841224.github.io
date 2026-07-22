/* =====================================================
   主動畫引擎
   - 開機畫面（BIOS 風，可按任意鍵跳過）
   - 指令打字機（區塊進入視窗才播放，單次）
   - 內容 reveal、標題 glitch、數字 count-up（單次）
   - 卡片 3D tilt（桌機 hover）
   - Mermaid 惰性渲染、選單 active、年資計算
   - Konami code 彩蛋
   - prefers-reduced-motion：全部降級為靜態
   ===================================================== */
(function () {
    'use strict';

    const docEl = document.documentElement;
    docEl.classList.remove('no-js'); // JS 可用，啟用動畫路徑；失效時 CSS 以 .no-js 保底顯示內容
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) docEl.classList.add('no-motion');

    /* ---------- 年資（2019/3 起算） ---------- */
    function calcYears() {
        const start = new Date(2019, 2, 1);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        if (now.getMonth() < start.getMonth()) years--;
        return Math.max(years, 1);
    }
    const yearsEl = document.getElementById('years-experience');
    if (yearsEl) yearsEl.textContent = String(calcYears());

    /* ---------- 打字機 ---------- */
    function typeText(el, text, speed) {
        return new Promise(function (resolve) {
            if (reducedMotion) {
                el.textContent = text;
                resolve();
                return;
            }
            let i = 0;
            (function tick() {
                if (i <= text.length) {
                    el.textContent = text.slice(0, i);
                    i++;
                    setTimeout(tick, speed);
                } else {
                    resolve();
                }
            })();
        });
    }

    /* ---------- 開機畫面 ---------- */
    const bootScreen = document.getElementById('boot-screen');
    const bootLog = document.getElementById('boot-log');
    let booted = false;

    const BOOT_LINES = [
        'TIAN-BIOS v5.0  ── Initializing...',
        'CPU  : Backend Engineer core detected',
        'MEM  : 7+ years experience ............ OK',
        'DISK : Go / C# / TypeScript mounted ... OK',
        'NET  : github.com/tian841224 .......... OK',
        '',
        'Boot sequence complete. Launching portfolio...'
    ];

    function finishBoot() {
        if (booted) return;
        booted = true;
        if (bootScreen) {
            bootScreen.classList.add('boot-done');
            setTimeout(function () { bootScreen.remove(); }, 500);
        }
        document.body.classList.add('booted');
        window.removeEventListener('keydown', finishBoot);
        window.removeEventListener('pointerdown', finishBoot);
        startHomeSequence();
    }

    function runBoot() {
        if (reducedMotion || !bootScreen || !bootLog) {
            if (bootScreen) bootScreen.remove();
            document.body.classList.add('booted');
            booted = true;
            startHomeSequence();
            return;
        }
        window.addEventListener('keydown', finishBoot);
        window.addEventListener('pointerdown', finishBoot);

        let idx = 0;
        (function next() {
            if (booted) return;
            if (idx >= BOOT_LINES.length) {
                setTimeout(finishBoot, 350);
                return;
            }
            const line = document.createElement('div');
            const text = BOOT_LINES[idx];
            line.innerHTML = text === '' ? '&nbsp;' :
                text.replace(' OK', ' <span class="ok">OK</span>');
            bootLog.appendChild(line);
            idx++;
            setTimeout(next, idx <= 1 ? 300 : 180);
        })();
    }

    /* ---------- 區塊打字 + reveal（單次） ---------- */
    function playSection(section) {
        if (section.dataset.played) return;
        section.dataset.played = 'true';

        // 標題 glitch（0.4s 單次）
        const title = section.querySelector('.section-title.glitch-text');
        if (title && !reducedMotion) {
            title.classList.add('glitching');
            setTimeout(function () { title.classList.remove('glitching'); }, 500);
        }

        const targets = section.querySelectorAll('.type-target');
        const reveals = section.querySelectorAll('.reveal-line, .reveal-group');

        function revealAll() {
            reveals.forEach(function (el, i) {
                setTimeout(function () { el.classList.add('in'); }, reducedMotion ? 0 : i * 90);
            });
        }

        if (targets.length === 0) {
            revealAll();
            return;
        }

        // 逐一打出該區塊的指令行，全部完成後 reveal 輸出
        let chain = Promise.resolve();
        targets.forEach(function (t) {
            chain = chain.then(function () {
                // 打字前先讓該行可見，避免在隱藏狀態下打完才整行浮現
                const revealParent = t.closest('.reveal-line');
                if (revealParent) revealParent.classList.add('in');
                const speed = parseInt(t.dataset.speed || '38', 10);
                return typeText(t, t.dataset.type, speed).then(function () {
                    const line = t.closest('.cmd-line');
                    if (line) line.classList.add('typed');
                });
            });
        });
        chain.then(revealAll);
    }

    /* ---------- home 區在開機完成後立即播放 ---------- */
    function startHomeSequence() {
        const home = document.getElementById('home');
        if (home) playSection(home);
    }

    /* ---------- IntersectionObserver：其餘區塊進場才播 ---------- */
    const sections = Array.prototype.slice.call(document.querySelectorAll('.cmd-section[id]'));

    const sectionIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            if (entry.target.id === 'home') return; // home 由開機流程觸發
            playSection(entry.target);
        });
    }, { threshold: 0.12 });

    sections.forEach(function (s) { sectionIO.observe(s); });

    /* ---------- 選單 active + Matrix 動態退位 ---------- */
    const menuLinks = Array.prototype.slice.call(document.querySelectorAll('.menu-link'));

    function setActive(id) {
        menuLinks.forEach(function (a) {
            const on = a.getAttribute('href') === '#' + id;
            a.classList.toggle('active', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });
    }

    const navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
                // hero 以外的內容區 → 背景退位
                if (window.MatrixRain) {
                    window.MatrixRain.setDim(entry.target.id !== 'home');
                }
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { navIO.observe(s); });
    setActive('home'); // 初始狀態

    /* ---------- 數字 count-up（單次，敘述句內的數字） ---------- */
    function formatNum(n, format) {
        return format === 'comma' ? n.toLocaleString('en-US') : String(n);
    }

    function countUp(el) {
        const target = parseInt(el.dataset.count, 10);
        const format = el.dataset.format;
        if (reducedMotion || !isFinite(target)) {
            el.textContent = formatNum(target, format);
            return;
        }
        const dur = 1200;
        const t0 = performance.now();
        (function frame(now) {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            el.textContent = formatNum(Math.round(target * eased), format);
            if (p < 1) requestAnimationFrame(frame);
        })(performance.now());
    }

    const numIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                countUp(entry.target);
                numIO.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.num[data-count]').forEach(function (el) { numIO.observe(el); });

    /* ---------- 卡片 3D tilt（桌機、非觸控、非 reduced-motion） ---------- */
    const canTilt = !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (canTilt) {
        document.querySelectorAll('.tilt-card').forEach(function (card) {
            let raf = null;
            card.addEventListener('mousemove', function (e) {
                if (raf) return;
                raf = requestAnimationFrame(function () {
                    raf = null;
                    const r = card.getBoundingClientRect();
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    card.style.transform =
                        'perspective(900px) rotateX(' + (-py * 3).toFixed(2) + 'deg) rotateY(' +
                        (px * 3).toFixed(2) + 'deg)';
                });
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    /* ---------- Mermaid 惰性渲染（通用迴圈，五張圖共用） ---------- */
    if (window.mermaid) {
        mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'dark' });

        document.querySelectorAll('details[data-mermaid]').forEach(function (det, idx) {
            det.addEventListener('toggle', function () {
                if (!det.open || det.dataset.rendered) return;
                det.dataset.rendered = 'true';
                const srcEl = document.getElementById(det.dataset.mermaid);
                const viewEl = det.querySelector('.mermaid-view');
                if (!srcEl || !viewEl) return;
                viewEl.innerHTML = '<p class="mermaid-loading">渲染架構圖中…</p>';
                mermaid.render('mmd-' + idx, srcEl.textContent.trim())
                    .then(function (out) { viewEl.innerHTML = out.svg; })
                    .catch(function (e) {
                        console.error('Mermaid render error:', e);
                        viewEl.innerHTML = '<p class="output-line info">架構圖渲染失敗，請重新整理頁面再試</p>';
                    });
            });
        });
    }

    /* ---------- Konami code 彩蛋 ---------- */
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiPos = 0;

    window.addEventListener('keydown', function (e) {
        if (reducedMotion) return;
        // 在輸入框打字時不觸發
        if (e.target && e.target.tagName === 'INPUT') return;
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === KONAMI[konamiPos]) {
            konamiPos++;
            if (konamiPos === KONAMI.length) {
                konamiPos = 0;
                triggerKonami();
            }
        } else {
            konamiPos = key === KONAMI[0] ? 1 : 0;
        }
    });

    function triggerKonami() {
        if (window.MatrixRain) window.MatrixRain.rave(8000);
        const toast = document.createElement('div');
        toast.className = 'konami-toast';
        toast.textContent = 'ACHIEVEMENT UNLOCKED: true geek';
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 4000);
    }

    /* ---------- 啟動 ---------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runBoot);
    } else {
        runBoot();
    }
})();
