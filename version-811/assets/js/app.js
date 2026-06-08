(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
            });
        }

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-page-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!filterCards.length) {
            return;
        }
        var query = normalize(filterInput && filterInput.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        filterCards.forEach(function (card) {
            var content = [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region')
            ].join(' ').toLowerCase();
            var cardType = normalize(card.getAttribute('data-type'));
            var matchedQuery = !query || content.indexOf(query) !== -1;
            var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
            card.hidden = !(matchedQuery && matchedType);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilter);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchDefault = document.querySelector('[data-search-default]');

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function resultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a class="movie-card-link" href="' + escapeHtml(item.href) + '">' +
            '<div class="movie-poster-wrap">' +
            '<img class="movie-poster" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span class="movie-play-badge">▶</span>' +
            '</div>' +
            '<div class="movie-card-body">' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</p>' +
            '<p class="movie-desc line-clamp-2">' + escapeHtml(item.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function runSearch() {
        if (!searchInput || !searchResults || !Array.isArray(window.SEARCH_DATA)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (initial && !searchInput.value) {
            searchInput.value = initial;
        }
        var query = normalize(searchInput.value);
        if (!query) {
            searchResults.innerHTML = '';
            if (searchDefault) {
                searchDefault.hidden = false;
            }
            return;
        }
        var terms = query.split(/\s+/).filter(Boolean);
        var matches = window.SEARCH_DATA.filter(function (item) {
            var content = [item.title, item.region, item.type, item.year, item.category, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
            return terms.every(function (term) {
                return content.indexOf(term) !== -1;
            });
        }).slice(0, 80);
        if (searchDefault) {
            searchDefault.hidden = true;
        }
        if (!matches.length) {
            searchResults.innerHTML = '<h2 class="search-result-title">未找到匹配影片</h2>';
            return;
        }
        searchResults.innerHTML = '<h2 class="search-result-title">搜索结果</h2><div class="movie-grid featured-grid">' + matches.map(resultCard).join('') + '</div>';
    }

    if (searchInput) {
        searchInput.addEventListener('input', runSearch);
        runSearch();
    }
})();
