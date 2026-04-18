import db from '../db.js';
import bcrypt from 'bcrypt';

// Public Route Controllers
export const getHomePage = (req, res) => {
    // Renders the landing page.
    res.render('index');
};

export const getLoginPage = (req, res) => {
    // Renders the log in form
    res.render('login', { error: null });
};

// Authentication engine
export const processLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Parametrised query
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [username]
        );

        // If no user is found, reject the attempt
        if (users.length === 0) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const user = users[0];

        // Compare the submitted plaintext password aqainst stored bcrypt hash
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        // Session initialisation
        req.session.userId = user.user_id;
        req.session.userRole = user.role;
        req.session.userName = user.first_name;

        // Role-Based Routing
        if (user.role === 'Institutional Administrator') {
            res.redirect('/admin-dashboard');
        } else {
            res.redirect('/officer-dashboard');
        }
    } catch (err) {
        console.error(err);
        // Error handling to prevent crash on database timeout
        res.render('login', { error: 'Database connection error. Is MySQL running?' });
    }
};

// Redirection to respective dashboard
export const dashboardRedirect = (req, res) => {
    // Check that a valid session and role exist
    if (!req.session || !req.session.userRole) {
        return res.redirect('/'); 
    }

    // Route authenticated user to their specific workspace
    if (req.session.userRole === 'Institutional Administrator') {
        return res.redirect('/admin-dashboard');
    } else if (req.session.userRole === 'Classification Officer') {
        return res.redirect('/officer-dashboard');
    } else {
        // Fallback for unrecognised roles
        return res.redirect('/'); 
    }
};

// Session Termination
export const processLogout = (req, res) => {
    // Securely destroys the session data on server
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        // Redirect back to public landing page
        res.redirect('/');
    });
};