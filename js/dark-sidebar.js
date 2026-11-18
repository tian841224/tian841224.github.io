(function () {
    'use strict';

    /* 即時數據看板的架構圖：點選節點會反白，一次只亮一個。 */
    document.querySelectorAll('[data-flow]').forEach(function (flow) {
        var nodes = flow.querySelectorAll('button.node');
        nodes.forEach(function (node) {
            node.addEventListener('click', function () {
                nodes.forEach(function (other) {
                    other.setAttribute('aria-pressed', other === node ? 'true' : 'false');
                });
            });
        });
    });

    /* 截圖：縮圖展開成大圖檢視，可切換上一張與下一張（循環）。 */
    document.querySelectorAll('[data-shots]').forEach(function (root) {
        var thumb = root.querySelector('.shots-thumb');
        var dialog = root.querySelector('.shots-dialog');
        var image = dialog.querySelector('img');
        var caption = dialog.querySelector('figcaption');
        var count = dialog.querySelector('.shots-count');
        var slides = JSON.parse(root.dataset.shots);
        var index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            image.src = slides[index].src;
            image.alt = slides[index].label;
            caption.textContent = slides[index].label;
            count.textContent = (index + 1) + ' / ' + slides.length;
        }

        thumb.addEventListener('click', function () {
            show(index);
            dialog.showModal();
        });
        dialog.querySelector('.prev').addEventListener('click', function () { show(index - 1); });
        dialog.querySelector('.next').addEventListener('click', function () { show(index + 1); });
        dialog.querySelector('.close').addEventListener('click', function () { dialog.close(); });

        /* 方向鍵只在大圖開啟時作用；點暗幕（dialog 本身以外的區域）也會關閉 */
        dialog.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') show(index - 1);
            if (event.key === 'ArrowRight') show(index + 1);
        });
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) dialog.close();
        });
    });
}());
