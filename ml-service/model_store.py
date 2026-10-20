"""In-memory store for trained models (one model per disease). Replaces the old model_store.py."""
import threading

_lock = threading.Lock()
_models = {}      # disease -> fitted model
_metrics = {}     # disease -> dict of test metrics
_meta = {"trained_at": None, "samples": 0, "train_rows": 0, "test_rows": 0, "split_at": None, "range": None,
         "dataset_range": None}


def set_model(disease, model, metrics):
    with _lock:
        _models[disease] = model
        _metrics[disease] = metrics


def set_meta(**kw):
    with _lock:
        _meta.update(kw)


def get_model(disease):
    return _models.get(disease)


def get_metrics():
    return dict(_metrics)


def get_meta():
    return dict(_meta)


def is_trained():
    return len(_models) > 0
