"""Single source of truth for the disease match rule (Python side).

The Node backend (diseaseMatch.js) and the React util (diseaseRisk.js) implement the same
rule from the same disease_profiles.json, so dataset, model, alerts and UI all agree.
"""
import json
import os
import numpy as np

_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "disease_profiles.json")
with open(_PATH, encoding="utf-8") as f:
    PROFILES = json.load(f)

RULE = PROFILES["match_rule"]
LEVELS = PROFILES["levels"]
DISEASES = PROFILES["diseases"]


def _outside(x, lo, hi):
    x = np.asarray(x, dtype=float)
    return np.where(x < lo, lo - x, np.where(x > hi, x - hi, 0.0))


def match_index(temp, humidity, disease):
    """0.2 - 1.0: how well the weather matches the disease's favourable window."""
    d = DISEASES[disease]
    pen_t = np.minimum(RULE["max_penalty_each"], RULE["slope_per_unit"] * _outside(temp, *d["temp"]))
    pen_h = np.minimum(RULE["max_penalty_each"], RULE["slope_per_unit"] * _outside(humidity, *d["humidity"]))
    return np.maximum(RULE["floor"], 1.0 - pen_t - pen_h)


def level_for(index):
    index = np.asarray(index, dtype=float)
    return np.where(index >= LEVELS["high_at"], "High",
                    np.where(index >= LEVELS["medium_at"], "Medium", "Low"))
