
// =========================
// == CONFIG & STATE =======
// =========================
const API_KEY = 'cb7c7779c5c4232012594c012cf9a701';
const BASE_URL = 'https://api.themoviedb.org/3/';
const MAX_TRENDS = 7;

let movieTrends = [];
let trendingTV = [];


// =========================
// == FETCH HELPERS ========
// =========================

// Generic fetch wrapper
async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// Movies
async function getTrendingMovies() {
    const url = `${BASE_URL}trending/movie/week?api_key=${API_KEY}`;
    const data = await fetchJson(url);

    movieTrends = data.results.map(m => Movie.fromJson(m));
    renderMediaGrid(movieTrends, buildMovieCard);
}

// TV Shows
async function getTrendingTVShows() {
    const url = `${BASE_URL}trending/tv/week?api_key=${API_KEY}`;
    const data = await fetchJson(url);

    trendingTV = data.results.map(tv => TVShow.fromJson(tv));
    renderMediaGrid(trendingTV, buildTVCard);
}



// ========================================================
// == SHARED GRID RENDERER (Movies + TV share this!) ======
// ========================================================
function renderMediaGrid(items, cardBuilder) {
    const grid = document.querySelector(".media-grid");
    grid.innerHTML = ""; // clear

    items.slice(0, MAX_TRENDS).forEach(item => {
        const card = cardBuilder(item);
        grid.appendChild(card);
    });
}



// ================================================
// == SHARED DOM UTILITIES ========================
// ================================================
function createEl(tag, classList = [], attrs = {}) {
    const el = document.createElement(tag);
    classList.forEach(c => el.classList.add(c));
    Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
    return el;
}

function createScoreBadge(scoreValue) {
    const badge = createEl("div", ["score-badge"]);
    const score = createEl("span", ["score-badge__value"]);
    score.textContent = `${Math.round(scoreValue * 10)}%`;

    if (scoreValue >= 7) {
        badge.classList.add("score-high");
    } else if (scoreValue >= 5) {
        badge.classList.add("score-medium");
    } else {
        badge.classList.add("score-low");
    }

    badge.appendChild(score);
    return badge;
}

function safePoster(url) {
    return url || "assets/images/noImage.png";
}



// ===================================
// == MOVIE CARD BUILDER =============
// ===================================
function buildMovieCard(movie) {
    const card = createEl("div", ["media-card", "mCard"]);
    const icon = createEl("div", ["media-icon"]);

    const poster = createEl("img", ["media-poster"], {
        src: safePoster(movie.getPosterUrl()),
        alt: movie.title,
        id: movie.id,
        onclick: `getMovieDetails(${movie.id})`
    });

    const posterDiv = createEl("div");
    posterDiv.appendChild(poster);

    const score = createScoreBadge(movie.voteAverage);

    const scoreActions = createEl("div", ["score-actions"]);
    scoreActions.appendChild(score);

    icon.append(posterDiv, scoreActions);

    const details = createEl("div", ["mDetails"]);
    const titleRow = createEl("div", ["mTitle"]);

    const title = document.createElement("h2");
    title.textContent = movie.title;

    const date = document.createElement("span");
    date.textContent = movie.releaseDate || "Release date not available";

    titleRow.append(title, date);
    details.append(titleRow);

    card.append(icon, details);
    return card;
}



// ===================================
// == TV CARD BUILDER ================
// ===================================
function buildTVCard(show) {
    const card = createEl("div", ["media-card", "mCard"]);
    const icon = createEl("div", ["media-icon"]);

    const poster = createEl("img", ["media-poster"], {
        src: safePoster(show.getPosterUrl()),
        alt: show.name,
        id: show.id
        // tv click can go here if needed
    });

    const posterDiv = createEl("div");
    posterDiv.appendChild(poster);

    const score = createScoreBadge(parseFloat(show.voteAverage));

    const scoreActions = createEl("div", ["score-actions"]);
    scoreActions.appendChild(score);

    icon.append(posterDiv, scoreActions);

    const details = createEl("div", ["mDetails"]);
    const titleRow = createEl("div", ["mTitle"]);

    const title = document.createElement("h3");
    title.textContent = show.name;

    const date = document.createElement("span");
    date.textContent = show.firstAirDate || "Date not available";

    titleRow.append(title, date);
    details.append(titleRow);

    card.append(icon, details);
    return card;
}



// =============================================
// == MOVIE DETAILS PANEL (unchanged logic) ====
// =============================================
let moviePanelOpen = false;
let moviePanel = document.querySelector(".movie-panel");

async function getMovieDetails(id) {
    const url = `${BASE_URL}movie/${id}?api_key=${API_KEY}&language=en-US`;
    const data = await fetchJson(url);
    const movie = Movie.fromJson(data);

    moviePanel.innerHTML = "";
    const controls = createEl("div", [], { id: "controls" });

    const closeBtn = createEl("span", ["closeBtn"], {
        onclick: "toggleMoviePanel()"
    });
    closeBtn.innerText = "X";

    controls.appendChild(closeBtn);
    moviePanel.appendChild(controls);

    const movieID = document.createElement("p");
    movieID.innerText = movie.id;
    moviePanel.appendChild(movieID);

    toggleMoviePanel();
}

function toggleMoviePanel() {
    if (!moviePanelOpen) {
        $(".movie-panel").animate({ bottom: 0 }, 320, "swing");
    } else {
        $(".movie-panel").animate({ bottom: -550 }, 260, "swing");
    }
    moviePanelOpen = !moviePanelOpen;
}



// ==============================
// == MENU + LIGHTBOX (same) ====
// ==============================
let menuOpen = false;

function toggleMenu() {
    if (!menuOpen) $("nav").animate({ right: 0 }, 320, "swing");
    else $("nav").animate({ right: -226 }, 260, "swing");

    menuOpen = !menuOpen;
}

function showBox(num) {
    $("#lightbox").css("visibility", "visible");
    $("#lightboxImage").attr("src", `assets/images/pic${num}.png`);
}

function hideBox() {
    $("#lightbox").css("visibility", "hidden");
}

function closeNav() {
    $("nav").animate({ right: -226 }, 220, "swing");
    menuOpen = false;
}

// Auto‑load movies + TV when the page finishes loading
window.addEventListener("DOMContentLoaded", () => {
    getTrendingMovies();
    getTrendingTVShows();
});
