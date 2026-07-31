const express = require('express');
const router = express.Router();
const { getRandomCachedBook } = require('../services/cache');

router.get('/', async (req, res) => {
  try {
    const cachedData = await getRandomCachedBook();

    if (!cachedData || !cachedData.book) {
      return res.status(404).json({ error: 'No stories explored yet to surprise you with. Search for one first!' });
    }

    let author = cachedData.book.author;
    let coverId = cachedData.book.coverId;
    let year = cachedData.book.year;

    // Backfill metadata for old cache entries that didn't store coverId or author
    if (!coverId || author === 'Unknown Author') {
      try {
        const { searchBooks } = require('../services/openLibrary');
        const searchResults = await searchBooks(cachedData.book.title);
        if (searchResults && searchResults.length > 0) {
          const match = searchResults[0];
          author = match.author !== 'Unknown Author' ? match.author : author;
          coverId = match.coverId || coverId;
          year = match.year || year;
        }
      } catch (err) {
        console.warn('Failed to backfill missing metadata for surprise book:', err.message);
      }
    }

    // Format for the frontend so it matches the expected book object structure
    const book = {
      workId: cachedData.workId,
      title: cachedData.book.title,
      author,
      year,
      coverId,
    };

    console.log(`🎲 Surprise pick from cache: "${book.title}" by ${book.author}`);

    res.json(book);

  } catch (error) {
    console.error('Surprise route error:', error.message);
    res.status(500).json({ error: 'Could not pick a surprise book.' });
  }
});

module.exports = router;
