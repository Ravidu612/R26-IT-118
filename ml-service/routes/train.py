from flask import Blueprint, jsonify

import model_store
from trainer import train_all

train_bp = Blueprint('train', __name__)


@train_bp.route('/', methods=['POST'], strict_slashes=False)
def retrain():
    """Retrain all 6 disease models and return the held-out test metrics."""
    try:
        report = train_all()
        return jsonify({'success': True, 'metrics': report, 'meta': model_store.get_meta()})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@train_bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        'success': True,
        'trained': model_store.is_trained(),
        'meta': model_store.get_meta(),
        'metrics': model_store.get_metrics(),
    })