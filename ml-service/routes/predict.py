from flask import Blueprint, jsonify
import model_store
import numpy as np
from datetime import datetime, timezone
from data_loader import load_region_dataframe

predict_bp = Blueprint('predict', __name__)

REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"]


def get_latest_conditions(region):
    """Pull the most recent real weather reading for this region instead of
    using hardcoded placeholder values."""
    df = load_region_dataframe(region)
    if df.empty:
        return None
    latest = df.iloc[-1]
    return {
        "temp": float(latest['temp']),
        "humidity": float(latest['humidity']),
        "rainfall": float(latest['rainfall']),
        "as_of": latest['timestamp'].isoformat(),
    }


def make_prediction(region):
    if not model_store.is_trained(region):
        return None, "Models not yet trained"

    disease_model  = model_store.get_disease_model(region)
    disease_scaler = model_store.get_disease_scaler(region)
    temp_model     = model_store.get_temp_model(region)
    temp_scaler    = model_store.get_temp_scaler(region)
    meta           = model_store.get_metadata(region)

    latest = get_latest_conditions(region)
    if latest is None:
        return None, "No weather data available for this region"

    now = datetime.now(timezone.utc)
    predictions = []

    # Start from the latest real reading; each step feeds the model's own
    # temperature prediction back in as the next step's temp, so the forecast
    # evolves instead of staying frozen at fixed numbers.
    current_temp = latest["temp"]
    humidity = latest["humidity"]
    rainfall = latest["rainfall"]

    for i in range(8):
        hour = (now.hour + i) % 24

        # Disease risk features: [temp, humidity, rainfall, hour]
        X_risk = disease_scaler.transform(
            np.array([[current_temp, humidity, rainfall, hour]])
        )
        disease_risk = float(disease_model.predict(X_risk)[0])
        disease_risk = round(max(0, min(100, disease_risk)) / 100, 3)

        # Temperature features: [humidity, rainfall, hour]
        X_temp = temp_scaler.transform(
            np.array([[humidity, rainfall, hour]])
        )
        temperature = round(float(temp_model.predict(X_temp)[0]), 2)

        predictions.append({
            "hour": i,
            "disease_risk": disease_risk,
            "temperature": temperature,
        })

        # Feed the predicted temperature forward as next hour's input
        current_temp = temperature

    return {
        "region": region,
        "based_on": latest,          # shows the real reading used as the starting point
        "predictions": predictions,
        "model_info": meta,
        "success": True,
    }, None


@predict_bp.route('/<region>', methods=['GET'])
def predict_region(region):
    result, error = make_prediction(region)
    if error:
        return jsonify({
            "success": False,
            "message": error,
            "trained": model_store.is_any_trained()
        }), 503
    return jsonify(result)


@predict_bp.route('/all', methods=['GET'])
def predict_all():
    results = {}
    for region in REGIONS:
        result, error = make_prediction(region)
        results[region] = result if result else {"success": False, "message": error}
    return jsonify({"success": True, "regions": results})