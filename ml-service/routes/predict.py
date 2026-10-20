from flask import Blueprint, jsonify, request
import numpy as np

import model_store
from data_loader import REGIONS
from disease_match import DISEASES, LEVELS, level_for

predict_bp = Blueprint("predict", __name__)


def make_prediction(region, hours):
    """hours: list of {temp, humidity, rainfall, t?} - the live reading + OpenWeather forecast
    built by the Node backend. Nothing is frozen or taken from the CSV."""
    if not model_store.is_trained():
        return None, "Models not yet trained", 503
    if region not in REGIONS:
        return None, f"Unknown region '{region}'", 404
    if not hours:
        return None, "Body must contain a non-empty 'hours' list", 400

    try:
        temp = np.array([float(h["temp"]) for h in hours])
        hum = np.array([float(h["humidity"]) for h in hours])
    except (KeyError, TypeError, ValueError):
        return None, "Each hour needs numeric 'temp' and 'humidity'", 400

    rng = model_store.get_meta()["range"]
    in_range = ((temp >= rng["temp"][0]) & (temp <= rng["temp"][1]) &
                (hum >= rng["humidity"][0]) & (hum <= rng["humidity"][1]))
    X = np.column_stack([np.clip(temp, *rng["temp"]), np.clip(hum, *rng["humidity"])])

    idx = {name: np.clip(model_store.get_model(name).predict(X), 0.2, 1.0) for name in DISEASES}

    predictions = []
    for i, h in enumerate(hours):
        diseases = {}
        for name in DISEASES:
            v = float(idx[name][i])
            diseases[name] = {"index": round(v, 3), "score": int(round(v * 100)),
                              "level": str(level_for(v))}
        top = max(diseases, key=lambda n: diseases[n]["index"])
        predictions.append({
            "hour": i,
            "time": h.get("t"),
            "temperature": round(float(temp[i]), 2),
            "humidity": round(float(hum[i]), 1),
            "rainfall": round(float(h.get("rainfall", 0) or 0), 2),
            "diseases": diseases,
            "top_disease": top,
            "disease_risk": diseases[top]["index"],  # 0-1, highest disease index (legacy field)
            "in_training_range": bool(in_range[i]),
        })

    return {
        "success": True,
        "region": region,
        "predictions": predictions,
        "levels": LEVELS,
        "model_info": {"meta": model_store.get_meta(), "metrics": model_store.get_metrics()},
    }, None, 200


@predict_bp.route("/metrics", methods=["GET"])
def metrics():
    if not model_store.is_trained():
        return jsonify({"success": False, "message": "Models not yet trained"}), 503
    return jsonify({"success": True, "meta": model_store.get_meta(), "metrics": model_store.get_metrics()})


@predict_bp.route("/<region>", methods=["POST"])
def predict_region(region):
    body = request.get_json(silent=True) or {}
    result, error, status = make_prediction(region, body.get("hours"))
    if error:
        return jsonify({"success": False, "message": error, "trained": model_store.is_trained()}), status
    return jsonify(result)
