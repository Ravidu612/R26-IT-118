import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/forecasts", label: "Forecasts" },
  { to: "/disease-risk", label: "Disease Risk" },
  { to: "/reports", label: "Reports" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-green-900 px-6 flex items-center justify-between h-14 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-green-400 rounded-tl-full rounded-br-full rounded-tr-none rounded-bl-none" />
        <span className="text-white font-medium text-sm">Tea Weather Intelligence</span>
      </div>
      <div className="flex gap-1">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-sm px-4 py-1.5 rounded-md transition-colors ${
              pathname === l.to
                ? "bg-white/20 text-white"
                : "text-green-200 hover:bg-white/10"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}