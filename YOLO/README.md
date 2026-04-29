# YOLO Tea Estate Monitoring App

This folder contains the Gradio application for the tea estate monitoring system.

## Files

- `app.py`: Main Gradio application.
- `requirements.txt`: Python dependencies.
- `best.pt`: Trained YOLO model weights (not included in this repo).

## Run locally

1. Install dependencies:
   ```bash
   pip install -r YOLO/requirements.txt
   ```
2. Place your YOLO model weights at `YOLO/best.pt`.
3. Run the application:
   ```bash
   python YOLO/app.py
   ```

If `YOLO/best.pt` is missing, the app will display a helpful message.
