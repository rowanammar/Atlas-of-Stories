import { useState, useRef, useEffect, useCallback } from 'react';
import { useBookSearch } from '../hooks/useBookSearch';
import SearchDropdown from './SearchDropdown';

export default function SearchBar({ onBookSelected }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const { results, isLoading } = useBookSearch(query);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when results arrive — but NOT if user just selected a book
  useEffect(() => {
    if (results.length > 0 && !hasSelected) {
      setShowDropdown(true);
    }
  }, [results, hasSelected]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }

  const handleSelect = useCallback((book) => {
    setHasSelected(true);
    setShowDropdown(false);
    setQuery(book.title);
    onBookSelected(book);
    document.activeElement?.blur();
  }, [onBookSelected]);

  function handleClear() {
    setQuery('');
    setShowDropdown(false);
    setHasSelected(false);
  }

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    // User is typing again — reset the "selected" guard
    if (hasSelected) setHasSelected(false);
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          id="book-search-input"
          className="search-input"
          type="text"
          placeholder="Search for a book…"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && !hasSelected && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {isLoading && <div className="search-spinner" />}

        {query && !isLoading && (
          <button className="search-clear" onClick={handleClear} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {showDropdown && query.trim().length >= 2 && !hasSelected && (
        <SearchDropdown results={results} onSelect={handleSelect} />
      )}
    </div>
  );
}
