-- 1. Users (Admin: Gandalf | Officers: Sherlock & Obi-Wan)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('gandalf@qub.ac.uk', '$2a$10$2nFvorCBT7uaxfKL/fkGK.GOGK9vguyIVC3inSc24sjdm8G6Tl.De', 'Gandalf', 'The Grey', 'Institutional Administrator'),
('holmes@qub.ac.uk', '$2a$10$2nFvorCBT7uaxfKL/fkGK.GOGK9vguyIVC3inSc24sjdm8G6Tl.De', 'Sherlock', 'Holmes', 'Classification Officer'),
('kenobi@qub.ac.uk', '$2a$10$2nFvorCBT7uaxfKL/fkGK.GOGK9vguyIVC3inSc24sjdm8G6Tl.De', 'Obi-Wan', 'Kenobi', 'Classification Officer');

-- 2. Programmes
INSERT INTO programmes (title, y2_weighting, y3_weighting) VALUES 
('BSc Alchemy & Potions', 0.30, 0.70),
('BSc Jedi Studies', 0.20, 0.80);

-- 3. Assignments (Sherlock to Alchemy, Obi-Wan to Jedi)
INSERT INTO officer_assignments (user_id, programme_id) VALUES (2, 1), (3, 2);

-- 4. Modules (Year 1, 2, 3 for Alchemy - 60 credits each to make 120/year)
INSERT INTO progr_modules (module_id, title, credits, academic_year, programme_id) VALUES 
('ALC101', 'Intro to Herbs', 60, 1, 1), ('ALC102', 'Glassware Safety', 60, 1, 1),
('ALC201', 'Advanced Distillation', 60, 2, 1), ('ALC202', 'Toxicology', 60, 2, 1),
('ALC301', 'Philosophers Stone Lab', 60, 3, 1), ('ALC302', 'Transmutation Theory', 60, 3, 1);

-- 5. Students
INSERT INTO progr_students (student_id, first_name, last_name, programme_id, final_classification) VALUES 
(101, 'Geralt', 'Of Rivia', 1, 'Pending'),   -- The "Perfect" Student
(102, 'Anakin', 'Skywalker', 1, 'Pending'), -- The "Resit" Student
(103, 'Frodo', 'Baggins', 1, 'Pending'),    -- The "Fail/Ineligible" Student
(104, 'John', 'Watson', 1, 'Pending');      -- The "Override" Student

-- 6. Grades (The Stress Test)

-- Geralt: Straight A's (Should get a 1st)
INSERT INTO progr_grades (student_id, module_id, mark, is_resit) VALUES 
(101, 'ALC101', 85, 0), (101, 'ALC102', 80, 0),
(101, 'ALC201', 75, 0), (101, 'ALC202', 78, 0),
(101, 'ALC301', 82, 0), (101, 'ALC302', 88, 0);

-- Anakin: Had a resit in Year 2. Raw mark was 80, but is_resit = 1.
-- Logic Check: System should cap that 80 at 40 for calculation.
INSERT INTO progr_grades (student_id, module_id, mark, is_resit) VALUES 
(102, 'ALC101', 50, 0), (102, 'ALC102', 50, 0),
(102, 'ALC201', 80, 1), (102, 'ALC202', 60, 0),
(102, 'ALC301', 60, 0), (102, 'ALC302', 60, 0);

-- Frodo: Failed a Year 1 module (only got 30). 
-- Logic Check: Credits will be 60/120 for Year 1. 
-- Result: Should be "Not eligible for Honours Classification".
INSERT INTO progr_grades (student_id, module_id, mark, is_resit) VALUES 
(103, 'ALC101', 30, 0), (103, 'ALC102', 60, 0),
(103, 'ALC201', 60, 0), (103, 'ALC202', 60, 0),
(103, 'ALC301', 60, 0), (103, 'ALC302', 60, 0);