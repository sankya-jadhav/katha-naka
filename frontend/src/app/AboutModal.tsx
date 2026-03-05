"use client";
import { useState, useEffect } from "react";

export default function AboutModal() {
    const [open, setOpen] = useState(false);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <>
            {/* ── माहिती button in footer ──────────────────────────────────────── */}
            <button
                onClick={() => setOpen(true)}
                style={{
                    marginTop: "18px",
                    padding: "9px 28px",
                    background: "transparent",
                    color: "rgba(255,255,255,0.65)",
                    border: "1.5px solid rgba(255,255,255,0.18)",
                    borderRadius: "999px",
                    fontFamily: "'Khand','Tiro Devanagari Marathi',serif",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.color = "#fff";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(204,0,0,0.7)";
                    (e.target as HTMLButtonElement).style.background = "rgba(204,0,0,0.1)";
                }}
                onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
                    (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                    (e.target as HTMLButtonElement).style.background = "transparent";
                }}
            >
                माहिती &nbsp;·&nbsp; About
            </button>

            {/* ── Backdrop ────────────────────────────────────────────────────── */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 99000,
                        background: "rgba(10,10,15,0.78)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "24px",
                        animation: "kn-fadeIn 0.22s ease",
                    }}
                >
                    {/* ── Glass Modal ───────────────────────────────────────────── */}
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: "100%", maxWidth: "480px",
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.18)",
                            borderRadius: "20px",
                            padding: "36px 32px 28px",
                            boxShadow: "0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
                            position: "relative",
                            animation: "kn-slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                        }}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                            style={{
                                position: "absolute", top: "16px", right: "18px",
                                background: "transparent",
                                color: "rgba(255,255,255,0.4)",
                                border: "none", fontSize: "1.4rem",
                                cursor: "pointer", lineHeight: 1,
                                transition: "color 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                        >
                            ×
                        </button>

                        {/* Favicon-style badge */}
                        <div style={{ textAlign: "center", marginBottom: "18px" }}>
                            <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: "58px", height: "58px", borderRadius: "14px",
                                background: "linear-gradient(135deg,#e83333,#cc0000 55%,#991b1b)",
                                boxShadow: "0 6px 24px rgba(204,0,0,0.45)",
                                fontFamily: "'Tiro Devanagari Marathi',serif",
                                fontSize: "2rem", color: "#fff", fontWeight: 700,
                            }}>प</span>
                        </div>

                        {/* Title */}
                        <h2 style={{
                            fontFamily: "'Tiro Devanagari Marathi','Khand',serif",
                            fontSize: "1.25rem", fontWeight: 400,
                            color: "#fff", textAlign: "center",
                            margin: "0 0 6px", lineHeight: 1.4,
                        }}>
                            साहित्याच्या पुणेरी पाट्या
                        </h2>
                        <p style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: "0.7rem", color: "rgba(255,255,255,0.35)",
                            textAlign: "center", letterSpacing: "0.12em",
                            textTransform: "uppercase", margin: "0 0 22px",
                        }}>
                            Pune's Marathi Literary Map
                        </p>

                        {/* Divider */}
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "0 0 20px" }} />

                        {/* Description */}
                        <p style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: "0.88rem", color: "rgba(255,255,255,0.8)",
                            lineHeight: 1.72, margin: "0 0 18px",
                        }}>
                            A fusion of <strong style={{ color: "#fff" }}>Marathi literature</strong> and{" "}
                            <strong style={{ color: "#fff" }}>Artificial Intelligence</strong>. Developed by{" "}
                            <strong style={{ color: "#cc0000" }}>Sanket Jadhav</strong>, an MCA student
                            exploring the intersection of culture and technology in Pune.
                        </p>

                        {/* Tech stack */}
                        <div style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px", padding: "12px 16px",
                            marginBottom: "22px",
                        }}>
                            <p style={{
                                fontFamily: "'Inter',sans-serif",
                                fontSize: "0.68rem", fontWeight: 700,
                                color: "rgba(255,255,255,0.4)",
                                letterSpacing: "0.14em", textTransform: "uppercase",
                                margin: "0 0 8px",
                            }}>Tech Stack</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                                {["Next.js 15", "FastAPI", "ChromaDB", "Marathi-BERT", "SQLite", "Leaflet", "Framer Motion"].map(t => (
                                    <span key={t} style={{
                                        padding: "3px 10px",
                                        background: "rgba(204,0,0,0.18)",
                                        border: "1px solid rgba(204,0,0,0.35)",
                                        borderRadius: "999px",
                                        fontFamily: "'Inter',sans-serif",
                                        fontSize: "0.72rem", fontWeight: 600,
                                        color: "#fca5a5", letterSpacing: "0.03em",
                                    }}>{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Social links */}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/in/sanketjadhav02"
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "7px",
                                    padding: "9px 22px",
                                    background: "rgba(10,102,194,0.2)",
                                    border: "1.5px solid rgba(10,102,194,0.5)",
                                    borderRadius: "999px",
                                    fontFamily: "'Inter',sans-serif",
                                    fontSize: "0.8rem", fontWeight: 600,
                                    color: "#93c5fd", textDecoration: "none",
                                    transition: "all 0.18s ease",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "rgba(10,102,194,0.38)";
                                    e.currentTarget.style.borderColor = "rgba(10,102,194,0.8)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(10,102,194,0.2)";
                                    e.currentTarget.style.borderColor = "rgba(10,102,194,0.5)";
                                }}
                            >
                                {/* LinkedIn SVG icon */}
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                                </svg>
                                LinkedIn
                            </a>

                            {/* GitHub */}
                            <a
                                href="https://github.com/sankya-jadhav"
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "7px",
                                    padding: "9px 22px",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1.5px solid rgba(255,255,255,0.18)",
                                    borderRadius: "999px",
                                    fontFamily: "'Inter',sans-serif",
                                    fontSize: "0.8rem", fontWeight: 600,
                                    color: "rgba(255,255,255,0.75)", textDecoration: "none",
                                    transition: "all 0.18s ease",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                                    e.currentTarget.style.color = "#fff";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                                }}
                            >
                                {/* GitHub SVG icon */}
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                </svg>
                                GitHub
                            </a>
                        </div>

                    </div>{/* end modal */}
                </div>
            )}

            {/* Keyframes injected inline so they work without globals.css edits */}
            <style>{`
        @keyframes kn-fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes kn-slideUp { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:none; } }
      `}</style>
        </>
    );
}
