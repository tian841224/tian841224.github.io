// CMD-style scroll animations - 像終端機一樣逐行出現
document.addEventListener('DOMContentLoaded', function () {
    // Intersection Observer for CMD-style animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');

                // 為區塊內的元素添加逐行出現效果
                const animatableElements = entry.target.querySelectorAll(
                    '.terminal-line, .timeline-item, .project-card, .blog-card, .skill-category, ' +
                    '.highlight-item, .contact-item, h2, h3, h4, p, ul li, .section-subtitle'
                );

                animatableElements.forEach((el, index) => {
                    // 設置初始狀態
                    el.style.opacity = '0';
                    el.style.transform = 'translateX(-10px)';

                    // 逐行出現動畫
                    setTimeout(() => {
                        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        el.style.opacity = '1';
                        el.style.transform = 'translateX(0)';
                    }, index * 50); // 每個元素延遲 50ms,模擬 CMD 逐行執行
                });
            }
        });
    }, observerOptions);

    // Observe all sections except hero
    const sections = document.querySelectorAll('section:not(#home)');
    sections.forEach(section => {
        observer.observe(section);
    });

    // 為卡片添加特殊的 CMD 風格動畫
    const cards = document.querySelectorAll('.project-card, .blog-card, .skill-category');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.boxShadow = '';
        });
    });

    // 為時間軸項目添加打字機效果
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                entry.target.classList.add('typed');

                // 為時間軸內容添加逐行打字效果
                const lines = entry.target.querySelectorAll('li');
                lines.forEach((line, index) => {
                    line.style.opacity = '0';
                    setTimeout(() => {
                        line.style.transition = 'opacity 0.2s ease';
                        line.style.opacity = '1';
                    }, index * 80);
                });
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => timelineObserver.observe(item));
});
