from flask import Blueprint, jsonify
from trainer import train_all

train_bp = Blueprint('train', __name__)

@train_bp.route('/now', methods=['POST'])
def train_now():
    try:
        train_all()
        return jsonify({ 'success': True, 'message': 'Training complete' })
    except Exception as e:
        return jsonify({ 'success': False, 'error': str(e) }), 500