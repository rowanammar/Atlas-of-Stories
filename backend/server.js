require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');


const booksRouter = require('./routes/books');
const locationsRouter = require('./routes/locations');
const surpriseRouter = require('./routes/surprise');


const app = express();
const PORT = process.env.PORT || 8080;


// CORS by5ly el front-end w el back-end yklmo b3d
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite server
    'http://localhost:5174',  // Vite fallback port
    'http://localhost:3000',  
  ],
  credentials: true,
}));

app.use(express.json());

// Health Checkkkkkkkkk
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API ruters
app.use('/api/books', booksRouter);     
app.use('/api/books', locationsRouter); 
app.use('/api/surprise', surpriseRouter); 


const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found. In development, use the Vite dev server on port 5173.' });
    }
  });
});

// ── Start the Server ─────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        📚 Atlas of Stories — Backend         ║');
  console.log(`║        Listening on port ${PORT}                ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  GCP Project:  ${process.env.GCP_PROJECT_ID || '⚠️  NOT SET'}`);
  console.log('');
});
