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
            res.redirect('/officer-dashboard'); // Redirect to officer dashboard
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
    try {
        const query = `
        SELECT p.*,
            GROUP_CONCAT(CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') AS assigned_officers
            FROM programmes p
            LEFT JOIN officer_assignments oa ON p.programme_id = oa.programme_id
            LEFT JOIN users u ON oa.user_id = u.user_id
            GROUP BY p.programme_id
        `;
        const [progs] = await db.execute(query);
        res.render('admin/manage-programmes', {
            programmes: progs,
            pageTitle: 'Programme Management'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading programmes.');
    }
});

app.get('/admin/officers', isAdmin, async (req, res) => {
    try {
        const query = `
        SELECT u.*, GROUP_CONCAT(p.title SEPARATOR ', ') AS assigned_programmes
        FROM users u
        LEFT JOIN officer_assignments oa ON u.user_id = oa.user_id
        LEFT JOIN programmes p ON oa.programme_id = p.programme_id
        WHERE u.role = "Classification Officer"
        GROUP BY u.user_id
        `;

        const [officers] = await db.execute(query);
        const [programmes] = await db.execute('SELECT * FROM programmes');

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

app.post('/admin/assign-officer', isAdmin, async (req, res) => {
    const { user_id, programme_id } = req.body;

    try {
        await db.execute(
            'INSERT IGNORE INTO officer_assignments (user_id, programme_id) VALUES (?, ?)',
            [user_id, programme_id]
        );
        res.redirect('/admin/officers?success=assigned');
    } catch (err) {
        console.error('Database Error during assignment', err);
        res.status(500).send('System error while assigning officer.');
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

app.post('/admin/officers/add', isAdmin, async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        await db.execute(
            'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, "Classification Officer")',
            [first_name, last_name, email, password]
        );

        res.redirect('/admin/officers?success=created');
    } catch (err) {
        console.error(err);

        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).send('Error: A user with that email address already exists in the system.');
        } else {
            res.status(500).send('System error while creating new Classification Officer.')
        }
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

app.post('/admin/programmes/add', isAdmin, async (req,res) => {
    const { title, y2, y3 } = req.body;

    try {
        await db.execute(
            'INSERT INTO programmes (title, y2_weighting, y3_weighting) VALUES (?, ?, ?)',
            [title, y2, y3]
        );
        res.redirect('/admin/programmes?success=created');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while creating new programme.');
    }
});

app.get('/officer-dashboard', isOfficer, async (req, res) => {
    try {
        const query = `
        SELECT p.programme_id, p.title, p.y2_weighting, p.y3_weighting
        FROM programmes p
        JOIN officer_assignments oa ON p.programme_id = oa.programme_id
        WHERE oa.user_id = ?
        `;

        const [assignedProgrammes] = await db.execute(query, [req.session.userId]);

        res.render('officer-dashboard', {
            programmes: assignedProgrammes,
            pageTitle: 'My Programmes'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading Officer Dashboard');
    }
});

app.get('/officer/programme/:id/students', isOfficer, async (req, res) => {
    const progId = req.params.id;

    try {
        const [authCheck] = await db.execute(
            'SELECT * FROM officer_assignments WHERE user_id = ? AND programme_id = ?',
            [req.session.userId, progId]
        );
        if (authCheck.length === 0) {
            return res.status(403).send('Unauthorised: You are not assigned to manage this programme.');
        }

        const [progData] = await db.execute('SELECT * FROM programmes WHERE programme_id = ?', [progId]);

        const query = `
        SELECT
            s.student_id,
            s.first_name,
            s.last_name,
            s.final_classification,
            s.manual_override,
            ROUND(SUM(CASE WHEN m.academic_year = 2 THEN g.mark * m.credits ELSE 0 END) /
                NULLIF(SUM(CASE WHEN m.academic_year = 2 THEN m.credits ELSE 0 END), 0), 2) AS level_5_average,
            ROUND(SUM(CASE WHEN m.academic_year = 3 THEN g.mark * m.credits ELSE 0 END) / 
                NULLIF(SUM(CASE WHEN m.academic_year = 3 THEN m.credits ELSE 0 END), 0), 2) AS level_6_average
        FROM progr_students s
        LEFT JOIN progr_grades g ON s.student_id = g.student_id
        LEFT JOIN progr_modules m ON g.module_id = m.module_id
        WHERE s.programme_id = ?
        GROUP BY s.student_id
        `;

        const [students] = await db.execute(query, [progId]);

        res.render('officer/student-roster', {
            programme: progData[0],
            students: students,
            pageTitle: 'Student Roster'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('System error loading student roster.');
    }
});

app.get('/officer/student/:id', isOfficer, async (req, res) => {
    const studentId = req.params.id;

    try {
        const [studentData] = await db.execute(`
            SELECT s.*, p.title as programme_title
            FROM progr_students s
            JOIN programmes p ON s.programme_id = p.programme_id
            WHERE s.student_id = ?
        `, [studentId]);

        if (studentData.length === 0) {
            return res.status(404).send('Student not found');
        }

        const student = studentData[0];

        const [authCheck] = await db.execute(
            'SELECT * FROM officer_assignments WHERE user_id = ? AND programme_id = ?',
            [req.session.userId, student.programme_id]
        );

        if (authCheck.length === 0) {
            return res.status(403).send('Unauthorised: You cannot view students outside of your assigned programmes.');
        }
        const [grades] = await db.execute(`
            SELECT g.grade_id, g.mark, g.is_resit, m.module_id, m.title, m.credits, m.academic_year
            FROM progr_grades g
            JOIN progr_modules m ON g.module_id = m.module_id
            WHERE g.student_id = ?
            ORDER BY m.academic_year ASC, m.module_id ASC
            `, [studentId]);

        res.render('officer/student-profile', {
            student: student,
            grades: grades,
            pageTitle: 'Student Profile'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('System error loading student profile.')
    }
});

app.post('/officer/programme/:id/calculate', isOfficer, async (req, res) => {
    const progId = req.params.id;

    try {
        const [progData] = await db.execute('SELECT y2_weighting, y3_weighting FROM programmes WHERE programme_id = ?', [progId]);
        const y2Weight = parseFloat(progData[0].y2_weighting);
        const y3Weight = parseFloat(progData[0].y3_weighting);

        const query = `
            SELECT
                s.student_id,
                ROUND(SUM(CASE WHEN m.academic_year = 2 THEN g.mark * m.credits ELSE 0 END) / 
                      NULLIF(SUM(CASE WHEN m.academic_year = 2 THEN m.credits ELSE 0 END), 0), 2) AS l5_avg,
                ROUND(SUM(CASE WHEN m.academic_year = 3 THEN g.mark * m.credits ELSE 0 END) / 
                      NULLIF(SUM(CASE WHEN m.academic_year = 3 THEN m.credits ELSE 0 END), 0), 2) AS l6_avg
            FROM progr_students s
            LEFT JOIN progr_grades g ON s.student_id = g.student_id
            LEFT JOIN progr_modules m ON g.module_id = m.module_id
            WHERE s.programme_id = ? AND s.manual_override = FALSE
            GROUP BY s.student_id
        `;

        const [students] = await db.execute(query, [progId]);

        for (let student of students) {
            if (student.l5_avg !== null && student.l6_avg !== null) {
                const finalMark = (student.l5_avg * y2Weight) + (student.l6_avg * y3Weight);
                let classification = 'Pending';

                if (finalMark >= 70) {
                    classification = 'First Class Honours (1st)';
                } else if (finalMark >= 60) {
                    classification = 'Upper Second Class (2:1)';
                } else if (finalMark >= 50) {
                    classification = 'Lower Second Class (2:2)';
                } else if (finalMark >= 40) {
                    classification = 'Third Class Honours (3rd)';
                } else {
                    classification = 'Fail';
                }

                await db.execute(
                    'UPDATE progr_students SET final_classification = ? WHERE student_id = ?',
                    [classification, student.student_id]
                );
            }
        }
        res.redirect('/officer/programme/' + progId + '/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error executing classification rules.');
    }
});

app.post('/officer/programme/:id/student/add', isOfficer, async (req, res) => {
    const progId = req.params.id;
    const { student_id, first_name, last_name } = req.body;

    try {
        const [authCheck] = await db.execute(
            'SELECT * FROM officer_assignments WHERE user_id = ? AND programme_id = ?',
            [req.session.userId, progId]
        );

        if (authCheck.length === 0) {
            return res.status(403).send('Unauthorised to add students to this programme.');
        }

        await db.execute(
            'INSERT INTO progr_students (student_id, first_name, last_name, programme_id, final_classification) VALUES (?, ?, ?, ?, ?)',
            [student_id, first_name, last_name, progId, 'Pending']
        );
        res.redirect('/officer/programme/' + progId + '/students');
    } catch (err) {
        console.error(err);

        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).send('Error: A student with that ID number already exists in the system');
        } else {
            res.status(500).send('System error while adding candidate.');
        }
    }
});

app.post('/officer/student/:id/override', isOfficer, async (req, res) => {
    const studentId = req.params.id;
    const { new_classification } = req.body;

    try {
        const [studentData] = await db.execute('SELECT programme_id FROM progr_students WHERE student_id = ?', [studentId]);

        if (studentData.length === 0) {
            return res.status(404).send('Student not found');
        }

        const [authCheck] = await db.execute(
            'SELECT * FROM officer_assignments WHERE user_id = ? AND programme_id = ?',
            [req.session.userId, studentData[0].programme_id]
        );

        if (authCheck.length === 0) {
            return res.status(403).send('Unauthorised to modify this student');
        }

        await db.execute(
            'UPDATE progr_students SET final_classification = ?, manual_override = TRUE WHERE student_id = ?',
            [new_classification, studentId]
        );

        res.redirect('/officer/programme/' + studentData[0].programme_id + '/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error applying manual override.')
    }
});

app.post('/officer/student/:studentId/grade/:gradeId/edit', isOfficer, async (req, res) => {
    const { studentId, gradeId } = req.params;
    const { new_mark } = req.body;

    try {
        const [studentData] = await db.execute('SELECT programme_id FROM progr_students WHERE student_id = ?', [studentId]);

        if (studentData.length === 0) {
            return res.status(404).send('Student not found.');
        }

        const [authCheck] = await db.execute(
            'SELECT * FROM officer_assignments WHERE user_id = ? AND programme_id = ?',
            [req.session.userId, studentData[0].programme_id]);

        if (authCheck.length === 0) {
            return res.status(403).send('Unauthorised to modify records for this programme.');
        }

        await db.execute(
            'UPDATE progr_grades SET mark = ? WHERE grade_id = ? AND student_id = ?',
            [new_mark, gradeId, studentId]
        );

        res.redirect('/officer/student/' + studentId);

    } catch (err) {
        console.error(err);
        res.status(500).send('System error updating module mark.')
    }
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