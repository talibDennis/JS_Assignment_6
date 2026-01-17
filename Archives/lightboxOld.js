
(function() {
  const dialog = document.getElementById('movie-hero-dialog');
  const triggers = document.querySelectorAll('[data-dialog="movie-hero-dialog"]');
  const closeBtn = dialog.querySelector('.lightbox__close');
  let previousActive = null;

  function getFocusable(root) {
    return [...root.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
      '[contenteditable], [tabindex]:not([tabindex="-1"])'
    )].filter(el => el.offsetParent !== null || el === closeBtn);
  }

  function openDialog() {
    previousActive = document.activeElement;

    // Use native <dialog> where supported
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden'; // lock scroll
    } else {
      // Fallback: add [open] attribute for styling
      dialog.setAttribute('open', '');
      document.body.classList.add('no-scroll');
    }

    // Focus the first focusable element
    const focusables = getFocusable(dialog);
    (focusables[0] || closeBtn).focus();
  }

  function closeDialog() {
    if (typeof dialog.close === 'function') {
      dialog.close();
      document.documentElement.style.overflow = '';
    } else {
      dialog.removeAttribute('open');
      document.body.classList.remove('no-scroll');
    }
    if (previousActive) previousActive.focus();
  }

  // Open handlers
  triggers.forEach(t => t.addEventListener('click', openDialog));

  // Close handlers
  closeBtn.addEventListener('click', closeDialog);

  // Click outside to close (only for native dialog)
  dialog.addEventListener('click', (e) => {
    const rect = dialog.querySelector('.lightbox__content').getBoundingClientRect();
    const inContent = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    );
    if (!inContent) closeDialog();
  });

  // ESC to close
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDialog();
    }
    // Focus trap
    if (e.key === 'Tab') {
      const focusables = getFocusable(dialog);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (!focusables.length) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
})();
