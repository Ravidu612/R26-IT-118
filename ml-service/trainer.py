"""Trains one Random Forest per disease: (temperature, humidity) -> condition match index.

Honest evaluation: train on the first 80% of hours, test on the last 20% (time-based split),
store R2 / MAE / level accuracy, then refit on all data for serving.
disease_risk (the noisy column) is NOT the target: weather explains little of it.
"""
import json
import os
from datetime import datetime, timezone

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

import model_store
from data_loader import HERE, load_training_frame, weather_range
from disease_match import DISEASES, level_for, match_index

FEATURES = ["temp", "humidity"]

# Coverage grid: the CSV only has weather from 3 regions (e.g. humidity never below 55), and a forest
# cannot extrapolate. Live weather can fall outside that, so the rule is also sampled on a grid.
# The grid is used for training only; all test metrics use real held-out hours.
GRID_TEMP = np.arange(5.0, 40.01, 0.5)
GRID_HUM = np.arange(20.0, 100.01, 1.0)


def _grid_xy(disease):
    t, h = np.meshgrid(GRID_TEMP, GRID_HUM)
    X = np.column_stack([t.ravel(), h.ravel()])
    return X, np.round(match_index(X[:, 0], X[:, 1], disease), 3)


def _forest():
    return RandomForestRegressor(n_estimators=150, min_samples_leaf=3, random_state=42, n_jobs=-1)


def train_all():
    print(f"[{datetime.now()}] Training models...")
    df = load_training_frame()
    split_at = df["timestamp"].quantile(0.8)
    report = {}

    for disease in DISEASES:
        d = df[df["disease"] == disease]
        train, test = d[d["timestamp"] <= split_at], d[d["timestamp"] > split_at]

        gX, gy = _grid_xy(disease)
        model = _forest().fit(np.vstack([train[FEATURES].values, gX]),
                              np.concatenate([train["condition_match_score"].values, gy]))
        pred = np.clip(model.predict(test[FEATURES].values), 0.2, 1.0)
        y = test["condition_match_score"].values
        metrics = {
            "r2": round(float(r2_score(y, pred)), 4),
            "mae": round(float(mean_absolute_error(y, pred)), 4),
            "level_accuracy": round(float((level_for(pred) == level_for(y)).mean()), 4),
            "origin": DISEASES[disease]["origin"],
            "train_rows": int(len(train)),
            "test_rows": int(len(test)),
        }

        # refit on everything for serving
        final = _forest().fit(np.vstack([d[FEATURES].values, gX]),
                              np.concatenate([d["condition_match_score"].values, gy]))
        model_store.set_model(disease, final, metrics)
        report[disease] = metrics
        print(f"  ok {disease}: R2={metrics['r2']} MAE={metrics['mae']} level_acc={metrics['level_accuracy']}")

    model_store.set_meta(
        trained_at=datetime.now(timezone.utc).isoformat(),
        samples=int(len(df)),
        split_at=str(split_at),
        range={"temp": [float(GRID_TEMP.min()), float(GRID_TEMP.max())],
               "humidity": [float(GRID_HUM.min()), float(GRID_HUM.max())]},
        dataset_range=weather_range(),
    )
    with open(os.path.join(HERE, "model_report.json"), "w", encoding="utf-8") as f:
        json.dump({"meta": model_store.get_meta(), "diseases": report}, f, indent=2)
    print(f"[{datetime.now()}] Training complete (report: model_report.json).")
    return report


if __name__ == "__main__":
    train_all()
