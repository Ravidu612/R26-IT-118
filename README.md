# TeaGuard AI - Tea Leaf Intelligence System

Microservices-based full-stack starter for tea-industry AI workflows.

## Services
- `Frontend/`: React + Vite + Tailwind UI.
- `Backend/api-gateway/`: frontend-facing API routing and protection.
- `Backend/auth-service/`: register, login, refresh, logout, current user.
- `Backend/model-service/`: model integration layer and prediction persistence.
- `Backend/shared/`: shared constants and response helpers.

## Implemented First Phase
- Landing page (`/`)
- Login page (`/login`)
- Register page (`/register`)
- Protected dashboard shell (`/dashboard`)
- Auth service with JWT + refresh cookie strategy
- Model service with env-driven Hugging Face client placeholders
- MongoDB connection setup
- Docker and `docker-compose` orchestration

## Environment Setup
1. Copy `.env.example` to `.env`
2. Fill placeholder values:
   - `MONGODB_URI` (MongoDB Atlas connection string; use a database name such as `teaguard`)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - Hugging Face tokens and optional API URLs
   - MQTT broker credentials and topics (`MQTT_HOST`, `MQTT_PORT`, `MQTT_USERNAME`, `MQTT_PASSWORD`, `MQTT_VITALS_TOPIC`, `MQTT_STATUS_TOPIC`)

## Run Without Docker
1. Frontend
   - `cd Frontend`
   - `npm install`
   - `npm run dev`
2. Auth service
   - `cd Backend/auth-service`
   - `npm install`
   - `npm run dev`
3. Model service
   - `cd Backend/model-service`
   - `npm install`
   - `npm run dev`
4. API Gateway
   - `cd Backend/api-gateway`
   - `npm install`
   - `npm run dev`

## Run With Docker Compose
1. Copy `.env.example` to `.env`
2. `docker compose up --build`
3. Access:
   - Frontend: `http://localhost:5173`
   - API gateway: `http://localhost:5000`

## Security Notes
- Frontend calls backend APIs only.
- Hugging Face tokens are server-side environment variables.
- Docker Compose uses the configured MongoDB Atlas cluster; no local MongoDB container is required.
- The model service consumes secure HiveMQ Cloud MQTT messages server-side and the frontend polls the API gateway only.
- No real secrets are committed in this repository.

## Live Worker Activity and Stress IoT Flow

`ESP32/MAX30102 + MPU6500 -> HiveMQ Cloud MQTT -> model-service MQTT consumer -> 30-second signal window -> Hugging Face wearable activity/stress model -> MongoDB prediction history`

The consumer accepts schema-version-two batches on `wearable/+/vitals` and status messages on `wearable/+/status`. It stores valid HR/SpO2 readings plus the new PPG and motion arrays. Invalid signal, finger-not-detected, out-of-range, malformed, and duplicate samples are ignored. A window becomes ready after at least 20 valid readings spanning 30 seconds.

The current Space (`prabodyagunasekara/tea-worker-health-risk-predictor`) predicts `AEROBIC`, `ANAEROBIC`, or `STRESS` using 245 HR, BVP, ACC, and IBI features. The backend converts the live window into temporary Gradio-compatible `HR.csv`, `BVP.csv`, `ACC.csv`, and optional `IBI.csv` uploads before calling the Space. These classes are activity/stress-session classes, not medical diagnoses.

For the ESP32 sensor format, the backend uses the MAX30102 IR series as the BVP-compatible signal and converts MPU6500 milli-g values to g. This is an integration mapping, so production accuracy should be validated with labeled data from this exact hardware before making worker-safety decisions.

### IoT API

All endpoints require the existing `Authorization: Bearer <access-token>` header.

```text
GET /api/iot/devices
GET /api/iot/worker-health/latest?deviceId=device-001
POST /api/iot/worker-health/analyze
```

Analyze request:

```json
{
  "deviceId": "device-001",
  "workerName": "Worker A",
  "workerId": "optional-worker-id"
}
```

The latest endpoint returns `online`, `lastSeen`, `latestReading`, `validReadingCount`, `collectionProgress`, `windowReady`, the 12 summary `features`, and signal sample counts. The analyze endpoint returns those window details together with the activity/stress prediction fields and persists the result through `Prediction` and `WorkerHealthRecord`.

### Sample MQTT payload

Publish this shape to `wearable/device-001/vitals` using any HiveMQ-compatible MQTT client. Repeat readings with increasing `sequence` and `uptimeMs` until the payloads cover 30 seconds:

```json
{
  "schemaVersion": 2,
  "deviceId": "device-001",
  "vitalRateHz": 5,
  "ppgSampleRateHz": 25,
  "accSampleRateHz": 25,
  "accUnit": "mg",
  "readings": [
    {
      "sequence": 1,
      "uptimeMs": 1000,
      "fingerDetected": true,
      "signalGood": true,
      "red": 99090,
      "ir": 115734,
      "bpm": 90,
      "liveBpm": 89.3,
      "spo2": 98,
      "ibiMs": 667
    }
  ],
  "ppg": {
    "count": 2,
    "startUptimeMs": 1000,
    "red": [99090, 99095],
    "ir": [115734, 115740]
  },
  "motion": {
    "count": 2,
    "startUptimeMs": 1000,
    "x": [0, 1],
    "y": [0, 1],
    "z": [1000, 1000]
  }
}
```

For a status message, publish `{"deviceId":"device-001","online":true}` to `wearable/device-001/status`.

### Tests

```text
cd Backend/model-service
npm test
```

The tests cover MQTT parsing/filtering, schema-version-two PPG and motion parsing, duplicate handling, rolling windows, HF signal-file generation, model output parsing, all 12 summary feature calculations, latest-data state, and the analyze service contract.
