"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Lookup tables ─────────────────────────────────────────────────────────────
const traitColor: Record<string, { bg: string; text: string; label: string }> = {
    "Historic": { bg: "#7f1d1d", text: "#fff", label: "🏛 Historic" },
    "Educational": { bg: "#1e3a8a", text: "#fff", label: "📚 Educational" },
    "Nature": { bg: "#14532d", text: "#fff", label: "🌿 Nature" },
    "Katta Culture": { bg: "#78350f", text: "#fff", label: "☕ Katta Culture" },
};
const sentimentColor: Record<string, string> = {
    "Historical/Serious": "#b91c1c", "Historical/Philosophical": "#b91c1c",
    "Humorous": "#d97706", "Humorous/Food-centric": "#d97706",
    "Nature/Poetic": "#15803d", "Spiritual/Grand": "#7e22ce",
    "Joyful/Cultural": "#be185d", "Artistic/Reflective": "#1d4ed8",
    "Nostalgic/Urban": "#475569",
};
const badgeColor = (s: string) => sentimentColor[s] ?? "#6b7280";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Quote {
    id: number; text: string; author: string; author_bio?: string;
    sentiment: string; reference_book?: string;
}
interface Location {
    id: number; name: string; latitude: number;
    longitude: number; trait?: string; quotes: Quote[];
}

// ── Shared card dimensions ────────────────────────────────────────────────────
const CARD_W = 276;

const sharedFace: React.CSSProperties = {
    position: "absolute", top: 0, left: 0, width: "100%",
    boxSizing: "border-box",
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
    padding: "14px 16px 14px",
    fontFamily: "'Khand','Tiro Devanagari Marathi','Noto Sans Devanagari',sans-serif",
    textAlign: "center",
    borderRadius: "0 0 12px 12px",
};
const frontFace: React.CSSProperties = {
    ...sharedFace, background: "rgba(255,255,255,0.96)",
};
const backFace: React.CSSProperties = {
    ...sharedFace,
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    transform: "rotateY(180deg)",
    border: "none",
};

const hr: React.CSSProperties = {
    border: "none", borderTop: "1.5px solid rgba(204,0,0,0.2)",
    margin: "8px auto", width: "50%",
};
const dotStyle = (a: boolean): React.CSSProperties => ({
    width: "7px", height: "7px", borderRadius: "50%",
    background: a ? "#cc0000" : "#e5e7eb",
    display: "inline-block", margin: "0 2px",
    transition: "background 0.2s",
});

// ── 3D Flip card ──────────────────────────────────────────────────────────────
function FlipCard({
    quote, trait, minHeight,
}: { quote: Quote; trait: { bg: string; text: string; label: string } | null; minHeight: number }) {
    const [flipped, setFlipped] = useState(false);
    const hasBio = !!quote.author_bio;

    return (
        <div style={{ perspective: "1000px", width: "100%", minHeight, position: "relative" }}>
            <div style={{
                position: "relative", width: "100%", minHeight,
                transformStyle: "preserve-3d",
                transition: "transform 0.52s cubic-bezier(0.4, 0.2, 0.2, 1)",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}>

                {/* FRONT */}
                <div style={frontFace}>
                    {/* Trait badge */}
                    {trait && (
                        <span style={{
                            display: "inline-block", padding: "2px 10px", borderRadius: "999px",
                            fontSize: "10px", fontWeight: 700, color: trait.text,
                            background: trait.bg, letterSpacing: "0.04em", marginBottom: "8px",
                        }}>{trait.label}</span>
                    )}

                    {/* Quote */}
                    <p style={{
                        margin: "0 0 6px", fontSize: "13.5px", fontStyle: "italic",
                        color: "#1e293b", lineHeight: "1.78",
                        fontFamily: "'Tiro Devanagari Marathi','Khand',serif",
                    }}>"{quote.text}"</p>

                    {/* Author */}
                    <p
                        onClick={() => hasBio && setFlipped(true)}
                        title={hasBio ? "Click for author bio" : undefined}
                        style={{
                            fontSize: "11.5px", margin: "4px 0 0",
                            color: hasBio ? "#cc0000" : "#64748b",
                            cursor: hasBio ? "pointer" : "default",
                            textDecoration: hasBio ? "underline dotted" : "none",
                            fontWeight: hasBio ? 600 : 400,
                            fontFamily: "'Inter','Montserrat',sans-serif",
                        }}
                    >
                        — {quote.author}{hasBio && " ℹ️"}
                    </p>

                    <hr style={hr} />
                    {quote.reference_book && (
                        <p style={{
                            fontSize: "10.5px", fontStyle: "italic",
                            color: "#cc0000", fontWeight: 600, margin: "0 0 8px",
                            fontFamily: "'Inter',sans-serif",
                        }}>{quote.reference_book}</p>
                    )}
                    {quote.sentiment && (
                        <span style={{
                            display: "inline-block", padding: "2px 10px", borderRadius: "999px",
                            fontSize: "9.5px", fontWeight: 700, color: "#fff",
                            background: badgeColor(quote.sentiment),
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            fontFamily: "'Inter',sans-serif",
                        }}>{quote.sentiment}</span>
                    )}
                </div>

                {/* BACK */}
                <div style={backFace}>
                    <p style={{
                        margin: "0 0 4px", fontSize: "13px", fontWeight: 700,
                        color: "#1d4ed8", fontFamily: "'Inter','Montserrat',sans-serif",
                    }}>✍️ {quote.author}</p>
                    <hr style={{ ...hr, borderColor: "rgba(29,78,216,0.2)" }} />
                    <p style={{
                        fontSize: "12px", color: "#1e293b", lineHeight: "1.75",
                        margin: "8px 0 12px",
                        fontFamily: "'Tiro Devanagari Marathi','Khand',serif",
                    }}>{quote.author_bio}</p>
                    <button
                        onClick={() => setFlipped(false)}
                        style={{
                            background: "#1d4ed8", color: "#fff",
                            border: "none", borderRadius: "999px",
                            padding: "5px 20px", fontSize: "11.5px", fontWeight: 600,
                            cursor: "pointer", fontFamily: "'Inter',sans-serif",
                        }}
                    >← परत</button>
                </div>
            </div>
        </div>
    );
}

// ── Main QuoteDialog — Framer Motion spring entrance ─────────────────────────
export default function QuoteDialog({ location }: { location: Location }) {
    const quotes = location.quotes ?? [];
    const [idx, setIdx] = useState(0);
    const trait = location.trait ? (traitColor[location.trait] ?? null) : null;

    // Estimate card height for the flip scaffold
    const minH = 160 + Math.ceil(quotes[idx]?.text?.length / 26) * 20;

    if (quotes.length === 0) {
        return (
            <div style={{
                padding: "16px 20px", fontFamily: "'Inter',sans-serif",
                fontSize: "12px", color: "#94a3b8"
            }}>No quotes yet.</div>
        );
    }

    const total = quotes.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.8 }}
            style={{ width: `${CARD_W}px`, overflow: "hidden", borderRadius: "12px" }}
        >
            {/* Location name header */}
            <div style={{
                background: "linear-gradient(135deg, #cc0000 0%, #991b1b 100%)",
                color: "#fff", padding: "10px 16px",
                fontWeight: 700, fontSize: "13.5px", letterSpacing: "0.04em",
                textTransform: "uppercase", textAlign: "center",
                fontFamily: "'Tiro Devanagari Marathi','Khand',serif",
                lineHeight: 1.3,
            }}>
                📍 {location.name}
            </div>

            {/* Flip card — key resets flipped state on carousel change */}
            <FlipCard key={idx} quote={quotes[idx]} trait={trait} minHeight={minH} />

            {/* Carousel nav */}
            {total > 1 && (
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px 10px",
                    background: "rgba(255,255,255,0.96)",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                }}>
                    <button
                        onClick={() => setIdx(i => (i - 1 + total) % total)}
                        style={{
                            background: "transparent", color: "#cc0000",
                            border: "1.5px solid #cc0000", borderRadius: "6px",
                            padding: "2px 10px", fontSize: "16px", fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >‹</button>

                    <span style={{
                        fontSize: "10px", color: "#94a3b8", textAlign: "center",
                        fontFamily: "'Inter',sans-serif"
                    }}>
                        {quotes.map((_, i) => <span key={i} style={dotStyle(i === idx)} />)}
                        <br /><span style={{ fontSize: "9px" }}>{idx + 1} / {total} voices</span>
                    </span>

                    <button
                        onClick={() => setIdx(i => (i + 1) % total)}
                        style={{
                            background: "transparent", color: "#cc0000",
                            border: "1.5px solid #cc0000", borderRadius: "6px",
                            padding: "2px 10px", fontSize: "16px", fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >›</button>
                </div>
            )}
        </motion.div>
    );
}
