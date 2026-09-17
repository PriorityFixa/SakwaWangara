/**
 * hero-slideshow.js
 * Cycles the .hero-slide images inside #heroSlideshow.
 * Each photo fades in with a slow zoom (see hero-slideshow.css),
 * holds for HOLD_MS, then crossfades into the next one.
 */

(function () {
    const HOLD_MS = 4800; // how long each photo stays fully visible before the next fade starts

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('heroSlideshow');
        if (!container) return;

        const slides = Array.from(container.querySelectorAll('.hero-slide'));
        if (slides.length < 2) return; // nothing to cycle

        let current = slides.findIndex(slide => slide.classList.contains('active'));
        if (current === -1) {
            current = 0;
            slides[0].classList.add('active');
        }

        setInterval(() => {
            const next = (current + 1) % slides.length;
            slides[current].classList.remove('active');
            slides[next].classList.add('active');
            current = next;
        }, HOLD_MS);
    });
})();
