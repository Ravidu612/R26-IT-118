import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from database import get_db
from model_store import set_model

REGIONS = ['Nuwara Eliya', 'Kandy', 'Ratnapura']

def calc_blister_blight(h, t):
    s = 0
    if h > 80: s += 50
    elif h > 65: s += 25
    if 15 <= t <= 25: s += 40
    elif 10 <= t <= 30: s += 20
    if h > 90: s += 10
    return min(s, 100)

def calc_red_spider_mite(h, t, r):
    s = 0
    if t > 30: s += 45
    elif t > 26: s += 25
    if h < 55: s += 35
    elif h < 70: s += 15
    if r < 1: s += 20
    return min(s, 100)

def calc_brown_blight(h, t, r):
    s = 0
    if 20 <= t <= 30: s += 40
    elif 18 <= t <= 32: s += 20
    if h > 75: s += 35
    elif h > 60: s += 15
    if r > 2: s += 25
    elif r > 0.5: s += 10
    return min(s, 100)

def calc_grey_blight(h, t):
    s = 0
    if 20 <= t <= 28: s += 45
    elif 16 <= t <= 32: s += 20
    if h > 80: s += 40
    elif h > 70: s += 20
    elif h > 60: s += 10
    if h > 90 and 20 <= t <= 28: s += 15
    return min(s, 100)

def calc_shot_hole_borer(h, t, r):
    s = 0
    if t > 28: s += 40
    elif t > 24: s += 20
    if h < 60: s += 35
    elif h < 70: s += 15
    if r < 0.5: s += 25
    elif r < 2: s += 10
    return min(s, 100)

def calc_algal_leaf_spot(h, t, r):
    s = 0
    if 25 <= t <= 35: s += 40
    elif 20 <= t <= 38: s += 20
    if h > 85: s += 35
    elif h > 75: s += 15
    if r > 3: s += 25
    elif r > 1: s += 10
    return min(s, 100)

def calc_avg_disease_risk(h, t, r):
    scores = [
        calc_blister_blight(h, t),
        calc_red_spider_mite(h, t, r),
        calc_brown_blight(h, t, r),
        calc_grey_blight(h, t),
        calc_shot_hole_borer(h, t, r),
        calc_algal_leaf_spot(h, t, r),
    ]
    return round(sum(scores) / len(scores), 2)

def load_region_data(region):
    db = get_db()
    collection = db['weatherreadings']
    docs = list(collection.find(
        { 'location.name': region },
        { 'temperature': 1, 'humidity': 1, 'rainfall': 1, 'timestamp': 1 }
    ).sort('timestamp', 1))
    return docs

def build_features(docs):
    rows = []
    for doc in docs:
        t = doc.get('temperature', {})
        temp = t.get('current')
        humidity = doc.get('humidity')
        rainfall = doc.get('rainfall', 0)
        timestamp = doc.get('timestamp')
        if temp is None or humidity is None or timestamp is None:
            continue
        rows.append({
            'temp': temp,
            'humidity': humidity,
            'rainfall': rainfall or 0,
            'hour': timestamp.hour,
            'disease_risk': calc_avg_disease_risk(humidity, temp, rainfall or 0),
            'timestamp': timestamp,
        })
    return pd.DataFrame(rows)

def train_all():
    print(f"[{datetime.now()}] Training models...")
    for region in REGIONS:
        try:
            docs = load_region_data(region)
            if len(docs) < 10:
                print(f"  Skipping {region} — not enough data ({len(docs)} readings)")
                continue

            df = build_features(docs)
            if len(df) < 10:
                continue

            # ── Disease Risk Model (Random Forest) ──────────────────────────
            # Features: current conditions → predict next reading's risk
            X_risk = df[['temp', 'humidity', 'rainfall', 'hour']].values[:-1]
            y_risk = df['disease_risk'].values[1:]  # next reading's risk

            scaler_risk = StandardScaler()
            X_risk_scaled = scaler_risk.fit_transform(X_risk)

            rf_model = RandomForestRegressor(n_estimators=50, random_state=42)
            rf_model.fit(X_risk_scaled, y_risk)
            set_model('disease_risk', region, rf_model, scaler_risk, datetime.now(timezone.utc))
            print(f"  ✓ Disease risk model trained for {region} ({len(df)} samples)")

            # ── Temperature Model (Linear Regression) ───────────────────────
            X_temp = df[['humidity', 'rainfall', 'hour']].values[:-1]
            y_temp = df['temp'].values[1:]  # next reading's temperature

            scaler_temp = StandardScaler()
            X_temp_scaled = scaler_temp.fit_transform(X_temp)

            lr_model = LinearRegression()
            lr_model.fit(X_temp_scaled, y_temp)
            set_model('temperature', region, lr_model, scaler_temp, datetime.now(timezone.utc))
            print(f"  ✓ Temperature model trained for {region}")

        except Exception as e:
            print(f"  ✗ Failed to train for {region}: {e}")

    print(f"[{datetime.now()}] Training complete.")