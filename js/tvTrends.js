
let trendingTV = []; // Array to store trending TV shows
const MAX_TRENDS = 7;

// sample api call for a movie search (searching for: ghost in the shell)
// https://api.themoviedb.org/3/trending/tv/week?api_key=YOUR_API_KEY
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701'
const BASE_URL = 'https://api.themoviedb.org/3/';

// Code begins:
async function getTrendingTVShows() {
  const url = `${BASE_URL}trending/tv/week?api_key=${API_KEY}`;
  console.log(url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Convert raw JSON to Movie instances
  trendingTV = data.results.map(tvJson => TVShow.fromJson(tvJson));
  console.log(trendingTV);

  showTrendingTV(trendingTV);
}



/* ============================
========= TV TRENDS =========
============================ */
// pulls results from 'trendingTV = [];' array
function showTrendingTV(tvShows) {
  const mediaGridDiv = document.querySelector('.media-grid');
  mediaGridDiv.innerHTML = '';

  tvShows.forEach(show => {
    // *********** Card *************
    const mCardDiv = document.createElement('div');
    mCardDiv.classList.add('media-card', 'mCard');

    // *********** Poster ***********
    const mIconDiv = document.createElement('div');
    mIconDiv.classList.add('media-icon');

    const posterDiv = document.createElement('div');
    const poster = document.createElement('img');
    poster.classList.add('media-poster');
    poster.src = show.getPosterUrl();
    poster.alt = show.name;
    poster.id = show.id;
    poster.setAttribute('onclick', 'getTrendingShows(this.id);');

    // *********** Score ***********
    const mScoreActions = document.createElement('div');
    mScoreActions.classList.add('score-actions');
    
    const mScoreBadge = document.createElement('div');
    // ** if statement will decide class **

    const score = document.createElement('span');
    score.classList.add('score-badge__value');
    const mScore = show.getScorePercentage();
    console.log(mScore);
    score.textContent = mScore;
    // Apply color class based on score
    const nScore = parseFloat(show.voteAverage);
    console.log(nScore);
    if (nScore >= 7) {
      mScoreBadge.classList.add('score-badge', 'score-high'); // Green
    } else if (nScore >= 5) {
      mScoreBadge.classList.add('score-badge', 'score-medium'); // Yellow
    } else {
      mScoreBadge.classList.add('score-badge', 'score-low'); // Red
    }

    // *********** Details ***********
    const mDetailsDiv = document.createElement('div');
    mDetailsDiv.classList.add('mDetails');
    const mTitleDiv = document.createElement('div');
    mTitleDiv.classList.add('mTitle');

    const title = document.createElement('h3');
    title.textContent = show.name;

    const date = document.createElement('span');
    date.textContent = show.firstAirDate || 'Date not available';

    // >>>> build divs <<<<<
    mScoreBadge.appendChild(score);
    mScoreActions.appendChild(mScoreBadge);
    posterDiv.appendChild(poster);
    mIconDiv.append(posterDiv, mScoreActions);

    mTitleDiv.append(title, date);
    mDetailsDiv.append(mTitleDiv);

    mCardDiv.append(mIconDiv, mDetailsDiv);
    mediaGridDiv.appendChild(mCardDiv);
  });
}
