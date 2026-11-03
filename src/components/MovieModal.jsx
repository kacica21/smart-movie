import { useEffect, useState } from "react";
import { getMovieDetails, poster } from "../api/tmdb";

export default function MovieModal({ id, onClose, onOpen, library, setLibrary }) {
  const [m, setM] = useState(null);

  useEffect(() => {
    setM(null);
    getMovieDetails(id).then(setM).catch(console.error);
  }, [id]);

  if (!m)
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal">Se încarcă...</div>
      </div>
    );

  const trailer = m.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer");
  const entry = library[id] || {};

  const save = (patch) =>
    setLibrary((prev) => ({
      ...prev,
      [id]: {
        id,
        title: m.title,
        poster_path: m.poster_path,
        vote_average: m.vote_average,
        release_date: m.release_date,
        runtime: m.runtime,
        genres: m.genres.map((g) => g.name),
        cast: m.credits.cast.slice(0, 5).map((c) => c.name),
        ...prev[id],
        ...patch,
      },
    }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>

        <div className="modal-top">
          <img src={poster(m.poster_path)} alt={m.title} />
          <div>
            <h2>{m.title} ({m.release_date?.slice(0, 4)})</h2>
            <p>⭐ {m.vote_average?.toFixed(1)} · {m.runtime} min</p>
            <p>{m.genres.map((g) => g.name).join(", ")}</p>
            <p className="overview">{m.overview}</p>

            <button
              className={entry.watchlist ? "btn active" : "btn"}
              onClick={() => save({ watchlist: !entry.watchlist })}
            >
              {entry.watchlist ? "✓ În watchlist" : "+ Watchlist"}
            </button>

            <div className="stars">
              Nota ta:{" "}
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={s <= (entry.rating || 0) ? "star on" : "star"}
                  onClick={() => save({ rating: entry.rating === s ? 0 : s })}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {trailer && (
          <div className="trailer">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              allowFullScreen
            />
          </div>
        )}

        <h3>Actori</h3>
        <div className="cast">
          {m.credits.cast.slice(0, 8).map((c) => (
            <div key={c.id} className="actor">
              <img src={poster(c.profile_path)} alt={c.name} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        <h3>Filme similare</h3>
        <div className="row-scroll">
          {m.similar.results.slice(0, 10).map((s) => (
            <div className="card" key={s.id} onClick={() => onOpen(s.id)}>
              <img src={poster(s.poster_path)} alt={s.title} />
              <h3>{s.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}