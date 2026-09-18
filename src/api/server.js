import 'dotenv/config';
import express from 'express';
import db from '../web/db.js';

const app = express();
const PORT = Number(process.env.API_PORT) || 4000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the HEdClass REST API. Available routes: /api/programmes'
    });
});

app.get('/api/programmes', async (req, res) => {
    try {
        const [programmes] = await db.execute('SELECT * FROM programmes');
        res.status(200).json({
            status: 'success',
            results: programmes.length,
            data: programmes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve programmes from the database.'
        });
    }
});

app.get('/api/programmes/:id/students', async (req, res) => {
    const programmeId = req.params.id;

    try {
        const [programmeCheck] = await db.execute('SELECT title FROM programmes WHERE programme_id = ?', [programmeId]);

        if (programmeCheck.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Programme not found.'
            });
        }

        const [students] = await db.execute(
            'SELECT student_id, first_name, last_name, final_classification, manual_override, override_rationale FROM progr_students WHERE programme_id = ?',
            [programmeId]
        );

        res.status(200).json({
            status: 'success',
            programme: programmeCheck[0].title,
            results: students.length,
            data: students
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve students for this programme.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Standalone REST API is currently running on http://localhost:${PORT}`);
});