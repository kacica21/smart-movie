import { useState } from "react";
import { discoverRaw } from "../api/tmdb";
import { MOODS } from "../data/moods";
import MovieCard from "./MovieCard";

export default function MoodPicker({ onOpen }) {
  const [mood, setMood] = useState(null);
  const [maxRuntime, setMaxRuntime] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load(m, runtime) {
    if (!m) return;
    setLoading(true);
    const params = { sort_by: "popularity.desc", ...m.params, page: Math.ceil(Math.random() * 3) };
    if (runtime) params["with_runtime.lte"] = Math.min(Number(runtime), params["with_runtime.lte"] || 999);
    try {
      const d = await discoverRaw(params);
      setMovies(d.results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const surprise = () => {
    const pick = movies[Math.floor(Math.random() * movies.length)];
    if (pick) onOpen(pick.id);
  };

  return (
    <div>
      <h2 className="center">Cum te simți azi?</h2>
      <div className="moods">
        {MOODS.map((m) => (
          <button
            key={m.id}
            className={mood?.id === m.id ? "mood on" : "mood"}
            onClick={() => { setMood(m); load(m, maxRuntime); }}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="center">
        <select
          value={maxRuntime}
          onChange={(e) => { setMaxRuntime(e.target.value); load(mood, e.target.value); }}
        >
          <option value="">Cât timp ai? Oricât</option>
          <option value="90">Maxim 90 min</option>
          <option value="120">Maxim 2 ore</option>
          <option value="150">Maxim 2.5 ore</option>
        </select>
        {mood && (
          <>
            <button className="btn" onClick={() => load(mood, maxRuntime)}>🔄 Alt set de filme</button>
            <button className="btn active" onClick={surprise}>🎲 Surprinde-mă</button>
          </>
        )}
      </div>

      {!mood && <p className="empty">Alege o stare de mai sus și îți găsim filmul potrivit.</p>}
      {loading && <p className="center">Se încarcă...</p>}
      <div className="grid">
        {movies.map((m) => <MovieCard key={m.id} movie={m} onOpen={onOpen} />)}
      </div>
    </div>
  );
}