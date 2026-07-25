import { useState } from 'react';
import { getSurpriseBook } from '../utils/api';

export default function SurpriseButton({ onBookSelected }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const book = await getSurpriseBook();
      onBookSelected(book);
    } catch (err) {
      console.error('Surprise failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`surprise-btn ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      aria-label="Surprise me with a random book"
    >
      <span className="surprise-icon">{loading ? '⏳' : '🎲'}</span>
      <span className="surprise-tooltip">
        <span className="surprise-tooltip-text">Surprise me!</span>
        <span className="surprise-tooltip-sub">Random literary journey</span>
      </span>
    </button>
  );
}
