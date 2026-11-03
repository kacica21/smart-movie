import { poster } from "../api/tmdb";

export default function MovieCard({ movie, onOpen }) {
  return (
    <div className="card" onClick={() => onOpen(movie.id)}>
      <img src={poster(movie.poster_path)} alt={movie.title} loading="lazy" />
      <h3>{movie.title}</h3>
      <p>⭐ {movie.vote_average?.toFixed(1)} · {movie.release_date?.slice(0, 4)}</p>
    </div>
  );
}