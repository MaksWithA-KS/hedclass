import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configuring EJS
app.set('view engine', 'ejs');

// Directing Express where to find EJS files
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.send('HEdClass is successfully running');
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Application started. Listening on port ${PORT}`);
});