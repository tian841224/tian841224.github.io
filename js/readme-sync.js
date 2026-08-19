(function () {
    'use strict';

    function loadReadme(details) {
        if (details.dataset.readmeLoaded) return;

        var target = details.querySelector('.readme-shell');
        var source = details.dataset.readmeSrc;
        if (!target || !source) return;

        details.dataset.readmeLoaded = 'loading';
        fetch(source, { cache: 'no-cache' })
            .then(function (response) {
                if (!response.ok) throw new Error('README 尚未同步');
                return response.text();
            })
            .then(function (html) {
                target.innerHTML = html;
                details.dataset.readmeLoaded = 'true';
            })
            .catch(function () {
                target.innerHTML = '<p class="readme-state">README 尚未同步，請先開啟上方的 GitHub README 連結。</p>';
                details.dataset.readmeLoaded = 'error';
            });
    }

    document.querySelectorAll('details[data-readme-src]').forEach(function (details) {
        details.addEventListener('toggle', function () {
            if (details.open) loadReadme(details);
        });
        if (details.open) loadReadme(details);
    });
}());
