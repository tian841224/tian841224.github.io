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
        var view = root.querySelector('.shots-view');
        var image = view.querySelector('img');
        var caption = view.querySelector('figcaption');
        var count = view.querySelector('.shots-count');
        var slides = JSON.parse(root.dataset.shots);
        var index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            image.src = slides[index].src;
            image.alt = slides[index].label;
            caption.textContent = slides[index].label;
            count.textContent = (index + 1) + ' / ' + slides.length;
        }

        function setOpen(open) {
            view.hidden = !open;
            thumb.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) show(index);
        }

        thumb.addEventListener('click', function () { setOpen(view.hidden); });
        view.querySelector('.prev').addEventListener('click', function () { show(index - 1); });
        view.querySelector('.next').addEventListener('click', function () { show(index + 1); });
        view.querySelector('.close').addEventListener('click', function () {
            setOpen(false);
            thumb.focus();
        });
    });
}());
