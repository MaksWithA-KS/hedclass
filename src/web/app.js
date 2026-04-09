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
            res.redirect('/admin-dashboard'); //Redirect to administrator dashboard
        } else {
            res.redirect('#'); // Redirect to officer dashboard
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Database connection error. Is MySQL running?' });
    }
});

const isAdmin = (req, res, next) => {
    if (req.session.userRole === 'Institutional Administrator') {
        return next();
    }
    res.redirect('/login');
};

const isOfficer = (req, res, next) => {
    if (req.session.userRole === 'Classification Officer') {
        return next();
    }
    res.redirect('/login');
};

app.get('/admin-dashboard', isAdmin, async (req, res) => {
   res.render('admin-dashboard');
});

app.get('/admin/programmes', isAdmin, async (req, res) => {
    const [progs] = await db.execute('SELECT * FROM programmes');
    res.render('admin/manage-programmes', { programmes: progs, pageTitle: 'Programme Management'});
});

app.get('/admin/officers', isAdmin, async (req, res) => {
    try {
        const [officers] = await db.execute('SELECT * FROM users WHERE role = "Classification Officer"');
        const [programmes] = await db.execute('SELECT * FROM programmes'); // Must include this!
        
        res.render('admin/manage-officers', { 
            officers: officers,
            programmes: programmes, 
            pageTitle: 'Classification Officer Management'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/officers/delete/:id', isAdmin, async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute('DELETE FROM officer_assignments WHERE user_id = ?', [userId]);
        
        await db.execute('DELETE FROM users WHERE user_id = ? AND role = "Classification Officer"', [userId]);
        
        res.redirect('/admin/officers?success=deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while deleting officer.');
    }
});

app.post('/admin/programmes/delete/:id', isAdmin, async (req, res) => {
    const progId = req.params.id;
    try {
        await db.execute('DELETE FROM officer_assignments WHERE programme_id = ?', [progId]);
        
        await db.execute('DELETE FROM programmes WHERE programme_id = ?', [progId]);
        
        res.redirect('/admin/programmes?success=deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while deleting programme.');
    }
});

app.post('/admin/programmes/edit/:id', isAdmin, async (req, res) => {
    const { title, y2, y3 } = req.body;
    const progId = req.params.id;
    
    try {
        await db.execute(
            'UPDATE programmes SET title = ?, y2_weighting = ?, y3_weighting = ? WHERE programme_id = ?',
            [title, y2, y3, progId]
        );
        res.redirect('/admin/programmes?success=updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while updating programme.');
    }
});

app.get('/officer-dashboard', (req, res) => {
    res.render('officer-dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Application started. Listening on port ${PORT}`);
});