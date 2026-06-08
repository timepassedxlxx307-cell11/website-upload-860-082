(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    let currentSlide = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length <= 1) {
            return;
        }
        heroTimer = setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function resetHeroTimer() {
        if (heroTimer) {
            clearInterval(heroTimer);
            heroTimer = null;
        }
        startHeroTimer();
    }

    const nextButton = document.querySelector("[data-hero-next]");
    const prevButton = document.querySelector("[data-hero-prev]");

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            showSlide(currentSlide + 1);
            resetHeroTimer();
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", function () {
            showSlide(currentSlide - 1);
            resetHeroTimer();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            resetHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get("q") || "";
    const searchInput = document.getElementById("siteSearch");
    const typeFilter = document.getElementById("typeFilter");
    const yearFilter = document.getElementById("yearFilter");
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    const emptyState = document.querySelector(".empty-state");

    if (searchInput && queryValue) {
        searchInput.value = queryValue;
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        const keyword = normalize(searchInput ? searchInput.value : "");
        const typeValue = normalize(typeFilter ? typeFilter.value : "");
        const yearValue = normalize(yearFilter ? yearFilter.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.year
            ].join(" "));
            const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchType = !typeValue || normalize(card.dataset.type) === typeValue;
            const matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
            const shouldShow = matchKeyword && matchType && matchYear;
            card.style.display = shouldShow ? "" : "none";
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterCards);
            control.addEventListener("change", filterCards);
        }
    });

    filterCards();
})();

function initMoviePlayer(source) {
    const video = document.querySelector(".movie-player");
    const overlay = document.querySelector(".play-overlay");
    const wrap = document.querySelector(".player-wrap");
    let hlsInstance = null;

    if (!video || !overlay || !wrap || !source) {
        return;
    }

    function startPlayback() {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    function attachSource() {
        wrap.classList.add("is-playing");

        if (!video.getAttribute("src") && !hlsInstance) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.setAttribute("src", source);
                video.load();
                startPlayback();
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    startPlayback();
                });
            } else {
                video.setAttribute("src", source);
                video.load();
                startPlayback();
            }
        } else {
            startPlayback();
        }
    }

    overlay.addEventListener("click", attachSource);
    video.addEventListener("click", function () {
        if (!wrap.classList.contains("is-playing")) {
            attachSource();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
