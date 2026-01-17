
class Movie {
  constructor(id, backdropPath = null, title, overview = null, releaseDate = null, posterPath = null, voteAverage = 0, genres = [], runtime = null, adult = false, video = false, status = null, tagline = null, certification = null, credits = {cast: [], crew: []}) {
    this.id = id;
    this.backdropPath = backdropPath;
    this.title = title;
    this.overview = overview;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.voteAverage = voteAverage;
    this.genres = Array.isArray(genres) ? genres : [];
    this.runtime = runtime; // minutes
    this.adult = adult;
    this.video = video;
    this.status = status; // "Released", "Post Production", etc.
    this.tagline = tagline;
    this.certification = certification;
    this.credits = credits;
  }

  static fromJson(json) {
    return new Movie(
      json.id,
      json.backdrop_path,
      json.title,
      json.overview,
      json.release_date ?? null,
      json.poster_path ?? null,
      Number(json.vote_average ?? 0),
      json.genres ?? [],
      json.runtime ?? null,
      json.adult ?? false,
      json.video ?? false,
      json.status ?? null,
      json.tagline ?? null,
      json.tagline ?? null,
      json.certification ?? null, // certification to be set after extra fetch     
      json.credits = { cast: [], crew: [] }, // credits to be set after extra fetch
    );
  }
  
  getPosterUrl(size = 'w342') {
    if (!this.posterPath) return 'assets/images/noImage.png';
    return `https://image.tmdb.org/t/p/${size}${this.posterPath}`;
  }

  getBackdropUrl(size = 'w780') {
    if (!this.backdropPath) return null;
    return `https://image.tmdb.org/t/p/${size}${this.backdropPath}`;
  }

  getScorePercentage() {
    const v = Number.isFinite(this.voteAverage) ? this.voteAverage : 0;
    return `${Math.round(v * 10)}%`;
  }

} // class