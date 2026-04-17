const Alert = require('../models/Alert');

// Must match keys in diseaseRisk.js DISEASES array
const DISEASE_THRESHOLDS = [
  { key: 'blisterBlight',  name: 'Blister Blight',   highAt: 65, mediumAt: 35 },
  { key: 'redSpiderMite',  name: 'Red Spider Mite',   highAt: 65, mediumAt: 35 },
  { key: 'brownBlight',    name: 'Brown Blight',      highAt: 65, mediumAt: 35 },
  { key: 'greyBlight',     name: 'Grey Blight',       highAt: 65, mediumAt: 35 },
  { key: 'shotHoleBorer',  name: 'Shot-hole Borer',   highAt: 65, mediumAt: 35 },
  { key: 'algalLeafSpot',  name: 'Algal Leaf Spot',   highAt: 65, mediumAt: 35 },
];

function calcScores(reading) {
  const h = reading.humidity;
  const t = reading.temperature?.current;
  const r = reading.rainfall;

  // Inline score calculations (mirrors diseaseRisk.js)
  const scores = {};

  // Blister Blight
  let s = 0;
  if (h > 80) s += 50; else if (h > 65) s += 25;
  if (t >= 15 && t <= 25) s += 40; else if (t >= 10 && t <= 30) s += 20;
  if (h > 90) s += 10;
  scores.blisterBlight = Math.min(s, 100);

  // Red Spider Mite
  s = 0;
  if (t > 30) s += 45; else if (t > 26) s += 25;
  if (h < 55) s += 35; else if (h < 70) s += 15;
  if (r < 1) s += 20;
  scores.redSpiderMite = Math.min(s, 100);

  // Brown Blight
  s = 0;
  if (t >= 20 && t <= 30) s += 40; else if (t >= 18 && t <= 32) s += 20;
  if (h > 75) s += 35; else if (h > 60) s += 15;
  if (r > 2) s += 25; else if (r > 0.5) s += 10;
  scores.brownBlight = Math.min(s, 100);

  // Grey Blight
  s = 0;
  if (t >= 20 && t <= 28) s += 45; else if (t >= 16 && t <= 32) s += 20;
  if (h > 80) s += 40; else if (h > 70) s += 20; else if (h > 60) s += 10;
  if (h > 90 && t >= 20 && t <= 28) s += 15;
  scores.greyBlight = Math.min(s, 100);

  // Shot-hole Borer
  s = 0;
  if (t > 28) s += 40; else if (t > 24) s += 20;
  if (h < 60) s += 35; else if (h < 70) s += 15;
  if (r < 0.5) s += 25; else if (r < 2) s += 10;
  scores.shotHoleBorer = Math.min(s, 100);

  // Algal Leaf Spot
  s = 0;
  if (t >= 25 && t <= 35) s += 40; else if (t >= 20 && t <= 38) s += 20;
  if (h > 85) s += 35; else if (h > 75) s += 15;
  if (r > 3) s += 25; else if (r > 1) s += 10;
  scores.algalLeafSpot = Math.min(s, 100);

  return scores;
}

const checkAndCreateAlerts = async (reading) => {
  const region = reading.location?.name;
  if (!region) return;

  const scores = calcScores(reading);

  for (const disease of DISEASE_THRESHOLDS) {
    const score = scores[disease.key];
    let level = null;

    if (score >= disease.highAt) level = 'High';
    else if (score >= disease.mediumAt) level = 'Medium';

    if (!level) continue;

    // Avoid duplicate alerts — check if same alert exists in last 30 min
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existing = await Alert.findOne({
      region,
      disease: disease.name,
      level,
      timestamp: { $gte: thirtyMinAgo },
    });

    if (existing) continue; // skip duplicate

    const message = level === 'High'
      ? `⚠️ High ${disease.name} risk detected in ${region} (score: ${score}/100). Immediate action recommended.`
      : `⚡ Medium ${disease.name} risk in ${region} (score: ${score}/100). Monitor conditions closely.`;

    await Alert.create({ region, disease: disease.name, score, level, message });
    console.log(`Alert created: [${level}] ${disease.name} in ${region}`);
  }
};

module.exports = { checkAndCreateAlerts };