(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      toggle.textContent = expanded ? "☰" : "×";
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function initBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      button.classList.toggle("visible", window.scrollY > 480);
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initCategoryFilters() {
    var grid = document.querySelector(".filter-grid");
    var keyword = document.querySelector(".filter-keyword");
    var year = document.querySelector(".filter-year");
    var type = document.querySelector(".filter-type");
    if (!grid || !keyword || !year || !type) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var word = keyword.value.trim().toLowerCase();
      var yearValue = year.value;
      var typeValue = type.value;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        var passWord = !word || text.indexOf(word) !== -1;
        var passYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var cardType = card.getAttribute("data-type") || "";
        var passType = !typeValue || cardType.indexOf(typeValue) !== -1;
        card.hidden = !(passWord && passYear && passType);
      });
    }

    keyword.addEventListener("input", apply);
    year.addEventListener("change", apply);
    type.addEventListener("change", apply);
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = [
      '<a class="movie-poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-badge">▶</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="movie-meta-line"><a class="pill" href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.summary) + '</p>',
      '<div class="tag-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("search-page-input");
    var heading = document.getElementById("search-heading");
    if (!results || !input || !heading || typeof MOVIES_SEARCH_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;
    if (!query) {
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = MOVIES_SEARCH_INDEX.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.summary,
        movie.tags
      ].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    });
    heading.textContent = "搜索结果";
    results.innerHTML = "";
    if (!matched.length) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有找到相关影片";
      results.appendChild(empty);
      return;
    }
    matched.slice(0, 120).forEach(function (movie) {
      results.appendChild(createSearchCard(movie));
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initBackTop();
    initCategoryFilters();
    initSearchPage();
  });
})();
