"""Builds data/weather_readings_extended.csv: all 6 diseases x all 3 regions.

- Original rows (3 region/disease pairs) are kept untouched and marked source=original.
- The other 15 pairs reuse the SAME hourly weather of each region and are marked source=extended.
  condition_match_score = the recovered rule (exact). disease_risk is SYNTHETIC for these rows
  (the original generator is unknown); it follows the original's level/spread:
  roughly 8.5 + 5.8*match + noise, so it correlates weakly with weather, like the original.
Run:  python build_dataset.py [path/to/weather_readings_with_disease.csv]
"""
import os
import sys
import numpy as np
import pandas as pd
from disease_match import DISEASES, PROFILES, match_index

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "data", "weather_readings_with_disease.csv")
OUT = os.path.join(HERE, "data", "weather_readings_extended.csv")
CUTS = PROFILES["risk_category_cuts"]


def base_name(s):
    return s.replace(" (dormant/low risk)", "")


def category(risk):
    return np.where(risk <= CUTS["low_max"], "Low", np.where(risk >= CUTS["high_min"], "High", "Moderate"))


def main():
    rng = np.random.default_rng(42)
    orig = pd.read_csv(SRC)
    orig["disease"] = orig["disease_name"].map(base_name)
    orig["source"] = "original"

    weather = orig[["timestamp", "location_name", "temperature_current", "humidity", "rainfall"]].drop_duplicates(
        ["timestamp", "location_name"])
    have = set(zip(orig["location_name"], orig["disease"]))

    parts = [orig]
    for region in weather["location_name"].unique():
        w = weather[weather["location_name"] == region]
        for name, d in DISEASES.items():
            if (region, name) in have:
                continue
            m = np.round(match_index(w["temperature_current"].values, w["humidity"].values, name), 3)
            risk = np.clip(np.round(8.5 + 5.8 * m + rng.normal(0, 3.4, len(w)), 2), 0.5, 30.0)
            cat = category(risk)
            ext = w.copy()
            ext["disease_risk"] = risk
            ext["disease"] = name
            ext["disease_name"] = np.where(cat == "Low", name + " (dormant/low risk)", name)
            ext["pathogen"] = d["pathogen"]
            ext["condition_match_score"] = m
            ext["risk_category"] = cat
            ext["source"] = "extended"
            parts.append(ext)

    out = pd.concat(parts, ignore_index=True)
    out = out.sort_values(["timestamp", "location_name", "disease"]).reset_index(drop=True)
    cols = ["timestamp", "location_name", "temperature_current", "humidity", "rainfall", "disease", "disease_name",
            "pathogen", "disease_risk", "condition_match_score", "risk_category", "source"]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out[cols].to_csv(OUT, index=False)
    print(f"wrote {OUT}: {len(out)} rows")
    print(out.groupby(["location_name", "disease", "source"]).size().unstack("source").fillna(0).astype(int))


if __name__ == "__main__":
    main()
