import pandas as pd

CSV_PATH = "data/weather_readings.csv"  # adjust path as needed

def load_region_dataframe(region):
    df = pd.read_csv(CSV_PATH)
    df = df[df['location_name'] == region].copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    df = df.rename(columns={'temperature_current': 'temp'})
    df['hour'] = df['timestamp'].dt.hour
    # disease_risk is already in the CSV — no need to recompute it,
    # but keep this if you still want the rule-based version for comparison
    return df[['temp', 'humidity', 'rainfall', 'hour', 'disease_risk', 'timestamp']]