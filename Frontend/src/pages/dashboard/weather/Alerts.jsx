import { useState, useEffect } from "react";
import API from "../../../services/api";

const LEVEL_STYLE = {
  High:   { badge: "bg-red-100 text-red-700 border border-red-200",    dot: "bg-red-500",    icon: "⚠️" },
  Medium: { badge: "bg-yellow-100 text-yellow-700 border border-yellow-200", dot: "bg-yellow-400", icon: "⚡" },
};

const REGION_COLORS = {
  "Nuwara Eliya": "text-green-700 bg-green-50 border-green-200",
  "Kandy":        "text-blue-700 bg-blue-50 border-blue-200",
  "Ratnapura":    "text-amber-700 bg-amber-50 border-amber-200",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | high | medium | unread

  const fetchAlerts = () => {
    API.get('/api/alerts')
      .then(res => {
        setAlerts(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const acknowledgeOne = async (id) => {
    await API.patch(`/api/alerts/${id}/acknowledge`);
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAll = async () => {
    await API.patch('/api/alerts/acknowledge-all');
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const clearAcknowledged = async () => {
    await API.delete('/api/alerts/clear');
    setAlerts(prev => prev.filter(a => !a.acknowledged));
  };

  const filtered = alerts.filter(a => {
    if (filter === "high")   return a.level === "High";
    if (filter === "medium") return a.level === "Medium";
    if (filter === "unread") return !a.acknowledged;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.acknowledged).length;
  const highCount   = alerts.filter(a => a.level === "High").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-green-700 font-medium">Loading alerts…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-green-900">Alerts</h1>
          <p className="text-sm text-green-600 mt-0.5">
            Disease risk alerts for all tea regions
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={acknowledgeAll}
              className="text-sm px-4 py-2 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={clearAcknowledged}
            className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            Clear read
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-green-100 p-4 text-center">
          <div className="text-2xl font-medium text-green-800">{alerts.length}</div>
          <div className="text-xs text-green-500 mt-1">Total Alerts</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <div className="text-2xl font-medium text-red-700">{highCount}</div>
          <div className="text-xs text-red-400 mt-1">High Risk</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4 text-center">
          <div className="text-2xl font-medium text-yellow-700">{unreadCount}</div>
          <div className="text-xs text-yellow-500 mt-1">Unread</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all",    label: `All (${alerts.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "high",   label: `High Risk (${highCount})` },
          { key: "medium", label: `Medium (${alerts.length - highCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              filter === tab.key
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-green-700 border-green-200 hover:border-green-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-green-100 p-10 text-center">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-green-700 font-medium">No alerts in this category</p>
          <p className="text-sm text-green-400 mt-1">All conditions are within safe levels</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(alert => {
            const s = LEVEL_STYLE[alert.level] || LEVEL_STYLE.Medium;
            const regionStyle = REGION_COLORS[alert.region] || "text-green-700 bg-green-50 border-green-200";
            return (
              <div
                key={alert._id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all ${
                  alert.acknowledged ? "opacity-50 border-green-100" : "border-green-200 shadow-sm"
                }`}
              >
                {/* Dot */}
                <div className="mt-1.5 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${alert.acknowledged ? "bg-gray-300" : s.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}>
                      {s.icon} {alert.level} Risk
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${regionStyle}`}>
                      {alert.region}
                    </span>
                    <span className="text-xs text-green-500">{alert.disease}</span>
                  </div>
                  <p className="text-sm text-green-800 mb-1">{alert.message}</p>
                  <p className="text-xs text-green-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Acknowledge button */}
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeOne(alert._id)}
                    className="flex-shrink-0 text-xs text-green-600 hover:text-green-800 border border-green-200 hover:border-green-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}