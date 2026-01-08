
let movieTrends = []; // stores trending movie results
let tvTrends = []; // stores trending movie results
let moviePanelOpen = false;
let moviePanel = document.querySelector('.movie-panel');
const MAX_TRENDS = 7;

// sample api call for a movie search (searching for: ghost in the shell)
// https://api.themoviedb.org/3/trending/movie/week?api_key=YOUR_API_KEY
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701'
const BASE_URL = 'https://api.themoviedb.org/3/';

// Code begins:
async function getTrendingMovies() {
  const url = `${BASE_URL}trending/movie/week?api_key=${API_KEY}`;
  console.log(url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Convert raw JSON to Movie instances
  movieTrends = data.results.map(movieJson => Movie.fromJson(movieJson));
  console.log(movieTrends);

  showTrendingMovies();
}



/* ============================
========= MOVIE TRENDS =========
============================ */
// pulls results from 'movieTrends = [];' array
function showTrendingMovies() {
  // ************* Grid *************
  let mediaGridDiv = document.querySelector('.media-grid');
  mediaGridDiv.innerHTML = ''; // clears the gallery first!

  for(let i = 0; i < MAX_TRENDS; i++) {
    // *********** Card *************
    let mCardDiv = document.createElement('div');
    mCardDiv.classList.add('media-card', 'mCard');
    
    // *********** Poster ***********
    let mIconDiv = document.createElement('div');
    mIconDiv.classList.add('media-icon');
    
    let posterDiv = document.createElement('div');
    let poster = document.createElement('img');
    poster.classList.add('media-poster');
    let posterUrl = movieTrends[i].getPosterUrl();
    poster.setAttribute('alt', movieTrends[i].title);
    poster.setAttribute('id', movieTrends[i].id);
    poster.setAttribute('onclick', 'getTrendingMovies(this.id);');
    // if no poster
    if (!posterUrl) {
      posterUrl = 'assets/images/noImage.png'; // ✅ your default image path
    }
    poster.setAttribute('src', posterUrl);
    posterDiv.appendChild(poster);
    // score badge
    let mScoreActions = document.createElement('div');
    mScoreActions.classList.add('score-actions');
    let mScoreBadge = document.createElement('div');
    let score = document.createElement('span');
    score.classList.add('score-badge__value');
    let mScore = movieTrends[i].voteAverage;
    let percentage = (mScore * 10).toFixed(0) + '%'; // Convert to percentage
    score.textContent = percentage;
    // score.textContent = show.getScorePercentage();
    // Apply color class based on score
    if (mScore >= 7) {
      mScoreBadge.classList.add('score-badge', 'score-high'); // Green
    } else if (mScore >= 5) {
      mScoreBadge.classList.add('score-badge', 'score-medium'); // Yellow
    } else {
      mScoreBadge.classList.add('score-badge', 'score-low'); // Red
    }
    mScoreBadge.appendChild(score);
    mScoreActions.appendChild(mScoreBadge);

    mIconDiv.append(posterDiv, mScoreActions);
    
    // *********** Details ***********
    let mDetailsDiv = document.createElement('div');
    mDetailsDiv.classList.add('mDetails');

    // >>>>create details-div-header
    let mTitleDiv = document.createElement('div');
    mTitleDiv.classList.add('mTitle');
    // title
    let title = document.createElement('h2');
    title.textContent = movieTrends[i].title;
    // date
    let date = document.createElement('span');
    let mMovieDate = movieTrends[i].releaseDate;
    // if no date
    if (!mMovieDate || mMovieDate.trim() === '') {
      date.textContent = 'Release date not available';
    } else {
      date.textContent = mMovieDate; // Or format it if needed
    }
    // Append both to header
    mTitleDiv.append(title, date);
    // Append header & body to details
    mDetailsDiv.appendChild(mTitleDiv);
    
    // *** Append poster & details to Card *************
    mCardDiv.append(mIconDiv, mDetailsDiv);

    // *** Append Card to Grid *************
    mediaGridDiv.appendChild(mCardDiv);

  }
} // showTrendingMovies()



/* ============================
========= LIGHTBOX =========
============================ */
async function getMovieDetails(id) {
  const url = `${BASE_URL}movie/${id}?api_key=${API_KEY}&language=en-US`;
  
  const response = await fetch(url);

  if (!response.ok) { // if response code is 200 ok
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  //  data.results is an array of raw movie JSON objects
  const movie = Movie.fromJson(data);

  // display movie details
  moviePanel.innerHTML = ''; // first clear the panel
  // moviePanel.setAttribute('style', `background: url(https://media.themoviedb.org/t/p/w1920_and_h800_multi_faces${movie.backdropPath})`);

  // make the controls and the x
  let controls = document.createElement('div');
  controls.setAttribute('id', 'controls');
  // set controls
  let closeBtn = document.createElement('span');
  closeBtn.setAttribute('class', 'closeBtn');
  closeBtn.innerText = 'X';
  closeBtn.setAttribute('onclick', 'toggleMoviePanel();');
  controls.appendChild(closeBtn);
  moviePanel.appendChild(controls);
  
  // set movie details
  let movieID = document.createElement('p');
  movieID.innerText = movie.id;
  
  moviePanel.appendChild(movieID);
  
  toggleMoviePanel();
}

function toggleMoviePanel() {
  if(!moviePanelOpen) { // it's closed so open the moviePane
    $('.movie-panel').animate({
      bottom: 0
    }, 320, 'swing');
  }
  else { // it's open now close the moviePane
    $('.movie-panel').animate({
      bottom: -550
    }, 260, 'swing');
  }
  moviePanelOpen = !moviePanelOpen;
} // toggleMoviePanel()

//==================>>
//== MENU CODE ==>>
let menuOpen = false;

function toggleMenu() {
  if(!menuOpen) { // it's closed so open the menu
    $('nav').animate({
      right: 0
    }, 320, 'swing');
  }
  else { // it's open now close the menu
    $('nav').animate({
      right: -226
    }, 260, 'swing');
  }
  menuOpen = !menuOpen; // very common short-cut
} // toggleMenu()

function showBox(num) {
  // first make the lightbox visible
  $('#lightbox').css('visibility', 'visible');

  // set the image src for the big picture
  $('#lightboxImage').attr('src', 'assets/images/pic' + num + '.png');
} // showBox()

function hideBox() {
  // hide the lightbox
  $('#lightbox').css('visibility', 'hidden');
} // hideBox()

function closeNav() {
  $('nav').animate({
      right: -226
    }, 220, 'swing');
    menuOpen = false;
} // closeNav()



/*
// demo
mediaMovies('ghost in the shell')
  .then(movies => {
    console.log('Movies as class instances:', movies);
    // e.g. use a method:
    movies.forEach(movie => {
      console.log(movie.title, movie.getPosterUrl());
    });
  })
*/