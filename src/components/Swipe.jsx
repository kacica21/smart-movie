import { useEffect, useRef, useState } from "react";
import { getGenres, discoverRaw, poster } from "../api/tmdb";

export default function Swipe({ library, setLibrary, onOpen }) {
  const [genres, setGenres] = useState([]);
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const startX = useRef(0);
  const busy = useRef(false);
  const seen = useRef(new Set());

  const idToName = Object.fromEntries(genres.map((g) => [g.id, g.name]));

  useEffect(() => {
    getGenres().then((d) => setGenres(d.genres)).catch(console.error);
  }, []);

  // Genurile preferate, calculate din filmele apreciate
  const liked = Object.values(library).filter((m) => m.rating >= 4);
  const score = {};
  liked.forEach((m) => m.genres?.forEach((n) => (score[n] = (score[n] || 0) + 1)));
  const topNames = Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);

  async function loadMore() {
    if (busy.current || !genres.length) return;
    busy.current = true;
    setLoading(true);
    const topIds = topNames.slice(0, 2).map((n) => genres.find((g) => g.name === n)?.id).filter(Boolean);
    const params = { sort_by: "popularity.desc", page: Math.ceil(Math.random() * 10) };
    // 70% din filme vin din genurile tale preferate, 30% sunt variate
    if (topIds.length && Math.random() < 0.7) params.with_genres = topIds.join("|");
    try {
      const d = await discoverRaw(params);
      setDeck((prev) => {
        const have = new Set(prev.map((m) => m.id));
        const fresh = d.results.filter(
          (m) => m.poster_path && !library[m.id] && !seen.current.has(m.id) && !have.has(m.id)
        );
        return [...prev, ...fresh];
      });
      setAttempt((a) => a + 1);
    } catch (e) {
      console.error(e);
    }
    busy.current = false;
    setLoading(false);
  }

  useEffect(() => {
    if (genres.length && deck.length < 5) loadMore();
  }, [genres, deck.length, attempt]);

  const top = deck[0];

  function decide(movie, kind) {
    seen.current.add(movie.id);
    const names = (movie.genre_ids || []).map((i) => idToName[i]).filter(Boolean);
    setLibrary((prev) => ({
      ...prev,
      [movie.id]: {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        genres: names,
        rating: kind === "dislike" ? 1 : 4,
        watchlist: kind === "watch",
        swiped: true,
      },
    }));
    setDeck((prev) => prev.slice(1));
  }

  const onDown = (e) => {
    startX.current = e.clientX;
    setDrag({ x: 0, active: true });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (drag.active) setDrag({ x: e.clientX - startX.current, active: true });
  };
  const onUp = () => {
    if (top && drag.x > 110) decide(top, "like");
    else if (top && drag.x < -110) decide(top, "dislike");
    setDrag({ x: 0, active: false });
  };

  const swiped = Object.values(library).filter((m) => m.swiped).length;

  return (
    <div className="swipe">
      <h2 className="center">Swipe: ce film alegi?</h2>
      <p className="empty" style={{ margin: "0 0 10px" }}>
        Trage dreapta dacă îți place, stânga dacă nu. Ai evaluat {swiped} filme.
        {topNames.length > 0 && <> Aplicația a învățat că îți plac: <b>{topNames.join(", ")}</b>.</>}
      </p>

      {top ? (
        <>
          <div
            className="swipe-card"
            style={{
              transform: `translateX(${drag.x}px) rotate(${drag.x / 18}deg)`,
              transition: drag.active ? "none" : "transform .3s",
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <img src={poster(top.poster_path)} alt={top.title} draggable={false} />
            <span className="stamp like" style={{ opacity: Math.max(0, Math.min(1, drag.x / 110)) }}>LIKE</span>
            <span className="stamp nope" style={{ opacity: Math.max(0, Math.min(1, -drag.x / 110)) }}>NOPE</span>
            <div className="swipe-info">
              <h3>{top.title} ({top.release_date?.slice(0, 4)})</h3>
              <p>⭐ {top.vote_average?.toFixed(1)} · {(top.genre_ids || []).map((i) => idToName[i]).filter(Boolean).slice(0, 3).join(", ")}</p>
            </div>
          </div>

          <div className="swipe-buttons">
            <button className="sb no" onClick={() => decide(top, "dislike")}>✕</button>
            <button className="sb info" onClick={() => onOpen(top.id)}>ℹ️</button>
            <button className="sb watch" onClick={() => decide(top, "watch")}>🔖</button>
            <button className="sb yes" onClick={() => decide(top, "like")}>♥</button>
          </div>
          <p className="empty" style={{ margin: "8px 0" }}>✕ nu · ℹ️ detalii · 🔖 watchlist · ♥ îmi place</p>
        </>
      ) : (
        <p className="center">{loading ? "Se încarcă filme..." : "Nu mai sunt filme noi."}</p>
      )}
    </div>
  );
}