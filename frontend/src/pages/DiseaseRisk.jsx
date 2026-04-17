import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { getWeatherData, getWeatherHistory } from "../services/api";
import {
  calcBlisterBlightRisk,
  calcRedSpiderMiteRisk,
  riskLabel,
} from "../utils/diseaseRisk";

const REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"];

const RISK_COLOR = {
  red:    { bar: "bg-red-400",    badge: "bg-red-100 text-red-700",    text: "text-red-600" },
  yellow: { bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700", text: "text-yellow-600" },
  green:  { bar: "bg-green-500",  badge: "bg-green-100 text-green-700",  text: "text-green-600" },
};

const RISK_INFO = {
  "Blister Blight": {
    description: "Fungal disease favored by high humidity (>80%) and cool temperatures (15–25°C). Common in high-altitude estates.",
    conditions: ["Humidity > 80%", "Temperature 15–25°C", "Misty / cloudy weather"],
  },
  "Red Spider Mite": {
    description: "Pest thriving in hot, dry conditions. Damages tea leaves by sucking cell sap, causing bronzing.",
    conditions: ["Temperature > 28°C", "Humidity < 60%", "Low or no rainfall"],
  },
};

function RiskGauge({ name, score }) {
  const risk = riskLabel(score);
  const c = RISK_COLOR[risk.color];
  return (
    <div className="bg-white rounded-xl border border-green-100 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-green-900">{name}</span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge}`}>
          {risk.label} Risk
        </span>
      </div>
      <div className="h-3 bg-green-50 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-green-400">
        <span>0</span>
        <span className={`font-medium ${c.text}`}>{score}/100</span>
        <span>100</span>
      </div>
    </div>
  );
}

export default function DiseaseRisk() {
  const [readings, setReadings] = useState({});
  const [histories, setHistories] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("Nuwara Eliya");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch latest readings
        const wRes = await getWeatherData();
        const data = wRes.data.data;
        const regionMap = {};
        data.forEach(r => {
          const name = r.location?.name;
          if (name && !regionMap[name]) regionMap[name] = r;
        });
        setReadings(regionMap);

        // Fetch 24h history for all regions
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
          <p className="text-green-700 font-medium">Analysing disease risk…</p>
        </div>
      </div>
    );
  }

  // Build risk trend from history for selected region
  const riskTrend = (histories[selectedRegion] || []).map(point => ({
    time: point.time,
    "Blister Blight": calcBlisterBlightRisk(point.humidity ?? 80, point.temp),
    "Red Spider Mite": calcRedSpiderMiteRisk(point.humidity ?? 80, point.temp, point.rainfall ?? 0),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-green-900">Disease Risk Analysis</h1>
        <p className="text-sm text-green-600 mt-0.5">
          Real-time disease risk index for Sri Lankan tea estates
        </p>
      </div>

      {/* All Regions Overview */}
      <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-3">
        Current Risk — All Regions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {REGIONS.map(region => {
          const r = readings[region];
          if (!r) return null;
          const bb  = calcBlisterBlightRisk(r.humidity, r.temperature?.current);
          const rsm = calcRedSpiderMiteRisk(r.humidity, r.temperature?.current, r.rainfall);
          const bbRisk  = riskLabel(bb);
          const rsmRisk = riskLabel(rsm);
          return (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`text-left bg-white rounded-xl border p-5 transition-all ${
                selectedRegion === region
                  ? "border-green-500 shadow-md shadow-green-100"
                  : "border-green-100 hover:border-green-300"
              }`}
            >
              <div className="text-sm font-medium text-green-800 mb-1">{region}</div>
              <div className="text-xs text-green-500 mb-4">
                {r.temperature?.current}°C · {r.humidity}% humidity · {r.rainfall}mm rain
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600">Blister Blight</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[bbRisk.color].badge}`}>
                    {bbRisk.label}
                  </span>
                </div>
                <div className="h-1.5 bg-green-50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${RISK_COLOR[bbRisk.color].bar}`} style={{ width: `${bb}%` }} />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-green-600">Red Spider Mite</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[rsmRisk.color].badge}`}>
                    {rsmRisk.label}
                  </span>
                </div>
                <div className="h-1.5 bg-green-50 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${RISK_COLOR[rsmRisk.color].bar}`} style={{ width: `${rsm}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed View for Selected Region */}
      <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-3">
        Detailed Analysis — {selectedRegion}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(RISK_INFO).map(([disease, info]) => {
          const r = readings[selectedRegion];
          const score = disease === "Blister Blight"
            ? calcBlisterBlightRisk(r?.humidity, r?.temperature?.current)
            : calcRedSpiderMiteRisk(r?.humidity, r?.temperature?.current, r?.rainfall);
          return (
            <div key={disease} className="bg-white rounded-xl border border-green-100 p-5">
              <RiskGauge name={disease} score={score} />
              <p className="text-xs text-green-600 mt-4 mb-3">{info.description}</p>
              <p className="text-xs font-medium text-green-700 mb-2">Risk conditions:</p>
              <ul className="flex flex-col gap-1">
                {info.conditions.map(c => (
                  <li key={c} className="text-xs text-green-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-white rounded-xl border border-green-100 p-5">
        <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-1">
          Risk Trend — 24h · {selectedRegion}
        </p>
        <p className="text-xs text-green-400 mb-4">
          Calculated from real historical weather data
        </p>
        {riskTrend.length === 0 ? (
          <p className="text-sm text-green-400">No historical data yet — check back in a few minutes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={riskTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#4ade80" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
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
                dataKey="Blister Blight"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Red Spider Mite"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-red-400 rounded" />
            <span className="text-xs text-green-500">Blister Blight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-yellow-400 rounded" />
            <span className="text-xs text-green-500">Red Spider Mite</span>
          </div>
        </div>
      </div>

    </div>
  );
}