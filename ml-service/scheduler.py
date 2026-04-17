import threading
import time
from trainer import train_all

def start_scheduler():
    thread = threading.Thread(target=_run, daemon=True)
    thread.start()

def _run():
    # Skip first run — already trained in app.py startup
    while True:
        time.sleep(60 * 60)  # retrain every hour
        train_all()