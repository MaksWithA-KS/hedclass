import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import session from 'express-session';

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

// ROUTES

// Home Page
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND password_hash = ?',
            [username, password]
        );

        if (users.length === 0) {
            return res.render('login', { error: 'Invalid email or password.' });
        }
        const user = users[0];

        req.session.userId = user.user_id;
        req.session.userRole = user.role;
        req.session.userName = user.first_name;

        if (user.role === 'Institutional Administrator') {
            res.redirect('#'); //Redirect to administrator dashboard
        } else {
            res.redirect('#'); // Redirect to officer dashboard
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Database connection error. Is MySQL running?' });
    }
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Application started. Listening on port ${PORT}`);
});