import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import officerRoutes from './routes/officerRoutes.js';

// ES Module workaround to define the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.WEB_PORT) || 3000;

// Configuring EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, '../../public'))); // Directing where to find image files
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configuring sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'hedclass-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Extracting user session data
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? {
        id: req.session.userId,
        name: req.session.userName,
        role: req.session.userRole
    } : null;
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', officerRoutes);

// Starting the server
app.listen(PORT, () => {
    console.log(`Application started. Listening on port ${PORT}`);
});