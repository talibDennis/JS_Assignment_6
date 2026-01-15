
import { loadMovies } from './movies.js';
import { loadTV } from './tv.js';

const API_KEY = 'cb7c7779c5c4232012594c012cf9a701';
const BASE_URL = 'https://api.themoviedb.org/3/';
const MAX_TRENDS = 20;

window.addEventListener('DOMContentLoaded', () => {
  loadMovies({ apiKey: API_KEY, baseUrl: BASE_URL, max: MAX_TRENDS }); // from your file
  loadTV({ apiKey: API_KEY, baseUrl: BASE_URL, max: MAX_TRENDS });     // from your file
  
  // const searchBtn = document.querySelector('.search_action');
  // if (searchBtn) {
  //   searchBtn.addEventListener('click', () => {
  //     window.location.href = 'search.html';
  //   });
  //   searchBtn.addEventListener('keydown', (e) => {
  //     if (e.key === 'Enter' || e.key === ' ') {
  //       e.preventDefault();
  //       searchBtn.click();
  //     }
  //   });
  // }
  
});


// Hide header on scroll down, show on scroll up
window.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const mobileMenu = document.querySelector('.mobile-menu'); // optional
  if (!header) return;

  let lastY = window.scrollY || document.documentElement.scrollTop;
  let ticking = false;
  const THRESHOLD = 10;     // ignore tiny scrolls
  const MIN_TOP_TO_HIDE = 60; // don't hide near very top

  const isMenuOpen = () => mobileMenu?.classList.contains('open');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;

    // Always show when near very top
    if (y <= MIN_TOP_TO_HIDE) {
      header.classList.remove('hidden');
      lastY = y;
      ticking = false;
      return;
    }

    // Don't auto-hide when the mobile drawer is open
    if (isMenuOpen()) {
      header.classList.remove('hidden');
      lastY = y;
      ticking = false;
      return;
    }

    const delta = y - lastY;

    // Only react if the movement is meaningful
    if (Math.abs(delta) > THRESHOLD) {
      if (delta > 0) {
        // scrolling down -> hide
        header.classList.add('hidden');
      } else {
        // scrolling up -> show
        header.classList.remove('hidden');
      }
      lastY = y;
    }

    ticking = false;
  }

  // Use rAF to keep it jank-free
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Ensure header is visible after resize or orientation change
  window.addEventListener('resize', () => header.classList.remove('hidden'));
  window.addEventListener('orientationchange', () => header.classList.remove('hidden'));
});



// Smooth-scroll to top when the header is tapped/clicked
window.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('appHeader');
  if (!header) return;

  const scrollToTop = () => {
    // If you use a custom scroll container, replace 'window' with that element
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Click (mouse) + tap (touch)
  header.addEventListener('click', scrollToTop, { passive: true });

  // Optional: make a tiny top "hit area" also trigger (for users who tap above the header)
  // This is useful on Android where status bar tap isn't supported.
  document.addEventListener('touchstart', (e) => {
    const y = e.touches?.[0]?.clientY ?? 0;
    if (y <= 8) { // taps within the top 8px of the viewport
      scrollToTop();
    }
  }, { passive: true });
});
