import { useEffect, useState } from "react";
import { getGenres, discoverRaw } from "../api/tmdb";
import MovieCard from "./MovieCard";

// Cosine similarity între doi vectori de genuri
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k] || 0, y = b[k] || 0;
    dot += x * y; na += x * x; nb += y * y;
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export default function ForYou({ library, onOpen }) {
  const rated = Object.values(library).filter((m) => m.rating);
  const key = rated.map((m) => m.id + ":" + m.rating).join(",");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!rated.length) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const g = await getGenres();
        const idToName = Object.fromEntries(g.genres.map((x) => [x.id, x.name]));

        // 1. Profilul tău: scor pe genuri (nota 1-2 scade, nota 4-5 crește)
        const profile = {};
        rated.forEach((m) =>
          m.genres?.forEach((n) => (profile[n] = (profile[n] || 0) + (m.rating - 2.5)))
        );

        // 2. Filme candidate (populare + foarte bine cotate)
        const pages = await Promise.all(
          [1, 2, 3].flatMap((p) => [
            discoverRaw({ sort_by: "popularity.desc", page: p }),
            discoverRaw({ sort_by: "vote_average.desc", "vote_count.gte": 1000, page: p }),
          ])
        );
        const seen = new Set(rated.map((m) => m.id));
        const map = new Map();
        pages.forEach((d) => d.results.forEach((m) => { if (!seen.has(m.id)) map.set(m.id, m); }));

        // 3. Scor = 80% similaritate cu gusturile tale + 20% rating general
        const scored = [...map.values()]
          .map((m) => {
            const names = m.genre_ids.map((i) => idToName[i]).filter(Boolean);
            const vec = Object.fromEntries(names.map((n) => [n, 1]));
            const sim = Math.max(0, cosine(profile, vec));
            const score = 0.8 * sim + 0.2 * (m.vote_average / 10);
            return { ...m, match: Math.round(score * 100), common: names.filter((n) => (profile[n] || 0) > 0) };
          })
          .sort((a, b) => b.match - a.match)
          .slice(0, 18);

        if (!cancel) setResults(scored);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [key]);

  if (!rated.length)
    return <p className="empty">Notează câteva filme (stelele din pagina filmului) și algoritmul îți calculează recomandări personalizate.</p>;

  return (
    <div>
      <h2>Recomandate pentru tine</h2>
      <p className="empty" style={{ margin: "0 0 14px" }}>
        Calculate din {rated.length} filme notate de tine, cu cosine similarity pe genuri.
      </p>
      {loading && <p>Se calculează...</p>}
      <div className="grid">
        {results.map((m) => (
          <div key={m.id} className="match-wrap">
            <span className="match">{m.match}% match</span>
            <MovieCard movie={m} onOpen={onOpen} />
            {m.common.length > 0 && <small className="why">Pentru că îți plac: {m.common.join(", ")}</small>}
          </div>
        ))}
      </div>
    </div>
  );
}