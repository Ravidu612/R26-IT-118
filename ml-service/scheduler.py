import threading
import time

from trainer import train_all

RETRAIN_EVERY_SECONDS = 24 * 60 * 60  # the CSV is static, so hourly retraining added nothing


def start_scheduler():
    threading.Thread(target=_run, daemon=True).start()


def _run():
    # First training happens in app.py at startup.
    while True:
        time.sleep(RETRAIN_EVERY_SECONDS)
        train_all()
