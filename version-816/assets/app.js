(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 520) {
        backTop.classList.add('is-visible');
      } else {
        backTop.classList.remove('is-visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.removeAttribute('src');
    });
  });

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    var showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    var startTimer = function () {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    var applyFilter = function () {
      var keyword = (keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect.value;
      var type = typeSelect.value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matchedType = !type || card.getAttribute('data-type') === type;
        card.hidden = !(matchedKeyword && matchedYear && matchedType);
      });
    };

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });
  });

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && Array.isArray(window.SITE_MOVIES)) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var searchInput = document.querySelector('[data-search-page-input]');
    var searchTitle = document.querySelector('[data-search-title]');

    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.toLowerCase();
    var matches = window.SITE_MOVIES.filter(function (movie) {
      if (!normalized) {
        return movie.featured;
      }
      return movie.text.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (searchTitle) {
      searchTitle.textContent = query ? '“' + query + '”的搜索结果' : '精选影片';
    }

    if (!matches.length) {
      searchResults.innerHTML = '<div class="copy-card"><h2>未找到相关影片</h2><p>可以尝试更换影片名、类型、地区或标签继续搜索。</p></div>';
    } else {
      searchResults.innerHTML = matches.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-play">播放</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
            '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
            '<p>' + escapeHtml(movie.desc) + '</p>' +
            '<div class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
          '</div>' +
        '</article>';
      }).join('');
    }
  }

  var video = document.getElementById('main-video');
  var playButton = document.querySelector('[data-play-button]');
  var hlsInstance = null;

  if (video && globalThis.PLAYBACK_URL) {
    var startVideo = function () {
      if (!video.getAttribute('src') && !(hlsInstance && hlsInstance.url)) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = globalThis.PLAYBACK_URL;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(globalThis.PLAYBACK_URL);
          hlsInstance.attachMedia(video);
        }
      }

      if (playButton) {
        playButton.classList.add('is-hidden');
      }

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    };

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
