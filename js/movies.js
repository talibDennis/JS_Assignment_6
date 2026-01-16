
// ===== Toggle & helpers =====
const movieToggle = document.getElementById('movie-switch-button-checkbox');

function getPeriod() {
  // Checked => "week", Unchecked => "day"
  return movieToggle?.checked ? 'week' : 'day';
}

// Let main.js decide what to do when the toggle changes
export function wireMovieToggle(onChange) {
  if (!movieToggle) return;
  movieToggle.addEventListener('change', () => {
    onChange?.(getPeriod());
  });
}

// Public API: loadMovies({ apiKey, baseUrl, max })
export async function loadMovies({ apiKey, baseUrl, max = 6 }) {
  const period = getPeriod() ?? 'day';
  const url = `${baseUrl}trending/movie/${period}?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const items = (data.results ?? []).map(Movie.fromJson);
    renderMovies(items, max);
  } catch (err) {
    console.error('Failed to load movies:', err);
    renderMovies([], 0); // degrade gracefully
  }
}


// =============================
// Helpers
// =============================

// date format: string (YYYY-MM-DD) to "Mon D, YYYY"
function formatTMDBDate(dateStr, locale = 'en-US') {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}


// =============================
// Render movie cards
// =============================
function renderMovies(movies, max) {
  const head = document.querySelector('.movieHead');
  const grid = document.querySelector('.movie-grid');
  if (!head || !grid) return;

  head.textContent = 'Movies Trending';
  grid.innerHTML = '';

  // Limit if max is provided
  const list = Number.isFinite(max) ? movies.slice(0, max) : movies;

  list.forEach((show) => {
    // *********** Card *************
    const mCardDiv = document.createElement('div');
    mCardDiv.classList.add('media-card', 'mCard');

    // *********** Poster ***********
    const mIconDiv = document.createElement('div');
    mIconDiv.classList.add('media-icon');

    const posterDiv = document.createElement('div');
    const poster = document.createElement('img');
    poster.classList.add('media-poster');

    const posterUrl = show.getPosterUrl();
    poster.src = posterUrl;
    poster.alt = show.title || 'Untitled';
    poster.id = show.id;

    poster.addEventListener("click", () => {
      window.getMovieDetails?.(show.id);
    });
    // console.log(getTitleDetails)

    // *********** Score ***********
    const mScoreActions = document.createElement('div');
    mScoreActions.classList.add('iScore-actions');
    
    const mScoreBadge = document.createElement('div');
    // ** if statement will decide class **

    const score = document.createElement('span');
    score.classList.add('iScore-badge__value');

    const mScore = show.getScorePercentage(); // Convert to percentage

    score.textContent = mScore;
    // Apply color class based on score
    const nScore = Number(show.voteAverage) || 0;
    console.log(nScore);

    // Apply color class based on score
    if (nScore >= 7) {
      mScoreBadge.classList.add('iScore-badge', 'score-high'); // Green
    } else if (nScore >= 5) {
      mScoreBadge.classList.add('iScore-badge', 'score-medium'); // Yellow
    } else {
      mScoreBadge.classList.add('iScore-badge', 'score-low'); // Red
    }

    // *********** Details ***********
    const mDetailsDiv = document.createElement('div');
    mDetailsDiv.classList.add('mDetails');

    const mTitleDiv = document.createElement('div');
    mTitleDiv.classList.add('mTitle');

    const title = document.createElement('h3');
    title.textContent = show.title || 'Untitled';

    const date = document.createElement('span');
    const pretty = formatTMDBDate(show.releaseDate, 'en-US');
    date.textContent = pretty ?? 'Date not available';

    // >>>> build DOM <<<<<
    mScoreBadge.appendChild(score);
    mScoreActions.appendChild(mScoreBadge);
    
    posterDiv.appendChild(poster);
    mIconDiv.append(posterDiv, mScoreActions);

    mTitleDiv.append(title, date);
    mDetailsDiv.append(mTitleDiv);

    mCardDiv.append(mIconDiv, mDetailsDiv);
    grid.appendChild(mCardDiv);
  });
}
