import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Forecasts from "./pages/Forecasts";
import DiseaseRisk from "./pages/DiseaseRisk";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Predictions from "./pages/Predictions";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-green-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecasts" element={<Forecasts />} />
          <Route path="/disease-risk" element={<DiseaseRisk />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/predictions" element={<Predictions />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}