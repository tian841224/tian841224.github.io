(function () {
    'use strict';

    /* 截圖：縮圖展開成大圖檢視，可切換上一張與下一張（循環）。 */
    document.querySelectorAll('[data-shots]').forEach(function (root) {
        var thumbs = root.querySelectorAll('.shots-thumb');
        var dialog = root.querySelector('.shots-dialog');
        var image = dialog.querySelector('img');
        var caption = dialog.querySelector('figcaption');
        var count = dialog.querySelector('.shots-count');
        var slides = JSON.parse(root.dataset.shots);
        var index = 0;

        /* 只有一張時不需要切換 */
        if (slides.length < 2) {
            dialog.querySelector('.prev').hidden = true;
            dialog.querySelector('.next').hidden = true;
            count.hidden = true;
        }

        function show(next) {
            index = (next + slides.length) % slides.length;
            /* 先清空再指定，讓只播一次的 GIF 每次切換或開啟都從頭播放 */
            image.removeAttribute('src');
            image.src = slides[index].src;
            image.alt = slides[index].label;
            caption.textContent = slides[index].label;
            count.textContent = (index + 1) + ' / ' + slides.length;
        }

        /* 同一個視窗可有多個縮圖入口，用 data-start 指定開啟時的起始張 */
        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(thumb.dataset.start === undefined ? index : Number(thumb.dataset.start));
                dialog.showModal();
            });
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
