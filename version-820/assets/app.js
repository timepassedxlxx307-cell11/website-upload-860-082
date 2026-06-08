(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;
  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var scopeSelector = input.getAttribute('data-search-input');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) return;
      var q = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-card') || card.textContent || '').toLowerCase();
        card.style.display = text.indexOf(q) >= 0 ? '' : 'none';
      });
    });
  });
})();
