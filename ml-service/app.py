import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.predict import predict_bp
from routes.train import train_bp
from trainer import train_all
from scheduler import start_scheduler
import model_store as ms
from disease_match import DISEASES

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(predict_bp, url_prefix='/predict')
app.register_blueprint(train_bp, url_prefix='/train')


@app.route('/')
def health():
    return jsonify({
        'status': 'ML service running',
        'diseases': list(DISEASES.keys()),
        'trained': ms.is_trained(),
    })


@app.route('/debug')
def debug():
    return jsonify({
        'trained_diseases': sorted(ms.get_metrics().keys()),
        'meta': ms.get_meta(),
    })


if __name__ == '__main__':
    print("Training models on startup...")
    train_all()
    print("Training done — starting server...")
    start_scheduler()

    # ML_PORT (not PORT): the Node backend's .env already uses PORT=5004, and load_dotenv()
    # can pick up that value, which put both services on the same port.
    PORT = int(os.getenv("ML_PORT", 5005))
    print(f"ML service listening on http://127.0.0.1:{PORT}")

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=False
    )