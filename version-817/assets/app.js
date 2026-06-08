(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    const backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('show', window.scrollY > 500);
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
        const prev = document.querySelector('[data-hero-prev]');
        const next = document.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        start();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        const input = root.querySelector('[data-filter-input]');
        const cards = Array.from(root.querySelectorAll('[data-movie-card]'));
        const chips = Array.from(root.querySelectorAll('[data-filter-chip]'));
        const empty = root.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        let activeChip = 'all';

        if (input && query) {
            input.value = query;
        }

        function applyFilter() {
            const term = input ? input.value.trim().toLowerCase() : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = card.getAttribute('data-title') || '';
                const type = card.getAttribute('data-type') || '';
                const region = card.getAttribute('data-region') || '';
                const category = card.getAttribute('data-category') || '';
                const matchesText = !term || haystack.indexOf(term) !== -1;
                const matchesChip = activeChip === 'all' || type.indexOf(activeChip) !== -1 || region.indexOf(activeChip) !== -1 || category === activeChip;
                const showCard = matchesText && matchesChip;

                card.style.display = showCard ? '' : 'none';

                if (showCard) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeChip = chip.getAttribute('data-filter-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                applyFilter();
            });
        });

        applyFilter();
    });
})();

window.initMoviePlayer = function (videoId, coverId, streamUrl) {
    const video = document.getElementById(videoId);
    const cover = document.getElementById(coverId);

    if (!video || !cover || !streamUrl) {
        return;
    }

    let loaded = false;
    let hls = null;

    function playVideo() {
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function loadVideo() {
        if (loaded) {
            playVideo();
            return;
        }

        loaded = true;
        cover.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            return;
        }

        video.src = streamUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        playVideo();
    }

    cover.addEventListener('click', loadVideo);

    video.addEventListener('click', function () {
        if (!loaded) {
            loadVideo();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
};
