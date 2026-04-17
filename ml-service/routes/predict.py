from flask import Blueprint, jsonify
import model_store
import numpy as np
from datetime import datetime, timezone

predict_bp = Blueprint('predict', __name__)

REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"]

def make_prediction(region):
    if not model_store.is_trained(region):
        return None, "Models not yet trained"

    disease_model  = model_store.get_disease_model(region)
    disease_scaler = model_store.get_disease_scaler(region)
    temp_model     = model_store.get_temp_model(region)
    temp_scaler    = model_store.get_temp_scaler(region)
    meta           = model_store.get_metadata(region)

    now = datetime.now(timezone.utc)
    predictions = []

    for i in range(8):
        hour = (now.hour + i) % 24

        humidity = 75.0
        rainfall = 0.5
        temp_approx = 20.0

        # Disease risk features: [temp, humidity, rainfall, hour]
        X_risk = disease_scaler.transform(
            np.array([[temp_approx, humidity, rainfall, hour]])
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

    return {
        "region": region,
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