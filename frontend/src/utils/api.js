const API_BASE = '/api';

/**
 * Wrapper around fetch with timeout and retry logic.
 * - Retries up to `retries` times with exponential backoff on network errors or 5xx.
 * - Times out after `timeoutMs` per attempt.
 */
async function fetchWithRetry(url, options = {}, { retries = 2, timeoutMs = 45000 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);

      // If server returned a 5xx, retry (might be a transient proxy/backend issue)
      if (res.status >= 500 && attempt < retries) {
        lastError = new Error(`Server error ${res.status}`);
        const backoff = 1000 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      // Don't retry on abort (user navigated away) or on final attempt
      if (err.name === 'AbortError') {
        lastError = new Error('Request timed out. The server took too long to respond.');
      }

      if (attempt < retries) {
        const backoff = 1000 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  throw lastError;
}

export async function searchBooks(query) {
  const res = await fetchWithRetry(
    `${API_BASE}/books/search?q=${encodeURIComponent(query)}`,
    {},
    { retries: 1, timeoutMs: 15000 }
  );
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getBookDetails(workId) {
  const res = await fetchWithRetry(
    `${API_BASE}/books/${workId}`,
    {},
    { retries: 1, timeoutMs: 15000 }
  );
  if (!res.ok) throw new Error('Failed to fetch book details');
  return res.json();
}

export async function getLocations(workId, bookParams = {}) {
  const params = new URLSearchParams();
  if (bookParams.title) params.append('title', bookParams.title);
  if (bookParams.author) params.append('author', bookParams.author);
  if (bookParams.year) params.append('year', bookParams.year);
  if (bookParams.coverId) params.append('coverId', bookParams.coverId);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  // Locations can take a while (Gemini + geocoding), use longer timeout
  const res = await fetchWithRetry(
    `${API_BASE}/books/${workId}/locations${queryString}`,
    {},
    { retries: 2, timeoutMs: 60000 }
  );
  if (!res.ok) throw new Error('Failed to fetch locations');
  return res.json();
}

export async function getSurpriseBook() {
  const res = await fetchWithRetry(
    `${API_BASE}/surprise`,
    {},
    { retries: 2, timeoutMs: 30000 }
  );
  if (!res.ok) throw new Error('Surprise failed');
  return res.json();
}
