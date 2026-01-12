
// =============================
// Config
// =============================
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701'; // Consider proxying via backend, not shipping client-side
const BASE_URL = 'https://api.themoviedb.org/3/';
const DEFAULT_LANGUAGE = 'en-US';

// =============================
// TitleCard (normalized card VM)
// =============================
class TitleCard {
  constructor({ id, type, title, date, overview, posterPath }) {
    this.id = id;                  // TMDB id
    this.type = type;              // 'movie' | 'tv'
    this.title = title;            // Movie.title or TVShow.name
    this.date = date;              // release_date or first_air_date
    this.overview = overview;      // string or null
    this.posterPath = posterPath;  // raw poster_path (used by getPosterUrl)
  }
  getPosterUrl(size = 'w342') {
    if (!this.posterPath) return 'assets/images/noImage.png';
    return `https://image.tmdb.org/t/p/${size}${this.posterPath}`;
  }
}

// =============================
// State
// =============================
let titles = [];               // TitleCard[]
let titlePanelOpen = false;
let currentSearchController = null;
let debounceTimer = null;

// =============================
// Utilities
// =============================
function safeText(value, fallback = 'Not available') {
  const s = typeof value === 'string' ? value.trim() : '';
  return s.length ? s : fallback;
}
function truncate(text, max = 150) {
  const s = typeof text === 'string' ? text : '';
  return s.length > max ? s.slice(0, max) + '…' : s;
}
function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}
function createEl(tag, classNames = [], attrs = {}) {
  const el = document.createElement(tag);
  if (classNames.length) el.classList.add(...classNames);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined && v !== null) el.setAttribute(k, String(v));
  }
  return el;
}

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

  // Prioritize Director & Writer for movies; Creator/Director/Writer for TV; then top-billed cast
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

// =============================
// Search (multi: movies + TV)
// =============================
async function searchTitles({ page = 1, language = DEFAULT_LANGUAGE } = {}) {
  const queryEl = document.querySelector('#txtSearch');
  if (!queryEl) {
    console.warn('searchTitles: #txtSearch not found.');
    return;
  }
  const query = queryEl.value.trim();
  if (!query) return renderEmptyState('Start typing to search for movies and shows.');

  // Abort any in-flight request
  if (currentSearchController) currentSearchController.abort();
  currentSearchController = new AbortController();

  const params = new URLSearchParams({
    api_key: API_KEY,
    query,
    include_adult: 'false',
    language,
    page: String(page),
  });
  const url = `${BASE_URL}search/multi?${params.toString()}`;

  showLoading();
  console.log(url);

  try {
    const resp = await fetch(url, { signal: currentSearchController.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const mixed = (data.results ?? []).filter(
      r => r.media_type === 'movie' || r.media_type === 'tv'
    );

    // Map to TitleCard instances
    titles = mixed.map(r => new TitleCard({
      id: r.id,
      type: r.media_type,                          // 'movie' or 'tv'
      title: r.media_type === 'movie' ? r.title : r.name,
      date: r.media_type === 'movie' ? r.release_date : r.first_air_date,
      overview: r.overview ?? null,
      posterPath: r.poster_path ?? null,
    }));

    renderSearchGrid(titles);
    console.log(titles);
    // Optional: renderPagination({ page: data.page, totalPages: data.total_pages });
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      renderError('Search failed. Please try again.');
    }
  } finally {
    hideLoading();
  }
}

// =============================
// Renderers
// =============================
function renderSearchGrid(items) {
  const grid = document.querySelector('.search-grid');
  if (!grid) {
    console.warn('renderSearchGrid: .search-grid not found.');
    return;
  }
  clearNode(grid);

  if (!items.length) {
    renderEmptyState('No matches. Try a different query.');
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach(t => {
    const card = createEl('div', ['search-card', 'sCard']);

    // Poster
    const posterDiv = createEl('div');
    const poster = createEl('img', ['search-poster'], {
      alt: t.title || 'Untitled',
      'data-id': t.id,
      'data-type': t.type,
    });
    poster.src = t.getPosterUrl();
    posterDiv.appendChild(poster);

    // Details
    const details = createEl('div', ['sDetails']);

    // Header (title + date + type chip)
    const header = createEl('div', ['sTitle']);

    const h2 = createEl('h2');
    h2.textContent = safeText(t.title, 'Untitled');

    const metaRow = createEl('div', ['sMeta']);
    const date = createEl('span', ['sDate']);
    date.textContent = safeText(t.date, 'Date not available');

    const typeChip = createEl('span', ['sType']);
    typeChip.textContent = t.type === 'movie' ? 'Movie' : 'TV Show';

    metaRow.appendChild(date);
    metaRow.appendChild(typeChip);

    header.appendChild(h2);
    header.appendChild(metaRow);

    // Overview
    const body = createEl('div', ['sOverview']);
    const p = createEl('p');
    p.textContent = truncate(safeText(t.overview, 'Overview not available'), 150);

    body.appendChild(p);
    details.appendChild(header);
    details.appendChild(body);

    // Assemble card
    card.appendChild(posterDiv);
    card.appendChild(details);

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

function renderEmptyState(message) {
  const grid = document.querySelector('.search-grid');
  if (!grid) return;
  clearNode(grid);
  const p = createEl('p', ['empty']);
  p.textContent = message;
  grid.appendChild(p);
}

function renderError(message) {
  const grid = document.querySelector('.search-grid');
  if (!grid) return;
  clearNode(grid);
  const p = createEl('p', ['error']);
  p.textContent = message;
  grid.appendChild(p);
}

// =============================
// Details (type-aware)
// =============================
async function getTitleDetails({ id, type }) {
  if (!id || !type) return;

  const params = new URLSearchParams({
    api_key: API_KEY,
    language: DEFAULT_LANGUAGE,
  });
  const path = type === 'movie' ? `movie/${id}` : `tv/${id}`;
  const url = `${BASE_URL}${path}?${params.toString()}`;

  showLoadingPanel();

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();

    const model = (type === 'movie') ? Movie.fromJson(json) : TVShow.fromJson(json);

    // Collect extra requests: certification, credits, videos (trailer)
    const extras = [];
    if (type === 'movie') {
      extras.push(fetch(`${BASE_URL}movie/${id}/release_dates?${params.toString()}`)); // certification
      extras.push(fetch(`${BASE_URL}movie/${id}/credits?${params.toString()}`));       // credits
      extras.push(fetch(`${BASE_URL}movie/${id}/videos?${params.toString()}`));        // videos
    } else {
      extras.push(fetch(`${BASE_URL}tv/${id}/content_ratings?${params.toString()}`));  // certification
      extras.push(fetch(`${BASE_URL}tv/${id}/credits?${params.toString()}`));          // credits
      extras.push(fetch(`${BASE_URL}tv/${id}/videos?${params.toString()}`));           // videos
    }

    const [certResp, creditsResp, vidsResp] = await Promise.all(extras.map(p => p.catch(() => null)));

    // --- Certification ---
    if (certResp && certResp.ok) {
      const certJson = await certResp.json();
      if (type === 'movie') {
        const us = (certJson.results || []).find(r => r.iso_3166_1 === 'US');
        const pick = us?.release_dates?.find(rd => rd.certification && rd.certification.trim());
        model.certification = pick?.certification ||
          (certJson.results?.[0]?.release_dates?.find(rd => rd.certification)?.certification ?? null);
      } else {
        const us = (certJson.results || []).find(r => r.iso_3166_1 === 'US');
        model.certification = us?.rating || (certJson.results?.[0]?.rating ?? null);
      }
    }

    // --- Credits ---
    if (creditsResp && creditsResp.ok) {
      const c = await creditsResp.json();
      model.credits = {
        cast: Array.isArray(c.cast) ? c.cast : [],
        crew: Array.isArray(c.crew) ? c.crew : []
      };
    }

    // --- Trailer key (optional) ---
    if (vidsResp && vidsResp.ok) {
      const vj = await vidsResp.json();
      const yt = (vj.results || []).find(v => v.site === 'YouTube' &&
        (v.type === 'Trailer' || v.type === 'Teaser'));
      if (yt) model.trailerKey = yt.key;
    }

    // ✅ Open the lightbox. If you implemented openTitleDialog(model, type), use that instead.
    window.openMovieDialog
      ? window.openMovieDialog(model)
      : window.openTitleDialog(model, type);

  } catch (err) {
    console.error(err);
    if (typeof renderErrorPanel === 'function') {
      renderErrorPanel('Unable to load details. Please try again.');
    }
  } finally {
    hideLoadingPanel();
  }
}


// lightbox.js (refactored)
(function renderLightbox() {
  const dialog = document.getElementById('movie-hero-dialog');
  if (!dialog) return;

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
    if (iframe && iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
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
  const posterEl   = dialog.querySelector('.poster-card img');
  const titleEl    = dialog.querySelector('h1.title');
  const yearEl     = dialog.querySelector('.title__year');
  const metaEls    = dialog.querySelectorAll('.meta li');
  const scoreEl    = dialog.querySelector('.score-badge__value');
  const taglineEl  = dialog.querySelector('.tagline');
  const overviewP  = dialog.querySelector('.overview p');
  const creditsBox = dialog.querySelector('.credits');

  // Poster
  if (posterEl) { posterEl.src = movie.getPosterUrl('w780'); posterEl.alt = movie.title ?? 'Poster'; }

  // Title + year
  if (titleEl) titleEl.childNodes[0] && titleEl.childNodes[0].nodeType === 3
    ? (titleEl.childNodes[0].nodeValue = (movie.title ?? 'Untitled') + ' ')
    : (titleEl.textContent = (movie.title ?? 'Untitled'));
  if (yearEl && movie.releaseDate) yearEl.textContent = `(${new Date(movie.releaseDate).getFullYear()})`;

  // Meta list (index-based: 0 release, 1 certification, 2 genres, 3 runtime)
  if (metaEls[0]) metaEls[0].textContent = movie.releaseDate ?? 'Date not available';
  if (metaEls[1]) metaEls[1].textContent = movie.certification ? movie.certification : '';
  if (metaEls[2]) metaEls[2].textContent = formatGenres(movie.genres);
  if (metaEls[3]) metaEls[3].textContent = formatRuntime(movie.runtime);

  // Score
  if (scoreEl) scoreEl.textContent = movie.getScorePercentage();

  // Tagline
  if (taglineEl) taglineEl.textContent = movie.tagline ?? '';

  // Overview
  if (overviewP) overviewP.textContent = movie.overview ?? '';

  // Credits
  if (creditsBox) {
    creditsBox.innerHTML = '';
    const top = selectTopCredits(movie.credits, 'movie');
    top.forEach(({ name, role }) => {
      const c = document.createElement('div');
      c.className = 'credit';
      c.innerHTML = `<span class="credit__name">${name}</span><span class="credit__role">${role}</span>`;
      creditsBox.appendChild(c);
    });
  }

  // Trailer (create if needed, remove if missing)
  const embedWrapper = dialog.querySelector('.video-embed');
  let iframeEl = dialog.querySelector('.video-embed__frame');

  if (movie.trailerKey) {
    // Ensure iframe exists
    if (!iframeEl && embedWrapper) {
      iframeEl = document.createElement('iframe');
      iframeEl.className = 'video-embed__frame';
      iframeEl.title = 'Trailer';
      iframeEl.loading = 'lazy';
      iframeEl.allow =
        'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframeEl.referrerPolicy = 'strict-origin-when-cross-origin';
      iframeEl.allowFullscreen = true;
      embedWrapper.appendChild(iframeEl);
    }
    if (iframeEl) {
      iframeEl.src =
        `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
      iframeEl.hidden = false;
    }
  } else {
    // No trailer: remove iframe element entirely
    if (iframeEl && iframeEl.parentNode) {
      iframeEl.parentNode.removeChild(iframeEl);
    }
  }
}

function setDialogFromTV(show) {
  const posterEl   = dialog.querySelector('.poster-card img');
  const titleEl    = dialog.querySelector('h1.title');
  const yearEl     = dialog.querySelector('.title__year');
  const metaEls    = dialog.querySelectorAll('.meta li');
  const scoreEl    = dialog.querySelector('.score-badge__value');
  const taglineEl  = dialog.querySelector('.tagline');
  const overviewP  = dialog.querySelector('.overview p');
  const creditsBox = dialog.querySelector('.credits');

  // Poster
  if (posterEl) { posterEl.src = show.getPosterUrl('w780'); posterEl.alt = show.name ?? 'Poster'; }

  // Title + year
  if (titleEl) titleEl.childNodes[0] && titleEl.childNodes[0].nodeType === 3
    ? (titleEl.childNodes[0].nodeValue = (show.name ?? 'Untitled') + ' ')
    : (titleEl.textContent = (show.name ?? 'Untitled'));
  if (yearEl && show.firstAirDate) yearEl.textContent = `(${new Date(show.firstAirDate).getFullYear()})`;

  // Meta list (index-based: 0 release, 1 certification, 2 genres, 3 runtime/episode)
  if (metaEls[0]) metaEls[0].textContent = show.firstAirDate ?? 'Date not available';
  if (metaEls[1]) metaEls[1].textContent = show.certification ? show.certification : '';
  if (metaEls[2]) metaEls[2].textContent = formatGenres(show.genres);
  if (metaEls[3]) {
    const avg = show.averageEpisodeRuntime; // your helper returns avg minutes
    metaEls[3].textContent = avg ? `${formatRuntime(avg)} per episode` : '';
  }

  // Score
  if (scoreEl) scoreEl.textContent = show.getScorePercentage();

  // Tagline
  if (taglineEl) taglineEl.textContent = show.tagline ?? '';

  // Overview
  if (overviewP) overviewP.textContent = show.overview ?? '';

  // Credits
  if (creditsBox) {
    creditsBox.innerHTML = '';
    const top = selectTopCredits(show.credits, 'tv');
    top.forEach(({ name, role }) => {
      const c = document.createElement('div');
      c.className = 'credit';
      c.innerHTML = `<span class="credit__name">${name}</span><span class="credit__role">${role}</span>`;
      creditsBox.appendChild(c);
    });
  }


  // Trailer (create if needed, remove if missing)
  const embedWrapper = dialog.querySelector('.video-embed');
  let iframeEl = dialog.querySelector('.video-embed__frame');

  if (show.trailerKey) {
    if (!iframeEl && embedWrapper) {
      iframeEl = document.createElement('iframe');
      iframeEl.className = 'video-embed__frame';
      iframeEl.title = 'Trailer';
      iframeEl.loading = 'lazy';
      iframeEl.allow =
        'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframeEl.referrerPolicy = 'strict-origin-when-cross-origin';
      iframeEl.allowFullscreen = true;
      embedWrapper.appendChild(iframeEl);
    }
    if (iframeEl) {
      iframeEl.src =
        `https://www.youtube.com/embed/${show.trailerKey}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
      iframeEl.hidden = false;
    }
  } else {
    if (iframeEl && iframeEl.parentNode) {
      iframeEl.parentNode.removeChild(iframeEl);
    }
  }
}

  // --- NEW: public function to open dialog with a movie ---

  function openTitleDialog(model, type) {
    if (type === 'movie') setDialogFromMovie(model);
    else setDialogFromTV(model);
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
  window.openTitleDialog = openTitleDialog;
})();


// =============================
// Non-blocking UI feedback (stub)
// =============================
function showLoading() { /* add spinner logic here */ }
function hideLoading() {}
function showLoadingPanel() {}
function hideLoadingPanel() {}

// =============================
// Event wiring
// =============================

// Debounce input to limit requests
const searchInput = document.querySelector('#txtSearch');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => searchTitles({ page: 1 }), 300);
  });
}

// Delegate clicks from grid to details
const searchGridEl = document.querySelector('.search-grid');
if (searchGridEl) {
  searchGridEl.addEventListener('click', (evt) => {
    const img = evt.target.closest('img.search-poster');
    if (!img) return;
    const id = img.getAttribute('data-id');
    const type = img.getAttribute('data-type'); // 'movie' | 'tv'
    getTitleDetails({ id, type });
  });
}