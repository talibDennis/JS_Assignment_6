
// scrollTop.js  —  ES Module

export function initScrollTopButton({
  buttonId = 'scrollTopBtn',
  afterPx = 300   // show only after scrolling this far
} = {}) {

  // Run AFTER the DOM exists
  document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById(buttonId);
    if (!btn) {
      console.warn(`Scroll-to-top button with id "${buttonId}" not found.`);
      return;
    }

    let ticking = false;

    // Toggle button visibility based on scroll position
    function updateVisibility() {
      const y = window.scrollY || document.documentElement.scrollTop;
      const shouldShow = y > afterPx;

      btn.classList.toggle('scroll-top--show', shouldShow);

      ticking = false;
    }

    // Smooth scroll (respect reduced-motion accessibility)
    function scrollToTop() {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }

    // Scroll listener using requestAnimationFrame for performance
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    // Click scroll behavior
    btn.addEventListener('click', scrollToTop);

    // Initialize on load (handles refresh at mid‑scroll)
    updateVisibility();
  });
}
