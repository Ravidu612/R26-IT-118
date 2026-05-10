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
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - Hugging Face tokens and optional API URLs

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
- No real secrets are committed in this repository.
