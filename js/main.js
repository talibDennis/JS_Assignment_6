
import { loadMovies, wireMovieToggle } from './movies.js';
import { loadTV, wireTvToggle } from './tv.js';

const API_KEY = 'cb7c7779c5c4232012594c012cf9a701';
const BASE_URL = 'https://api.themoviedb.org/3/';
const MAX_TRENDS = 6;


window.addEventListener('DOMContentLoaded', () => {
  // Initial loads
  loadMovies({ apiKey: API_KEY, baseUrl: BASE_URL, max: MAX_TRENDS });
  loadTV({ apiKey: API_KEY, baseUrl: BASE_URL, max: MAX_TRENDS });

  // Re-load movies whenever the toggle changes
  wireMovieToggle(() => {
    loadMovies({ apiKey: API_KEY, baseUrl: BASE_URL, max: MAX_TRENDS });
  });

  // Re-load movies whenever the toggle changes
  wireTvToggle(() => {
    loadTV({ apiKey: API_KEY, baseUrl: BASE_URL, max: MAX_TRENDS });
  });

});
