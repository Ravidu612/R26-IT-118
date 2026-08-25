import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from data_loader import load_region_dataframe
import model_store  # ← import the module, not individual functions

REGIONS = ['Nuwara Eliya', 'Kandy', 'Ratnapura']


def train_all():
    print(f"[{datetime.now()}] Training models...")
    for region in REGIONS:
        try:
            df = load_region_dataframe(region)
            if len(df) < 10:
                print(f"  Skipping {region} — not enough data ({len(df)} readings)")
                continue

            now = datetime.now(timezone.utc)

            # ── Disease Risk Model (Random Forest) ──────────────────────────
            # Features: [temp, humidity, rainfall, hour]
            X_risk = df[['temp', 'humidity', 'rainfall', 'hour']].values[:-1]
            y_risk = df['disease_risk'].values[1:]

            scaler_risk = StandardScaler()
            X_risk_scaled = scaler_risk.fit_transform(X_risk)

            rf_model = RandomForestRegressor(n_estimators=50, random_state=42)
            rf_model.fit(X_risk_scaled, y_risk)

            model_store.set_disease_model(region, rf_model, scaler_risk, now)
            model_store.set_samples(region, len(df))
            print(f"  ✓ Disease risk model trained for {region} ({len(df)} samples)")

            # ── Temperature Model (Linear Regression) ───────────────────────
            # Features: [humidity, rainfall, hour]
            X_temp = df[['humidity', 'rainfall', 'hour']].values[:-1]
            y_temp = df['temp'].values[1:]

            scaler_temp = StandardScaler()
            X_temp_scaled = scaler_temp.fit_transform(X_temp)

            lr_model = LinearRegression()
            lr_model.fit(X_temp_scaled, y_temp)

            model_store.set_temp_model(region, lr_model, scaler_temp, now)
            print(f"  ✓ Temperature model trained for {region}")

        except Exception as e:
            print(f"  ✗ Failed to train for {region}: {e}")

    print(f"[{datetime.now()}] Training complete.")