export function calcBlisterBlightRisk(humidity, tempC) {
  // Blister blight thrives: humidity > 80%, temp 15–25°C
  let score = 0;
  if (humidity > 80) score += 50;
  else if (humidity > 65) score += 25;
  if (tempC >= 15 && tempC <= 25) score += 40;
  else if (tempC >= 10 && tempC <= 30) score += 20;
  if (humidity > 90) score += 10;
  return Math.min(score, 100);
}

export function calcRedSpiderMiteRisk(humidity, tempC, rainfall) {
  // Mites thrive: humidity < 60%, temp > 28°C, low rain
  let score = 0;
  if (tempC > 30) score += 45;
  else if (tempC > 26) score += 25;
  if (humidity < 55) score += 35;
  else if (humidity < 70) score += 15;
  if (rainfall < 1) score += 20;
  return Math.min(score, 100);
}

export function riskLabel(score) {
  if (score >= 65) return { label: "High", color: "red" };
  if (score >= 35) return { label: "Medium", color: "yellow" };
  return { label: "Low", color: "green" };
}