import { useState, useRef, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import BookPanel from './components/BookPanel';
import MapView from './components/MapView';
import WelcomeOverlay from './components/WelcomeOverlay';
import LoadingOverlay from './components/LoadingOverlay';
import SurpriseButton from './components/SurpriseButton';
import { getLocations } from './utils/api';

function App() {
  const [currentBook, setCurrentBook] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  const handleBookSelected = useCallback(async (book) => {
    setShowWelcome(false);
    setIsLoading(true);
    setCurrentBook(book);
    setLocations([]);
    setError(null);

    const workId = book.key
      ? book.key.replace('/works/', '')
      : book.workId;

    try {
      const data = await getLocations(workId);
      setLocations(data.locations || data || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
      setLocations([]);
      setError('Could not load locations. Please try again.');
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLocationClick = useCallback((loc, index) => {
    if (mapRef.current) {
      mapRef.current.openPopupAt(index);
    }
  }, []);

  const handlePanelClose = useCallback(() => {
    setCurrentBook(null);
    setLocations([]);
    setShowWelcome(true);
  }, []);

  return (
    <>
      <MapView ref={mapRef} locations={locations} />
      <SearchBar onBookSelected={handleBookSelected} />

      {showWelcome && !currentBook && <WelcomeOverlay visible={true} />}
      {isLoading && <LoadingOverlay />}

      {currentBook && (
        <BookPanel
          book={currentBook}
          locations={locations}
          onLocationClick={handleLocationClick}
          onClose={handlePanelClose}
        />
      )}

      <SurpriseButton onBookSelected={handleBookSelected} />

      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          <span className="error-toast-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </>
  );
}

export default App;
