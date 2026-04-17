from flask import Blueprint, jsonify
from datetime import datetime, timezone
import numpy as np
from database import get_db
from model_store import get_model, is_trained

predict_bp = Blueprint('predict', __name__)

REGIONS = ['Nuwara Eliya', 'Kandy', 'Ratnapura']

def get_latest_reading(region):
    db = get_db()
    return db['weatherreadings'].find_one(
        { 'location.name': region },
        sort=[('timestamp', -1)]
    )

@predict_bp.route('/<region>', methods=['GET'])
def predict_region(region):
    region = region.replace('-', ' ').title()
    if region not in REGIONS:
        return jsonify({ 'error': 'Region not found' }), 404

    if not is_trained('disease_risk', region) or not is_trained('temperature', region):
        return jsonify({
            'success': False,
            'message': 'Models not yet trained — please wait a moment and retry',
            'trained': False
        }), 202

    reading = get_latest_reading(region)
    if not reading:
        return jsonify({ 'error': 'No data found for region' }), 404

    temp    = reading['temperature']['current']
    humidity = reading['humidity']
    rainfall = reading.get('rainfall', 0) or 0
    hour     = reading['timestamp'].hour

    # ── Disease Risk Prediction ──────────────────────────────────────────────
    risk_entry  = get_model('disease_risk', region)
    risk_model  = risk_entry['model']
    risk_scaler = risk_entry['scaler']

    # Predict for next 8 time steps (~40 min intervals = ~5 hours ahead)
    risk_predictions = []
    current = [temp, humidity, rainfall, hour]
    for i in range(8):
        X = risk_scaler.transform([current])
        pred_risk = float(np.clip(risk_model.predict(X)[0], 0, 100))
        future_hour = (hour + i) % 24
        risk_predictions.append({
            'hoursAhead': i + 1,
            'label': f'+{i+1}h',
            'predictedRisk': round(pred_risk, 1),
        })
        current[3] = (hour + i + 1) % 24

    # ── Temperature Prediction ───────────────────────────────────────────────
    temp_entry  = get_model('temperature', region)
    temp_model  = temp_entry['model']
    temp_scaler = temp_entry['scaler']

    temp_predictions = []
    current_h = humidity
    current_r = rainfall
    current_hour = hour
    for i in range(8):
        X = temp_scaler.transform([[current_h, current_r, current_hour]])
        pred_temp = float(temp_model.predict(X)[0])
        temp_predictions.append({
            'hoursAhead': i + 1,
            'label': f'+{i+1}h',
            'predictedTemp': round(pred_temp, 1),
        })
        current_hour = (current_hour + 1) % 24

    return jsonify({
        'success': True,
        'region': region,
        'basedOn': {
            'temp': temp,
            'humidity': humidity,
            'rainfall': rainfall,
            'timestamp': reading['timestamp'].isoformat(),
        },
        'diseaseRiskForecast': risk_predictions,
        'temperatureForecast': temp_predictions,
        'trainedAt': risk_entry['trained_at'].isoformat(),
    })


@predict_bp.route('/all', methods=['GET'])
def predict_all():
    results = {}
    for region in REGIONS:
        if not is_trained('disease_risk', region):
            results[region] = { 'trained': False }
            continue
        reading = get_latest_reading(region)
        if not reading:
            continue
        temp     = reading['temperature']['current']
        humidity = reading['humidity']
        rainfall = reading.get('rainfall', 0) or 0
        hour     = reading['timestamp'].hour

        risk_entry  = get_model('disease_risk', region)
        X = risk_entry['scaler'].transform([[temp, humidity, rainfall, hour]])
        pred_risk = float(np.clip(risk_entry['model'].predict(X)[0], 0, 100))

        temp_entry = get_model('temperature', region)
        X2 = temp_entry['scaler'].transform([[humidity, rainfall, hour]])
        pred_temp = float(temp_entry['model'].predict(X2)[0])

        results[region] = {
            'trained': True,
            'predictedRisk': round(pred_risk, 1),
            'predictedTemp': round(pred_temp, 1),
        }

    return jsonify({ 'success': True, 'data': results })