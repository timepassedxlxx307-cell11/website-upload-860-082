(function () {
    var body = document.body;
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }

        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            var isOpen = body.classList.toggle('nav-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                body.classList.remove('nav-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(grid, query) {
        if (!grid) {
            return;
        }

        var value = normalize(query);
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            card.classList.toggle('is-hidden-card', value && haystack.indexOf(value) === -1);
        });
    }

    document.querySelectorAll('.search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[type="search"]');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './search.html';
            window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
        });
    });

    document.querySelectorAll('[data-live-search]').forEach(function (input) {
        var grid = document.querySelector(input.getAttribute('data-live-search'));

        input.addEventListener('input', function () {
            filterCards(grid, input.value);
        });
    });

    var globalSearchInput = document.querySelector('[data-global-search]');

    if (globalSearchInput) {
        var grid = document.querySelector(globalSearchInput.getAttribute('data-global-search'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        globalSearchInput.value = initialQuery;
        filterCards(grid, initialQuery);

        globalSearchInput.addEventListener('input', function () {
            filterCards(grid, globalSearchInput.value);
        });

        document.querySelectorAll('[data-filter-value]').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter-value') || '';
                var isActive = button.classList.toggle('active');

                document.querySelectorAll('[data-filter-value]').forEach(function (other) {
                    if (other !== button) {
                        other.classList.remove('active');
                    }
                });

                globalSearchInput.value = isActive ? value : '';
                filterCards(grid, globalSearchInput.value);
            });
        });
    }

    setupHero();
})();
