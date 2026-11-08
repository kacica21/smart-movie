import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { discoverRaw, getBasic } from "../api/tmdb";

const tip = { background: "#1b1c33", border: "none", borderRadius: 8 };
const short = (s) => (s.length > 14 ? s.slice(0, 13) + "…" : s);

export default function Economics({ onOpen }) {
  const [year, setYear] = useState(2025);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (year < 1980 || year > 2026) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const d = await discoverRaw({ sort_by: "revenue.desc", primary_release_year: year });
        const det = await Promise.all(d.results.map((m) => getBasic(m.id)));
        setRows(
          det
            .filter((m) => m.budget > 0 && m.revenue > 0)
            .map((m) => ({
              id: m.id,
              title: m.title,
              budget: Math.round(m.budget / 1e6),
              revenue: Math.round(m.revenue / 1e6),
              roi: Math.round(((m.revenue - m.budget) / m.budget) * 100),
              genres: m.genres.map((g) => g.name),
            }))
        );
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [year]);

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalRoi = totalBudget ? Math.round(((totalRevenue - totalBudget) / totalBudget) * 100) : 0;
  const best = [...rows].sort((a, b) => b.roi - a.roi)[0];

  const byGenre = {};
  rows.forEach((r) =>
    r.genres.forEach((g) => {
      byGenre[g] = byGenre[g] || { name: g, sum: 0, n: 0 };
      byGenre[g].sum += r.roi;
      byGenre[g].n += 1;
    })
  );
  const genreRoi = Object.values(byGenre)
    .map((g) => ({ name: g.name, roi: Math.round(g.sum / g.n) }))
    .sort((a, b) => b.roi - a.roi);

  const top10 = rows.slice(0, 10).map((r) => ({ ...r, name: short(r.title) }));

  return (
    <div>
      <h2 className="center">📊 Dashboard economic: filme și bani</h2>
      <div className="center">
        An: <input type="number" className="year-input" min="1980" max="2026" value={year} onChange={(e) => setYear(Number(e.target.value))} />
      </div>

      {loading && <p className="center">Se calculează...</p>}
      {!loading && rows.length === 0 && <p className="empty">Nu sunt date financiare pentru acest an.</p>}

      {rows.length > 0 && (
        <>
          <div className="stats">
            <div><b>${totalBudget}M</b><span>buget total</span></div>
            <div><b>${totalRevenue}M</b><span>încasări totale</span></div>
            <div><b>{totalRoi}%</b><span>ROI total</span></div>
            {best && <div><b>{best.roi}%</b><span>cel mai bun ROI: {short(best.title)}</span></div>}
          </div>

          <h3>Buget vs. încasări (milioane $), top 10 după încasări</h3>
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <BarChart data={top10}>
                <CartesianGrid stroke="#334" />
                <XAxis dataKey="name" stroke="#ccd" interval={0} angle={-30} textAnchor="end" height={80} />
                <YAxis stroke="#ccd" />
                <Tooltip contentStyle={tip} />
                <Legend />
                <Bar dataKey="budget" name="Buget" fill="#f97316" />
                <Bar dataKey="revenue" name="Încasări" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3>ROI mediu pe gen (%)</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={genreRoi}>
                <CartesianGrid stroke="#334" />
                <XAxis dataKey="name" stroke="#ccd" interval={0} angle={-30} textAnchor="end" height={70} />
                <YAxis stroke="#ccd" />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="roi" name="ROI %" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3>Cele mai profitabile filme</h3>
          <table className="table">
            <thead><tr><th>Film</th><th>Buget</th><th>Încasări</th><th>ROI</th></tr></thead>
            <tbody>
              {[...rows].sort((a, b) => b.roi - a.roi).map((r) => (
                <tr key={r.id} onClick={() => onOpen(r.id)}>
                  <td>{r.title}</td><td>${r.budget}M</td><td>${r.revenue}M</td><td>{r.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="empty">ROI = (încasări − buget) / buget × 100. Date TMDB; unele filme nu au buget raportat și sunt excluse.</p>
        </>
      )}
    </div>
  );
}