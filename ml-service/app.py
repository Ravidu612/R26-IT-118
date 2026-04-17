from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes.predict import predict_bp
from routes.train import train_bp
from trainer import train_all
from scheduler import start_scheduler

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(predict_bp, url_prefix='/predict')
app.register_blueprint(train_bp, url_prefix='/train')

@app.route('/')
def health():
    return jsonify({ 'status': 'ML service running', 'models': ['disease_risk', 'temperature'] })

if __name__ == '__main__':
    # Train synchronously BEFORE starting Flask
    print("Training models on startup...")
    train_all()
    print("Training done — starting server...")
    
    # Start background retraining scheduler
    start_scheduler()
    
    app.run(port=5001, debug=False)