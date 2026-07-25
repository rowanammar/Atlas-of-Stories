
const BASE_URL = 'https://openlibrary.org';

const HEADERS = {
  'User-Agent': 'AtlasOfStories/1.0',
};

/**
 * @param {string} query — The search term
 * @returns {Array} — Array of book objects: { workId, title, author, year, coverId }
 */

async function searchBooks(query) {
  try {
    const url = `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,first_publish_year,cover_i`;

    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    // Transform ly cleaner format
    return data.docs.map((doc) => ({
      workId: doc.key.replace('/works/', ''),
      title: doc.title,
      author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
      year: doc.first_publish_year || null,
      coverId: doc.cover_i || null,
    }));
  } catch (error) {
    console.error('Open Library search error:', error.message);
    return [];
  }
}

/**
 * getBookDetails(workId)
 * bngyb el details ely ndyha ly gemini
 * @param {string} workId 
 * @returns {object} 
 */
async function getBookDetails(workId) {
  try {
    const url = `${BASE_URL}/works/${workId}.json`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();

    let description = '';
    if (typeof data.description === 'string') {
      description = data.description;
    } else if (data.description && data.description.value) {
      description = data.description.value;
    }

    return {
      title: data.title || 'Unknown Title',
      description: description,
      subjects: data.subjects || [],
      // "subject_places" is a list of real places mentioned in the book's metadata
      places: data.subject_places || [],
    };
  } catch (error) {
    console.error('Open Library details error:', error.message);
    throw new Error('Failed to fetch book details from Open Library');
  }
}

module.exports = {
  searchBooks,
  getBookDetails,
};
