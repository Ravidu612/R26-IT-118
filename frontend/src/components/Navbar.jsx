import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/forecasts", label: "Forecasts" },
  { to: "/disease-risk", label: "Disease Risk" },
  { to: "/reports", label: "Reports" },
  { to: "/alerts", label: "Alerts" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  // Poll alert count every 60 seconds
  useEffect(() => {
    const fetchCount = () => {
      API.get('/api/alerts/count')
        .then(res => setAlertCount(res.data.count))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-green-900 px-6 flex items-center justify-between h-14 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-green-400 rounded-tl-full rounded-br-full rounded-tr-none rounded-bl-none" />
        <span className="text-white font-medium text-sm">Tea Weather Intelligence</span>
      </div>
      <div className="flex gap-1 items-center">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`relative text-sm px-4 py-1.5 rounded-md transition-colors ${
              pathname === l.to
                ? "bg-white/20 text-white"
                : "text-green-200 hover:bg-white/10"
            }`}
          >
            {l.label}
            {/* Badge — only on Alerts link */}
            {l.to === "/alerts" && alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}