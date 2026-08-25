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

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(predict_bp, url_prefix='/predict')
app.register_blueprint(train_bp, url_prefix='/train')

@app.route('/')
def health():
    return jsonify({ 'status': 'ML service running', 'models': ['disease_risk', 'temperature'] })

@app.route('/debug')
def debug():
    return jsonify({
        'store_id': id(ms._store),
        'disease_keys': list(ms._store['disease_risk'].keys()),
        'temp_keys': list(ms._store['temperature'].keys()),
    })

if __name__ == '__main__':
    print("Training models on startup...")
    train_all()
    print("Training done — starting server...")
    start_scheduler()
    PORT = int(os.getenv("PORT", 5005))

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=False
    )