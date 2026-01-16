
// ====== Config ======
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701';
const BASE_URL = 'https://api.themoviedb.org/3/';
const DEFAULT_LANGUAGE = 'en-US';

// ====== Helpers (same ones you used on search) ======
function formatRuntime(mins) {
  if (!Number.isFinite(mins) || mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}
function formatGenres(genres) {
  if (!Array.isArray(genres) || !genres.length) return '';
  return genres.map(g => g.name).filter(Boolean).join(', ');
}
function selectTopCredits(credits, type = 'movie') {
  if (!credits) return [];
  const crew = Array.isArray(credits.crew) ? credits.crew : [];
  const cast = Array.isArray(credits.cast) ? credits.cast : [];
  const roles = (type === 'movie')
    ? ['Director', 'Writer', 'Screenplay']
    : ['Creator', 'Director', 'Writer', 'Screenplay'];
  const pickedCrew = [];
  roles.forEach(role => {
    crew.filter(c => c.job === role).slice(0, 2).forEach(c => pickedCrew.push({ name: c.name, role: c.job }));
  });
  const pickedCast = cast.slice(0, 3).map(c => ({ name: c.name, role: c.character })).filter(c => c.name && c.role);
  return [...pickedCrew, ...pickedCast];
}

// ====== Lightbox IIFE ======
(function renderLightbox() {
  const dialog = document.getElementById('movie-hero-dialog');
  if (!dialog) return;

  const closeBtn = dialog.querySelector('.lightbox__close');
  let previousActive = null;

  // --- Trailer helpers ---
  function ensureTrailerIframe(dialog) {
    const wrapper = dialog.querySelector('.video-embed');
    if (!wrapper) return null;

    let iframe = dialog.querySelector('.video-embed__frame');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.className = 'video-embed__frame';
      iframe.title = 'Trailer';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      wrapper.appendChild(iframe);
    }
    return iframe;
  }

  function setTrailer(dialog, youtubeKey) {
    // If there is no trailer, remove any existing iframe so we don't show an empty box
    const existing = dialog.querySelector('.video-embed__frame');
    if (!youtubeKey) {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      return;
    }
    const iframe = ensureTrailerIframe(dialog);
    if (iframe) {
      iframe.src =
        `https://www.youtube.com/embed/${youtubeKey}` +
        `?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
      iframe.hidden = false;
    }
  }

  function stopTrailer(dialog) {
    const iframe = dialog.querySelector('.video-embed__frame');
    if (iframe && iframe.parentNode) {
      // Remove the iframe entirely so playback stops and a new click recreates it fresh
      iframe.parentNode.removeChild(iframe);
    }
  }

  function openDialog() {
    previousActive = document.activeElement;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else {
      dialog.setAttribute('open', '');
      document.body.classList.add('no-scroll');
    }
    (closeBtn ?? dialog).focus();
  }

  function closeDialog() {
    // stop/remove trailer on close
    stopTrailer(dialog);

    if (typeof dialog.close === 'function') {
      dialog.close();
      document.documentElement.style.overflow = '';
    } else {
      dialog.removeAttribute('open');
      document.body.classList.remove('no-scroll');
    }
    if (previousActive) previousActive.focus();
  }

  // ---- Populate for Movie ----
  function setDialogFromMovie(movie) {
    const posterEl   = dialog.querySelector('.poster-card img');
    const titleEl    = dialog.querySelector('h1.title');
    const yearEl     = dialog.querySelector('.title__year');
    const metaEls    = dialog.querySelectorAll('.meta li');
    const scoreEl    = dialog.querySelector('.score-badge__value');
    const trailerEl  = dialog.querySelector('.btn.btn--ghost');
    const taglineEl  = dialog.querySelector('.tagline');
    const overviewP  = dialog.querySelector('.overview p');
    const creditsBox = dialog.querySelector('.credits');

    if (posterEl) { posterEl.src = movie.getPosterUrl('w780'); posterEl.alt = movie.title ?? 'Poster'; }
    if (titleEl) {
      if (titleEl.childNodes[0] && titleEl.childNodes[0].nodeType === 3)
        titleEl.childNodes[0].nodeValue = (movie.title ?? 'Untitled') + ' ';
      else
        titleEl.textContent = (movie.title ?? 'Untitled');
    }
    if (yearEl && movie.releaseDate) yearEl.textContent = `(${new Date(movie.releaseDate).getFullYear()})`;

    if (metaEls[0]) metaEls[0].textContent = movie.releaseDate ?? 'Date not available';
    if (metaEls[1]) metaEls[1].textContent = movie.certification || '';
    if (metaEls[2]) metaEls[2].textContent = formatGenres(movie.genres);
    if (metaEls[3]) metaEls[3].textContent = formatRuntime(movie.runtime);

    if (scoreEl) scoreEl.textContent = movie.getScorePercentage();

    if (trailerEl) trailerEl.href = `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
    
    
    if (taglineEl) taglineEl.textContent = movie.tagline ?? '';
    if (overviewP) overviewP.textContent = movie.overview ?? '';

    if (creditsBox) {
      creditsBox.innerHTML = '';
      selectTopCredits(movie.credits, 'movie').forEach(({ name, role }) => {
        const c = document.createElement('div');
        c.className = 'credit';
        c.innerHTML = `<span class="credit__name">${name}</span><span class="credit__role">${role}</span>`;
        creditsBox.appendChild(c);
      });
    }

    // NEW: set or remove the trailer iframe
    setTrailer(dialog, movie.trailerKey);
  }

  // ---- Populate for TV ----
  function setDialogFromTV(show) {
    const posterEl   = dialog.querySelector('.poster-card img');
    const titleEl    = dialog.querySelector('h1.title');
    const yearEl     = dialog.querySelector('.title__year');
    const metaEls    = dialog.querySelectorAll('.meta li');
    const scoreEl    = dialog.querySelector('.score-badge__value');
    const trailerEl  = dialog.querySelector('.btn.btn--ghost');
    const taglineEl  = dialog.querySelector('.tagline');
    const overviewP  = dialog.querySelector('.overview p');
    const creditsBox = dialog.querySelector('.credits');

    if (posterEl) { posterEl.src = show.getPosterUrl('w780'); posterEl.alt = show.name ?? 'Poster'; }
    if (titleEl) {
      if (titleEl.childNodes[0] && titleEl.childNodes[0].nodeType === 3)
        titleEl.childNodes[0].nodeValue = (show.name ?? 'Untitled') + ' ';
      else
        titleEl.textContent = (show.name ?? 'Untitled');
    }
    if (yearEl && show.firstAirDate) yearEl.textContent = `(${new Date(show.firstAirDate).getFullYear()})`;

    if (metaEls[0]) metaEls[0].textContent = show.firstAirDate ?? 'Date not available';
    if (metaEls[1]) metaEls[1].textContent = show.certification || '';
    if (metaEls[2]) metaEls[2].textContent = formatGenres(show.genres);
    if (metaEls[3]) {
      const avg = show.averageEpisodeRuntime;
      metaEls[3].textContent = avg ? `${formatRuntime(avg)} per episode` : '';
    }

    if (scoreEl) scoreEl.textContent = show.getScorePercentage();
    if (trailerEl) trailerEl.href = `https://www.youtube.com/embed/${show.trailerKey}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
    if (taglineEl) taglineEl.textContent = show.tagline ?? '';
    if (overviewP) overviewP.textContent = show.overview ?? '';

    if (creditsBox) {
      creditsBox.innerHTML = '';
      selectTopCredits(show.credits, 'tv').forEach(({ name, role }) => {
        const c = document.createElement('div');
        c.className = 'credit';
        c.innerHTML = `<span class="credit__name">${name}</span><span class="credit__role">${role}</span>`;
        creditsBox.appendChild(c);
      });
    }

    // NEW: set or remove the trailer iframe
    setTrailer(dialog, show.trailerKey);
  }

  function openTitleDialog(model, type) {
    if (type === 'movie') setDialogFromMovie(model);
    else setDialogFromTV(model);
    openDialog();
  }

  // Close handlers + accessibility
  closeBtn?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', (e) => {
    const rect = dialog.querySelector('.lightbox__content').getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                   e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) closeDialog();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); closeDialog(); }
    if (e.key === 'Tab') {
      const focusables = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // expose
  window.openTitleDialog = openTitleDialog;
})();

// ====== Details fetchers for Home (Movies/TV) ======
async function getMovieDetails(id) {
  if (!id) return;
  const params = new URLSearchParams({ api_key: API_KEY, language: DEFAULT_LANGUAGE });
  const url = `${BASE_URL}movie/${id}?${params.toString()}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const model = Movie.fromJson(json);

    // extras: certification, credits, videos
    const [certResp, creditsResp, vidsResp] = await Promise.all([
      fetch(`${BASE_URL}movie/${id}/release_dates?${params.toString()}`).catch(() => null),
      fetch(`${BASE_URL}movie/${id}/credits?${params.toString()}`).catch(() => null),
      fetch(`${BASE_URL}movie/${id}/videos?${params.toString()}`).catch(() => null),
    ]);

    if (certResp?.ok) {
      const certJson = await certResp.json();
      const us = (certJson.results || []).find(r => r.iso_3166_1 === 'US');
      const pick = us?.release_dates?.find(rd => rd.certification && rd.certification.trim());
      model.certification = pick?.certification ||
        (certJson.results?.[0]?.release_dates?.find(rd => rd.certification)?.certification ?? null);
    }
    if (creditsResp?.ok) {
      const c = await creditsResp.json();
      model.credits = {
        cast: Array.isArray(c.cast) ? c.cast : [],
        crew: Array.isArray(c.crew) ? c.crew : []
      };
    }
    if (vidsResp?.ok) {
      const vj = await vidsResp.json();
      const yt = (vj.results || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      if (yt) model.trailerKey = yt.key;
    }

    window.openTitleDialog(model, 'movie');
  } catch (err) {
    console.error(err);
  }
}
async function getTvDetails(id) {
  if (!id) return;
  const params = new URLSearchParams({ api_key: API_KEY, language: DEFAULT_LANGUAGE });
  const url = `${BASE_URL}tv/${id}?${params.toString()}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const model = TVShow.fromJson(json);

    const [certResp, creditsResp, vidsResp] = await Promise.all([
      fetch(`${BASE_URL}tv/${id}/content_ratings?${params.toString()}`).catch(() => null),
      fetch(`${BASE_URL}tv/${id}/credits?${params.toString()}`).catch(() => null),
      fetch(`${BASE_URL}tv/${id}/videos?${params.toString()}`).catch(() => null),
    ]);

    if (certResp?.ok) {
      const certJson = await certResp.json();
      const us = (certJson.results || []).find(r => r.iso_3166_1 === 'US');
      model.certification = us?.rating || (certJson.results?.[0]?.rating ?? null);
    }
    if (creditsResp?.ok) {
      const c = await creditsResp.json();
      model.credits = {
        cast: Array.isArray(c.cast) ? c.cast : [],
        crew: Array.isArray(c.crew) ? c.crew : []
      };
    }
    if (vidsResp?.ok) {
      const vj = await vidsResp.json();
      const yt = (vj.results || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      if (yt) model.trailerKey = yt.key;
    }

    window.openTitleDialog(model, 'tv');
  } catch (err) {
    console.error(err);
  }
}

// expose these for movies-js / tv-js click handlers
window.getMovieDetails = getMovieDetails;
window.getTvDetails = getTvDetails;
