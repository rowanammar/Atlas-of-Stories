const API_BASE = '/api';

export async function searchBooks(query) {
  const res = await fetch(`${API_BASE}/books/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getBookDetails(workId) {
  const res = await fetch(`${API_BASE}/books/${workId}`);
  if (!res.ok) throw new Error('Failed to fetch book details');
  return res.json();
}

export async function getLocations(workId) {
  const res = await fetch(`${API_BASE}/books/${workId}/locations`);
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
}

export async function getSurpriseBook() {
  const res = await fetch(`${API_BASE}/surprise`);
  if (!res.ok) throw new Error('Surprise failed');
  return res.json();
}
