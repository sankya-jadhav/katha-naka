"use client";
import dynamic from "next/dynamic";
import AboutModal from "./AboutModal";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function Home() {
  return (
    <main>
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="kn-nav">
        <a className="kn-nav-logo" href="/">साहित्याच्या<span> पुणेरी पाट्या</span></a>
        <ul className="kn-nav-links">
          <li><a href="#map">नकाशा · Map</a></li>
          <li><a href="https://github.com/sankya-jadhav" target="_blank" rel="noopener">GitHub</a></li>
        </ul>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      <section className="kn-hero">
        <div className="kn-hero-bg" />
        <div className="kn-hero-overlay" />

        <div className="kn-hero-content">
          <span className="kn-hero-eyebrow">Pune · Maharashtra · Literary Map</span>

          <h1 className="kn-hero-title">
            साहित्याच्या पुणेरी पाट्या
            <span className="kn-hero-title-en">Pune's Literary Heritage Map</span>
          </h1>

          <p className="kn-hero-tagline">
            Pune's streets hold centuries of poetry, wit, and wisdom.
            Walk the city through the eyes of its greatest writers.
          </p>

          <a href="#map" className="kn-hero-cta">
            नकाशा पाहा
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Stats bar */}
        <div className="kn-stats">
          <div className="kn-stat">
            <div className="kn-stat-num">47</div>
            <div className="kn-stat-label">Locations</div>
          </div>
          <div className="kn-stat">
            <div className="kn-stat-num">67</div>
            <div className="kn-stat-label">Quotes</div>
          </div>
          <div className="kn-stat">
            <div className="kn-stat-num">20+</div>
            <div className="kn-stat-label">Authors</div>
          </div>
          <div className="kn-stat">
            <div className="kn-stat-num">4</div>
            <div className="kn-stat-label">Eras</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="kn-scroll-indicator">
          <span>Scroll</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      <section id="map" className="kn-map-section">
        <div className="kn-map-section-label">
          पुण्याचा साहित्यिक नकाशा — Pune's Literary Heritage Map
        </div>
        <MapComponent />
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="kn-footer">
        <p>
          Built with ❤️ for Pune's literary legacy ·{" "}
          <a href="https://github.com/sankya-jadhav" target="_blank" rel="noopener">Open Source</a>{" "}
          · Powered by L3Cube Marathi-BERT &amp; ChromaDB
        </p>
        <p style={{ marginTop: "8px", opacity: 0.45 }}>
          Quotes are attributed to their respective authors. Educational use only.
        </p>
        {/* माहिती button — opens the About modal */}
        <AboutModal />
      </footer>
    </main>
  );
}
