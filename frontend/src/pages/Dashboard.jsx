import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { getWeatherData } from "../services/api";
import { calcBlisterBlightRisk, calcRedSpiderMiteRisk, riskLabel } from "../utils/diseaseRisk";

const FORECAST_MOCK = [
  { day: "Today", icon: "⛅", high: 19, low: 13, rain: 4.2 },
  { day: "Fri",   icon: "🌦", high: 17, low: 12, rain: 6.1 },
  { day: "Sat",   icon: "🌧", high: 16, low: 11, rain: 11 },
  { day: "Sun",   icon: "🌥", high: 18, low: 12, rain: 2.0 },
  { day: "Mon",   icon: "⛅", high: 20, low: 13, rain: 1.2 },
  { day: "Tue",   icon: "☀️", high: 22, low: 14, rain: 0 },
  { day: "Wed",   icon: "🌤", high: 21, low: 13, rain: 0.5 },
];

const RISK_COLOR = {
  red:    { bar: "bg-red-400",    badge: "bg-red-100 text-red-800" },
  yellow: { bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-800" },
  green:  { bar: "bg-green-500",  badge: "bg-green-100 text-green-800" },
};

function DiseaseGauge({ name, score }) {
  const risk = riskLabel(score);
  const c = RISK_COLOR[risk.color];
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm font-medium text-green-900">{name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${c.badge}`}>
          {risk.label}
        </span>
      </div>
      <div className="h-2 bg-green-50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(0);

  useEffect(() => {
    getWeatherData()
      .then((res) => {
        // Get latest reading per region (last 3 unique locations)
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

  // Build a fake 24h trend from today's temp ± noise (replace with real history later)
  const trendData = readings[selectedRegion]
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-green-900">Sri Lanka Tea Estate Monitor</h1>
        <p className="text-sm text-green-600 mt-0.5">
          Live conditions · Updated {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Live Weather Cards */}
      <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-3">
        Live Conditions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {readings.map((r, i) => (
          <button
            key={i}
            onClick={() => setSelectedRegion(i)}
            className={`text-left bg-white rounded-xl border p-4 transition-all ${
              selectedRegion === i
                ? "border-green-500 shadow-md shadow-green-100"
                : "border-green-100 hover:border-green-300"
            }`}
          >
            <div className="text-sm font-medium text-green-800">{r.location?.name}</div>
            <div className="text-xs text-green-500 mb-3">
              {new Date(r.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-3xl font-medium text-green-700 mb-3">
              {r.temperature?.current}°C
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Humidity", `${r.humidity}%`],
                ["Rainfall", `${r.rainfall}mm`],
                ["Wind", `${r.windSpeed} m/s`],
                ["Feels like", `${r.temperature?.feelsLike ?? "—"}°C`],
              ].map(([label, val]) => (
                <div key={label} className="bg-green-50 rounded-lg p-2">
                  <div className="text-xs text-green-500">{label}</div>
                  <div className="text-sm font-medium text-green-800 mt-0.5">{val}</div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Disease Risk + Trend Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Disease Risk */}
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
            Disease Risk Index
          </p>
          <div className="flex flex-col gap-5">
            {readings.map((r) => {
              const bb = calcBlisterBlightRisk(r.humidity, r.temperature?.current);
              const rsm = calcRedSpiderMiteRisk(r.humidity, r.temperature?.current, r.rainfall);
              return (
                <div key={r.location?.name} className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-green-700 border-b border-green-50 pb-1">
                    {r.location?.name}
                  </p>
                  <DiseaseGauge name="Blister Blight" score={bb} />
                  <DiseaseGauge name="Red Spider Mite" score={rsm} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Temp Trend Chart */}
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-1">
            Temperature Trend — 24h
          </p>
          <p className="text-sm text-green-700 font-medium mb-4">
            {readings[selectedRegion]?.location?.name}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#4ade80" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#4ade80" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "0.5px solid #bbf7d0",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3, fill: "#16a34a" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-green-400 mt-2">
            Click a region card above to switch the chart
          </p>
        </div>
      </div>

      {/* 7-day Forecast */}
      <div className="bg-white rounded-xl border border-green-100 p-5">
        <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
          7-Day Outlook — {readings[selectedRegion]?.location?.name}
        </p>
        <div className="grid grid-cols-7 gap-2">
          {FORECAST_MOCK.map((d, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-center border ${
                i === 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-100"
              }`}
            >
              <div className={`text-xs font-medium ${i === 0 ? "text-blue-600" : "text-green-500"}`}>
                {d.day}
              </div>
              <div className="text-xl my-1.5">{d.icon}</div>
              <div className={`text-sm font-medium ${i === 0 ? "text-blue-700" : "text-green-800"}`}>
                {d.high}°
              </div>
              <div className="text-xs text-green-500">{d.low}°</div>
              {d.rain > 0 && (
                <div className="text-xs text-sky-500 mt-1">{d.rain}mm</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}