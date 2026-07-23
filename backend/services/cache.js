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
 * fallback lel surprise me
 */
async function getRandomCachedBook() {
  try {
    const snapshot = await db.collection(COLLECTION).limit(20).get();

    if (snapshot.empty) {
      return null;
    }

    const docs = snapshot.docs;
    const randomDoc = docs[Math.floor(Math.random() * docs.length)];

    return {
      workId: randomDoc.id,
      ...randomDoc.data(),
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
