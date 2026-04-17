_store = {
    "disease_risk": {},
    "disease_scaler": {},
    "temperature": {},
    "temp_scaler": {},
    "metadata": {},
}

def set_disease_model(region, model, scaler, trained_at):
    _store["disease_risk"][region] = model
    _store["disease_scaler"][region] = scaler
    _store["metadata"].setdefault(region, {})["disease_trained_at"] = trained_at.isoformat()
    print(f"[model_store] disease model set for {region} — store id: {id(_store)}")

def set_temp_model(region, model, scaler, trained_at):
    _store["temperature"][region] = model
    _store["temp_scaler"][region] = scaler
    _store["metadata"].setdefault(region, {})["temp_trained_at"] = trained_at.isoformat()
    print(f"[model_store] temp model set for {region} — store id: {id(_store)}")

def set_samples(region, n):
    _store["metadata"].setdefault(region, {})["samples"] = n

def get_disease_model(region):
    return _store["disease_risk"].get(region)

def get_disease_scaler(region):
    return _store["disease_scaler"].get(region)

def get_temp_model(region):
    return _store["temperature"].get(region)

def get_temp_scaler(region):
    return _store["temp_scaler"].get(region)

def get_metadata(region):
    return _store["metadata"].get(region, {})

def is_trained(region):
    result = (
        region in _store["disease_risk"] and
        region in _store["temperature"]
    )
    print(f"[model_store] is_trained({region}) → {result} — store id: {id(_store)}")
    return result

def is_any_trained():
    return len(_store["disease_risk"]) > 0