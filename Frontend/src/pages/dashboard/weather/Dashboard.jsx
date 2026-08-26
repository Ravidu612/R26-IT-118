  import { useState, useEffect } from "react";
  import {
    Brain, Cloud, CloudRain, CloudSun, Droplets, Eye, Gauge,
    Leaf, MapPin, RefreshCw, Sprout, Sun, Thermometer, TriangleAlert,
    Umbrella, Wind, Wheat, Zap,
  } from "lucide-react";
  import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
  } from "recharts";
  import { getWeatherData, getWeatherForecast, getWeatherHistory } from "../../../services/api";
  import { calcBlisterBlightRisk, calcRedSpiderMiteRisk, riskLabel } from "../../../utils/diseaseRisk";

  const RISK_COLOR = {
    red: { badge: "bg-red-50 text-red-700", dot: "bg-red-500" },
    yellow: { badge: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
    green: { badge: "bg-green-50 text-green-700", dot: "bg-green-500" },
  };

  const cardClass = "rounded-2xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg";

  const getWeatherIcon = (weatherMain, className = "h-10 w-10") => {
    const icons = { Clear: Sun, Clouds: CloudSun, Rain: CloudRain, Drizzle: CloudRain, Thunderstorm: Zap, Snow: Cloud, Mist: Cloud, Fog: Cloud };
    const Icon = icons[weatherMain] || CloudSun;
    return <Icon className={className} />;
  };

  const getCondition = (reading) => reading?.weather?.description || reading?.weather?.main || reading?.condition || "Partly cloudy";

  function RiskBadge({ score }) {
    const risk = riskLabel(score);
    const colors = RISK_COLOR[risk.color] || RISK_COLOR.green;
    return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />{risk.label}</span>;
  }

  export default function Dashboard() {
    const [readings, setReadings] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(0);

    // Fetch live weather readings
    useEffect(() => {
      getWeatherData()
        .then((res) => {
          const data = res.data.data;
          const regionMap = {};
          data.forEach((r) => {
            const name = r.location?.name;
            if (name && !regionMap[name]) regionMap[name] = r;
          });
          setReadings(Object.values(regionMap));
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, []);

    // Fetch forecast when selected region changes
    useEffect(() => {
      if (readings.length === 0) return;
      const regionName = readings[selectedRegion]?.location?.name;
      if (!regionName) return;

      setForecast([]);
      getWeatherForecast(regionName)
        .then((res) => setForecast(res.data.data))
        .catch((err) => console.error('Forecast error:', err));
    }, [selectedRegion, readings]);

    // Fetch 24h history when selected region changes
    useEffect(() => {
      if (readings.length === 0) return;
      const regionName = readings[selectedRegion]?.location?.name;
      if (!regionName) return;

      getWeatherHistory(regionName)
        .then((res) => setHistoryData(res.data.data))
        .catch((err) => console.error('History error:', err));
    }, [selectedRegion, readings]);

    // Use real history if available, otherwise fall back to sinusoidal estimate
    const trendData = historyData.length > 0
      ? historyData
      : readings[selectedRegion]
        ? Array.from({ length: 9 }, (_, i) => {
            const base = readings[selectedRegion].temperature?.current ?? 20;
            const hour = i * 3;
            const offset = Math.sin((hour / 24) * Math.PI * 2) * 3;
            return {
              time: `${String(hour).padStart(2, "0")}:00`,
              temp: +(base + offset - 1).toFixed(1),
            };
          })
        : [];

    if (loading) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-green-700 font-medium">Loading weather data…</p>
          </div>
        </div>
      );
    }

    const current = readings[selectedRegion] || {};
    const currentCondition = getCondition(current);
    const riskRows = readings.flatMap((reading) => [
      { disease: "Blister Blight", score: calcBlisterBlightRisk(reading.humidity, reading.temperature?.current), region: reading.location?.name },
      { disease: "Red Spider Mite", score: calcRedSpiderMiteRisk(reading.humidity, reading.temperature?.current, reading.rainfall), region: reading.location?.name },
    ]);
    const summaryStats = [
      [Thermometer, "Average Temperature", `${current.temperature?.current ?? "—"}°C`, "bg-orange-50 text-orange-600"],
      [Umbrella, "Rainfall", `${current.rainfall ?? "—"} mm`, "bg-sky-50 text-sky-600"],
      [Droplets, "Humidity", `${current.humidity ?? "—"}%`, "bg-blue-50 text-blue-600"],
      [Wind, "Wind Speed", `${current.windSpeed ?? "—"} m/s`, "bg-teal-50 text-teal-600"],
      [Gauge, "Forecast Accuracy", "94%", "bg-green-50 text-green-600"],
    ];
    const recommendations = [[Droplets, "Irrigation", "Soil moisture is healthy. Maintain regular irrigation checks."], [Sprout, "Fertilizer", "A light nutrient application is favorable this week."], [Wheat, "Harvesting", "Dry conditions ahead create a good harvesting window."], [Leaf, "Disease Prevention", "Monitor shaded rows closely as humidity rises."]];
    const alerts = [[TriangleAlert, "High Humidity", `${current.humidity ?? 0}% humidity may increase disease pressure.`, "text-orange-600 bg-orange-50"], [CloudRain, "Heavy Rain", `${current.rainfall ?? 0} mm rainfall recorded in the latest reading.`, "text-sky-600 bg-sky-50"], [Wind, "Strong Wind", `${current.windSpeed ?? 0} m/s wind speed detected across the estate.`, "text-red-600 bg-red-50"]];

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-600"><span className="h-2 w-2 rounded-full bg-green-500" />Live intelligence</div><h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Weather &amp; Climate Intelligence</h1><p className="mt-2 text-slate-500">Real-time weather monitoring, forecasting and estate recommendations.</p></div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"><MapPin className="h-4 w-4 text-green-600" /><select aria-label="Location" value={selectedRegion} onChange={(event) => setSelectedRegion(Number(event.target.value))} className="bg-transparent font-medium outline-none">{readings.map((reading, index) => <option key={reading.location?.name || index} value={index}>{reading.location?.name || "Estate"}</option>)}</select></label>
              <select aria-label="Time range" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm outline-none"><option>Last 24 hours</option><option>Last 7 days</option></select>
              <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"><RefreshCw className="h-4 w-4" />Refresh</button>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className={`${cardClass} xl:col-span-1`}><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Current Weather</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-400"><MapPin className="h-3.5 w-3.5" />{current.location?.name || "Estate"}</p></div><div className="rounded-2xl bg-green-50 p-3 text-green-600">{getWeatherIcon(current.weather?.main, "h-9 w-9")}</div></div><div className="mt-7 flex items-end gap-3"><span className="text-5xl font-bold tracking-tight">{current.temperature?.current ?? "—"}°</span><span className="mb-1 text-lg text-slate-400">C</span></div><p className="mt-2 font-medium capitalize text-slate-600">{currentCondition}</p><div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">{[[Droplets, "Humidity", `${current.humidity ?? "—"}%`], [Wind, "Wind Speed", `${current.windSpeed ?? "—"} m/s`], [Umbrella, "Rainfall", `${current.rainfall ?? "—"} mm`]].map(([Icon, label, value]) => <div key={label}><Icon className="mb-2 h-4 w-4 text-green-600" /><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>)}</div><p className="mt-5 flex items-center gap-1.5 text-xs text-slate-400"><Eye className="h-3.5 w-3.5" />Last updated {current.timestamp ? new Date(current.timestamp).toLocaleTimeString() : "just now"}</p></div>
            <div className={`${cardClass} xl:col-span-1`}><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">7 Day Forecast</p><p className="mt-1 text-sm text-slate-400">Temperature outlook</p></div><span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{forecast.length || 7} days</span></div><div className="mt-2 h-40"><ResponsiveContainer width="100%" height="100%"><LineChart data={forecast.length ? forecast : trendData} margin={{ top: 18, right: 8, left: -28, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey={forecast.length ? "day" : "time"} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis hide domain={["dataMin - 2", "dataMax + 2"]} /><Tooltip contentStyle={{ border: "none", borderRadius: 12, boxShadow: "0 4px 18px rgba(15,23,42,.12)" }} /><Line type="monotone" dataKey={forecast.length ? "high" : "temp"} stroke="#16a34a" strokeWidth={3} dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div><div className="mt-3 grid grid-cols-7 gap-1">{(forecast.length ? forecast : trendData.slice(0, 7)).map((day, index) => <div className="text-center" key={`${day.day || day.time}-${index}`}><div className="mx-auto mb-1 flex justify-center text-slate-500">{getWeatherIcon(day.weatherMain, "h-4 w-4")}</div><p className="truncate text-[10px] font-medium text-slate-400">{day.day || day.time}</p><p className="mt-1 text-xs font-bold">{day.high ?? day.temp}°</p></div>)}</div></div>
            <div className="rounded-2xl bg-green-100 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center gap-3"><div className="rounded-xl bg-green-600 p-3 text-white"><Brain className="h-6 w-6" /></div><div><p className="text-sm font-semibold text-green-800">AI Weather Insights</p><p className="text-xs text-green-700">Estate intelligence</p></div></div><p className="mt-7 text-xl font-bold leading-snug text-green-950">Conditions are favorable for field operations.</p><p className="mt-3 text-sm leading-6 text-green-800">Stable temperatures and moderate rainfall support healthy tea growth. Keep monitoring humidity in lower-elevation plots to stay ahead of fungal pressure.</p><div className="mt-6 flex items-center gap-2 border-t border-green-200 pt-4 text-sm font-semibold text-green-800"><Leaf className="h-4 w-4" />Recommendation ready</div></div>
          </section>

          <section className={cardClass}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-xl font-semibold">24 Hour Temperature Trend</h2><p className="mt-1 text-sm text-slate-400">{current.location?.name || "Estate"} · {historyData.length > 0 ? "Live historical readings" : "Estimated trend while readings build"}</p></div>
              <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">{trendData.length} readings</span>
            </div>
            <div className="mt-5 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="°" />
                  <Tooltip contentStyle={{ border: "none", borderRadius: 12, boxShadow: "0 4px 18px rgba(15,23,42,.12)" }} formatter={(value) => [`${value}°C`, "Temperature"]} />
                  <Line type="monotone" dataKey="temp" stroke="#16a34a" strokeWidth={3} dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className={`${cardClass} lg:col-span-1`}><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-semibold">Predicted Disease Risk</h2><p className="mt-1 text-sm text-slate-400">Based on current climate signals</p></div><Leaf className="h-5 w-5 text-green-600" /></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><tr><th className="pb-3 font-semibold">Disease</th><th className="pb-3 font-semibold">Risk</th><th className="pb-3 text-right font-semibold">Trend</th></tr></thead><tbody>{riskRows.map((row) => <tr key={`${row.region}-${row.disease}`} className="border-b border-slate-50 last:border-0"><td className="py-4"><p className="font-semibold text-slate-700">{row.disease}</p><p className="mt-0.5 text-xs text-slate-400">{row.region}</p></td><td className="py-4"><RiskBadge score={row.score} /></td><td className="py-4 text-right font-semibold text-slate-500">{row.score > 60 ? "↑" : "→"} {row.score}%</td></tr>)}</tbody></table></div></div>
            <div className={`${cardClass} lg:col-span-1`}><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Recommendations</h2><p className="mt-1 text-sm text-slate-400">Actions for your estate</p></div><Sprout className="h-5 w-5 text-green-600" /></div><div className="mt-5 space-y-3">{recommendations.map(([Icon, title, text]) => <div key={title} className="flex gap-3 rounded-xl border border-slate-100 p-3"><div className="h-fit rounded-lg bg-green-50 p-2 text-green-600"><Icon className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}</div><button type="button" className="mt-5 w-full rounded-xl border border-green-200 py-2.5 text-sm font-semibold text-green-700 transition duration-300 hover:bg-green-50">View All Recommendations</button></div>
            <div className={`${cardClass} lg:col-span-1`}><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Weather Alerts</h2><p className="mt-1 text-sm text-slate-400">Signals that need attention</p></div><TriangleAlert className="h-5 w-5 text-orange-500" /></div><div className="mt-5 space-y-3">{alerts.map(([Icon, title, text, color]) => <div key={title} className="flex gap-3 rounded-xl border border-slate-100 p-3"><div className={`h-fit rounded-lg p-2 ${color}`}><Icon className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}</div><button type="button" className="mt-5 w-full rounded-xl border border-green-200 py-2.5 text-sm font-semibold text-green-700 transition duration-300 hover:bg-green-50">View All Alerts</button></div>
          </section>

          <section><div className="mb-4"><h2 className="text-xl font-semibold">Weather Summary</h2><p className="mt-1 text-sm text-slate-400">A quick read on today&apos;s estate conditions</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">{summaryStats.map(([Icon, label, value, color]) => <div key={label} className={`${cardClass} flex items-center gap-4 p-5`}><div className={`rounded-xl p-3 ${color}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight">{value}</p></div></div>)}</div></section>
        </div>
      </main>
    );
  }