export const MOODS = [
  { id: "laugh", emoji: "😂", label: "Vreau să râd", params: { with_genres: "35", "vote_average.gte": 6.3 } },
  { id: "easy", emoji: "😴", label: "Sunt obosit, ceva ușor", params: { with_genres: "35|10751|16", "with_runtime.lte": 105 } },
  { id: "adrenaline", emoji: "🔥", label: "Vreau adrenalină", params: { with_genres: "28|53", "vote_average.gte": 6.5 } },
  { id: "romance", emoji: "💕", label: "Mă simt romantic", params: { with_genres: "10749", "vote_average.gte": 6.5 } },
  { id: "cry", emoji: "😭", label: "Vreau să plâng", params: { with_genres: "18,10749", "vote_average.gte": 7, sort_by: "vote_average.desc" } },
  { id: "scare", emoji: "😱", label: "Vreau să mă sperii", params: { with_genres: "27", "vote_average.gte": 6 } },
  { id: "think", emoji: "🧠", label: "Vreau să mă gândesc", params: { with_genres: "9648|878", "vote_average.gte": 7 } },
  { id: "escape", emoji: "🌍", label: "Vreau să evadez", params: { with_genres: "12|14", "vote_average.gte": 6.5 } },
  { id: "nostalgia", emoji: "📼", label: "Nostalgie", params: { with_genres: "10751|12|35", "primary_release_date.lte": "2005-12-31", "vote_average.gte": 7 } },
];