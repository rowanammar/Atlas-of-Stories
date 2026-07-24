export default function SearchDropdown({ results, onSelect }) {
  if (!results || results.length === 0) {
    return (
      <div className="search-dropdown">
        <div className="search-no-results">No books found</div>
      </div>
    );
  }

  return (
    <div className="search-dropdown">
      {results.map((book) => {
        const coverId = book.cover_i || book.coverId;
        const coverSrc = coverId
          ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
          : null;
        const author = book.author_name?.[0] || book.author || 'Unknown author';
        const year = book.first_publish_year || book.year || '';

        return (
          <div
            key={book.key || book.workId}
            className="search-result"
            onClick={() => onSelect(book)}
          >
            {coverSrc ? (
              <img
                className="search-result-cover"
                src={coverSrc}
                alt=""
                loading="lazy"
              />
            ) : (
              <div className="search-result-placeholder">📖</div>
            )}
            <div className="search-result-info">
              <div className="search-result-title">{book.title}</div>
              <div className="search-result-author">
                {author}
                {year && <span className="search-result-year">{year}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
