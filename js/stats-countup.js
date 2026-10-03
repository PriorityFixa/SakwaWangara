/* =========================================================
   STAT COUNT-UP ANIMATION
   Add this as a new file (e.g. js/stats-countup.js) and
   include it with <script src="js/stats-countup.js" defer></script>
   just before </body>, alongside your other script tags.

   Reads each .stat-card h3 (e.g. "5000+"), animates from 0 up
   to that number, and re-adds the "+" suffix at the end — no
   HTML changes needed, it works with the numbers already there.
========================================================= */

function animateCountUp(el, target, duration = 1400) {
    const suffix = el.textContent.replace(/[0-9]/g, ""); // keeps "+" or any other trailing character
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        // ease-out so it slows down near the end, feels less mechanical
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);

        el.textContent = value.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target.toLocaleString() + suffix;
        }
    }

    requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", () => {
    const statNumbers = document.querySelectorAll(".stat-card h3");

    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const target = parseInt(el.textContent.replace(/[^0-9]/g, ""), 10);

            if (Number.isFinite(target)) {
                animateCountUp(el, target);
            }

            obs.unobserve(el); // only animate once
        });
    }, { threshold: 0.4 });

    statNumbers.forEach(el => observer.observe(el));
});
