
const express = require('express');
const router = express.Router();
const { getCachedLocations, cacheLocations } = require('../services/cache');
const { getBookDetails } = require('../services/openLibrary');
const { extractLocations } = require('../services/gemini');
const { geocodeLocations } = require('../services/geocoder');


router.get('/:workId/locations', async (req, res) => {
  try {
    const { workId } = req.params;
    const { title, author, year, coverId } = req.query;

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing: "${title || workId}"`);
    console.log(`${'='.repeat(50)}`);

    const cached = await getCachedLocations(workId);

    if (cached) {
      console.log('Returning cached result');
      return res.json(cached);
    }

    console.log('Fetching book details from Open Library...');
    const bookDetails = await getBookDetails(workId);

    const bookInfo = {
      title: title || bookDetails.title,
      author: author || 'Unknown Author',
      year: year || null,
      coverId: coverId || null,
      description: bookDetails.description,
      subjects: bookDetails.subjects,
      places: bookDetails.places,
    };

    console.log('Asking Gemini to extract locations...');
    const rawLocations = await extractLocations(bookInfo);

    console.log('Geocoding locations...');
    const geocodedLocations = await geocodeLocations(rawLocations);

    const result = {
      book: {
        workId,
        title: bookInfo.title,
        author: bookInfo.author,
        year: bookInfo.year,
        coverId: bookInfo.coverId,
        description: bookInfo.description,
      },
      locations: geocodedLocations,
    };

    await cacheLocations(workId, result);

    console.log(`Done! Returning ${geocodedLocations.length} locations for "${bookInfo.title}"\n`);
    res.json(result);

  } catch (error) {
    console.error(' Location extraction failed:', error.message);
    res.status(500).json({
      error: 'Failed to extract locations. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
