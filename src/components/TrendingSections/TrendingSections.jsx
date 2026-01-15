
// TrendingSections.jsx
import HorizontalScroller from "./HorizontalScroller";
import PosterCard from "./PosterCard"; // your card component (image, title, rating)

export default function TrendingSections({ trendingMovies, trendingTv }) {
  return (
    <>
      <HorizontalScroller
        title="Trending Movies"
        items={trendingMovies}
        itemWidth={200}
        renderItem={(movie) => (
          <PosterCard
            imageUrl={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            title={movie.title}
            subtitle={movie.release_date?.slice(0,4)}
            rating={movie.vote_average}
          />
        )}
      />

      <HorizontalScroller
        title="Trending TV"
        items={trendingTv}
        itemWidth={200}
        renderItem={(tv) => (
          <PosterCard
            imageUrl={`https://image.tmdb.org/t/p/w300${tv.poster_path}`}
            title={tv.name}
            subtitle={tv.first_air_date?.slice(0,4)}
            rating={tv.vote_average}
          />
        )}
      />
    </>
  );
}