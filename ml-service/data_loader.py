import os
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
# Absolute path: works no matter which folder the service is started from.
CSV_PATH = os.path.join(HERE, "data", "weather_readings_extended.csv")

REGIONS = ["Nuwara Eliya", "Kandy", "Ratnapura"]


def load_training_frame():
    """All regions x all 6 diseases. Target column: condition_match_score."""
    df = pd.read_csv(CSV_PATH)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.rename(columns={"temperature_current": "temp"})
    return df.sort_values("timestamp").reset_index(drop=True)


def weather_range():
    """Temp/humidity range seen in training, used to flag out-of-range live inputs."""
    df = load_training_frame()
    return {
        "temp": [float(df["temp"].min()), float(df["temp"].max())],
        "humidity": [float(df["humidity"].min()), float(df["humidity"].max())],
    }
