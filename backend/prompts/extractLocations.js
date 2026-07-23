/**
 * @param {object} bookInfo — { title, author, year, description, subjects, places }
 * @returns {string} — The full prompt to send to Gemini
 */
function buildPrompt(bookInfo) {
  const { title, author, year, description, subjects, places } = bookInfo;

  return `You are a literary geography expert. Your task is to identify all significant REAL-WORLD locations connected to the book described below.

## Book Information
- **Title:** ${title}
- **Author:** ${author || 'Unknown'}
- **Year:** ${year || 'Unknown'}
- **Description:** ${description || 'No description available.'}
- **Subjects:** ${subjects && subjects.length > 0 ? subjects.slice(0, 15).join(', ') : 'None listed'}
- **Known places:** ${places && places.length > 0 ? places.join(', ') : 'None listed'}

## Your Task
Identify **8 to 15** real-world locations that are significant to this book. Include:

1. **Plot settings** — Where does the story take place? (cities, neighborhoods, buildings)
2. **Author connections** — Where was the author born, lived, or wrote this book?
3. **Inspirations** — Real places that inspired fictional locations in the book
4. **Historical locations** — Real events or places referenced in the story

## Output Format
Return ONLY a valid JSON array (no markdown, no code fences, no explanation). Each object must have:

\`\`\`json
[
  {
    "name": "Full place name (e.g., 'St. Petersburg, Russia')",
    "type": "plot_setting" | "author_connection" | "inspiration" | "historical",
    "significance": "One sentence explaining why this place matters to the book (max 120 chars)",
    "trivia": "A fascinating, lesser-known fact connecting this place to the book (max 150 chars)",
    "quote": "A relevant quote from the book mentioning or evoking this place, if available. Otherwise leave empty string."
  }
]
\`\`\`

## Rules
- Every location MUST be a real, geocodable place (not fictional like "Narnia" or "Hogwarts")
- Use the most specific name possible (e.g., "Haymarket Square, St. Petersburg, Russia" not just "Russia")
- Include a mix of all 4 types when possible
- Return ONLY the JSON array — no other text`;
}

module.exports = { buildPrompt };
