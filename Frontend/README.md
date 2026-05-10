# TeaGuard AI Frontend

React + Vite frontend for Tea Leaf Intelligence System.

## Stack
- React
- Vite
- Tailwind CSS
- React Router
- lucide-react

## Routes
- `/` Landing page
- `/login` Login page
- `/register` Register page
- `/dashboard` Protected dashboard shell

## Run
1. `npm install`
2. `copy .env.example .env` (Windows) and update `VITE_API_BASE_URL`
3. `npm run dev`

## Important
- Frontend must call backend APIs only.
- Do not expose API keys in frontend code.
- Do not call Hugging Face APIs directly from frontend.
