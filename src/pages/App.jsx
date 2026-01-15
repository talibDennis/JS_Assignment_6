
import { useEffect, useState } from "react";
import TrendingSections from "./components/TrendingSections/TrendingSections";

function App() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Read API key from env (Vite) or fallback to window config
  const API_KEY = import.meta?.env?.VITE_TMDB_API_KEY || window.TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    async function loadData() {
      try {
        if (!API_KEY) {
          throw new Error(
            "Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env (Vite) or set window.TMDB_API_KEY in index.html."
          );
        }

        const [moviesRes, tvRes] = await Promise.all([
          fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`),
        ]);

        if (!moviesRes.ok || !tvRes.ok) {
          throw new Error(`Fetch failed: ${moviesRes.status}/${tvRes.status}`);
        }

        const moviesJson = await moviesRes.json();
        const tvJson = await tvRes.json();

        setTrendingMovies(moviesJson.results || []);
        setTrendingTv(tvJson.results || []);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Something went wrong while fetching trending data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "1.5rem" }}>
        <h1 style={{ marginTop: 0 }}>Loading…</h1>
        <p>Fetching trending Movies and TV shows.</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main style={{ padding: "1.5rem" }}>
        <h1 style={{ marginTop: 0 }}>Oops</h1>
        <p style={{ color: "tomato" }}>{errorMsg}</p>
        <p style={{ marginTop: "1rem" }}>
          Tip: create a <code>.env</code> file and add <code>VITE_TMDB_API_KEY=YOUR_KEY</code>, then restart dev server.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1 style={{ marginTop: 0 }}>Trending Now</h1>

      <TrendingSections
        trendingMovies={trendingMovies}
        trendingTv={trendingTv}
      />
    </main>
  );
}

export default App;
