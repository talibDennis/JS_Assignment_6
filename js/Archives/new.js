
// === Config (consider moving API_KEY server-side) ===
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701'; // ⚠️ consider proxying through a backend
const BASE_URL = 'https://api.themoviedb.org/3/';
const DEFAULT_LANGUAGE = 'en-US';

let movies = [];
let moviePanelOpen = false;
let currentSearchController = null;

// =============================
// Utilities
// =============================
function safeText(value, fallback = 'Not available') {
  const s = typeof value === 'string' ? value.trim() : '';
  return s.length ? s : fallback;
}
function truncate(text, max = 150) {
  const s = typeof text === 'string' ? text : '';
  return s.length > max ? s.slice(0, max) + '...' : s;
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
// =============================
// === Search (debounced + cancellable) ===
// =============================
async function searchMovies({ page = 1, language = DEFAULT_LANGUAGE } = {}) {
  const query = document.querySelector('#txtSearch').value.trim();
  if (!query) {
    renderEmptyState('Start typing to search for movies.');
    return;
  }

  // Cancel any in-flight request
  if (currentSearchController) currentSearchController.abort();
  currentSearchController = new AbortController();

  const params = new URLSearchParams({
    api_key: API_KEY,
    query: query,
    include_adult: 'false',
    language,
    page: String(page),
  });

  const url = `${BASE_URL}search/movie?${params.toString()}`;
  showLoading();
  console.log(url);

  try {
    const response = await fetch(url, { signal: currentSearchController.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Map to Movie instances
    movies = Array.isArray(data.results) ? data.results.map(Movie.fromJson) : [];
    renderSearchGrid(movies);
    console.log(movies);

    // Optional: show total pages, next/prev buttons
    // renderPagination({ page: data.page, totalPages: data.total_pages });

  } catch (err) {
    if (err.name === 'AbortError') return; // Ignore aborted request
    renderError(`Something went wrong searching for "${query}". Please try again.`);
    console.error(err);
  } finally {
    hideLoading();
  }
}

// =============================
// === Renderers ===
// =============================
function renderSearchGrid(list) {
  const grid = document.querySelector('.search-grid');
  clearNode(grid);

  if (!list.length) {
    renderEmptyState('No results. Try a different title.');
    return;
  }

  const frag = document.createDocumentFragment();

  list.forEach((m) => {
    // Card
    const card = createEl('div', ['search-card', 'sCard']);

    // Poster
    const posterDiv = createEl('div');
    const poster = createEl('img', ['search-poster'], {
      alt: m.title,
      'data-id': m.id, // use data attribute for delegation
    });
    poster.src = m.getPosterUrl(); // relies on Movie.getPosterUrl fallback
    posterDiv.appendChild(poster);

    // Details
    const details = createEl('div', ['sDetails']);

    // Header (title + date + type chip)
    const header = createEl('div', ['sTitle']);
    
    const title = createEl('h2');
    title.textContent = safeText(m.title, 'Untitled');

    const date = createEl('span');
    date.textContent = safeText(m.releaseDate, 'Release date not available');

    header.appendChild(title);
    header.appendChild(date);

    const overviewDiv = createEl('div', ['sOverview']);
    const overviewP = createEl('p');
    overviewP.textContent = truncate(safeText(m.overview, 'Overview not available'), 150);
    overviewDiv.appendChild(overviewP);

    details.appendChild(header);
    details.appendChild(overviewDiv);

    card.appendChild(posterDiv);
    card.appendChild(details);

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

// === Details panel ===
async function getMovieDetails(id) {
  if (!id) return;
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: DEFAULT_LANGUAGE,
  });
  const url = `${BASE_URL}movie/${id}?${params.toString()}`;

  showLoadingPanel();

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const movie = Movie.fromJson(data);
    renderDetailsPanel(movie);
    toggleMoviePanel(true);
  } catch (err) {
    console.error(err);
    renderErrorPanel('Unable to load details. Please try again.');
  } finally {
    hideLoadingPanel();
  }
}

function renderDetailsPanel(movie) {
  const panelGrid = document.querySelector('.panel-grid');
  clearNode(panelGrid);

  // Controls
  const controls = createEl('div', [], { id: 'controls' });
  const closeBtn = createEl('button', ['closeBtn']);
  closeBtn.type = 'button';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => toggleMoviePanel(false));
  controls.appendChild(closeBtn);
  panelGrid.appendChild(controls);

  // Card
  const card = createEl('div', ['panel-card', 'pCard']);

  // Poster
  const posterDiv = createEl('div');
  const poster = createEl('img', ['panel-poster'], {
    alt: movie.title,
  });
  poster.src = movie.getPosterUrl();
  posterDiv.appendChild(poster);
  card.appendChild(posterDiv);

  // Details
  const details = createEl('div', ['pDetails']);
  const header = createEl('div', ['pTitle']);
  const title = createEl('h2');
  title.textContent = safeText(movie.title, 'Untitled');
  const date = createEl('span');
  date.textContent = safeText(movie.releaseDate, 'Release date not available');

  header.appendChild(title);
  header.appendChild(date);

  const overviewDiv = createEl('div', ['sOverview']);
  const overview = createEl('p');
  overview.textContent = truncate(safeText(movie.overview, 'Overview not available'), 150);

  overviewDiv.appendChild(overview);
  details.appendChild(header);
  details.appendChild(overviewDiv);

  card.appendChild(details);
  panelGrid.appendChild(card);
}

// === Panel animation (vanilla) ===
function toggleMoviePanel(open) {
  const panel = document.querySelector('.panel-grid');
  const isOpen = open ?? !moviePanelOpen;

  panel.style.transition = 'bottom 300ms ease';
  panel.style.bottom = isOpen ? '0' : '-550px';

  moviePanelOpen = isOpen;
}

// === Non-blocking UI feedback ===
function showLoading() {
  // Implement: e.g., add a spinner to the search area
}
function hideLoading() {}
function showLoadingPanel() {}
function hideLoadingPanel() {}

function renderEmptyState(message) {
  const grid = document.querySelector('.search-grid');
  clearNode(grid);
  const p = createEl('p', ['empty']);
  p.textContent = message;
  grid.appendChild(p);
}

function renderError(message) {
  const grid = document.querySelector('.search-grid');
  clearNode(grid);
  const p = createEl('p', ['error']);
  p.textContent = message;
  grid.appendChild(p);
}

function renderErrorPanel(message) {
  const panel = document.querySelector('.panel-grid');
  clearNode(panel);
  const p = createEl('p', ['error']);
  p.textContent = message;
  panel.appendChild(p);
}

// === Event wiring ===

// Debounce input typing to limit requests
let debounceTimer;
document.querySelector('#txtSearch').addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => searchMovies({ page: 1 }), 300);
});

// Event delegation for poster clicks
document.querySelector('.search-grid').addEventListener('click', (evt) => {
  const img = evt.target.closest('img.search-poster');
  if (!img) return;
  const id = img.getAttribute('data-id');
  getMovieDetails(id);
});
