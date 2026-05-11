import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { getWeatherData, getWeatherHistory } from "../services/api";
import { DISEASES, riskLabel } from "../utils/diseaseRisk";

const REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"];

const RISK_COLOR = {
  red:    { bar: "bg-red-400",    badge: "bg-red-100 text-red-700",      text: "text-red-600" },
  yellow: { bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700", text: "text-yellow-600" },
  green:  { bar: "bg-green-500",  badge: "bg-green-100 text-green-700",   text: "text-green-600" },
};

const DISEASE_COLORS = {
  blisterBlight: "#ef4444",
  redSpiderMite: "#f59e0b",
  brownBlight:   "#8b5cf6",
  greyBlight:    "#6b7280",
  shotHoleBorer: "#f97316",
  algalLeafSpot: "#06b6d4",
};

// ─── Disease image URLs (user-provided) ──────────────────────────────────────
const DISEASE_IMAGES = {
  blisterBlight: "https://tse3.mm.bing.net/th/id/OIP.KGmvOEUOEl2bGN14JHwbdAHaFm?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  redSpiderMite: "https://tse2.mm.bing.net/th/id/OIP.FnC0G8XcUlmpnSQmzwqyfgHaFB?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  brownBlight:   "https://tse2.mm.bing.net/th/id/OIP.dXjtr9-HFQwpih6t3L6nIQHaD6?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  greyBlight:    "https://tse2.mm.bing.net/th/id/OIP.V__sKPeEpOkyxUVaK8G_WgHaCw?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  shotHoleBorer: "https://tse4.mm.bing.net/th/id/OIP.J-hNIDqig5WTqv2ZFpuxKgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  algalLeafSpot: "https://hgic.clemson.edu/wp-content/uploads/2018/03/algal-leaf-spot-on-camellia-leaves-e1521812206380.jpeg",
};

// ─── Fallback emoji per disease ───────────────────────────────────────────────
const DISEASE_EMOJI = {
  blisterBlight: "🍃",
  redSpiderMite: "🕷️",
  brownBlight:   "🟫",
  greyBlight:    "🌫️",
  shotHoleBorer: "🪲",
  algalLeafSpot: "🔴",
};

const DISEASE_FALLBACK_BG = {
  blisterBlight: "from-red-50 to-red-100",
  redSpiderMite: "from-orange-50 to-orange-100",
  brownBlight:   "from-purple-50 to-purple-100",
  greyBlight:    "from-gray-50 to-gray-100",
  shotHoleBorer: "from-amber-50 to-amber-100",
  algalLeafSpot: "from-cyan-50 to-cyan-100",
};

// ─── Disease Image with fallback ──────────────────────────────────────────────
function DiseaseImage({ diseaseKey, name }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className={`w-full h-36 rounded-t-xl bg-gradient-to-br ${DISEASE_FALLBACK_BG[diseaseKey]} flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-4xl">{DISEASE_EMOJI[diseaseKey]}</span>
          <p className="text-xs text-gray-400 mt-1">{name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-36 overflow-hidden rounded-t-xl bg-gray-100">
      <img
        src={DISEASE_IMAGES[diseaseKey]}
        alt={`${name} symptoms on tea leaves`}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
}

// ─── Risk Gauge ───────────────────────────────────────────────────────────────
function RiskGauge({ name, score }) {
  const risk = riskLabel(score);
  const c = RISK_COLOR[risk.color];
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-green-900">{name}</span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge}`}>
          {risk.label} Risk
        </span>
      </div>
      <div className="h-3 bg-green-50 rounded-full overflow-hidden mb-1">
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiseaseRisk() {
  const [readings, setReadings]             = useState({});
  const [histories, setHistories]           = useState({});
  const [loading, setLoading]               = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("Nuwara Eliya");
  const [selectedDisease, setSelectedDisease] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
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
          <p className="text-green-700 font-medium">Analysing disease risk…</p>
        </div>
      </div>
    );
  }

  // Build risk trend from history
  const riskTrend = (histories[selectedRegion] || []).map(point => {
    const fakeReading = {
      humidity: point.humidity ?? 80,
      temperature: { current: point.temp },
      rainfall: point.rainfall ?? 0,
    };
    const entry = { time: point.time };
    DISEASES.forEach(d => { entry[d.name] = d.calc(fakeReading); });
    return entry;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-green-900">Disease Risk Analysis</h1>
        <p className="text-sm text-green-600 mt-0.5">
          Real-time disease risk index for Sri Lankan tea estates — 6 diseases tracked
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
          const scores = DISEASES.map(d => ({ name: d.name, score: d.calc(r) }));
          const highest = scores.reduce((a, b) => a.score > b.score ? a : b);
          const highestRisk = riskLabel(highest.score);

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
              <div className="flex justify-between items-start mb-1">
                <div className="text-sm font-medium text-green-800">{region}</div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[highestRisk.color].badge}`}>
                  {highestRisk.label}
                </span>
              </div>
              <div className="text-xs text-green-500 mb-4">
                {r.temperature?.current}°C · {r.humidity}% humidity · {r.rainfall}mm rain
              </div>
              <div className="flex flex-col gap-2">
                {scores.map(({ name, score }) => {
                  const risk = riskLabel(score);
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-green-600">{name}</span>
                        <span className="text-xs text-green-500">{score}</span>
                      </div>
                      <div className="h-1.5 bg-green-50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${RISK_COLOR[risk.color].bar}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Analysis — 6 disease cards with images */}
      <p className="text-xs font-medium tracking-widest text-green-500 uppercase mb-3">
        Detailed Analysis — {selectedRegion}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {DISEASES.map(disease => {
          const r = readings[selectedRegion];
          const score = r ? disease.calc(r) : 0;
          const isExpanded = selectedDisease?.key === disease.key;
          const risk = riskLabel(score);

          return (
            <div
              key={disease.key}
              onClick={() => setSelectedDisease(isExpanded ? null : disease)}
              className="bg-white rounded-xl border border-green-100 overflow-hidden cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
            >
              {/* Disease photo */}
              <div className="relative">
                <DiseaseImage diseaseKey={disease.key} name={disease.name} />

                {/* Risk badge overlaid on image bottom-left */}
                <div className="absolute bottom-2 left-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow ${RISK_COLOR[risk.color].badge}`}>
                    {risk.label} Risk · {score}/100
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <RiskGauge name={disease.name} score={score} />
                <p className="text-xs text-green-600 mt-3 mb-2">{disease.description}</p>

                {/* Expandable conditions */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="text-xs font-medium text-green-700 mb-2">Risk conditions:</p>
                  <ul className="flex flex-col gap-1">
                    {disease.conditions.map(c => (
                      <li key={c} className="text-xs text-green-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-green-400 mt-2">
                  {isExpanded ? "▲ Hide conditions" : "▼ Show conditions"}
                </p>
              </div>
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
          <ResponsiveContainer width="100%" height={280}>
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
              {DISEASES.map(d => (
                <Line
                  key={d.key}
                  type="monotone"
                  dataKey={d.name}
                  stroke={DISEASE_COLORS[d.key]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="flex flex-wrap gap-4 mt-3">
          {DISEASES.map(d => (
            <div key={d.key} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ backgroundColor: DISEASE_COLORS[d.key] }} />
              <span className="text-xs text-green-500">{d.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}