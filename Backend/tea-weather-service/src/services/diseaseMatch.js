// Same rule as ml-service/disease_match.py and Frontend/src/utils/diseaseRisk.js,
// driven by the same disease_profiles.json (copied to ../config/diseaseProfiles.json).
const profiles = require('../config/diseaseProfiles.json');

const { slope_per_unit: SLOPE, max_penalty_each: CAP, floor: FLOOR } = profiles.match_rule;
const outside = (x, [lo, hi]) => (x < lo ? lo - x : x > hi ? x - hi : 0);

// 0.2 - 1.0
function matchIndex(temp, humidity, name) {
  const d = profiles.diseases[name];
  const penT = Math.min(CAP, SLOPE * outside(temp, d.temp));
  const penH = Math.min(CAP, SLOPE * outside(humidity, d.humidity));
  return Math.max(FLOOR, 1 - penT - penH);
}

function levelFor(index) {
  if (index >= profiles.levels.high_at) return 'High';
  if (index >= profiles.levels.medium_at) return 'Medium';
  return 'Low';
}

module.exports = { matchIndex, levelFor, profiles };
