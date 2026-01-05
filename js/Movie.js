class Movie {
  constructor(id, backdropPath, title, overview, releaseDate, posterPath, voteAverage) {
    this.id = id;
    this.backdropPath = backdropPath;
    this.title = title;
    this.overview = overview;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.voteAverage = voteAverage;
  }

  static fromJson(json) {
    return new Movie(
      json.id,
      json.backdrop_path,
      json.title,
      json.overview,
      json.release_date,
      json.poster_path,
      json.average
    );
  }
  
  getPosterUrl(size = 'w342') {
    if (!this.posterPath) {
      return null;
    }
    return `https://image.tmdb.org/t/p/${size}${this.posterPath}`;
  }
} // class