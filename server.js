import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080; // Use a porta definida pelo ambiente ou 8080

// Serve static files from the 'dist' directory
// Add Cache-Control headers
app.use(express.static(path.join(__dirname, 'dist'), {
  // Set a long cache duration for most static assets (JS, CSS, images, etc.)
  // Vite adds content hashes to filenames, so these can be cached indefinitely
  maxAge: '1y', // Cache for 1 year
  immutable: true, // Indicates that the file will not change

  // However, we need to ensure index.html is always revalidated
  setHeaders: function (res, path) {
    if (path.endsWith('index.html')) {
      // For index.html, prevent caching or force revalidation
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// For any other route, serve the index.html file (for client-side routing)
// This ensures that client-side routing works and the correct index.html is served
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});