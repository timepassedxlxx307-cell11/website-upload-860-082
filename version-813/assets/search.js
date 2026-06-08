(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function card(movie) {
    return [
      '<a class="search-result-card" href="' + escapeHtml(movie.url) + '">',
      '  <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <article>',
      '    <h2>' + escapeHtml(movie.title) + '</h2>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '  </article>',
      '</a>'
    ].join('');
  }

  function render() {
    var input = document.querySelector('[data-live-search-input]');
    var form = document.querySelector('[data-live-search-form]');
    var results = document.querySelector('[data-search-results]');
    var data = window.MOVIES_INDEX || [];
    var query = getQuery();

    if (!results) {
      return;
    }

    if (input) {
      input.value = query;
      input.focus();
    }

    function draw(value) {
      var terms = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var filtered = data.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      });

      if (!terms.length) {
        filtered = data.slice(0, 48);
      }

      if (!filtered.length) {
        results.innerHTML = '<div class="empty-state is-visible">没有找到匹配内容</div>';
        return;
      }

      results.innerHTML = filtered.slice(0, 120).map(card).join('');
    }

    if (input) {
      input.addEventListener('input', function () {
        draw(input.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        window.history.replaceState(null, '', value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html');
        draw(value);
      });
    }

    draw(query);
  }

  document.addEventListener('DOMContentLoaded', render);
})();
