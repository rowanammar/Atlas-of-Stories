const { Firestore } = require('@google-cloud/firestore');

// Initialize Firestore — it automatically uses your GCP_PROJECT_ID
// from the environment and your gcloud credentials locally.
const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
});

// Tfirestore collection bn-save fyh ellocation
const COLLECTION = 'book-locations';

/**
 * @param {string} workId — The Open Library work ID (e.g. "OL166894W")
 * @returns {object|null} — The cached data if it exists, or null if not found.
 */
async function getCachedLocations(workId) {
  try {
    const doc = await db.collection(COLLECTION).doc(workId).get();

    if (doc.exists) {
      console.log(` Cache HIT for ${workId}`);
      return doc.data();
    }

    console.log(`Cache MISS for ${workId}`);
    return null;
  } catch (error) {
    console.error('Cache read error:', error.message);
    return null; //law mafeesh cache mtdysh error kamel 3ady
  }
}

/**

 * bn-save fl cache  3shan mndysh gemini tany 3la nfs elktab
 * @param {string} workId — The Open Library work ID
 * @param {object} data — The full response object (book info + locations array)
 */
async function cacheLocations(workId, data) {
  try {
    await db.collection(COLLECTION).doc(workId).set({
      ...data,
      cachedAt: new Date().toISOString(), 
    });
    console.log(`Cached locations for ${workId}`);
  } catch (error) {
    console.error('Cache write error:', error.message);
  }
}

/**
 * Curated list of classic book work IDs saved in Firestore.
 * The surprise feature picks randomly from this list only.
 */
const CURATED_CLASSICS = [
  'OL10263W',    // Le Petit Prince (The Little Prince)
  'OL103123W',   // Fahrenheit 451
  'OL1100007W',  // Around the World in 80 Days
  'OL1168007W',  // Animal Farm
  'OL1168083W',  // Nineteen Eighty-Four
  'OL1599746W',  // ثرثرة فوق النيل (Chitchat on the Nile)
  'OL166894W',   // Crime and Punishment
  'OL1865528W',  // The Bell Jar
  'OL262421W',   // The Adventures of Sherlock Holmes
  'OL262454W',   // The Hound of the Baskervilles
  'OL262496W',   // A Study in Scarlet
  'OL267096W',   // Anna Karenina
  'OL27448W',    // The Lord of the Rings
  'OL3140822W',  // To Kill a Mockingbird
  'OL3171069W',  // The Haunting of Hill House
  'OL3335245W',  // The Catcher in the Rye
  'OL36287W',    // The Count of Monte Cristo
  'OL41059W',    // The Tell-Tale Heart
  'OL41078W',    // The Fall of the House of Usher
  'OL455327W',   // Lord of the Flies
  'OL45804W',    // Fantastic Mr Fox
  'OL468431W',   // The Great Gatsby
  'OL471509W',   // The A.B.C. Murders
  'OL471565W',   // And Then There Were None
  'OL471576W',   // Murder on the Orient Express
  'OL498556W',   // Metamorphosis
  'OL66554W',    // Pride and Prejudice
  'OL8193416W',  // The Picture of Dorian Gray
  'OL796465W',   // The Alchemist
  'OL5781992W',  // The Kite Runner
  'OL5819456W',  // The Book Thief
  'OL274505W',   // One Hundred Years of Solitude
  'OL278437W',   // The Shadow of the Wind
  'OL2827199W',  // Life of Pi
];

/**
 * Pick a random book from the curated classics list.
 * Fetches the specific document from Firestore by its work ID.
 */
async function getRandomCachedBook() {
  try {
    const randomId = CURATED_CLASSICS[Math.floor(Math.random() * CURATED_CLASSICS.length)];
    const doc = await db.collection(COLLECTION).doc(randomId).get();

    if (!doc.exists) {
      // If the picked doc doesn't exist in cache, try a few more before giving up
      for (let i = 0; i < 5; i++) {
        const fallbackId = CURATED_CLASSICS[Math.floor(Math.random() * CURATED_CLASSICS.length)];
        const fallbackDoc = await db.collection(COLLECTION).doc(fallbackId).get();
        if (fallbackDoc.exists) {
          return { workId: fallbackDoc.id, ...fallbackDoc.data() };
        }
      }
      return null;
    }

    return {
      workId: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Random cache read error:', error.message);
    return null;
  }
}

module.exports = {
  getCachedLocations,
  cacheLocations,
  getRandomCachedBook,
};
