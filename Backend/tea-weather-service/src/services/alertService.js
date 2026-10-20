const Alert = require('../models/Alert');
const { matchIndex, levelFor, profiles } = require('./diseaseMatch');

const checkAndCreateAlerts = async (reading) => {
  const region = reading.location?.name;
  const temp = reading.temperature?.current;
  if (!region || typeof temp !== 'number' || typeof reading.humidity !== 'number') return;

  // Avoid duplicate alerts: same alert in the last 30 min
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  for (const name of Object.keys(profiles.diseases)) {
    const index = matchIndex(temp, reading.humidity, name);
    const level = levelFor(index);
    if (level === 'Low') continue; // no alert for Low

    const score = Math.round(index * 100);
    const existing = await Alert.findOne({ region, disease: name, level, timestamp: { $gte: thirtyMinAgo } });
    if (existing) continue;

    const message = level === 'High'
      ? `High ${name} risk in ${region} (index ${score}/100): weather is inside the favourable window. Immediate action recommended.`
      : `Medium ${name} risk in ${region} (index ${score}/100). Monitor conditions closely.`;

    await Alert.create({ region, disease: name, score, level, message });
    console.log(`Alert created: [${level}] ${name} in ${region}`);
  }
};

module.exports = { checkAndCreateAlerts };
