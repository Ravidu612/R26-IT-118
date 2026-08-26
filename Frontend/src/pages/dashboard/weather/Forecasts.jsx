import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getWeatherForecast, getWeatherHistory } from "../../../services/api";

const REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"];

const REGION_COLORS = {
  "Nuwara Eliya": "#16a34a",
  "Kandy":        "#0284c7",
  "Ratnapura":    "#d97706",
};

const getWeatherEmoji = (weatherMain) => {
  const map = {
    Clear: "☀️", Clouds: "⛅", Rain: "🌧", Drizzle: "🌦",
    Thunderstorm: "⛈", Snow: "❄️", Mist: "🌫", Fog: "🌫",
  };
  return map[weatherMain] || "🌤";
};

export default function Forecasts() {
  const [forecasts, setForecasts] = useState({});
  const [histories, setHistories] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("Nuwara Eliya");

  useEffect(() => {
    const fetchAll = async () => {
      const forecastResults = {};
      const historyResults = {};

      await Promise.all(
        REGIONS.map(async (region) => {
          try {
            const [fRes, hRes] = await Promise.all([
              getWeatherForecast(region),
              getWeatherHistory(region),
            ]);
            forecastResults[region] = fRes.data.data;
            historyResults[region] = hRes.data.data;
          } catch (err) {
            console.error(`Failed to fetch data for ${region}:`, err);
            forecastResults[region] = [];
            historyResults[region] = [];
          }
        })
      );

      setForecasts(forecastResults);
      setHistories(historyResults);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-green-700 font-medium">Loading forecasts…</p>
        </div>
      </div>
    );
  }

  // Build combined chart data for all 3 regions from history
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

  const selectedForecast = forecasts[selectedRegion] || [];
  const today = selectedForecast[0] || {};
  const selectedHistory = histories[selectedRegion] || [];
  const latestTemperature = selectedHistory[selectedHistory.length - 1]?.temp ?? today.high ?? "—";
  const allForecastDays = Object.values(forecasts).flat();
  const numericHighs = allForecastDays.map((day) => Number(day.high)).filter(Number.isFinite);
  const numericLows = allForecastDays.map((day) => Number(day.low)).filter(Number.isFinite);
  const average = (values) => values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : "—";
  const cardClass = "rounded-2xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="mb-2 text-sm font-semibold text-green-600">LIVE REGIONAL MONITORING</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Weather Forecast Intelligence</h1><p className="mt-2 text-slate-500">Monitor temperature trends, rainfall forecasts and regional weather predictions.</p></div>
          <div className="flex flex-wrap items-center gap-3"><select aria-label="Location" value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm outline-none focus:border-green-500">{REGIONS.map((region) => <option key={region}>{region}</option>)}</select><select aria-label="Time range" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm outline-none"><option>Last 24 hours</option><option>Next 5 days</option></select><button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700">↻ Refresh</button></div>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className={cardClass}><p className="text-sm font-semibold text-slate-500">Today&apos;s Temperature</p><div className="mt-5 flex items-center justify-between"><span className="text-5xl">{getWeatherEmoji(today.weatherMain)}</span><span className="text-4xl font-bold text-slate-900">{latestTemperature}°C</span></div><p className="mt-4 font-semibold capitalize text-slate-700">{today.description || "Awaiting forecast"}</p><div className="mt-5 flex gap-8 border-t border-slate-100 pt-4 text-sm"><span><span className="block text-xs text-slate-400">High</span><b>{today.high ?? "—"}°C</b></span><span><span className="block text-xs text-slate-400">Low</span><b>{today.low ?? "—"}°C</b></span></div></div>
          <div className={cardClass}><p className="text-sm font-semibold text-slate-500">Rainfall Forecast</p><div className="mt-5 flex items-center justify-between"><span className="text-5xl">🌧</span><span className="text-4xl font-bold text-slate-900">{today.rain ?? 0}<small className="ml-1 text-lg font-semibold text-slate-400">mm</small></span></div><p className="mt-4 font-semibold text-slate-700">Expected precipitation</p><div className="mt-5 flex gap-8 border-t border-slate-100 pt-4 text-sm"><span><span className="block text-xs text-slate-400">Chance of rain</span><b>{today.rain > 0 ? "High" : "Low"}</b></span><span><span className="block text-xs text-slate-400">Humidity</span><b>—</b></span></div></div>
        </section>

        <section className={cardClass}><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-semibold">24 Hour Temperature Trend</h2><p className="mt-1 text-sm text-slate-400">Historical temperature comparison across all tea-growing regions.</p></div><span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">{combinedHistory.length} readings</span></div>{combinedHistory.length === 0 ? <p className="mt-10 text-sm text-slate-400">No historical data yet — check back in a few minutes.</p> : <div className="mt-5 h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={combinedHistory} margin={{ top: 18, right: 12, left: -16, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="°" /><Tooltip contentStyle={{ background: "#fff", border: "none", borderRadius: 12, boxShadow: "0 5px 20px rgba(15,23,42,.12)" }} formatter={(value) => [`${value}°C`, "Temperature"]} /><Legend wrapperStyle={{ fontSize: 12, paddingBottom: 12 }} />{REGIONS.map((region) => <Line key={region} type="monotone" dataKey={region} stroke={REGION_COLORS[region]} strokeWidth={3} dot={false} activeDot={{ r: 5 }} connectNulls />)}</LineChart></ResponsiveContainer></div>}</section>

        <section><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">Regional Forecast</h2><p className="mt-1 text-sm text-slate-400">Select a tea-growing region to explore its outlook.</p></div><div className="flex flex-wrap gap-2">{REGIONS.map((region) => <button key={region} type="button" onClick={() => setSelectedRegion(region)} className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${selectedRegion === region ? "bg-green-600 text-white shadow-md" : "bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:bg-green-50"}`}>{region}</button>)}</div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{selectedForecast.length === 0 ? <div className="col-span-full rounded-2xl bg-white p-8 text-center text-sm text-slate-400 shadow-md">Loading forecast...</div> : selectedForecast.map((day, index) => <div key={index} className={`rounded-2xl p-5 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "bg-gradient-to-br from-green-600 to-green-500 text-white sm:scale-[1.03]" : "bg-white text-slate-900"}`}><p className={`text-sm font-semibold ${index === 0 ? "text-green-50" : "text-slate-500"}`}>{day.day}</p><div className="my-4 text-5xl">{getWeatherEmoji(day.weatherMain)}</div><p className="text-3xl font-bold">{day.high}°C</p><div className={`mt-2 text-sm ${index === 0 ? "text-green-50" : "text-slate-400"}`}>High {day.high}° · Low {day.low}°</div><p className={`mt-3 text-sm ${index === 0 ? "text-green-50" : "text-slate-500"}`}>🌧 {day.rain || 0}mm</p><p className={`mt-3 min-h-10 text-xs capitalize ${index === 0 ? "text-green-50" : "text-slate-400"}`}>{day.description || "No description"}</p><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${index === 0 ? "bg-white/20 text-white" : "bg-green-50 text-green-700"}`}>{index === 0 ? "Today" : "Forecast"}</span></div>)}</div></section>

        <section><div className="mb-4"><h2 className="text-xl font-semibold">Regional Weather Overview</h2><p className="mt-1 text-sm text-slate-400">Today&apos;s conditions across every tea-growing region.</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{REGIONS.map((region, index) => { const regionToday = forecasts[region]?.[0]; if (!regionToday) return null; const accent = ["border-green-400", "border-sky-400", "border-orange-400"][index]; return <div key={region} className={`${cardClass} border-l-4 ${accent}`}><div className="flex items-start justify-between"><div><p className="font-semibold">{region}</p><span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{index === 0 ? "Cooler climate" : index === 1 ? "Stable" : "Monitor"}</span></div><span className="text-4xl">{getWeatherEmoji(regionToday.weatherMain)}</span></div><p className="mt-5 text-4xl font-bold">{regionToday.high}°C</p><p className="mt-1 text-sm capitalize text-slate-500">{regionToday.description}</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs"><span><b className="block text-sm">{regionToday.rain || 0}mm</b>Rainfall</span><span><b className="block text-sm">{regionToday.low}°C</b>Low</span></div></div>; })}</div></section>

        <section><div className="mb-4"><h2 className="text-xl font-semibold">Forecast Statistics</h2><p className="mt-1 text-sm text-slate-400">Five-day averages across all monitored regions.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["🌡", "Average Temperature", `${average(numericHighs)}°C`, "Across forecast highs"], ["🌧", "Average Rainfall", `${average(allForecastDays.map((day) => Number(day.rain)).filter(Number.isFinite))}mm`, "Expected precipitation"], ["☀", "Highest Temperature", `${numericHighs.length ? Math.max(...numericHighs) : "—"}°C`, "Warmest forecast period"], ["❄", "Lowest Temperature", `${numericLows.length ? Math.min(...numericLows) : "—"}°C`, "Coolest forecast period"]].map(([icon, label, value, description]) => <div className={cardClass} key={label}><div className="text-3xl">{icon}</div><p className="mt-5 text-sm font-medium text-slate-400">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p><p className="mt-2 text-xs text-slate-400">{description}</p></div>)}</div></section>
      </div>
    </main>
  );
}