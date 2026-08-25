import { useState, useEffect } from "react";
import { getWeatherData, getWeatherHistory } from "../../../services/api";
import {
  calcBlisterBlightRisk,
  calcRedSpiderMiteRisk,
  riskLabel,
} from "../../../utils/diseaseRisk";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"];

export default function Reports() {
  const [readings, setReadings] = useState({});
  const [histories, setHistories] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { default: api } = await import("../../../services/api");
        const wRes = await getWeatherData();
        const data = wRes.data.data;
        const regionMap = {};
        data.forEach(r => {
          const name = r.location?.name;
          if (name && !regionMap[name]) regionMap[name] = r;
        });
        setReadings(regionMap);

        const historyResults = {};
        await Promise.all(
          REGIONS.map(async region => {
            try {
              const hRes = await getWeatherHistory(region);
              historyResults[region] = hRes.data.data;
            } catch {
              historyResults[region] = [];
            }
          })
        );
        setHistories(historyResults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-green-700 font-medium">Generating reports…</p>
        </div>
      </div>
    );
  }

  // Summary stats per region
  const summaryStats = REGIONS.map(region => {
    const r = readings[region];
    const history = histories[region] || [];
    const temps = history.map(h => h.temp).filter(Boolean);
    const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : r?.temperature?.current ?? "—";
    const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : "—";
    const minTemp = temps.length ? Math.min(...temps).toFixed(1) : "—";
    const bb  = calcBlisterBlightRisk(r?.humidity, r?.temperature?.current);
    const rsm = calcRedSpiderMiteRisk(r?.humidity, r?.temperature?.current, r?.rainfall);
    return {
      region,
      current: r?.temperature?.current ?? "—",
      avgTemp,
      maxTemp,
      minTemp,
      humidity: r?.humidity ?? "—",
      rainfall: r?.rainfall ?? 0,
      windSpeed: r?.windSpeed ?? "—",
      feelsLike: r?.temperature?.feelsLike ?? "—",
      bbScore: bb,
      bbRisk: riskLabel(bb).label,
      rsmScore: rsm,
      rsmRisk: riskLabel(rsm).label,
      readings: history.length,
    };
  });

  // Bar chart data — current conditions comparison
  const barData = summaryStats.map(s => ({
    region: s.region.replace(" ", "\n"),
    Temperature: s.current,
    Humidity: s.humidity,
  }));

  // Combined history for line chart
  const allTimes = [...new Set(
    REGIONS.flatMap(r => (histories[r] || []).map(d => d.time))
  )].sort();
  const combinedHistory = allTimes.map(time => {
    const point = { time };
    REGIONS.forEach(region => {
      const match = (histories[region] || []).find(d => d.time === time);
      if (match) point[region] = match.temp;
    });
    return point;
  });

  const REGION_COLORS = {
    "Nuwara Eliya": "#16a34a",
    "Kandy": "#0284c7",
    "Ratnapura": "#d97706",
  };

  const RISK_BADGE = {
    High:   "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low:    "bg-green-100 text-green-700",
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Region", "Current Temp (°C)", "Avg Temp (°C)", "Min Temp (°C)", "Max Temp (°C)", "Humidity (%)", "Rainfall (mm)", "Wind (m/s)", "Feels Like (°C)", "Blister Blight Risk", "Red Spider Mite Risk", "Readings (24h)"];
    const rows = summaryStats.map(s => [
      s.region, s.current, s.avgTemp, s.minTemp, s.maxTemp,
      s.humidity, s.rainfall, s.windSpeed, s.feelsLike,
      s.bbRisk, s.rsmRisk, s.readings,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tea-weather-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-green-900">Reports</h1>
          <p className="text-sm text-green-600 mt-0.5">
            Summary statistics and exportable data · Generated {new Date().toLocaleString()}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "summary", label: "Summary" },
          { key: "charts",  label: "Charts" },
          { key: "data",    label: "Raw Data" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === tab.key
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-green-700 border-green-200 hover:border-green-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUMMARY TAB */}
      {activeTab === "summary" && (
        <div className="flex flex-col gap-4">
          {summaryStats.map(s => (
            <div key={s.region} className="bg-white rounded-xl border border-green-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-green-900">{s.region}</h2>
                <span className="text-xs text-green-400">{s.readings} readings in last 24h</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  ["Current Temp", `${s.current}°C`],
                  ["Avg Temp (24h)", `${s.avgTemp}°C`],
                  ["Min Temp (24h)", `${s.minTemp}°C`],
                  ["Max Temp (24h)", `${s.maxTemp}°C`],
                  ["Humidity", `${s.humidity}%`],
                  ["Rainfall", `${s.rainfall}mm`],
                  ["Wind Speed", `${s.windSpeed} m/s`],
                  ["Feels Like", `${s.feelsLike}°C`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-500 mb-1">{label}</div>
                    <div className="text-sm font-semibold text-green-800">{val}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs text-green-600">Blister Blight</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_BADGE[s.bbRisk]}`}>
                    {s.bbRisk} ({s.bbScore}/100)
                  </span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs text-green-600">Red Spider Mite</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_BADGE[s.rsmRisk]}`}>
                    {s.rsmRisk} ({s.rsmScore}/100)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CHARTS TAB */}
      {activeTab === "charts" && (
        <div className="flex flex-col gap-4">
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-green-100 p-5">
            <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
              Current Conditions Comparison
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#4ade80" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#4ade80" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "0.5px solid #bbf7d0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Temperature" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Humidity" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart */}
          <div className="bg-white rounded-xl border border-green-100 p-5">
            <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
              24h Temperature Trend — All Regions
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={combinedHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#4ade80" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#4ade80" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "0.5px solid #bbf7d0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {REGIONS.map(region => (
                  <Line key={region} type="monotone" dataKey={region} stroke={REGION_COLORS[region]} strokeWidth={2} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Disease Risk Bar Chart */}
          <div className="bg-white rounded-xl border border-green-100 p-5">
            <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
              Disease Risk Score Comparison
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={summaryStats.map(s => ({
                  region: s.region,
                  "Blister Blight": s.bbScore,
                  "Red Spider Mite": s.rsmScore,
                }))}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#4ade80" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#4ade80" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "0.5px solid #bbf7d0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Blister Blight" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Red Spider Mite" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RAW DATA TAB */}
      {activeTab === "data" && (
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium tracking-widest text-green-500 uppercase">
              Raw Data Table
            </p>
            <button
              onClick={exportCSV}
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              Export as CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-100">
                  {["Region", "Temp (°C)", "Avg (24h)", "Min", "Max", "Humidity", "Rainfall", "Wind", "Feels Like", "Blister Blight", "Red Spider Mite", "Readings"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-green-500 pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryStats.map((s, i) => (
                  <tr key={s.region} className={`border-b border-green-50 ${i % 2 === 0 ? "bg-green-50/30" : ""}`}>
                    <td className="py-3 pr-4 font-medium text-green-800 whitespace-nowrap">{s.region}</td>
                    <td className="py-3 pr-4 text-green-700">{s.current}°C</td>
                    <td className="py-3 pr-4 text-green-700">{s.avgTemp}°C</td>
                    <td className="py-3 pr-4 text-green-700">{s.minTemp}°C</td>
                    <td className="py-3 pr-4 text-green-700">{s.maxTemp}°C</td>
                    <td className="py-3 pr-4 text-green-700">{s.humidity}%</td>
                    <td className="py-3 pr-4 text-green-700">{s.rainfall}mm</td>
                    <td className="py-3 pr-4 text-green-700">{s.windSpeed} m/s</td>
                    <td className="py-3 pr-4 text-green-700">{s.feelsLike}°C</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_BADGE[s.bbRisk]}`}>{s.bbRisk}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_BADGE[s.rsmRisk]}`}>{s.rsmRisk}</span>
                    </td>
                    <td className="py-3 pr-4 text-green-700">{s.readings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}