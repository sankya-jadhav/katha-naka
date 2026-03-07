# साहित्याच्या पुणेरी पाट्या — Deployment Guide

## Prerequisites
- Python 3.10+, Node.js 18+
- `pip install gunicorn` on the server

---

## Backend — FastAPI with Gunicorn

### Install dependencies
```bash
cd backend
pip install -r requirements.txt
pip install gunicorn
```

### Seed the database (first time only)
```bash
python seeds.py
```

### Run for production
```bash
# 4 workers, uvicorn worker class for async support
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

### Environment considerations
- `katha_naka.db` and `chroma_db/` must be on a **persistent volume** (not ephemeral container storage)
- Set `CORS` origins in `main.py` to your real frontend domain before deploying:
  ```python
  allow_origins=["https://your-frontend.vercel.app"]
  ```

---

## Frontend — Next.js

### Set environment variables
```bash
cp .env.production.example .env.production
# Edit .env.production and set:
# NEXT_PUBLIC_API_URL=https://katha-naka-api.onrender.com
```

### Build and start
```bash
npm run build
npm start
# or deploy to Vercel: vercel --prod
```

---

## Recommended Hosting Stack

| Layer     | Service                          | Why                          |
|-----------|----------------------------------|------------------------------|
| Frontend  | **Vercel** (free tier)           | Zero-config Next.js deploy   |
| Backend   | **Render** or **Railway**        | Persistent disk for SQLite + Chroma |
| Database  | SQLite on persistent disk (now) → Postgres (later) | Simple to start |

---

## Quick Start (Local Dev)

```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open http://localhost:3000
