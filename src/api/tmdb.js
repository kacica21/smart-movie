const BASE = "https://api.themoviedb.org/3";
const KEY = import.meta.env.VITE_TMDB_KEY;

async function get(path, params = {}) {
  const qs = new URLSearchParams({ api_key: KEY, language: "en-US", ...params });
  const res = await fetch(`${BASE}${path}?${qs}`);
  if (!res.ok) throw new Error("Eroare la API");
  return res.json();
}

export const getGenres = () => get("/genre/movie/list");
export const searchMovies = (query, page = 1) => get("/search/movie", { query, page });
export const searchPerson = (query) => get("/search/person", { query });
export const getTrending = () => get("/trending/movie/week");
export const getList = (type) => get(`/movie/${type}`); // popular, top_rated, now_playing, upcoming
export const getMovieDetails = (id) =>
  get(`/movie/${id}`, { append_to_response: "credits,videos,similar" });

export const discoverMovies = ({ genre, year, minRating, maxRuntime, actor, sort, page = 1 }) => {
  const p = { sort_by: sort || "popularity.desc", "vote_count.gte": 200, page };
  if (genre) p.with_genres = genre;
  if (year) p.primary_release_year = year;
  if (minRating) p["vote_average.gte"] = minRating;
  if (maxRuntime) p["with_runtime.lte"] = maxRuntime;
  if (actor) p.with_cast = actor;
  return get("/discover/movie", p);
};
export const discoverRaw = (params) =>
  get("/discover/movie", { "vote_count.gte": 300, ...params });
export const getBasic = (id) => get(`/movie/${id}`);
export const poster = (path) =>
  path ? `https://image.tmdb.org/t/p/w342${path}` : "https://placehold.co/342x513?text=Fara+poster";