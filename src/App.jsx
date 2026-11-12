import { useEffect, useState } from "react";
import { getGenres, searchMovies, searchPerson, discoverMovies, getTrending, getList } from "./api/tmdb";
import useLocalStorage from "./hooks/useLocalStorage";
import MovieCard from "./components/MovieCard";
import Row from "./components/Row";
import MovieModal from "./components/MovieModal";
import MovieDNA from "./components/MovieDNA";
import MoodPicker from "./components/MoodPicker";
import ForYou from "./components/ForYou";
import Economics from "./components/Economics";
import Swipe from "./components/Swipe";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("explore");
  const [openId, setOpenId] = useState(null);
  const [library, setLibrary] = useLocalStorage("library", {});

  const [genres, setGenres] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [maxRuntime, setMaxRuntime] = useState("");
  const [actorName, setActorName] = useState("");
  const [sort, setSort] = useState("popularity.desc");

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const active = query.trim() || genre || year || minRating > 0 || maxRuntime || actorName.trim();

  useEffect(() => {
    getGenres().then((d) => setGenres(d.genres));
  }, []);

  async function fetchPage(p) {
    setLoading(true);
    try {
      let data;
      if (query.trim()) {
        data = await searchMovies(query, p);
      } else {
        let actorId;
        if (actorName.trim()) {
          const r = await searchPerson(actorName);
          actorId = r.results[0]?.id;
          if (!actorId) {
            setMovies([]);
            setTotalPages(0);
            setLoading(false);
            return;
          }
        }
        data = await discoverMovies({ genre, year, minRating, maxRuntime, actor: actorId, sort, page: p });
      }
      setMovies((prev) => (p === 1 ? data.results : [...prev, ...data.results]));
      setPage(p);
      setTotalPages(data.total_pages);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const filtersKey = JSON.stringify({ query, genre, year, minRating, maxRuntime, actorName, sort });
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => fetchPage(1), 400);
    return () => clearTimeout(t);
  }, [filtersKey]);

  const reset = () => {
    setQuery(""); setGenre(""); setYear(""); setMinRating(0);
    setMaxRuntime(""); setActorName(""); setSort("popularity.desc");
  };

  const watchlist = Object.values(library).filter((m) => m.watchlist);
  const rated = Object.values(library).filter((m) => m.rating && !m.swiped);

  const rowGenres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 27, name: "Horror" },
    { id: 878, name: "Sci-Fi" },
  ];

  return (
    <div className="app">
      <h1>🎬 Smart Movie</h1>

     <div className="tabs">
  <button className={tab === "mood" ? "on" : ""} onClick={() => setTab("mood")}>🎭 Mood</button><button className={tab === "swipe" ? "on" : ""} onClick={() => setTab("swipe")}>👆 Swipe</button>
  <button className={tab === "explore" ? "on" : ""} onClick={() => setTab("explore")}>Explorează</button>{tab === "swipe" && <Swipe library={library} setLibrary={setLibrary} onOpen={setOpenId} />}
  <button className={tab === "foryou" ? "on" : ""} onClick={() => setTab("foryou")}>✨ Pentru tine</button>{tab === "swipe" && <Swipe library={library} setLibrary={setLibrary} onOpen={setOpenId} />}
  <button className={tab === "watchlist" ? "on" : ""} onClick={() => setTab("watchlist")}>{tab === "swipe" && <Swipe library={library} setLibrary={setLibrary} onOpen={setOpenId} />}
    Watchlist ({watchlist.length})
  </button>
  <button className={tab === "dna" ? "on" : ""} onClick={() => setTab("dna")}>Movie DNA</button>{tab === "swipe" && <Swipe library={library} setLibrary={setLibrary} onOpen={setOpenId} />}
  <button className={tab === "econ" ? "on" : ""} onClick={() => setTab("econ")}>📊 Economic</button>{tab === "swipe" && <Swipe library={library} setLibrary={setLibrary} onOpen={setOpenId} />}
</div>

      {tab === "explore" && (
        <>
          <input className="search" placeholder="Caută un film..." value={query} onChange={(e) => setQuery(e.target.value)} />

          <div className="filters">
            <select value={genre} onChange={(e) => setGenre(e.target.value)} disabled={!!query}>
              <option value="">Toate genurile</option>
              {genres.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
            </select>
            <input type="number" placeholder="An" min="1920" max="2026" value={year} onChange={(e) => setYear(e.target.value)} disabled={!!query} />
            <input type="text" placeholder="Actor (ex: Tom Hanks)" value={actorName} onChange={(e) => setActorName(e.target.value)} disabled={!!query} />
            <select value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} disabled={!!query}>
              <option value="">Orice durată</option>
              <option value="90">Am 90 min</option>
              <option value="120">Am 2 ore</option>
              <option value="150">Am 2.5 ore</option>
            </select>
            <label>
              Rating minim: {minRating}
              <input type="range" min="0" max="9" step="1" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} disabled={!!query} />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} disabled={!!query}>
              <option value="popularity.desc">Popularitate</option>
              <option value="vote_average.desc">Rating</option>
              <option value="primary_release_date.desc">Cele mai noi</option>
            </select>
            {active && <button className="btn" onClick={reset}>Resetează</button>}
          </div>

          {active ? (
            <>
              {!loading && movies.length === 0 && <p className="empty">Niciun film găsit.</p>}
              <div className="grid">
                {movies.map((m) => (<MovieCard key={m.id} movie={m} onOpen={setOpenId} />))}
              </div>
              {loading && <p>Se încarcă...</p>}
              {!loading && page < totalPages && (
                <div className="center">
                  <button className="btn" onClick={() => fetchPage(page + 1)}>Încarcă mai multe</button>
                </div>
              )}
            </>
          ) : (
            <>
              <Row title="🔥 În trend săptămâna asta" fetcher={getTrending} onOpen={setOpenId} />
              <Row title="🏆 Cele mai bine cotate" fetcher={() => getList("top_rated")} onOpen={setOpenId} />
              <Row title="🎟️ Acum în cinema" fetcher={() => getList("now_playing")} onOpen={setOpenId} />
              <Row title="⏳ În curând" fetcher={() => getList("upcoming")} onOpen={setOpenId} />
              {rowGenres.map((g) => (
                <Row key={g.id} title={g.name} fetcher={() => discoverMovies({ genre: g.id })} onOpen={setOpenId} />
              ))}
            </>
          )}
        </>
      )}

      {tab === "watchlist" && (
        <>
          <h2>Vreau să văd</h2>
          {watchlist.length === 0 && <p className="empty">Watchlist-ul e gol. Deschide un film și apasă „+ Watchlist".</p>}
          <div className="grid">
            {watchlist.map((m) => (<MovieCard key={m.id} movie={m} onOpen={setOpenId} />))}
          </div>
          <h2>Filmele mele notate</h2>
          <div className="grid">
            {rated.map((m) => (<MovieCard key={m.id} movie={m} onOpen={setOpenId} />))}
          </div>
        </>
      )}

      {tab === "dna" && <MovieDNA library={library} />}
      {tab === "mood" && <MoodPicker onOpen={setOpenId} />}
      {tab === "foryou" && <ForYou library={library} onOpen={setOpenId} />}
      {tab === "econ" && <Economics onOpen={setOpenId} />}
      const [tab, setTab] = useState("mood");

      {openId && (
        <MovieModal id={openId} onClose={() => setOpenId(null)} onOpen={setOpenId} library={library} setLibrary={setLibrary} />
      )}

      <footer>This product uses the TMDB API but is not endorsed or certified by TMDB.</footer>
    </div>
  );
}
