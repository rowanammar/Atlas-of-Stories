

const express = require('express');
const router = express.Router();
const surpriseBooks = require('../data/surpriseBooks');

let lastPickIndex = -1;

router.get('/', async (req, res) => {
  try {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * surpriseBooks.length);
    } while (randomIndex === lastPickIndex && surpriseBooks.length > 1);

    lastPickIndex = randomIndex;

    const book = surpriseBooks[randomIndex];
    console.log(`🎲 Surprise pick: "${book.title}" by ${book.author}`);

    res.json(book);

  } catch (error) {
    console.error('Surprise route error:', error.message);
    res.status(500).json({ error: 'Could not pick a surprise book.' });
  }
});

module.exports = router;
