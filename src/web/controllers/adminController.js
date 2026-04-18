import db from '../db.js';
import bcrypt from 'bcrypt';

// Dashboard routing
export const getAdminDashboard = async (req, res) => {
    res.render('admin-dashboard');
};

// Programme Management
export const getProgrammes = async (req, res) => {
    try {
        // Aggregates list of programmes for the table
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
};

// Officer Management
export const getOfficers = async (req, res) => {
    try {
        // Aggregates the programmes assigned to each officer for the table
        const query = `
        SELECT u.*, GROUP_CONCAT(p.title SEPARATOR ', ') AS assigned_programmes
        FROM users u
        LEFT JOIN officer_assignments oa ON u.user_id = oa.user_id
        LEFT JOIN programmes p ON oa.programme_id = p.programme_id
        WHERE u.role = "Classification Officer"
        GROUP BY u.user_id
        `;

        const [officers] = await db.execute(query);
        // Fetches list of available programmes to populate the Assign Programme modal
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
};

// Officer Assignment
export const assignOfficer = async (req, res) => {
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
};

// Officer Deletion
export const deleteOfficer = async (req, res) => {
    const userId = req.params.id;
    try {
        // Remove all relationship mappings
        await db.execute('DELETE FROM officer_assignments WHERE user_id = ?', [userId]);
        // Delete the user record
        await db.execute('DELETE FROM users WHERE user_id = ? AND role = "Classification Officer"', [userId]);
        res.redirect('/admin/officers?success=deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while deleting officer.');
    }
};

// Create a new Officer
export const addOfficer = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        // Hashes the temporary password
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, "Classification Officer")',
            [first_name, last_name, email, hashedPassword]
        );
        res.redirect('/admin/officers?success=created');
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            // Handles existing emails
            res.status(400).send('Error: A user with that email address already exists in the system.');
        } else {
            res.status(500).send('System error while creating new Classification Officer.')
        }
    }
};

// Delete programme
export const deleteProgramme = async (req, res) => {
    const progId = req.params.id;
    try {
        await db.execute('DELETE FROM officer_assignments WHERE programme_id = ?', [progId]);
        await db.execute('DELETE FROM programmes WHERE programme_id = ?', [progId]);
        res.redirect('/admin/programmes?success=deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while deleting programme.');
    }
};

// Programme Updates
export const editProgramme = async (req, res) => {
    const { title, y2, y3 } = req.body;
    const progId = req.params.id;
    try {
        // Allows admins to adjust l5 and L6 weightings per programme
        await db.execute(
            'UPDATE programmes SET title = ?, y2_weighting = ?, y3_weighting = ? WHERE programme_id = ?',
            [title, y2, y3, progId]
        );
        res.redirect('/admin/programmes?success=updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error while updating programme.');
    }
};

// Create Programme
export const addProgramme = async (req, res) => {
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
};