import { useEffect, useState, useMemo } from 'react';

// Atmospheric floating dust motes
function DustMotes() {
  const motes = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1.5 + Math.random() * 3,
      duration: 8 + Math.random() * 16,
      delay: Math.random() * 10,
      drift: -40 + Math.random() * 80,
      opacity: 0.15 + Math.random() * 0.35,
    })),
    []
  );

  return (
    <div className="dust-motes" aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.id}
          className="dust-mote"
          style={{
            left: m.left,
            top: m.top,
            width: m.size,
            height: m.size,
            '--mote-duration': `${m.duration}s`,
            '--mote-delay': `${m.delay}s`,
            '--mote-drift': `${m.drift}px`,
            '--mote-opacity': m.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function WelcomeOverlay({ visible }) {
  const title = 'Atlas of Stories';
  const [started, setStarted] = useState(false);

  // Kick off the typewriter once mounted
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`welcome-overlay ${!visible ? 'hidden' : ''}`}>
      {/* Atmospheric layers */}
      <div className="welcome-vignette" aria-hidden="true" />
      <DustMotes />
      <div className="welcome-light-rays" aria-hidden="true" />

      <div className="welcome-content">
        {/* Decorative top ornament */}
        <div className="welcome-ornament top" aria-hidden="true">
          ✦ ─── ✦ ─── ✦
        </div>

        {/* Title with per-character typewriter */}
        <h1 className="welcome-title" aria-label={title}>
          {title.split('').map((char, index) => (
            <span
              key={index}
              className={`typewriter-char ${started ? 'visible' : ''}`}
              style={{ '--char-index': index }}
              aria-hidden="true"
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        {/* Decorative bottom ornament */}
        <div className="welcome-ornament bottom" aria-hidden="true">
          ─── ◈ ───
        </div>

        {/* Subtitle */}
        <p className="welcome-subtitle">
                  Search for a book to explore its world on the map

        </p>
      </div>
    </div>
  );
}
