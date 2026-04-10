-- Creating the database
CREATE DATABASE IF NOT EXISTS `40083161`;
USE `40083161`;

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
    final_classification VARCHAR(50),
    FOREIGN KEY (programme_id) REFERENCES programmes(programme_id)
);

-- 5. Modules Table
CREATE TABLE progr_modules (
    module_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    academic_year INT NOT NULL
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