
// lightbox.js (refactored)
(function () {
  const dialog = document.getElementById('movie-hero-dialog');
  const closeBtn = dialog.querySelector('.lightbox__close');
  const triggers = document.querySelectorAll('[data-dialog="movie-hero-dialog"]');
  let previousActive = null;

  // --- existing open logic ---
  function openDialog() {
    previousActive = document.activeElement;


    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden'; // lock scroll
    } else {
    
      dialog.setAttribute('open', '');
      document.body.classList.add('no-scroll');
    }
    
    // Focus a sensible element
    const focusable = dialog.querySelector('.lightbox__close');
    (focusable ?? dialog).focus();
  }

  function stopEmbeddedVideo() {
    const iframe = dialog.querySelector('.video-embed__frame');
    if (iframe) {
      const src = iframe.getAttribute('src');
      iframe.setAttribute('src', src); // reload to stop playback
    }
  }

  function closeDialog() {
    stopEmbeddedVideo();
    if (typeof dialog.close === 'function') {
      dialog.close();
      document.documentElement.style.overflow = '';
    } else {
      dialog.removeAttribute('open');
      document.body.classList.remove('no-scroll');
    }
    if (previousActive) previousActive.focus();
  }

  // --- NEW: populate dialog from a Movie instance ---
  function setDialogFromMovie(movie) {
    // These selectors assume the HTML from section 2
    const posterEl   = dialog.querySelector('.lightbox__poster');
    const titleEl    = dialog.querySelector('.lightbox__title');
    const dateEl     = dialog.querySelector('.lightbox__date');
    const scoreEl    = dialog.querySelector('.lightbox__score');
    const overviewEl = dialog.querySelector('.lightbox__overview');
    const iframeEl   = dialog.querySelector('.video-embed__frame');

    // Use Movie helpers & properties
    posterEl.src = movie.getPosterUrl('w780');           // good size for hero/lightbox
    posterEl.alt = movie.title ?? 'Poster';              // fallback title
    titleEl.textContent = movie.title ?? 'Untitled';
    dateEl.textContent = movie.releaseDate ?? 'Date not available';
    scoreEl.textContent = movie.getScorePercentage();    // e.g., "76%"
    overviewEl.textContent = movie.overview ?? '';

    // Optional: if you have a trailer key, set the iframe and unhide
    // (You can pass it via movie or a separate param)
    if (iframeEl && movie.trailerKey) {
      iframeEl.src = `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`;
      iframeEl.hidden = false;
    } else if (iframeEl) {
      iframeEl.hidden = true;
      iframeEl.removeAttribute('src');
    }
  }

  // --- NEW: public function to open dialog with a movie ---
  function openMovieDialog(movie) {
    setDialogFromMovie(movie);        // populate using the Movie class
    openDialog();                     // reuse your existing open routine
  }

  // Open handlers
  // Keep your existing trigger wiring (optional)
  triggers.forEach(t => t.addEventListener('click', openDialog));
  // Close handlers
  // Close handlers & accessibility (unchanged)
  closeBtn.addEventListener('click', closeDialog);

  // Click outside to close (only for native dialog)
  dialog.addEventListener('click', (e) => {
    const content = dialog.querySelector('.lightbox__content').getBoundingClientRect();
    const inContent =
      e.clientX >= content.left && e.clientX <= content.right &&
      e.clientY >= content.top  && e.clientY <= content.bottom;
    if (!inContent) closeDialog();
  });

  // ESC to close
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDialog();
    }
    // basic focus trap (unchanged)
    if (e.key === 'Tab') {
      const focusables = [...dialog.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Expose the helper for your card grid
  window.openMovieDialog = openMovieDialog;
})();
