
// trends_hardened.js — Movies + TV (DRY, resilient, auto-load)
// Requirements: Movie.js, TVShow.js loaded before this file; optional jQuery for animations.

// =========================
// == CONFIG & STATE =======
// =========================
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701';
const BASE_URL = 'https://api.themoviedb.org/3/';
const MAX_TRENDS = 7; // change as needed

let movieTrends = [];
let trendingTV = [];

// =========================
// == UTILITIES ============
// =========================
function createEl(tag, classList = [], attrs = {}) {
  const el = document.createElement(tag);
  classList.forEach(c => el.classList.add(c));
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined && v !== null) el.setAttribute(k, v);
  }
  return el;
}

function safePoster(url) {
  return url || 'assets/images/noImage.png';
}

function createScoreBadge(voteAverage) {
  const badge = createEl('div', ['score-badge']);
  const valueEl = createEl('span', ['score-badge__value']);
  const va = Number(voteAverage || 0);
  valueEl.textContent = `${Math.round(va * 10)}%`;
  if (va >= 7) badge.classList.add('score-high');
  else if (va >= 5) badge.classList.add('score-medium');
  else badge.classList.add('score-low');
  badge.appendChild(valueEl);
  return badge;
}

function showStatus(selector, message) {
  const grid = document.querySelector(selector);
  if (!grid) return;
  const note = createEl('div', ['status-note']);
  note.textContent = message;
  grid.appendChild(note);
}

// =========================
// == NETWORK ==============
// =========================
async function fetchJson(url, { retries = 2, delayMs = 400 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[fetchJson] Attempt ${attempt + 1} failed:`, err);
      if (attempt < retries) {
        const backoff = delayMs * (attempt + 1);
        await new Promise(r => setTimeout(r, backoff));
      } else {
        throw err;
      }
    }
  }
}

function assertDeps() {
  if (typeof Movie === 'undefined') throw new Error('Movie class missing');
  if (typeof TVShow === 'undefined') throw new Error('TVShow class missing');
}

// =========================
// == SHARED RENDERER ======
// =========================
function renderMediaGrid(items, cardBuilder, selector) {
  const grid = document.querySelector(selector);
  if (!grid) {
    console.error(`[renderMediaGrid] Grid not found: ${selector}`);
    return;
  }
  grid.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    console.warn(`[renderMediaGrid] No items to render for ${selector}`);
    return;
  }

  const count = Math.min(items.length, MAX_TRENDS);
  for (let i = 0; i < count; i++) {
    try {
      const card = cardBuilder(items[i]);
      grid.appendChild(card);
    } catch (err) {
      console.error(`[renderMediaGrid] Failed to build card ${i}:`, err);
    }
  }
}

// =========================
// == CARD BUILDERS =========
// =========================
function buildMovieCard(movie) {
  const card = createEl('div', ['media-card', 'mCard']);
  const icon = createEl('div', ['media-icon']);

  const poster = createEl('img', ['media-poster'], {
    src: safePoster(movie?.getPosterUrl?.()),
    alt: movie?.title ?? 'Untitled',
  });
  poster.addEventListener('click', () => {
    if (movie?.id) getMovieDetails(movie.id);
  });

  const posterDiv = createEl('div');
  posterDiv.appendChild(poster);

  const score = createScoreBadge(Number(movie?.voteAverage ?? 0));
  const scoreActions = createEl('div', ['score-actions']);
  scoreActions.appendChild(score);

  icon.append(posterDiv, scoreActions);

  const details = createEl('div', ['mDetails']);
  const titleRow = createEl('div', ['mTitle']);

  const title = document.createElement('h2');
  title.textContent = movie?.title ?? 'Media Title';

  const date = document.createElement('span');
  date.textContent = (movie?.releaseDate && movie.releaseDate.trim() !== '')
    ? movie.releaseDate
    : 'Release date not available';

  titleRow.append(title, date);
  details.append(titleRow);

  card.append(icon, details);
  return card;
}

function buildTVCard(show) {
  const card = createEl('div', ['media-card', 'mCard']);
  const icon = createEl('div', ['media-icon']);

  const poster = createEl('img', ['media-poster'], {
    src: safePoster(show?.getPosterUrl?.()),
    alt: show?.name ?? 'Untitled',
  });
  // Add click handler if you want TV details behaviour later
  // poster.addEventListener('click', () => { ... });

  const posterDiv = createEl('div');
  posterDiv.appendChild(poster);

  const score = createScoreBadge(Number(show?.voteAverage ?? 0));
  const scoreActions = createEl('div', ['score-actions']);
  scoreActions.appendChild(score);

  icon.append(posterDiv, scoreActions);

  const details = createEl('div', ['mDetails']);
  const titleRow = createEl('div', ['mTitle']);

  const title = document.createElement('h3');
  title.textContent = show?.name ?? 'Media Title';

  const date = document.createElement('span');
  date.textContent = (show?.firstAirDate && show.firstAirDate.trim() !== '')
    ? show.firstAirDate
    : 'Date not available';

  titleRow.append(title, date);
  details.append(titleRow);

  card.append(icon, details);
  return card;
}

// =========================
// == FETCH + RENDER =======
// =========================
async function getTrendingMovies() {
  assertDeps();
  const url = `${BASE_URL}trending/movie/week?api_key=${API_KEY}`;
  const data = await fetchJson(url);
  movieTrends = data?.results?.map(m => Movie.fromJson(m)) ?? [];
  renderMediaGrid(movieTrends, buildMovieCard, '.movie-grid');
}

async function getTrendingTVShows() {
  assertDeps();
  const url = `${BASE_URL}trending/tv/week?api_key=${API_KEY}`;
  const data = await fetchJson(url);
  trendingTV = data?.results?.map(tv => TVShow.fromJson(tv)) ?? [];
  renderMediaGrid(trendingTV, buildTVCard, '.tv-grid');
}

// =========================
// == MOVIE DETAILS PANEL ===
// =========================
let moviePanelOpen = false;
let moviePanel = document.querySelector('.movie-panel');

async function getMovieDetails(id) {
  const url = `${BASE_URL}movie/${id}?api_key=${API_KEY}&language=en-US`;
  try {
    const data = await fetchJson(url);
    const movie = Movie.fromJson(data);

    if (!moviePanel) moviePanel = document.querySelector('.movie-panel');
    if (!moviePanel) {
      console.warn('[getMovieDetails] .movie-panel not found');
      return;
    }

    moviePanel.innerHTML = '';

    const controls = createEl('div', [], { id: 'controls' });
    const closeBtn = createEl('span', ['closeBtn']);
    closeBtn.innerText = 'X';
    closeBtn.addEventListener('click', toggleMoviePanel);
    controls.appendChild(closeBtn);
    moviePanel.appendChild(controls);

    const movieID = document.createElement('p');
    movieID.innerText = movie.id;
    moviePanel.appendChild(movieID);

    toggleMoviePanel();
  } catch (err) {
    console.error('[getMovieDetails] Failed:', err);
  }
}

function toggleMoviePanel() {
  const panel = moviePanel || document.querySelector('.movie-panel');
  if (!panel) {
    console.warn('[toggleMoviePanel] .movie-panel not found');
    return;
  }

  const usingJQuery = (typeof window.$ !== 'undefined' && typeof window.$.fn !== 'undefined');
  if (!moviePanelOpen) {
    if (usingJQuery) {
      $('.movie-panel').animate({ bottom: 0 }, 320, 'swing');
    } else {
      panel.style.transition = 'bottom 0.32s ease';
      panel.style.bottom = '0px';
    }
  } else {
    if (usingJQuery) {
      $('.movie-panel').animate({ bottom: -550 }, 260, 'swing');
    } else {
      panel.style.transition = 'bottom 0.26s ease';
      panel.style.bottom = '-550px';
    }
  }
  moviePanelOpen = !moviePanelOpen;
}

// =========================
// == BOOTSTRAP (run once) ==
// =========================
let _bootstrapped = false;
function bootstrap() {
  if (_bootstrapped) return;
  _bootstrapped = true;

  try {
    getTrendingMovies().catch(err => {
      console.error('[Movies] Load error:', err);
      showStatus('.movie-grid', 'Couldn\'t load movies. Please reload.');
    });
    getTrendingTVShows().catch(err => {
      console.error('[TV] Load error:', err);
      showStatus('.tv-grid', 'Couldn\'t load TV shows. Please reload.');
    });
  } catch (err) {
    console.error('[bootstrap] Unexpected error:', err);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  // DOM already ready (e.g., after hot reload / SPA nav)
  bootstrap();
}
