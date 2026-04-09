-- Insert Users. Note: Right now the password is a placeholder. It will be hashed later down the line.
INSERT INTO
    users (email, password_hash, first_name, last_name, role)

VALUES
    (
        'admin@hedclass.ac.uk',
        'password123',
        'Maks',
        'Admin',
        'Institutional Administrator'
    ),
    (
        'officer@hedclass.ac.uk',
        'password456',
        'Sarah',
        'Officer',
        'Classification Officer'
    );

-- Insert Mock Programmes
INSERT INTO
    programmes (title, y2_weighting, y3_weighting)
VALUES
    ('BSc Computer Science', 0.30, 0.70),
    ('BSc Software Engineering', 0.40, 0.60);

-- Assign an officer to a programme
INSERT INTO officer_assignments (user_id, programme_id) VALUES (2, 1);