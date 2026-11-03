import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

export default function MovieDNA({ library }) {
  const rated = Object.values(library).filter((m) => m.rating);

  if (rated.length === 0)
    return <p className="empty">Notează câteva filme (cu stelele din pagina filmului) ca să-ți vezi Movie DNA.</p>;

  const genres = {}, actors = {}, decades = {};
  rated.forEach((m) => {
    m.genres?.forEach((g) => (genres[g] = (genres[g] || 0) + m.rating));
    m.cast?.forEach((a) => (actors[a] = (actors[a] || 0) + m.rating));
    const dec = Math.floor(Number(m.release_date?.slice(0, 4)) / 10) * 10;
    if (dec) decades[dec + "s"] = (decades[dec + "s"] || 0) + 1;
  });

  const radar = top(genres, 6).map(([name, value]) => ({ name, value }));
  const avg = (rated.reduce((s, m) => s + m.rating, 0) / rated.length).toFixed(1);
  const minutes = rated.reduce((s, m) => s + (m.runtime || 0), 0);

  return (
    <div className="dna">
      <div className="stats">
        <div><b>{rated.length}</b><span>filme notate</span></div>
        <div><b>{avg}★</b><span>notă medie</span></div>
        <div><b>{Math.round(minutes / 60)}h</b><span>timp vizionat</span></div>
      </div>

      <h3>Genurile tale</h3>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <RadarChart data={radar}>
            <PolarGrid stroke="#556" />
            <PolarAngleAxis dataKey="name" stroke="#ccd" />
            <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <h3>Actorii tăi preferați</h3>
      <p>{top(actors, 5).map(([n]) => n).join(" · ")}</p>

      <h3>Deceniile tale</h3>
      <p>{top(decades, 4).map(([d, c]) => `${d} (${c})`).join(" · ")}</p>
    </div>
  );
}