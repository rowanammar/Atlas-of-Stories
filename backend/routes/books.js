
const express = require('express');
const router = express.Router();
const { searchBooks, getBookDetails } = require('../services/openLibrary');

/**
 * bydwr f Open Library w el user byktb
 * Response: { results: [{ workId, title, author, year, coverId }, ...] }
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required. Use ?q=your+search' });
    }

    console.log(`Searching for: "${query}"`);
    const results = await searchBooks(query);

    res.json({ results });

  } catch (error) {
    console.error('Search route error:', error.message);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

/**
 * btgyb details elktab bel id
 * Params:
 *   workId — The Open Library work ID (e.g. "OL166894W")
 * Response: { title, description, subjects, places }
 */
router.get('/:workId', async (req, res) => {
  try {
    const { workId } = req.params;

    console.log(`Fetching details for: ${workId}`);
    const details = await getBookDetails(workId);

    res.json(details);

  } catch (error) {
    console.error('Book details route error:', error.message);
    res.status(500).json({ error: 'Failed to fetch book details.' });
  }
});

module.exports = router;
