import { useState, useEffect } from "react";
import { getPredictions } from "../../../services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── Disease formulas (mirrored from diseaseRisk.js) ─────────────────────────
function calcBlisterBlightRisk(humidity, tempC) {
  let score = 0;
  if (humidity > 80) score += 50; else if (humidity > 65) score += 25;
  if (tempC >= 15 && tempC <= 25) score += 40; else if (tempC >= 10 && tempC <= 30) score += 20;
  if (humidity > 90) score += 10;
  return Math.min(score, 100);
}
function calcRedSpiderMiteRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC > 30) score += 45; else if (tempC > 26) score += 25;
  if (humidity < 55) score += 35; else if (humidity < 70) score += 15;
  if (rainfall < 1) score += 20;
  return Math.min(score, 100);
}
function calcBrownBlightRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC >= 20 && tempC <= 30) score += 40; else if (tempC >= 18 && tempC <= 32) score += 20;
  if (humidity > 75) score += 35; else if (humidity > 60) score += 15;
  if (rainfall > 2) score += 25; else if (rainfall > 0.5) score += 10;
  return Math.min(score, 100);
}
function calcGreyBlightRisk(humidity, tempC) {
  let score = 0;
  if (tempC >= 20 && tempC <= 28) score += 45; else if (tempC >= 16 && tempC <= 32) score += 20;
  if (humidity > 80) score += 40; else if (humidity > 70) score += 20; else if (humidity > 60) score += 10;
  if (humidity > 90 && tempC >= 20 && tempC <= 28) score += 15;
  return Math.min(score, 100);
}
function calcShotHoleBorerRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC > 28) score += 40; else if (tempC > 24) score += 20;
  if (humidity < 60) score += 35; else if (humidity < 70) score += 15;
  if (rainfall < 0.5) score += 25; else if (rainfall < 2) score += 10;
  return Math.min(score, 100);
}
function calcAlgalLeafSpotRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC >= 25 && tempC <= 35) score += 40; else if (tempC >= 20 && tempC <= 38) score += 20;
  if (humidity > 85) score += 35; else if (humidity > 75) score += 15;
  if (rainfall > 3) score += 25; else if (rainfall > 1) score += 10;
  return Math.min(score, 100);
}

function riskLabel(score) {
  if (score >= 65) return { label: "High", color: "red" };
  if (score >= 35) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "green" };
}

// ─── Action recommendations ───────────────────────────────────────────────────
const ACTIONS = {
  "Blister Blight": {
    High: [
      "Apply copper-based fungicide spray immediately",
      "Avoid overhead irrigation — wet leaves worsen spread",
      "Increase airflow by light pruning of canopy edges",
      "Schedule field inspection every 2 hours",
    ],
    Medium: [
      "Monitor leaf tips for white blisters",
      "Prepare fungicide as precaution",
      "Avoid fertilizing — lush growth increases susceptibility",
    ],
  },
  "Red Spider Mite": {
    High: [
      "Apply miticide (e.g. dicofol) to undersides of leaves",
      "Increase irrigation to raise humidity above 70%",
      "Avoid dusty conditions — mites thrive in dry heat",
    ],
    Medium: [
      "Inspect leaf undersides for reddish mite colonies",
      "Increase watering frequency slightly",
    ],
  },
  "Brown Blight": {
    High: [
      "Apply mancozeb or carbendazim fungicide",
      "Clear blocked drainage channels immediately",
      "Remove and destroy infected leaf litter",
    ],
    Medium: [
      "Ensure proper canopy spacing for airflow",
      "Monitor for brown lesions on young shoots",
    ],
  },
  "Grey Blight": {
    High: [
      "Apply systemic fungicide (e.g. thiophanate-methyl)",
      "Reduce canopy density through selective pruning",
      "Avoid irrigating in the evening",
    ],
    Medium: [
      "Watch for grey-brown leaf spots",
      "Ensure drainage is not waterlogged",
    ],
  },
  "Shot-hole Borer": {
    High: [
      "Inspect stems for beetle entry holes immediately",
      "Remove and burn heavily infested branches",
      "Apply trunk protection paste (lime + copper)",
    ],
    Medium: [
      "Check stems for small bore holes",
      "Avoid water stress — keep irrigation consistent",
    ],
  },
  "Algal Leaf Spot": {
    High: [
      "Apply copper oxychloride spray",
      "Improve drainage around root zone",
      "Remove heavily spotted leaves to reduce spore spread",
    ],
    Medium: [
      "Monitor for orange-red spots on older leaves",
      "Ensure good sunlight penetration through canopy",
    ],
  },
};

// ─── Disease definitions ──────────────────────────────────────────────────────
const DISEASES = [
  { name: "Blister Blight",  emoji: "🍃", color: "#ef4444", calc: (h, t, r) => calcBlisterBlightRisk(h, t) },
  { name: "Red Spider Mite", emoji: "🕷️", color: "#f97316", calc: (h, t, r) => calcRedSpiderMiteRisk(h, t, r) },
  { name: "Brown Blight",    emoji: "🟫", color: "#92400e", calc: (h, t, r) => calcBrownBlightRisk(h, t, r) },
  { name: "Grey Blight",     emoji: "🌫️", color: "#6b7280", calc: (h, t, r) => calcGreyBlightRisk(h, t) },
  { name: "Shot-hole Borer", emoji: "🪲", color: "#7c3aed", calc: (h, t, r) => calcShotHoleBorerRisk(h, t, r) },
  { name: "Algal Leaf Spot", emoji: "🔴", color: "#0ea5e9", calc: (h, t, r) => calcAlgalLeafSpotRisk(h, t, r) },
];

const ASSUMED_HUMIDITY = 75;
const ASSUMED_RAINFALL  = 0.5;

// ─── Colour helpers ───────────────────────────────────────────────────────────
const riskBorder  = { High: "border-red-300",    Medium: "border-yellow-300",    Low: "border-green-300" };
const riskText    = { High: "text-red-700",       Medium: "text-yellow-700",      Low: "text-green-700" };
const riskBadgeBg = { High: "bg-red-100 text-red-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };
const riskDot     = { High: "bg-red-500",         Medium: "bg-yellow-400",        Low: "bg-green-500" };

// ─── Charts Modal ─────────────────────────────────────────────────────────────
function ChartsModal({ predictions, onClose }) {
  const [activeTab, setActiveTab] = useState("temperature");

  const chartData = predictions.map((p) => {
    const row = {
      hour: `+${p.hour}h`,
      Temperature: parseFloat(p.temperature.toFixed(1)),
      "ML Risk %": Math.round(p.disease_risk * 100),
    };
    DISEASES.forEach((d) => {
      row[d.name] = d.calc(ASSUMED_HUMIDITY, p.temperature, ASSUMED_RAINFALL);
    });
    return row;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-green-900">📊 8-Hour Forecast Charts</h2>
            <p className="text-xs text-gray-400 mt-0.5">Predicted trends for the next 8 hours</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold transition"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 flex-wrap">
          {[
            { id: "temperature", label: "🌡️ Temperature" },
            { id: "ml",          label: "🤖 ML Risk %" },
            { id: "diseases",    label: "🦠 Disease Scores" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeTab === t.id
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-green-800 border-green-200 hover:border-green-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div className="px-6 py-5">

          {activeTab === "temperature" && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Predicted temperature (°C) over next 8 hours</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}°`} />
                  <Tooltip formatter={(v) => [`${v}°C`, "Temperature"]} />
                  <Line
                    type="monotone" dataKey="Temperature"
                    stroke="#16a34a" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#16a34a" }} activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "ml" && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Combined ML disease risk % predicted by the model</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fef9c3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => [`${v}%`, "Disease Risk"]} />
                  <Line
                    type="monotone" dataKey="ML Risk %"
                    stroke="#f59e0b" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#f59e0b" }} activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-xs text-gray-500 justify-center">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />≥70% High</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />40–69% Medium</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />&lt;40% Low</span>
              </div>
            </div>
          )}

          {activeTab === "diseases" && (
            <div>
              <p className="text-xs text-gray-500 mb-3">Per-disease risk scores (0–100) across 8 hours</p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(value) => {
                      const d = DISEASES.find((x) => x.name === value);
                      return `${d?.emoji ?? ""} ${value}`;
                    }}
                  />
                  {DISEASES.map((d) => (
                    <Line
                      key={d.name} type="monotone" dataKey={d.name}
                      stroke={d.color} strokeWidth={2}
                      dot={{ r: 3 }} activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Predictions() {
  const regions = ["Nuwara Eliya", "Kandy", "Ratnapura"];
  const [selectedRegion, setSelectedRegion] = useState("Nuwara Eliya");
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPredictions(selectedRegion);
        setData(res);
      } catch (e) {
        setError("Failed to load predictions. Is the ML service running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedRegion]);

  const predictions = data?.predictions ?? [];

  const peakHour = predictions.reduce(
    (best, p) => (p.disease_risk > best.disease_risk ? p : best),
    { hour: 0, disease_risk: 0 }
  );
  const peakPct = Math.round(peakHour.disease_risk * 100);

  const diseasePeaks = DISEASES.map((d) => {
    let peakScore = 0, peakHourIdx = 0;
    predictions.forEach((p) => {
      const score = d.calc(ASSUMED_HUMIDITY, p.temperature, ASSUMED_RAINFALL);
      if (score > peakScore) { peakScore = score; peakHourIdx = p.hour; }
    });
    return { ...d, peakScore, peakHourIdx, risk: riskLabel(peakScore) };
  });

  const alertDiseases = diseasePeaks.filter((d) => d.peakScore >= 35);

  const priorityActions = (() => {
    const actions = [], seen = new Set();
    for (const d of [...alertDiseases].sort((a, b) => b.peakScore - a.peakScore)) {
      for (const action of (ACTIONS[d.name]?.[d.risk.label] ?? [])) {
        if (!seen.has(action)) {
          seen.add(action);
          actions.push({ disease: d.name, action, risk: d.risk });
          if (actions.length === 3) return actions;
        }
      }
    }
    return actions;
  })();

  const bannerColor =
    peakPct >= 70 ? "bg-red-50 border-red-300 text-red-800"
    : peakPct >= 40 ? "bg-yellow-50 border-yellow-300 text-yellow-800"
    : "bg-green-50 border-green-300 text-green-700";
  const bannerIcon = peakPct >= 70 ? "🚨" : peakPct >= 40 ? "⚠️" : "✅";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Charts Modal */}
      {showCharts && predictions.length > 0 && (
        <ChartsModal predictions={predictions} onClose={() => setShowCharts(false)} />
      )}

      {/* ── Header + 📊 button ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-900">🔮 Disease Predictions</h1>
          <p className="text-sm text-gray-500 mt-1">
            8-hour ML forecast with per-disease action recommendations
          </p>
        </div>
        {predictions.length > 0 && (
          <button
            onClick={() => setShowCharts(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow transition-all whitespace-nowrap"
          >
            📊 View Charts
          </button>
        )}
      </div>

      {/* ── Region selector ──────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              selectedRegion === r
                ? "bg-green-700 text-white border-green-700 shadow"
                : "bg-white text-green-800 border-green-200 hover:border-green-400"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* ── Loading / Error ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-16 text-green-700 animate-pulse">
          Loading predictions for {selectedRegion}…
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
      )}

      {/* ── Action Plan ──────────────────────────────────────────────────────── */}
      {!loading && !error && predictions.length > 0 && (
        <div className="space-y-6">

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-green-100" />
            <h2 className="text-lg font-bold text-green-900 whitespace-nowrap">📋 Action Plan</h2>
            <div className="h-px flex-1 bg-green-100" />
          </div>

          {/* Peak banner */}
          <div className={`border rounded-xl px-5 py-4 flex items-start gap-3 ${bannerColor}`}>
            <span className="text-2xl leading-none">{bannerIcon}</span>
            <div>
              <p className="font-semibold text-base">
                Peak disease risk expected at +{peakHour.hour}h ({peakPct}%)
              </p>
              <p className="text-sm mt-0.5 opacity-80">
                {peakPct >= 70
                  ? "Take preventive action before this window — conditions are highly favourable for disease spread."
                  : peakPct >= 40
                  ? "Conditions are moderately risky. Stay alert and monitor field status closely."
                  : "Risk levels are low. Routine monitoring is sufficient."}
              </p>
            </div>
          </div>

          {/* Disease Risk Overview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Disease Risk Overview — Next 8 Hours
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diseasePeaks.map((d) => {
                const show = d.peakScore >= 35;
                return (
                  <div
                    key={d.name}
                    className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                      show ? riskBorder[d.risk.label] : "border-gray-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{d.emoji}</span>
                        <span className="font-semibold text-sm text-gray-800">{d.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${show ? riskBadgeBg[d.risk.label] : "bg-gray-100 text-gray-500"}`}>
                        {d.risk.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${d.peakScore >= 65 ? "bg-red-500" : d.peakScore >= 35 ? "bg-yellow-400" : "bg-green-400"}`}
                        style={{ width: `${d.peakScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Peak score: <strong>{d.peakScore}</strong>/100</span>
                      <span>at +{d.peakHourIdx}h</span>
                    </div>
                    {!show && <p className="text-xs text-gray-400 mt-2">No action needed</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Actions */}
          {alertDiseases.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Recommended Actions — {selectedRegion}
              </h3>
              <div className="space-y-4">
                {[...alertDiseases].sort((a, b) => b.peakScore - a.peakScore).map((d) => {
                  const actionList = ACTIONS[d.name]?.[d.risk.label] ?? [];
                  return (
                    <div key={d.name} className={`bg-white rounded-xl border p-5 shadow-sm ${riskBorder[d.risk.label]}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${riskDot[d.risk.label]}`} />
                        <span className="font-bold text-gray-900">{d.emoji} {d.name}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${riskBadgeBg[d.risk.label]}`}>
                          {d.risk.label} Risk · {d.peakScore}/100
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {actionList.map((action, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${d.risk.label === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {i + 1}
                            </span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center text-green-800">
              <p className="text-2xl mb-1">✅</p>
              <p className="font-semibold">All disease risks are Low for {selectedRegion}</p>
              <p className="text-sm text-green-600 mt-1">Routine monitoring is sufficient. No preventive action required.</p>
            </div>
          )}

          {/* Priority Actions */}
          {priorityActions.length > 0 && (
            <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                🏆 Top Priority Actions
              </h3>
              <div className="space-y-3">
                {priorityActions.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${i === 0 ? "bg-red-600 text-white" : i === 1 ? "bg-orange-400 text-white" : "bg-yellow-400 text-white"}`}>
                      P{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.disease} · <span className={riskText[item.risk.label]}>{item.risk.label} Risk</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* No data state */}
      {!loading && !error && predictions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌿</p>
          <p>No prediction data available for {selectedRegion}.</p>
          <p className="text-sm mt-1">Make sure the ML service is running and models are trained.</p>
        </div>
      )}
    </div>
  );
}