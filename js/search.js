
let movies = []; // empty collection of movies
let moviePanelOpen = false;

// let panelCard = document.querySelector('.panel-card');
const MAX_TRENDS = 6;

// sample api call for a movie search (searching for: ghost in the shell)
// https://api.themoviedb.org/3/search/movie?api_key=cb7c7779c5c4232012594c012cf9a701&query=ghost in the shell

// Code begins:
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701'
const BASE_URL = 'https://api.themoviedb.org/3/';

async function searchMovies() {
  let query = document.querySelector('#txtSearch').value;
  const url = `${BASE_URL}search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
  console.log(url);
  const response = await fetch(url);

  if (!response.ok) { // if response code is 200 ok
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  //  data.results is an array of raw movie JSON objects
  movies = data.results.map(movieJson => Movie.fromJson(movieJson));
  console.log(movies);
  
  showPoster()
  // return movies;
} // searchMovies()

// pulls results from 'movies = [];' array
function showPoster() {
  // *************Grid
  let searchGridDiv = document.querySelector('.search-grid');
  searchGridDiv.innerHTML = ''; // clears the gallery first!

  for(let i = 0; i < movies.length; i++) {
    // *************Card
    let sCardDiv = document.createElement('div');
    sCardDiv.classList.add('search-card', 'sCard');
    
    // *************Poster
    let posterDiv = document.createElement('div');
    let poster = document.createElement('img');
    poster.classList.add('search-poster');
    poster.setAttribute('alt', movies[i].title);
    poster.setAttribute('id', movies[i].id);
    poster.setAttribute('onclick', 'getMovieDetails(this.id);');
    
    let posterUrl = movies[i].getPosterUrl();
    if (!posterUrl) {
      posterUrl = 'assets/images/noImage.png'; // ✅ your default image path
    }
    poster.setAttribute('src', posterUrl);

    // Append image to poster
    posterDiv.appendChild(poster);
    
    // *************Details
    let sDetailsDiv = document.createElement('div');
    sDetailsDiv.classList.add('sDetails');

    // >>>>create details-div-heading
    let sTitleDiv = document.createElement('div');
    sTitleDiv.classList.add('sTitle');
    // create title
    let title = document.createElement('h2');
    title.textContent = movies[i].title;
    // create date
    let date = document.createElement('span');
    let sMovieDate = movies[i].releaseDate;

    // Check if release date is empty or null
    if (!sMovieDate || sMovieDate.trim() === '') {
      date.textContent = 'Release date not available';
    } else {
      date.textContent = sMovieDate; // Or format it if needed
    }

    // Append both to heading
    sTitleDiv.appendChild(title);
    sTitleDiv.appendChild(date);
    
    // >>>>create details-div-body
    let sOverviewDiv = document.createElement('div');
    sOverviewDiv.classList.add('sOverview');
    
    let sOverview = document.createElement('p');
    let sMovieOverview = movies[i].overview;

    // Check if overview is empty or null
    if (!sMovieOverview || sMovieOverview.trim() === '') {
      sOverview.textContent = 'Overview not available';
    } else {
      // Truncate if too long
      let maxLength = 150; // Approx. 2 lines
      if (sMovieOverview.length > maxLength) {
        sMovieOverview = sMovieOverview.substring(0, maxLength) + '...';
      }
      sOverview.textContent = sMovieOverview;
    }

    sOverviewDiv.appendChild(sOverview);


    // Append header & body to details
    sDetailsDiv.appendChild(sTitleDiv);
    sDetailsDiv.appendChild(sOverviewDiv);
    
    // *************Append poster & details to Card
    sCardDiv.appendChild(posterDiv);
    sCardDiv.appendChild(sDetailsDiv);

    // *************Append Card to Grid
    searchGridDiv.appendChild(sCardDiv);

  }
} // showPosters()


async function getMovieDetails(id) {
  const url = `${BASE_URL}movie/${id}?api_key=${API_KEY}&language=en-US`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  const movie = Movie.fromJson(data); // single movie object

  // Clear panel
  let panelGrid = document.querySelector('.panel-grid');
  panelGrid.innerHTML = '';

  // Close button
  let controls = document.createElement('div');
  controls.setAttribute('id', 'controls');
  let closeBtn = document.createElement('span');
  closeBtn.setAttribute('class', 'closeBtn');
  closeBtn.innerText = 'X';
  closeBtn.setAttribute('onclick', 'toggleMoviePanel();');
  controls.appendChild(closeBtn);
  panelGrid.appendChild(controls);

  // Panel Card
  let panelCardDiv = document.createElement('div');
  panelCardDiv.classList.add('panel-card', 'pCard');

  // Poster
  let panelPosterDiv = document.createElement('div');
  let pPoster = document.createElement('img');
  pPoster.classList.add('panel-poster');
  pPoster.setAttribute('alt', movie.title);
  pPoster.setAttribute('id', movie.id);
  let posterUrl = movie.getPosterUrl();
  if (!posterUrl) {
    posterUrl = 'assets/images/noImage.png'; // fallback
  }
  pPoster.setAttribute('src', posterUrl);
  panelPosterDiv.appendChild(pPoster);
  panelCardDiv.appendChild(panelPosterDiv);

  // Details
  let pDetailsDiv = document.createElement('div');
  pDetailsDiv.classList.add('pDetails');

  // Title & Date
  let pTitleDiv = document.createElement('div');
  pTitleDiv.classList.add('pTitle');
  let title = document.createElement('h2');
  title.textContent = movie.title;
  let date = document.createElement('span');
  let pMovieDate = movie.releaseDate;
  date.textContent = (!pMovieDate || pMovieDate.trim() === '') ? 'Release date not available' : pMovieDate;
  pTitleDiv.appendChild(title);
  pTitleDiv.appendChild(date);

  // Overview
  let pOverviewDiv = document.createElement('div');
  pOverviewDiv.classList.add('sOverview');
  let pOverview = document.createElement('p');
  let pMovieOverview = movie.overview;
  if (!pMovieOverview || pMovieOverview.trim() === '') {
    pOverview.textContent = 'Overview not available';
  } else {
    let maxLength = 150;
    if (pMovieOverview.length > maxLength) {
      pMovieOverview = pMovieOverview.substring(0, maxLength) + '...';
    }
    pOverview.textContent = pMovieOverview;
  }
  pOverviewDiv.appendChild(pOverview);

  // Append details
  pDetailsDiv.appendChild(pTitleDiv);
  pDetailsDiv.appendChild(pOverviewDiv);
  panelCardDiv.appendChild(pDetailsDiv);

  // Add to panel
  panelGrid.appendChild(panelCardDiv);

  toggleMoviePanel();
}


function toggleMoviePanel() {
  if(!moviePanelOpen) { // it's closed so open the moviePane
    $('.panel-grid').animate({
      bottom: 0
    }, 320, 'swing');
  }
  else { // it's open now close the moviePane
    $('.panel-grid').animate({
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
searchMovies('ghost in the shell')
  .then(movies => {
    console.log('Movies as class instances:', movies);
    // e.g. use a method:
    movies.forEach(movie => {
      console.log(movie.title, movie.getPosterUrl());
    });
  })
*/