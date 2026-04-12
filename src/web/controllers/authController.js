import db from '../db.js';
import bcrypt from 'bcrypt';

export const getHomePage = (req, res) => {
    res.render('index');
};

export const getLoginPage = (req, res) => {
    res.render('login', { error: null });
};

export const processLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [username]
        );

        if (users.length === 0) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        req.session.userId = user.user_id;
        req.session.userRole = user.role;
        req.session.userName = user.first_name;

        if (user.role === 'Institutional Administrator') {
            res.redirect('/admin-dashboard');
        } else {
            res.redirect('/officer-dashboard');
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Database connection error. Is MySQL running?' });
    }
};

export const processLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
};