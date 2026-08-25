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

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-green-900">Forecasts</h1>
        <p className="text-sm text-green-600 mt-0.5">
          5-day outlook and 24h temperature trends for all regions
        </p>
      </div>

      {/* Combined 24h Trend Chart */}
      <div className="bg-white rounded-xl border border-green-100 p-5 mb-6">
        <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-1">
          Temperature Trend — 24h All Regions
        </p>
        <p className="text-xs text-green-400 mb-4">
          Showing real historical data from MongoDB
        </p>
        {combinedHistory.length === 0 ? (
          <p className="text-sm text-green-400">No historical data yet — check back in a few minutes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={combinedHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#4ade80" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
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
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {REGIONS.map(region => (
                <Line
                  key={region}
                  type="monotone"
                  dataKey={region}
                  stroke={REGION_COLORS[region]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Region Selector */}
      <div className="flex gap-2 mb-6">
        {REGIONS.map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              selectedRegion === region
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-green-700 border-green-200 hover:border-green-400"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* 5-day Forecast Cards for Selected Region */}
      <div className="bg-white rounded-xl border border-green-100 p-5 mb-6">
        <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
          5-Day Outlook — {selectedRegion}
        </p>
        {!forecasts[selectedRegion] || forecasts[selectedRegion].length === 0 ? (
          <p className="text-sm text-green-400">Loading forecast...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {forecasts[selectedRegion].map((d, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 text-center border ${
                  i === 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-green-50 border-green-100"
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${i === 0 ? "text-blue-600" : "text-green-500"}`}>
                  {d.day}
                </div>
                <div className="text-2xl my-2">{getWeatherEmoji(d.weatherMain)}</div>
                <div className={`text-sm font-semibold ${i === 0 ? "text-blue-700" : "text-green-800"}`}>
                  {d.high}°C
                </div>
                <div className="text-xs text-green-500">{d.low}°C</div>
                {d.rain > 0 && (
                  <div className="text-xs text-sky-500 mt-1">🌧 {d.rain}mm</div>
                )}
                <div className="text-xs text-green-400 mt-1 capitalize">{d.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Regions Forecast Summary Table */}
      <div className="bg-white rounded-xl border border-green-100 p-5">
        <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-4">
          All Regions — Today's Summary
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REGIONS.map(region => {
            const today = forecasts[region]?.[0];
            if (!today) return null;
            return (
              <div key={region} className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-green-800">{region}</span>
                  <span className="text-2xl">{getWeatherEmoji(today.weatherMain)}</span>
                </div>
                <div className="text-3xl font-medium text-green-700 mb-2">{today.high}°C</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-green-500">Low</div>
                    <div className="font-medium text-green-800">{today.low}°C</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-green-500">Rain</div>
                    <div className="font-medium text-green-800">{today.rain > 0 ? `${today.rain}mm` : "None"}</div>
                  </div>
                </div>
                <div className="text-xs text-green-500 mt-2 capitalize">{today.description}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}