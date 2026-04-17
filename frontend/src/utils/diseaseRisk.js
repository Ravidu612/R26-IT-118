// ─── EXISTING DISEASES ───────────────────────────────────────────────────────

export function calcBlisterBlightRisk(humidity, tempC) {
  let score = 0;
  if (humidity > 80) score += 50;
  else if (humidity > 65) score += 25;
  if (tempC >= 15 && tempC <= 25) score += 40;
  else if (tempC >= 10 && tempC <= 30) score += 20;
  if (humidity > 90) score += 10;
  return Math.min(score, 100);
}

export function calcRedSpiderMiteRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC > 30) score += 45;
  else if (tempC > 26) score += 25;
  if (humidity < 55) score += 35;
  else if (humidity < 70) score += 15;
  if (rainfall < 1) score += 20;
  return Math.min(score, 100);
}

// ─── NEW DISEASES ─────────────────────────────────────────────────────────────

export function calcBrownBlightRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC >= 20 && tempC <= 30) score += 40;
  else if (tempC >= 18 && tempC <= 32) score += 20;
  if (humidity > 75) score += 35;
  else if (humidity > 60) score += 15;
  if (rainfall > 2) score += 25;
  else if (rainfall > 0.5) score += 10;
  return Math.min(score, 100);
}

export function calcGreyBlightRisk(humidity, tempC) {
  let score = 0;
  if (tempC >= 20 && tempC <= 28) score += 45;
  else if (tempC >= 16 && tempC <= 32) score += 20;
  if (humidity > 80) score += 40;
  else if (humidity > 70) score += 20;
  else if (humidity > 60) score += 10;
  if (humidity > 90 && tempC >= 20 && tempC <= 28) score += 15;
  return Math.min(score, 100);
}

export function calcShotHoleBorerRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC > 28) score += 40;
  else if (tempC > 24) score += 20;
  if (humidity < 60) score += 35;
  else if (humidity < 70) score += 15;
  if (rainfall < 0.5) score += 25;
  else if (rainfall < 2) score += 10;
  return Math.min(score, 100);
}

export function calcAlgalLeafSpotRisk(humidity, tempC, rainfall) {
  let score = 0;
  if (tempC >= 25 && tempC <= 35) score += 40;
  else if (tempC >= 20 && tempC <= 38) score += 20;
  if (humidity > 85) score += 35;
  else if (humidity > 75) score += 15;
  if (rainfall > 3) score += 25;
  else if (rainfall > 1) score += 10;
  return Math.min(score, 100);
}

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

export function riskLabel(score) {
  if (score >= 65) return { label: "High", color: "red" };
  if (score >= 35) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "green" };
}

export const DISEASES = [
  {
    key: "blisterBlight",
    name: "Blister Blight",
    calc: (r) => calcBlisterBlightRisk(r.humidity, r.temperature?.current),
    description: "Fungal disease favored by high humidity and cool temps. Common in high-altitude estates.",
    conditions: ["Humidity > 80%", "Temperature 15–25°C", "Misty / cloudy weather"],
  },
  {
    key: "redSpiderMite",
    name: "Red Spider Mite",
    calc: (r) => calcRedSpiderMiteRisk(r.humidity, r.temperature?.current, r.rainfall),
    description: "Pest thriving in hot, dry conditions. Damages leaves by sucking cell sap.",
    conditions: ["Temperature > 28°C", "Humidity < 60%", "Low or no rainfall"],
  },
  {
    key: "brownBlight",
    name: "Brown Blight",
    calc: (r) => calcBrownBlightRisk(r.humidity, r.temperature?.current, r.rainfall),
    description: "Fungal infection causing brown lesions on leaves. Spreads rapidly in warm wet weather.",
    conditions: ["Temperature 20–30°C", "Humidity > 75%", "Rainfall > 2mm"],
  },
  {
    key: "greyBlight",
    name: "Grey Blight",
    calc: (r) => calcGreyBlightRisk(r.humidity, r.temperature?.current),
    description: "Leaf blight causing grey-brown spots. Common during prolonged humid periods.",
    conditions: ["Temperature 20–28°C", "Humidity > 70%", "Overcast conditions"],
  },
  {
    key: "shotHoleBorer",
    name: "Shot-hole Borer",
    calc: (r) => calcShotHoleBorerRisk(r.humidity, r.temperature?.current, r.rainfall),
    description: "Bark beetle that bores into stressed tea stems. Worsens during dry spells.",
    conditions: ["Temperature > 25°C", "Humidity < 70%", "Low rainfall"],
  },
  {
    key: "algalLeafSpot",
    name: "Algal Leaf Spot",
    calc: (r) => calcAlgalLeafSpotRisk(r.humidity, r.temperature?.current, r.rainfall),
    description: "Algal growth on leaves causing orange-red spots. Thrives in warm wet lowlands.",
    conditions: ["Temperature 25–35°C", "Humidity > 85%", "High rainfall"],
  },
];