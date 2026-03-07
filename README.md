<div align="center">

<img src="frontend/public/favicon.ico" width="80" height="80" alt="साहित्याच्या पुणेरी पाट्या icon"/>

# साहित्याच्या पुणेरी पाट्या
### Pune's Marathi Literary AI Map

*Discover centuries of Marathi poetry, wit, and wisdom — pinned to the streets of Pune.*

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6F61?style=flat-square)](https://www.trychroma.com/)
[![GitHub](https://img.shields.io/badge/GitHub-katha--naka-black?style=flat-square&logo=github)](https://github.com/sankya-jadhav/katha-naka)
[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](LICENSE)

</div>

---

🌐 Live Demo: https://katha-naka.vercel.app

---

## 📖 About

**साहित्याच्या पुणेरी पाट्या** is a location-based Marathi literary map that fuses AI and culture. Every pin on the map represents a real Pune location — Shanivar Wada, Vetal Tekdi, Saras Baug — each holding quotes from iconic Marathi authors like **Pu La Deshpande**, **V. P. Kale**, and **Savitribai Phule**.

Built by **Sanket Jadhav**, an MCA student exploring the intersection of culture, NLP, and modern web technology.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺 **Literary Map** | Interactive Leaflet map with 47+ Pune locations and 67+ Marathi quotes |
| 📚 **Multi-voice Carousel** | Each location can hold multiple literary perspectives — carousel through them |
| 🪟 **Puneri Paati Popup** | Glassmorphism cards styled after classic Pune signboards, with 3D flip for author bios |
| 🔍 **Vibe Filter** | Filter markers by sentiment — विनोदी, ऐतिहासिक, निसर्ग, कट्टा |
| 🌙 **Night Mode** | Dark CartoDB tile layer with red neon glow on markers |
| 🔴 **Smart Clustering** | Custom red `L.divIcon` clusters matching the Puneri colour theme |
| 🤖 **Semantic Search** | L3Cube Marathi-BERT embeddings stored in ChromaDB for vibe-based discovery |
| 📱 **Mobile Optimised** | Scroll-snap, touch-zoom centering, responsive glassmorphism UI |

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** (App Router, `"use client"`, dynamic imports)
- **React Leaflet** + **react-leaflet-cluster** — interactive map
- **Framer Motion** — spring-pop popup animations
- **Tiro Devanagari Marathi** + **Inter** — bilingual typography

### Backend
- **FastAPI** — REST API (`/locations`, `/search`, `/generate-walk`)
- **SQLAlchemy** + **SQLite** — relational data store
- **ChromaDB** — vector store for semantic search
- **L3Cube Marathi-BERT** (`l3cube-pune/marathi-sentence-bert-nli-v2`) — Marathi sentence embeddings

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python seeds.py          # seed the database
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
cp .env.production.example .env.local
# Edit .env.local → NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🌐 Deployment

See [`DEPLOY.md`](DEPLOY.md) for the full production guide using **Gunicorn + Vercel**.

| Layer | Service |
|---|---|
| Frontend | Vercel (zero-config Next.js) |
| Backend | Render / Railway (persistent disk for SQLite + ChromaDB) |

---

## 📁 Project Structure

```
katha-naka/
├── backend/
│   ├── main.py          # FastAPI app & API endpoints
│   ├── models.py        # SQLAlchemy models (Location, Quote)
│   ├── seeds.py         # Database seeding (47 locations, 67+ quotes)
│   ├── nlp_service.py   # Marathi-BERT embeddings & ChromaDB
│   └── requirements.txt
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx         # Hero + Map + Footer layout
│   │   ├── MapComponent.tsx # Leaflet map, clusters, night mode
│   │   ├── QuoteDialog.tsx  # 3D flip Puneri Paati popup
│   │   ├── FilterBar.tsx    # Glassmorphism vibe filter
│   │   ├── AboutModal.tsx   # Developer info modal
│   │   ├── globals.css      # Design system (glassmorphism, snap-scroll)
│   │   └── layout.tsx       # Fonts, favicon, metadata
│   └── public/
│       ├── favicon.ico      # Literary book icon
│       └── pune_hero.png    # Hero background image
├── DEPLOY.md
└── README.md
```

---

## 👨‍💻 Developer

**Sanket Jadhav**  
MCA Student · Culture × Technology · Pune

[![LinkedIn](https://img.shields.io/badge/LinkedIn-sanketjadhav02-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/sanketjadhav02)
[![GitHub](https://img.shields.io/badge/GitHub-sankya--jadhav-black?style=flat-square&logo=github)](https://github.com/sankya-jadhav/katha-naka)

---

## 📜 License

MIT License — quotes are attributed to their respective authors and used for educational purposes only.

---

<div align="center">
  <sub>Built with ❤️ for Pune's literary legacy · Powered by L3Cube Marathi-BERT & ChromaDB</sub>
</div>
