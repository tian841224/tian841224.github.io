/* =====================================================
   Matrix Rain 背景（Canvas 2D）
   - 內容區捲入時自動降低亮度（動態退位）
   - 滑鼠移過時鄰近字雨加速變亮（漣漪）
   - Konami 暴走模式 API：window.MatrixRain.rave(ms)
   - prefers-reduced-motion：不啟動
   ===================================================== */
(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    if (reducedMotion) {
        canvas.style.display = 'none';
        window.MatrixRain = { rave: function () {}, setDim: function () {} };
        return;
    }

    const ctx = canvas.getContext('2d');
    const BASE_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>/{}[]=+-*#$%&';
    const RAVE_COLORS = ['#3ddc84', '#7a9cff', '#ff3d6e', '#ffbd2e', '#29d8ff'];
    // 小螢幕/觸控裝置降頻：字距加大（欄數減少）、FPS 降低，減少電量與效能負擔
    const isCoarse = window.matchMedia('(pointer: coarse), (max-width: 767px)').matches;
    const FONT_SIZE = isCoarse ? 20 : 15;
    const FPS = isCoarse ? 20 : 30;
    const FRAME_MS = 1000 / FPS;

    let columns = 0;
    let drops = [];
    let boosts = [];       // 滑鼠漣漪：每欄的亮度/速度加成（0~1，隨時間衰減）
    let lastFrame = 0;
    let alpha = 0.55;      // 目前整體透明度
    let targetAlpha = 0.55;
    let raveUntil = 0;
    let mouseX = -9999;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.ceil(canvas.width / FONT_SIZE);
        drops = new Array(columns).fill(0).map(function () {
            return Math.floor(Math.random() * canvas.height / FONT_SIZE);
        });
        boosts = new Array(columns).fill(0);
    }

    function draw(now) {
        requestAnimationFrame(draw);
        if (now - lastFrame < FRAME_MS) return;
        lastFrame = now;

        const raving = now < raveUntil;

        // 平滑靠近目標透明度
        alpha += ((raving ? 0.9 : targetAlpha) - alpha) * 0.06;

        ctx.fillStyle = 'rgba(11, 14, 20, ' + (raving ? 0.14 : 0.1) + ')';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = FONT_SIZE + 'px "Fira Code", monospace';

        const mouseCol = Math.floor(mouseX / FONT_SIZE);

        for (let i = 0; i < columns; i++) {
            // 滑鼠漣漪：鄰近 6 欄注入加成
            if (mouseCol >= 0 && Math.abs(i - mouseCol) < 6) {
                boosts[i] = Math.min(1, boosts[i] + 0.15);
            }
            boosts[i] *= 0.94; // 衰減

            const boost = boosts[i];
            const ch = BASE_CHARS[Math.floor(Math.random() * BASE_CHARS.length)];
            const x = i * FONT_SIZE;
            const y = drops[i] * FONT_SIZE;

            if (raving) {
                ctx.fillStyle = RAVE_COLORS[(i + Math.floor(now / 120)) % RAVE_COLORS.length];
                ctx.globalAlpha = 0.9;
            } else {
                ctx.fillStyle = boost > 0.2 ? '#7fffc2' : '#3ddc84';
                ctx.globalAlpha = alpha * (0.35 + boost * 0.65);
            }
            ctx.fillText(ch, x, y);
            ctx.globalAlpha = 1;

            const speed = (raving ? 2.2 : 1) + boost * 1.2;
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            } else {
                drops[i] += speed * 0.5 + Math.random() * 0.3;
            }
        }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', function (e) {
        // 只在游標落在終端機視窗外（背景區）時觸發漣漪，內容閱讀不受干擾
        const container = document.getElementById('terminal-container');
        if (container) {
            const r = container.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right) {
                mouseX = -9999;
                return;
            }
        }
        mouseX = e.clientX;
    });

    // 對外 API
    window.MatrixRain = {
        /** 暴走模式（Konami 彩蛋用） */
        rave: function (ms) { raveUntil = performance.now() + (ms || 8000); },
        /** 內容區覆蓋時的動態退位：0.2（退位）~ 0.6（前景） */
        setDim: function (dim) { targetAlpha = dim ? 0.22 : 0.55; }
    };

    resize();
    requestAnimationFrame(draw);
})();
