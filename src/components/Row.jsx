import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

export default function Row({ title, fetcher, onOpen }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetcher().then((d) => setMovies(d.results)).catch(console.error);
  }, []);

  return (
    <section>
      <h2 className="row-title">{title}</h2>
      <div className="row-scroll">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}