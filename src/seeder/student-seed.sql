-- Inserting mock students
INSERT INTO progr_students (student_id, first_name, last_name, programme_id, final_classification)
VALUES
(10001, 'Luke', 'Skywalker', 1, 'Pending'),
(10002, 'Lara', 'Croft', 1, 'Pending');

-- Creating test modules
INSERT INTO progr_modules (module_id, title, credits, academic_year, programme_id)
VALUES
('CS201', 'Advanced Programming', 20, 2, 1),
('CS202', 'Databases', 20, 2, 1),
('CS301', 'Language Learning Models', 20, 3, 1),
('CS302', 'Final Year Project', 40, 3, 1);

-- Inserting mock grades for previously inserted students
INSERT INTO progr_grades (student_id, module_id, mark, is_resit)
VALUES
(10001, 'CS201', 75, FALSE),
(10001, 'CS202', 82, FALSE),
(10001, 'CS301', 68, FALSE),
(10001, 'CS302', 74, FALSE),
(10002, 'CS201', 55, FALSE),
(10002, 'CS202', 60, FALSE),
(10002, 'CS301', 62, FALSE),
(10002, 'CS302', 65, FALSE);