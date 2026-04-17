import sys

# Force single instance by storing on the module itself
_disease_risk = {}
_temperature = {}

def get_model(model_type, region):
    store = _disease_risk if model_type == 'disease_risk' else _temperature
    return store.get(region)

def set_model(model_type, region, model, scaler, trained_at):
    store = _disease_risk if model_type == 'disease_risk' else _temperature
    store[region] = {
        'model': model,
        'scaler': scaler,
        'trained_at': trained_at,
    }
    print(f"[model_store] Saved {model_type} for {region} — store size: {len(store)}")

def is_trained(model_type, region):
    store = _disease_risk if model_type == 'disease_risk' else _temperature
    result = region in store
    print(f"[model_store] is_trained({model_type}, {region}) = {result}, store keys: {list(store.keys())}")
    return result