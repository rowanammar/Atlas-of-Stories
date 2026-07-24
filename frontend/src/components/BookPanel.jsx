import { useState } from 'react';

const TYPE_COLORS = {
  'plot setting':       'plot-setting',
  'author connection':  'author-connection',
  'inspiration':        'inspiration',
  'historical':         'historical',
};

function normalizeType(type) {
  if (!type) return 'plot-setting';
  const lower = type.toLowerCase().replace(/_/g, ' ');
  return TYPE_COLORS[lower] || 'plot-setting';
}

export default function BookPanel({ book, locations, onLocationClick, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!book) return null;

  const coverId = book.cover_i || book.coverId;
  const coverSrc = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    : null;
  const author = book.author_name?.[0] || book.author || 'Unknown author';
  const year = book.first_publish_year || book.year || '';
  const description = typeof book.description === 'string'
    ? book.description
    : book.description?.value || '';

  return (
    <aside className="book-panel open">
      <button className="panel-close" onClick={onClose} aria-label="Close panel">×</button>

      {coverSrc ? (
        <img className="panel-cover" src={coverSrc} alt={`Cover of ${book.title}`} />
      ) : (
        <div className="panel-cover-placeholder">📚</div>
      )}

      <div className="panel-content">
        <h1 className="panel-title">{book.title}</h1>
        <p className="panel-author">{author}</p>
        {year && <p className="panel-year">{year}</p>}

        {description && (
          <>
            <p className={`panel-description ${!isExpanded ? 'truncated' : ''}`}>
              {description}
            </p>
            <button
              className="panel-read-more"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Read more…'}
            </button>
          </>
        )}

        {locations && locations.length > 0 && (
          <>
            <div className="location-badge">
               {locations.length} location{locations.length !== 1 ? 's' : ''} discovered
            </div>

            <ul className="location-list">
              {locations.map((loc, i) => (
                <li
                  key={`${loc.name}-${i}`}
                  className="location-item"
                  onClick={() => onLocationClick(loc, i)}
                >
                  <span className={`location-dot ${normalizeType(loc.type)}`} />
                  <div>
                    <div className="location-name">{loc.name}</div>
                    <div className="location-type">{loc.type || 'Plot Setting'}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="type-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--burnt-orange)' }} />
                Plot Setting
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--burgundy)' }} />
                Author Connection
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--forest)' }} />
                Inspiration
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--amber)' }} />
                Historical
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
