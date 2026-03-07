"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import L from "leaflet";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import QuoteDialog from "./QuoteDialog";
import FilterBar, { SentimentFilter } from "./FilterBar";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const MarkerClusterGroup = dynamic(
    () => import("react-leaflet-cluster").then(m => m.default),
    { ssr: false }
);

// ── Fix Leaflet default icons ─────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const TILE_DAY = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_NIGHT = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const PUNE_BOUNDS: [[number, number], [number, number]] = [
    [18.35, 73.70], [18.65, 74.05],
];

function matchesFilter(loc: any, filter: SentimentFilter): boolean {
    if (filter === "all") return true;
    const trait = (loc.trait ?? "").toLowerCase();
    const sentiments = (loc.quotes ?? []).map((q: any) => (q.sentiment ?? "").toLowerCase());
    if (filter === "humorous") return sentiments.some((s: string) => s.includes("humorous"));
    if (filter === "historical") return sentiments.some((s: string) => s.includes("historical")) || trait === "historic";
    if (filter === "nature") return sentiments.some((s: string) => s.includes("nature") || s.includes("poetic")) || trait === "nature";
    if (filter === "katta") return trait === "katta culture";
    return true;
}

function createClusterIcon(cluster: any) {
    const count = cluster.getChildCount();
    const size = count < 10 ? 38 : count < 30 ? 44 : 52;
    return L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          background:radial-gradient(circle at 35% 35%,#e83333,#cc0000 55%,#991b1b);
          border-radius:50%;display:flex;align-items:center;justify-content:center;
          color:#fff;font-weight:800;font-size:${size < 44 ? 14 : 16}px;
          font-family:'Inter','Khand',sans-serif;
          border:3px solid rgba(255,255,255,0.85);
          box-shadow:0 0 0 3px rgba(204,0,0,0.4),0 4px 14px rgba(0,0,0,0.35);
        ">${count}</div>`,
        className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
    });
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function MapSkeleton() {
    return (
        <div style={{
            position: "absolute", inset: 0, zIndex: 500,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(10,10,15,0.78)", backdropFilter: "blur(8px)",
        }}>
            <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                border: "4px solid rgba(204,0,0,0.25)", borderTopColor: "#cc0000",
                animation: "kn-spin 0.85s linear infinite", marginBottom: "20px",
            }} />
            <p style={{ fontFamily: "'Tiro Devanagari Marathi','Khand',serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>
                साहित्य शोधत आहे…
            </p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: "6px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Locating literary Pune
            </p>
        </div>
    );
}

// ── Click-to-activate overlay ─────────────────────────────────────────────────
function ActivateOverlay({ onActivate }: { onActivate: () => void }) {
    return (
        <div
            onClick={onActivate}
            style={{
                position: "absolute", inset: 0, zIndex: 490, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent",
            }}
        >
            <div style={{
                background: "rgba(10,10,15,0.72)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.18)", borderRadius: "12px",
                padding: "12px 28px", display: "flex", alignItems: "center", gap: "10px",
            }}>
                <span style={{ fontSize: "1.2rem" }}>🗺</span>
                <div>
                    <p style={{ fontFamily: "'Khand',sans-serif", color: "#fff", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
                        Click to Interact
                    </p>
                    <p style={{ fontFamily: "'Inter',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", margin: 0 }}>
                        Scroll wheel zooms after clicking · Ctrl+Scroll to zoom
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── ScrollWheel controller (inside MapContainer context) ──────────────────────
function ScrollWheelController({ enabled }: { enabled: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (enabled) map.scrollWheelZoom.enable();
        else map.scrollWheelZoom.disable();
    }, [enabled, map]);
    return null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MapComponent() {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeFilter, setActiveFilter] = useState<SentimentFilter>("all");
    const [nightMode, setNightMode] = useState(false);
    const [mapActive, setMapActive] = useState(false);   // user clicked into map
    const wrapperRef = useRef<HTMLDivElement>(null);

    // ── Fetch locations ───────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`${API}/locations`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => { setLocations(d); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
    }, []);

    // ── IntersectionObserver: release map focus when scrolled out of view ─────
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                // When less than 30% of the map is visible, deactivate it
                if (entry.intersectionRatio < 0.3 && mapActive) {
                    setMapActive(false);
                }
            },
            { threshold: [0, 0.3, 1] }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [mapActive]);

    // ── Click anywhere outside the map to deactivate ──────────────────────────
    useEffect(() => {
        if (!mapActive) return;
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setMapActive(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [mapActive]);

    const visibleLocations = locations.filter(loc => matchesFilter(loc, activeFilter));
    const tileUrl = nightMode ? TILE_NIGHT : TILE_DAY;

    const moonBtn: React.CSSProperties = {
        position: "absolute", right: "12px", top: "16px", zIndex: 1000,
        background: nightMode ? "rgba(15,23,42,0.88)" : "rgba(255,255,255,0.14)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        color: nightMode ? "#facc15" : "#fff",
        border: `1.5px solid ${nightMode ? "#facc15" : "rgba(255,255,255,0.3)"}`,
        borderRadius: "999px", padding: "6px 14px", fontSize: "18px",
        cursor: "pointer", fontFamily: "'Khand',sans-serif", fontWeight: 700,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "all 0.2s ease",
    };

    return (
        <div
            ref={wrapperRef}
            id="katha-naka-map"
            className={nightMode ? "katha-night" : ""}
            style={{ position: "relative", height: "100vh", width: "100%", overflow: "hidden" }}
        >
            {loading && <MapSkeleton />}

            {error && (
                <div style={{ position: "absolute", inset: 0, zIndex: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)" }}>
                    <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>😔</p>
                    <p style={{ fontFamily: "'Tiro Devanagari Marathi','Khand',serif", fontSize: "1.05rem", color: "#fca5a5" }}>सर्व्हर उपलब्ध नाही</p>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>Backend server is offline. Please try again later.</p>
                </div>
            )}

            {/* Click-to-activate overlay — hidden once user clicks in */}
            {!loading && !error && !mapActive && (
                <ActivateOverlay onActivate={() => setMapActive(true)} />
            )}

            <FilterBar active={activeFilter} onChange={setActiveFilter} />

            <button style={moonBtn} onClick={() => setNightMode(n => !n)} title="Toggle Night Mode">
                {nightMode ? "🌕" : "🌙"}
            </button>

            <MapContainer
                key={tileUrl}
                id="leaflet-map"
                center={[18.5204, 73.8567]}
                zoom={13}
                minZoom={11}
                maxBounds={PUNE_BOUNDS}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={false}   // off by default; enabled after click via controller
                dragging={true}            
                touchZoom="center"        // pinch-to-zoom anchors at screen centre, not fingers
                style={{ height: "100%", width: "100%", minHeight: "80vh" }}
            >
                <TileLayer url={tileUrl} />

                {/* Enable scroll wheel zoom only after user has clicked into the map */}
                <ScrollWheelController enabled={mapActive} />

                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon}>
                    {visibleLocations.map((loc: any) => (
                        <Marker key={loc.id} position={[loc.latitude, loc.longitude]} zIndexOffset={1000}>
                            <Popup
                                className="kn-popup"
                                maxWidth={300}
                                minWidth={276}
                                autoPan={true}
                                autoPanPadding={[50, 50]}
                            >
                                <QuoteDialog location={loc} />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
