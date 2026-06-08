const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

ready(() => {
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", () => {
            const open = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    document.querySelectorAll("[data-hero]").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === active);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => show(active + 1), 5000);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        prev?.addEventListener("click", () => {
            show(active - 1);
            start();
        });

        next?.addEventListener("click", () => {
            show(active + 1);
            start();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(active);
        start();
    });

    document.querySelectorAll("[data-search-root]").forEach((root) => {
        const input = root.querySelector("[data-search-input]");
        const select = root.querySelector("[data-category-filter]");
        const cards = Array.from(root.querySelectorAll("[data-card]"));

        const apply = () => {
            const keyword = (input?.value || "").trim().toLowerCase();
            const category = select?.value || "";

            cards.forEach((card) => {
                const haystack = card.getAttribute("data-search") || "";
                const cardCategory = card.getAttribute("data-category") || "";
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchCategory = !category || cardCategory === category;
                card.classList.toggle("is-hidden", !(matchKeyword && matchCategory));
            });
        };

        input?.addEventListener("input", apply);
        select?.addEventListener("change", apply);
        apply();
    });
});
