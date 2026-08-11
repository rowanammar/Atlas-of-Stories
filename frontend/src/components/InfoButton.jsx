import { useState, useRef, useEffect } from 'react';

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        className={`info-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="About this project"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {open && (
        <div className="info-popup" ref={panelRef}>
          {/* Header */}
          <div className="info-popup-header">
            <span className="info-popup-title">Atlas of Stories</span>
            <button className="info-popup-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          {/* Architecture */}
          <div className="info-popup-section">
            <div className="info-popup-label">Architecture</div>
            <p className="info-popup-text">
              React + MapLibre GL frontend served by a Node.js / Express backend,
              deployed on Google Cloud Run with Firestore caching. 
              Book data from OpenLibrary; locations extracted via the Gemini API
              and geocoded in real-time.
            </p>
          </div>

          {/* Attributions */}
          <div className="info-popup-section">
            <div className="info-popup-label">Attributions</div>
            <ul className="info-popup-credits">
              <li>
                Map tiles by <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>
              </li>
              <li>
                Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
              </li>
              <li>
                Book data from <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer">OpenLibrary</a>
              </li>
              <li>
                Powered by <a href="https://maplibre.org" target="_blank" rel="noopener noreferrer">MapLibre GL</a>
              </li>
            </ul>
          </div>

          {/* GitHub link */}
          <a
            className="info-popup-github"
            href="https://github.com/rowanammar/Atlas-of-Stories"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>View on GitHub</span>
            <svg className="info-popup-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      )}
    </>
  );
}
