export default function WelcomeOverlay({ visible }) {
  return (
    <div className={`welcome-overlay ${!visible ? 'hidden' : ''}`}>
      <h1 className="welcome-title">Atlas of Stories</h1>
      <p className="welcome-subtitle">
        Search for a book to explore its world on the map
      </p>
    </div>
  );
}
