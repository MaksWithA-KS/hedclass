-- HEdClass Fresh Install & Seed Script

CREATE DATABASE IF NOT EXISTS `hedclass`;
USE `hedclass`;

-- ==========================================
-- PART 0: CLEAN SLATE
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS progr_grades;
DROP TABLE IF EXISTS progr_students;
DROP TABLE IF EXISTS progr_modules;
DROP TABLE IF EXISTS officer_assignments;
DROP TABLE IF EXISTS programmes;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- PART 1: SCHEMA CREATION
-- ==========================================

-- 1. Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('Institutional Administrator', 'Classification Officer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Programmes Table
CREATE TABLE programmes (
    programme_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    y2_weighting DECIMAL(3,2) DEFAULT 0.30,
    y3_weighting DECIMAL(3,2) DEFAULT 0.70
);

-- 3. Officer Assignments
CREATE TABLE officer_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    programme_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- 4. Students Table
CREATE TABLE progr_students (
    student_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    programme_id INT,
    manual_override BOOLEAN DEFAULT FALSE,
    final_classification VARCHAR(100),
    override_rationale TEXT,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id)
);

-- 5. Modules Table
CREATE TABLE progr_modules (
    module_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    academic_year INT NOT NULL,
    programme_id INT NOT NULL,
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id) ON DELETE CASCADE
);

-- 6. Grades Table
CREATE TABLE progr_grades (
    grade_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    module_id VARCHAR(20),
    mark INT NOT NULL,
    is_resit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES progr_students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES progr_modules(module_id) ON DELETE CASCADE
);

-- ==========================================
-- PART 2: DATA SEEDING
-- ==========================================

-- 1. Users (Admin: Gandalf | Officers: Sherlock & Obi-Wan)
-- Passwords are hashed versions of 'yoshllntpass!1', 'elementary2$', and 'helloth3re' respectively
INSERT INTO users (user_id, email, password_hash, first_name, last_name, role) VALUES 
(1, 'gandalf@qub.ac.uk', '$2a$10$wuXhzgXgNsHXV4lUWRnOn.CWrgrOy6l6bWntUFLKsaIWoEEYci.ka', 'Gandalf', 'The Grey', 'Institutional Administrator'),
(2, 'holmes@qub.ac.uk', '$2a$10$BlZ57R6Txz0C76Tv303TCuM72SVY.g/s/ci7RSqCvxnwrd.T1DOQW', 'Sherlock', 'Holmes', 'Classification Officer'),
(3, 'kenobi@qub.ac.uk', '$2a$10$cpk.tMvYK.7jCmZdDUK1y.QxQZJGGkEmPhxLSqvB/bbNvmRMeacrC', 'Obi-Wan', 'Kenobi', 'Classification Officer');

-- 2. Programmes (Using explicit IDs to ensure logic matches assignments)
INSERT INTO programmes (programme_id, title, y2_weighting, y3_weighting) VALUES 
(1, 'BSc Alchemy & Potions', 0.30, 0.70),
(2, 'BSc Jedi Studies', 0.20, 0.80),
(3, 'BSc Cybernetic Engineering', 0.40, 0.60),
(4, 'BSc Xenobiology', 0.25, 0.75);

-- 3. Assignments
INSERT INTO officer_assignments (user_id, programme_id) VALUES 
(2, 1), (3, 2), (2, 3), (3, 4);

-- 4. Modules
INSERT INTO progr_modules (module_id, title, credits, academic_year, programme_id) VALUES 
('ALC101', 'Intro to Herbs', 60, 1, 1), ('ALC102', 'Glassware Safety', 60, 1, 1),
('ALC201', 'Advanced Distillation', 60, 2, 1), ('ALC202', 'Toxicology', 60, 2, 1),
('ALC301', 'Philosophers Stone Lab', 60, 3, 1), ('ALC302', 'Transmutation Theory', 60, 3, 1),
('JEDI101', 'Lightsaber Safety', 60, 1, 2), ('JEDI102', 'Force Meditation', 60, 1, 2),
('JEDI201', 'Telekinesis II', 60, 2, 2), ('JEDI202', 'Interstellar Diplomacy', 60, 2, 2),
('JEDI301', 'Combat Mastery', 60, 3, 2), ('JEDI302', 'Ethics of the Force', 60, 3, 2),
('CYB101', 'Intro to Robotics', 60, 1, 3), ('CYB102', 'Soldering 101', 60, 1, 3),
('CYB201', 'Neural Interfacing', 60, 2, 3), ('CYB202', 'Bionic Limbs', 60, 2, 3),
('CYB301', 'AI Governance', 60, 3, 3), ('CYB302', 'Advanced Prosthetics', 60, 3, 3),
('XENO101', 'Anatomy of the Unknown', 60, 1, 4), ('XENO102', 'Alien Microbiology', 60, 1, 4),
('XENO201', 'Atmospheric Adaptation', 60, 2, 4), ('XENO202', 'Symbiosis Studies', 60, 2, 4),
('XENO301', 'Extraterrestrial Ethics', 60, 3, 4), ('XENO302', 'Field Research: Mars', 60, 3, 4);

-- 5. Students
INSERT INTO progr_students (student_id, first_name, last_name, programme_id, final_classification) VALUES 
(101, 'Geralt', 'Of Rivia', 1, 'Pending'),
(102, 'Anakin', 'Skywalker', 1, 'Pending'),
(103, 'Frodo', 'Baggins', 1, 'Pending'),
(104, 'John', 'Watson', 1, 'Pending'),
(201, 'Luke', 'Skywalker', 2, 'Pending'),
(202, 'Ahsoka', 'Tano', 2, 'Pending'),
(301, 'Tony', 'Stark', 3, 'Pending'),
(302, 'Victor', 'Stone', 3, 'Pending'),
(303, 'Arthur', 'Dent', 3, 'Pending'),
(401, 'Ellen', 'Ripley', 4, 'Pending'),
(402, 'Spock', 'Sarek', 4, 'Pending'),
(403, 'Nyota', 'Uhura', 4, 'Pending');

-- 6. Grades
INSERT INTO progr_grades (student_id, module_id, mark, is_resit) VALUES 
(101, 'ALC101', 85, 0), (101, 'ALC102', 80, 0), (101, 'ALC201', 75, 0), (101, 'ALC202', 78, 0), (101, 'ALC301', 82, 0), (101, 'ALC302', 88, 0),
(102, 'ALC101', 50, 0), (102, 'ALC102', 50, 0), (102, 'ALC201', 80, 1), (102, 'ALC202', 60, 0), (102, 'ALC301', 60, 0), (102, 'ALC302', 60, 0),
(103, 'ALC101', 30, 0), (103, 'ALC102', 60, 0), (103, 'ALC201', 60, 0), (103, 'ALC202', 60, 0), (103, 'ALC301', 60, 0), (103, 'ALC302', 60, 0),
(201, 'JEDI101', 65, 0), (201, 'JEDI102', 62, 0), (201, 'JEDI201', 68, 0), (201, 'JEDI202', 64, 0), (201, 'JEDI301', 67, 0), (201, 'JEDI302', 66, 0),
(202, 'JEDI101', 75, 0), (202, 'JEDI102', 72, 0), (202, 'JEDI201', 68, 0), (202, 'JEDI202', 71, 0), (202, 'JEDI301', 70, 0), (202, 'JEDI302', 70, 0),
(301, 'CYB101', 98, 0), (301, 'CYB102', 100, 0), (301, 'CYB201', 95, 0), (301, 'CYB202', 99, 0), (301, 'CYB301', 97, 0), (301, 'CYB302', 100, 0),
(302, 'CYB101', 50, 0), (302, 'CYB102', 50, 0), (302, 'CYB201', 90, 1), (302, 'CYB202', 95, 1), (302, 'CYB301', 45, 0), (302, 'CYB302', 42, 0),
(303, 'CYB101', 40, 0), (303, 'CYB102', 40, 0), (303, 'CYB201', 41, 0), (303, 'CYB202', 40, 0), (303, 'CYB301', 39, 0), (303, 'CYB302', 40, 0),
(401, 'XENO101', 65, 0), (401, 'XENO102', 68, 0), (401, 'XENO201', 66, 0), (401, 'XENO202', 64, 0), (401, 'XENO301', 67, 0), (401, 'XENO302', 69, 0),
(402, 'XENO101', 82, 0), (402, 'XENO102', 78, 0), (402, 'XENO201', 75, 0), (402, 'XENO202', 79, 0), (402, 'XENO301', 80, 0), (402, 'XENO302', 81, 0),
(403, 'XENO101', 55, 0), (403, 'XENO102', 58, 0), (403, 'XENO201', 52, 0), (403, 'XENO202', 50, 0), (403, 'XENO301', 54, 0), (403, 'XENO302', 53, 0);