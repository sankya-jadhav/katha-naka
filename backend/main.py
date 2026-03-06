from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import math
import models, database

# Create all tables on startup (critical for Render where no .db file is deployed)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Katha-Naka API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _loc_to_dict(loc: models.Location) -> dict:
    return {
        "id":        loc.id,
        "name":      loc.name,
        "latitude":  loc.latitude,
        "longitude": loc.longitude,
        "trait":     loc.trait,
        "quotes": [
            {
                "id":             q.id,
                "text":           q.text,
                "author":         q.author,
                "author_bio":     q.author_bio,
                "sentiment":      q.sentiment,
                "reference_book": q.reference_book,
            }
            for q in loc.quotes
        ],
    }

# ── Health check — Render uses this to confirm the server is alive ────────────
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def home():
    return {"message": "Welcome to Katha-Naka API"}

# ── Main data endpoint (no NLP needed) ───────────────────────────────────────
@app.get("/locations")
def get_locations(db: Session = Depends(database.get_db)):
    return [_loc_to_dict(loc) for loc in db.query(models.Location).all()]

# ── Semantic walk — NLP imported ONLY when this endpoint is actually called ───
@app.get("/generate-walk")
def generate_walk(
    vibe: str = Query(...),
    n:    int  = Query(4, ge=2, le=10),
    db:   Session = Depends(database.get_db),
):
    # Deferred import: sentence-transformers & chromadb are NOT loaded at startup.
    # They are imported here, on the first real request to this endpoint.
    from nlp_service import nlp_layer

    results   = nlp_layer.find_similar_quotes(vibe, n_results=min(n * 4, 20))
    ids       = results.get("ids", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    seen: set[int] = set()
    walk_locs: list[models.Location] = []

    for meta in metadatas:
        loc_id = int(meta.get("location_id", -1))
        if loc_id < 0 or loc_id in seen:
            continue
        loc = db.get(models.Location, loc_id)
        if loc:
            seen.add(loc_id)
            walk_locs.append(loc)
        if len(walk_locs) == n:
            break

    if not walk_locs:
        return []

    def haversine(a: models.Location, b: models.Location) -> float:
        R = 6371.0
        lat1, lat2 = math.radians(a.latitude), math.radians(b.latitude)
        dlat = lat2 - lat1
        dlng = math.radians(b.longitude - a.longitude)
        h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        return 2 * R * math.asin(math.sqrt(h))

    ordered: list[models.Location] = [walk_locs.pop(0)]
    while walk_locs:
        last    = ordered[-1]
        nearest = min(walk_locs, key=lambda l: haversine(last, l))
        walk_locs.remove(nearest)
        ordered.append(nearest)

    return [_loc_to_dict(loc) for loc in ordered]
