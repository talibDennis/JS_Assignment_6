
class TVShow {
  constructor(id, name, overview, firstAirDate, posterPath, voteAverage) {
    this.id = id;
    this.name = name; // TV show title
    this.overview = overview;
    this.firstAirDate = firstAirDate;
    this.posterPath = posterPath;
    this.voteAverage = voteAverage;
  }

  static fromJson(json) {
    return new TVShow(
      json.id,
      json.name, // TMDb uses "name" for TV shows
      json.overview,
      json.first_air_date,
      json.poster_path,
      json.vote_average
    );
  }

  getPosterUrl(size = 'w342') {
    if (!this.posterPath) {
      return 'assets/images/noImage.png'; // ✅ fallback image
    }
    return `https://image.tmdb.org/t/p/${size}${this.posterPath}`;
  }

  getScorePercentage() {
    return (this.voteAverage * 10).toFixed(0) + '%'; // Convert to percentage
  }
} // class
