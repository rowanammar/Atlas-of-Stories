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
      {loading ? '⏳' : '🎲'}
      <span className="surprise-tooltip">Surprise me!</span>
    </button>
  );
}
