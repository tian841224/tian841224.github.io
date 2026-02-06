// Terminal Portfolio - 完整版 JavaScript (包含打字特效和年資計算)

document.addEventListener('DOMContentLoaded', function () {
    // 計算工作年資 (從 2019/3 到現在)
    function calculateYearsOfExperience() {
        const startDate = new Date(2019, 2); // 2019年3月 (月份從0開始)
        const currentDate = new Date();

        let years = currentDate.getFullYear() - startDate.getFullYear();
        const months = currentDate.getMonth() - startDate.getMonth();

        // 如果未滿一年,則增加一年
        if (months < 0 || (months === 0 && currentDate.getDate() < startDate.getDate())) {
            years--;
        }

        // 未滿一年則增加一年
        if (years < 1) {
            years = 1;
        }

        return years;
    }

    // 更新年資顯示
    const yearsElement = document.getElementById('years-experience');
    if (yearsElement) {
        yearsElement.textContent = calculateYearsOfExperience();
    }

    // 打字機效果
    function typeWriter(element, text, speed = 100) {
        return new Promise((resolve) => {
            let i = 0;
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();  // 打字完成
                }
            }
            type();
        });
    }

    // ===== 初始化區塊打字機特效 =====

    const initCmdElement = document.getElementById('typing-init-cmd');
    const initMsg1Element = document.getElementById('init-message-1');
    const initMsg2Element = document.getElementById('init-message-2');
    const mottoCmdLineElement = document.getElementById('motto-cmd-line');
    const mottoCmdElement = document.getElementById('typing-motto-cmd');
    const mottoContentElement = document.getElementById('motto-content');
    const mottoElement = document.getElementById('typing-motto');

    // 初始化動畫完成的標記
    let initAnimationComplete = false;

    if (initCmdElement && initMsg1Element && initMsg2Element && mottoElement) {
        // 使用 async/await 確保順序執行
        (async function () {
            // 延遲 200ms 後開始
            await new Promise(resolve => setTimeout(resolve, 200));

            // 1. 打字命令 "./init_portfolio.sh"（速度改為 30ms，更快）
            await typeWriter(initCmdElement, './init_portfolio.sh', 30);
            await new Promise(resolve => setTimeout(resolve, 150));

            // 2. 顯示並打字 "Initializing portfolio..."（速度改為 30ms）
            initMsg1Element.style.opacity = '1';
            initMsg1Element.style.transition = 'opacity 0.3s ease-in';
            await typeWriter(initMsg1Element, 'Initializing portfolio...', 30);
            await new Promise(resolve => setTimeout(resolve, 150));

            // 3. 顯示並打字 "Loading developer profile..."（速度改為 30ms）
            initMsg2Element.style.opacity = '1';
            initMsg2Element.style.transition = 'opacity 0.3s ease-in';
            await typeWriter(initMsg2Element, 'Loading developer profile...', 30);
            await new Promise(resolve => setTimeout(resolve, 250));

            // 4. 顯示 "echo $MOTTO" 命令行
            mottoCmdLineElement.style.opacity = '1';
            mottoCmdLineElement.style.transition = 'opacity 0.3s ease-in';
            await new Promise(resolve => setTimeout(resolve, 150));

            // 5. 打字 "echo $MOTTO"（速度改為 30ms，與初始化區塊一致）
            await typeWriter(mottoCmdElement, 'echo $MOTTO', 30);
            await new Promise(resolve => setTimeout(resolve, 150));

            // 6. 顯示標語內容區塊
            mottoContentElement.style.opacity = '1';
            mottoContentElement.style.transition = 'opacity 0.3s ease-in';
            await new Promise(resolve => setTimeout(resolve, 150));


            // 7. 打字標語 "成就感來自於學習"（保持 150ms）
            await typeWriter(mottoElement, '成就感來自於學習', 150);
            await new Promise(resolve => setTimeout(resolve, 300));  // 從 1500ms 大幅縮短到 300ms，馬上開始下一段


            // 8. 標記初始化動畫完成，觸發 about 段落
            initAnimationComplete = true;
            const aboutContent = document.getElementById('about-content');
            if (aboutContent && !aboutContent.dataset.animated) {
                const aboutConfig = {
                    commandId: 'typing-about-cmd',
                    contentId: 'about-content',
                    command: 'cat about.txt'
                };
                initSectionTyping(aboutConfig);
                aboutContent.dataset.animated = 'true';
            }
        })();
    }

    // Smooth scrolling for menu links
    const menuLinks = document.querySelectorAll('.menu-link');

    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const terminalBody = document.querySelector('.terminal-body');
    const allLines = document.querySelectorAll('.cmd-line, .output-line');

    // 跟隨捲軸位置逐行顯示 - 優化版
    function updateLinesVisibility() {
        const scrollTop = terminalBody.scrollTop;
        const viewportHeight = terminalBody.clientHeight;

        // 漸層效果只在視窗底部 30% 的區域
        const fadeZoneHeight = viewportHeight * 0.3;
        const fadeStartPosition = viewportHeight - fadeZoneHeight;

        allLines.forEach(line => {
            const lineTop = line.offsetTop;
            const lineHeight = line.offsetHeight;

            // 計算這一行相對於視窗的位置
            const relativeTop = lineTop - scrollTop;

            // 如果這一行在視窗上方或已經進入視窗上半部,完全顯示
            if (relativeTop < fadeStartPosition) {
                line.style.opacity = '1';
                line.style.transform = 'translateX(0)';
            }
            // 如果在漸層區域(視窗底部 30%)
            else if (relativeTop >= fadeStartPosition && relativeTop < viewportHeight) {
                // 計算在漸層區域的進度 (0 到 1)
                const progress = 1 - ((relativeTop - fadeStartPosition) / fadeZoneHeight);

                // 使用更陡峭的曲線,讓亮度提升更快
                const easedProgress = Math.pow(progress, 0.5);

                line.style.opacity = easedProgress;
                line.style.transform = `translateX(${-10 * (1 - easedProgress)}px)`;
            }
            // 還沒進入視窗
            else {
                line.style.opacity = '0';
                line.style.transform = 'translateX(-10px)';
            }
        });
    }

    // 初始化所有行的樣式
    allLines.forEach(line => {
        line.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    });

    // 監聽捲軸事件
    if (terminalBody) {
        terminalBody.addEventListener('scroll', updateLinesVisibility);

        // 初始執行一次
        updateLinesVisibility();
    }

    // Highlight current section in menu
    if (terminalBody) {
        terminalBody.addEventListener('scroll', function () {
            let current = '';
            const sections = document.querySelectorAll('.cmd-section');

            sections.forEach(section => {
                const sectionTop = section.offsetTop;

                if (terminalBody.scrollTop >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            menuLinks.forEach(link => {
                link.style.color = '#7a9cff';
                if (link.getAttribute('href') === '#' + current) {
                    link.style.color = '#a8c0ff';
                    link.style.fontWeight = '600';
                } else {
                    link.style.fontWeight = '400';
                }
            });
        });
    }

    // Add click effect to links
    const links = document.querySelectorAll('.link');
    links.forEach(link => {
        link.addEventListener('click', function () {
            this.style.color = '#a8c0ff';
            setTimeout(() => {
                this.style.color = '#7a9cff';
            }, 200);
        });
    });

    // ===== 段落打字機特效 (Intersection Observer) =====

    // 通用的段落打字機特效函數
    async function initSectionTyping(config) {
        const { commandId, contentId, command } = config;
        const commandElement = document.getElementById(commandId);
        const contentElement = document.getElementById(contentId);

        if (!commandElement || !contentElement) return;

        // 打字命令（速度改為 30ms，與初始化區塊一致）
        await typeWriter(commandElement, command, 30);

        // 命令打完後等待 300ms
        await new Promise(resolve => setTimeout(resolve, 300));

        // 顯示內容
        contentElement.style.opacity = '1';
        contentElement.style.transition = 'opacity 0.5s ease-in';

        // 逐行顯示動畫
        const lines = contentElement.querySelectorAll('.output-line, .json-output, .skills-columns, .stats-container, .stats-container-left');
        lines.forEach((line, index) => {
            line.style.opacity = '0';
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transition = 'opacity 0.3s ease-in';
            }, index * 80);
        });
    }

    // 定義所有段落的配置
    const sections = [
        { commandId: 'typing-about-cmd', contentId: 'about-content', command: 'cat about.txt' },
        { commandId: 'typing-skills-cmd', contentId: 'skills-content', command: 'ls -la skills/' },
        { commandId: 'typing-experience-cmd', contentId: 'experience-content', command: 'cat projects_experience.md' },
        { commandId: 'typing-projects-cmd', contentId: 'projects-content', command: 'cat opensource_projects.md' },
        { commandId: 'typing-blog-cmd', contentId: 'blog-content', command: 'ls -l blog/' },
        { commandId: 'typing-stats-cmd', contentId: 'stats-content', command: 'cat stats.json' },
        { commandId: 'typing-contact-cmd', contentId: 'contact-content', command: 'cat contact.txt' }
    ];

    // 使用 Intersection Observer 優化效能
    // 注意：about 段落不使用 Observer，由初始化動畫完成後手動觸發
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const sectionId = entry.target.id;

                // 跳過 about 段落，它由初始化動畫觸發
                if (sectionId === 'about-content') return;

                const config = sections.find(s => s.contentId === sectionId);
                if (config) {
                    initSectionTyping(config);
                    entry.target.dataset.animated = 'true';
                }
            }
        });
    }, { threshold: 0.1 });  // 當 10% 的內容進入視窗時觸發，提高手機版靈敏度

    // 觀察所有內容區塊（除了 about，它由初始化動畫觸發）
    sections.forEach(section => {
        if (section.contentId === 'about-content') return;  // 跳過 about

        const element = document.getElementById(section.contentId);
        if (element) {
            observer.observe(element);
        }
    });
});
