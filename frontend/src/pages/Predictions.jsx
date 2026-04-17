import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getPredictions } from "../services/api";

const REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"];

export default function Predictions() {
  const [region, setRegion] = useState("Nuwara Eliya");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPredictions = async (r) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPredictions(r);
      setData(result);
    } catch (e) {
      setError(e.response?.data?.message || "ML service unavailable. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPredictions(region); }, [region]);

  const chartData = data?.predictions?.map((p) => ({
    name: `+${p.hour}h`,
    "Disease Risk (%)": parseFloat((p.disease_risk * 100).toFixed(1)),
    "Temperature (°C)": p.temperature,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-900">ML Predictions</h1>
          <p className="text-gray-500 text-sm mt-1">
            8-hour forecast · Random Forest + Linear Regression
          </p>
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-white text-green-900 border border-green-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600 font-medium"
        >
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Model info */}
      {data?.model_info && (
        <div className="bg-white rounded-xl border border-green-100 p-4 flex flex-wrap gap-6 text-sm shadow-sm">
          <div>
            <span className="text-gray-400">Region </span>
            <span className="text-green-800 font-semibold">{data.region}</span>
          </div>
          <div>
            <span className="text-gray-400">Samples used </span>
            <span className="text-green-700 font-bold">{data.model_info.samples}</span>
          </div>
          <div>
            <span className="text-gray-400">Disease model trained </span>
            <span className="text-gray-700 font-mono text-xs">
              {new Date(data.model_info.disease_trained_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Temp model trained </span>
            <span className="text-gray-700 font-mono text-xs">
              {new Date(data.model_info.temp_trained_at).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 text-gray-400">Loading predictions...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && chartData && (
        <>
          {/* Disease Risk Chart */}
          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h2 className="text-green-900 font-semibold mb-4">Disease Risk Forecast — next 8 hours</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Disease Risk (%)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Temperature Chart */}
          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h2 className="text-green-900 font-semibold mb-4">Temperature Forecast — next 8 hours</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Temperature (°C)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: "#16a34a", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly table */}
          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h2 className="text-green-900 font-semibold mb-4">Hourly Breakdown</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2">Hour</th>
                  <th className="text-left pb-2">Disease Risk</th>
                  <th className="text-left pb-2">Temperature</th>
                  <th className="text-left pb-2">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {data.predictions.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-green-50/50">
                    <td className="py-2 text-gray-700 font-mono">+{p.hour}h</td>
                    <td className={`py-2 font-mono font-semibold ${
                      p.disease_risk >= 0.7 ? "text-red-500" :
                      p.disease_risk >= 0.4 ? "text-yellow-500" : "text-green-600"
                    }`}>
                      {(p.disease_risk * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 text-gray-700">{p.temperature.toFixed(1)}°C</td>
                    <td className="py-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        p.disease_risk >= 0.7 ? "bg-red-100 text-red-600" :
                        p.disease_risk >= 0.4 ? "bg-yellow-100 text-yellow-600" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {p.disease_risk >= 0.7 ? "HIGH" : p.disease_risk >= 0.4 ? "MEDIUM" : "LOW"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}