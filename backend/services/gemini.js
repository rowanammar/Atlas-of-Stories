

const { VertexAI } = require('@google-cloud/vertexai');
const { buildPrompt } = require('../prompts/extractLocations');

// bndy Vertex AI project ID and region.
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1',
});

// Get the Gemini 2.0 Flash model — it's fast and cost-effective
const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.3,     // Low temperature = more factual, less creative
    maxOutputTokens: 4096, // Enough for ~15 locations with all fields
  },
});

/**
 * cleanJsonResponse(text)
 * @param {string} text — Raw Gemini response
 * @returns {string} — Cleaned JSON string
 */
function cleanJsonResponse(text) {
  let cleaned = text.trim();

  // Remove ```json ... ``` or ``` ... ``` wrappers
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
  }

  return cleaned.trim();
}

/**
 * extractLocations
 *bta5od el book data w bt3ml prompt
 * @param {object} bookInfo — { title, author, year, description, subjects, places }
 * @returns {Array} — Array of location objects from Gemini
 */
async function extractLocations(bookInfo) {
  const prompt = buildPrompt(bookInfo);
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Calling Gemini (attempt ${attempt}) for "${bookInfo.title}"...`);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.candidates[0].content.parts[0].text;

      const cleaned = cleanJsonResponse(text);
      const locations = JSON.parse(cleaned);

      if (!Array.isArray(locations) || locations.length === 0) {
        throw new Error('Gemini returned empty or non-array response');
      }

      console.log(`Gemini extracted ${locations.length} locations for "${bookInfo.title}"`);
      return locations;

    } catch (error) {
      lastError = error;
      console.error(`Gemini attempt ${attempt} failed:`, error.message);

      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(' Gemini extraction failed after 2 attempts');
  throw lastError;
}

module.exports = { extractLocations };
