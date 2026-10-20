// Disease index for the dashboard. Uses the SAME windows and rule as the ML dataset and models
// (diseaseProfiles.json is a copy of ml-service/disease_profiles.json).
import profiles from "./diseaseProfiles.json";

const { slope_per_unit: SLOPE, max_penalty_each: CAP, floor: FLOOR } = profiles.match_rule;

const outside = (x, [lo, hi]) => (x < lo ? lo - x : x > hi ? x - hi : 0);

// 0.2 - 1.0, identical to ml-service/disease_match.py
export function matchIndex(temp, humidity, diseaseName) {
  const d = profiles.diseases[diseaseName];
  const penT = Math.min(CAP, SLOPE * outside(temp, d.temp));
  const penH = Math.min(CAP, SLOPE * outside(humidity, d.humidity));
  return Math.max(FLOOR, 1 - penT - penH);
}

// Score on a 0-100 scale for the UI bars
export const scoreFor = (temp, humidity, diseaseName) =>
  Math.round(matchIndex(temp, humidity, diseaseName) * 100);

// Same cut-offs as the ML service and the alerts (profiles.levels)
export function riskLabel(score) {
  const { high_at, medium_at } = profiles.levels;
  if (score >= high_at * 100) return { label: "High", color: "red" };
  if (score >= medium_at * 100) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "green" };
}

// Same shape the pages already use: calc(reading) -> 0-100
export const DISEASES = Object.entries(profiles.diseases).map(([name, d]) => ({
  key: d.key,
  name,
  calc: (r) => scoreFor(r.temperature?.current, r.humidity, name),
  description: d.description,
  // A list of strings (the pages call conditions.map)
  conditions: [
    `Temperature ${d.temp[0]}–${d.temp[1]} °C`,
    `Humidity ${d.humidity[0]}–${d.humidity[1]} %`,
    "Risk drops the further the weather is outside these ranges",
  ],
  origin: d.origin,
}));

export const DISEASE_PROFILES = profiles;

// ─── Backward-compatible functions (old pages such as Dashboard.jsx / Reports.jsx import these) ───
// Same argument order as before: (humidity, tempC[, rainfall]). They now use the shared rule, so every
// page agrees with the ML models and the alerts. Rainfall is accepted but not used by the rule.
export const calcBlisterBlightRisk = (humidity, tempC) => scoreFor(tempC, humidity, "Blister Blight");
export const calcRedSpiderMiteRisk = (humidity, tempC) => scoreFor(tempC, humidity, "Red Spider Mite");
export const calcBrownBlightRisk   = (humidity, tempC) => scoreFor(tempC, humidity, "Brown Blight");
export const calcGreyBlightRisk    = (humidity, tempC) => scoreFor(tempC, humidity, "Grey Blight");
export const calcShotHoleBorerRisk = (humidity, tempC) => scoreFor(tempC, humidity, "Shot-hole Borer");
export const calcAlgalLeafSpotRisk = (humidity, tempC) => scoreFor(tempC, humidity, "Algal Leaf Spot");