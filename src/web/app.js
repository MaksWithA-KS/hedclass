import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import officerRoutes from './routes/officerRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configuring EJS
app.set('view engine', 'ejs');

// Directing Express where to find EJS files
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'hedclass-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.userId ? {
        id: req.session.userId,
        name: req.session.userName,
        role: req.session.userRole
    } : null;
    next();
});

// ROUTES

// Home Page
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', officerRoutes);

// Starting the server
app.listen(PORT, () => {
    console.log(`Application started. Listening on port ${PORT}`);
});