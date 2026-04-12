import db from '../db.js';

export const getOfficerDashboard = async (req, res) => {
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
};

export const getStudentRoster = async (req, res) => {
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
            s.student_id, s.first_name, s.last_name, s.final_classification, s.manual_override,
            ROUND(SUM(CASE WHEN m.academic_year = 2 THEN (CASE WHEN g.is_resit = 1 AND g.mark > 40 THEN 40 ELSE g.mark END) * m.credits ELSE 0 END) /
                NULLIF(SUM(CASE WHEN m.academic_year = 2 THEN m.credits ELSE 0 END), 0), 2) AS level_5_average,
            ROUND(SUM(CASE WHEN m.academic_year = 3 THEN (CASE WHEN g.is_resit = 1 AND g.mark > 40 THEN 40 ELSE g.mark END) * m.credits ELSE 0 END) / 
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
};

export const getStudentProfile = async (req, res) => {
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
};

export const calculateGrades = async (req, res) => {
    const progId = req.params.id;
    try {
        const [progData] = await db.execute('SELECT y2_weighting, y3_weighting FROM programmes WHERE programme_id = ?', [progId]);
        const y2Weight = parseFloat(progData[0].y2_weighting);
        const y3Weight = parseFloat(progData[0].y3_weighting);

        const query = `
            SELECT
                s.student_id,
                SUM(CASE WHEN m.academic_year = 1 AND g.mark >= 40 THEN m.credits ELSE 0 END) AS y1_credits,
                SUM(CASE WHEN m.academic_year = 2 AND g.mark >= 40 THEN m.credits ELSE 0 END) AS y2_credits,
                SUM(CASE WHEN m.academic_year = 3 AND g.mark >= 40 THEN m.credits ELSE 0 END) AS y3_credits,
                SUM(CASE WHEN g.mark < 40 THEN 1 ELSE 0 END) AS total_fails,
                ROUND(SUM(CASE WHEN m.academic_year = 2 THEN (CASE WHEN g.is_resit = 1 AND g.mark > 40 THEN 40 ELSE g.mark END) * m.credits ELSE 0 END) / 
                      NULLIF(SUM(CASE WHEN m.academic_year = 2 THEN m.credits ELSE 0 END), 0), 2) AS l5_avg,
                ROUND(SUM(CASE WHEN m.academic_year = 3 THEN (CASE WHEN g.is_resit = 1 AND g.mark > 40 THEN 40 ELSE g.mark END) * m.credits ELSE 0 END) / 
                      NULLIF(SUM(CASE WHEN m.academic_year = 3 THEN m.credits ELSE 0 END), 0), 2) AS l6_avg
            FROM progr_students s
            LEFT JOIN progr_grades g ON s.student_id = g.student_id
            LEFT JOIN progr_modules m ON g.module_id = m.module_id
            WHERE s.programme_id = ? AND s.manual_override = FALSE
            GROUP BY s.student_id
        `;
        const [students] = await db.execute(query, [progId]);

        for (let student of students) {
            let classification = 'Pending';

            if (student.y1_credits < 120 || student.y2_credits < 120 || student.y3_credits < 120 || student.total_fails > 0) {
                classification = 'Not eligiblefor Honours Classification';
            } else if (student.l5_avg !== null && student.l6_avg !== null) {
                const finalMark = (student.l5_avg * y2Weight) + (student.l6_avg * y3Weight);

                if (finalMark >= 70) classification = 'First Class Honours (1st)';
                else if (finalMark >= 60) classification = 'Upper Second Class (2:1)';
                else if (finalMark >= 50) classification = 'Lower Second Class (2:2)';
                else if (finalMark >= 40) classification = 'Third Class Honours (3rd)';
                else classification = 'Fail';
            }
            await db.execute(
                'UPDATE progr_students SET final_classification = ? WHERE student_id = ?',
                [classification, student.student_id]
            );
        }
        res.redirect('/officer/programme/' + progId + '/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error executing classification rules.');
    }
};

export const addStudent = async (req, res) => {
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
};

export const overrideClassification = async (req, res) => {
    const studentId = req.params.id;
    const { new_classification, rationale } = req.body;
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
            'UPDATE progr_students SET final_classification = ?, manual_override = TRUE, override_rationale = ? WHERE student_id = ?',
            [new_classification, rationale, studentId]
        );

        res.redirect('/officer/programme/' + studentData[0].programme_id + '/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('System error applying manual override.')
    }
};

export const editGrade = async (req, res) => {
    const { studentId, gradeId } = req.params;
    const { new_mark, is_resit } = req.body;
    const resitValue = is_resit === 'on' ? 1 : 0;
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
            'UPDATE progr_grades SET mark = ?, is_resit = ? WHERE grade_id = ? AND student_id = ?',
            [new_mark, resitValue, gradeId, studentId]
        );

        res.redirect('/officer/student/' + studentId);
    } catch (err) {
        console.error(err);
        res.status(500).send('System error updating module mark.')
    }
};

export const exportRoster = async (req, res) => {
    const progId = req.params.id;

    try {
        const [authCheck] = await db.execute(
            'SELECT * FROM officer_assignments WHERE user_id = ? AND programme_id = ?',
            [req.session.userId, progId]
        );

        if (authCheck.length === 0) {
            return res.status(403).send('Unauthorised to export records for this programme.');
        }

        const [progData] = await db.execute('SELECT title FROM programmes WHERE programme_id = ?', [progId]);
        const safeTitle = progData[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const query = `
        SELECT
            s.student_id, s.first_name, s.last_name, s.final_classification, s.manual_override,
            ROUND(SUM(CASE WHEN m.academic_year = 2 THEN (CASE WHEN g.is_resit = 1 AND g.mark > 40 THEN 40 ELSE g.mark END) * m.credits ELSE 0 END) /
                NULLIF(SUM(CASE WHEN m.academic_year = 2 THEN m.credits ELSE 0 END), 0), 2) AS level_5_average,
            ROUND(SUM(CASE WHEN m.academic_year = 3 THEN (CASE WHEN g.is_resit = 1 AND g.mark > 40 THEN 40 ELSE g.mark END) * m.credits ELSE 0 END) / 
                NULLIF(SUM(CASE WHEN m.academic_year = 3 THEN m.credits ELSE 0 END), 0), 2) AS level_6_average
        FROM progr_students s
        LEFT JOIN progr_grades g ON s.student_id = g.student_id
        LEFT JOIN progr_modules m ON g.module_id = m.module_id
        WHERE s.programme_id = ?
        GROUP BY s.student_id
        `;

        const [students] = await db.execute(query, [progId]);

        let csv = 'Student ID,First Name,Last Name,Level 5 Average,Level 6 Average,Final Classification,Manual Override\n';

        students.forEach(student => {
            const l5 = student.level_5_average || 'N/A';
            const l6 = student.level_6_average || 'N/A';
            const classification = student.final_classification || 'Pending';
            const override = student.manual_override ? 'Yes' : 'No';

            csv += `"${student.student_id}","${student.first_name}","${student.last_name}",${l5},${l6},"${classification}","${override}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`board_export_${safeTitle}.csv`);
        return res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('System error generating CSV export.');
    }
};