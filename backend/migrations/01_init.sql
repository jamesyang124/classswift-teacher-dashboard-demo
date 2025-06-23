-- Initial database setup for ClassSwift Teacher Dashboard
-- This file will be executed when the PostgreSQL container starts

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes Table: Core classroom entities
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(255) PRIMARY KEY,                    -- Internal unique class identifier
    public_id VARCHAR(255) UNIQUE NOT NULL,        -- Public class identifier for QR codes (e.g., "X58E9647")
    name VARCHAR(255) NOT NULL,                     -- Human-readable class name (e.g., "302 Science")
    student_count INTEGER DEFAULT 0,               -- Current number of active students
    total_capacity INTEGER DEFAULT 30,             -- Maximum students allowed in class
    is_active BOOLEAN DEFAULT TRUE,                -- Whether class is currently accepting students
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_capacity_positive CHECK (total_capacity > 0),
    CONSTRAINT chk_student_count_valid CHECK (student_count >= 0 AND student_count <= total_capacity)
);

-- Students Table: Student records (independent of classes)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,                         -- Auto-incrementing student ID
    name VARCHAR(255) NOT NULL,                    -- Full student name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Class Enrollments Table: Many-to-many relationship with seat assignments
CREATE TABLE IF NOT EXISTS class_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,                   -- Reference to student
    class_id VARCHAR(255) NOT NULL,               -- Reference to class
    seat_number INTEGER,                          -- Seat number in this specific class (NULL = not seated)
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT chk_seat_number_positive CHECK (seat_number IS NULL OR seat_number > 0),
    CONSTRAINT unique_student_class UNIQUE (student_id, class_id),
    CONSTRAINT unique_seat_per_class UNIQUE (class_id, seat_number)
);

-- Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_classes_public_id ON classes(public_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_seat_number ON class_enrollments(class_id, seat_number);

-- Views for Common Queries
CREATE OR REPLACE VIEW class_students_view AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    ce.class_id,
    c.name as class_name,
    c.public_id,
    ce.seat_number,
    ce.enrolled_at,
    ce.updated_at,
    CASE WHEN ce.seat_number IS NOT NULL THEN true ELSE false END as is_seated
FROM students s
INNER JOIN class_enrollments ce ON s.id = ce.student_id
LEFT JOIN classes c ON ce.class_id = c.id;

CREATE OR REPLACE VIEW class_summary AS
SELECT 
    c.*,
    COUNT(ce.id) as total_students,
    COUNT(CASE WHEN ce.seat_number IS NOT NULL THEN ce.id END) as seated_students,
    COUNT(CASE WHEN ce.seat_number IS NULL THEN ce.id END) as unassigned_students
FROM classes c
LEFT JOIN class_enrollments ce ON c.id = ce.class_id
GROUP BY c.id, c.public_id, c.name, c.student_count, c.total_capacity, c.is_active, c.created_at, c.updated_at;

-- Triggers for Data Consistency
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle enrollment changes (INSERT/DELETE on class_enrollments)
    IF TG_OP = 'INSERT' THEN
        UPDATE classes 
        SET student_count = student_count + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.class_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE classes 
        SET student_count = student_count - 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = OLD.class_id;
        RETURN OLD;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enrollment_class_count ON class_enrollments;
CREATE TRIGGER trigger_enrollment_class_count
    AFTER INSERT OR DELETE ON class_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_class_student_count();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_classes_updated_at ON classes;
CREATE TRIGGER trigger_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_enrollments_updated_at ON class_enrollments;
CREATE TRIGGER trigger_enrollments_updated_at
    BEFORE UPDATE ON class_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample Data for Development
INSERT INTO classes (id, public_id, name) VALUES 
('class-1', 'D45E6789', 'English Literature Is Way Too Good For Sleep'),
('class-2', 'X58E9647', '302 Science'),
('class-3', 'A12B3456', '101 Math'),
('class-4', 'B23C4567', '205 History'),
('class-5', 'C34D5678', 'Art Studio')
ON CONFLICT (id) DO NOTHING;

-- Insert students first (independent of classes)
INSERT INTO students (name) VALUES 
('Philip'),
('Darrell'),
('Maria'),
('Jessica'),
('Ashley'),
('Codyerzofazima'),
('Zest'),
('James'),
('Sarah'),
('Michael'),
('Emma'),
('David'),
('Lisa'),
('Robert'),
('Raven'),
('Olivia'),
('Ethan'),
('Mason'),
('Ava'),
('Isabella'),
('Lucas'),
('Mia'),
('Logan'),
('Noah'),
('Liam'),
('Jacob'),
('Sophia'),
('William'),
('Alexander'),
('Charlotte'),
('Benjamin'),
('Amelia'),
('Henry'),
('Harper'),
('Sebastian'),
('Evelyn'),
('Owen'),
('Abigail'),
('Jack'),
('Emily'),
('Luke'),
('Elizabeth'),
('Gabriel'),
('Sofia'),
('Samuel'),
('Avery'),
('Anthony'),
('Ella'),
('Christopher'),
('Madison'),
('Andrew'),
('Scarlett'),
('Joshua'),
('Victoria'),
('Nathan'),
('Aria'),
('Caleb'),
('Grace')
ON CONFLICT DO NOTHING;

-- Class enrollment simulation with varying enrollment rates
-- class-1: 0% enrollment (0 students) - Empty class
-- No enrollments for class-1

-- class-2: 20% enrollment (6 students out of 30 capacity)
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(1, 'class-2', 15),   -- Philip (seated)
(2, 'class-2', 3),   -- Darrell (seated)
(3, 'class-2', 22),   -- Maria (seated)
(4, 'class-2', 8),   -- Jessica (seated)
(5, 'class-2', NULL), -- Ashley (not seated)
(6, 'class-2', NULL); -- Codyerzofazima (not seated)

-- class-3: 40% enrollment (12 students out of 30 capacity)
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(7, 'class-3', 12),   -- Zest (seated)
(8, 'class-3', 25),   -- James (seated)
(9, 'class-3', 7),   -- Sarah (seated)
(10, 'class-3', 19),  -- Michael (seated)
(11, 'class-3', 2),  -- Emma (seated)
(12, 'class-3', 30),  -- David (seated)
(13, 'class-3', 14),  -- Lisa (seated)
(14, 'class-3', 6),  -- Robert (seated)
(15, 'class-3', NULL), -- Raven (not seated)
(16, 'class-3', NULL), -- Olivia (not seated)
(17, 'class-3', NULL), -- Ethan (not seated)
(18, 'class-3', NULL), -- Mason (not seated)
(19, 'class-3', 17),  -- Ava in class-3 (seated) - multi-class
(20, 'class-3', 4), -- Isabella in class-3 (seated) - multi-class
(24, 'class-3', 11), -- Noah in class-3 (seated) - multi-class
(25, 'class-3', 23), -- Liam in class-3 (seated) - multi-class
(26, 'class-3', NULL), -- Jacob in class-3 (not seated) - multi-class
(27, 'class-3', NULL), -- Sophia in class-3 (not seated) - multi-class
(32, 'class-3', NULL), -- Amelia in class-3 (not seated) - multi-class
(33, 'class-3', NULL); -- Henry in class-3 (not seated) - multi-class

-- class-4: 60% enrollment (18 students out of 30 capacity)
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(19, 'class-4', 11),  -- Ava (seated)
(20, 'class-4', 27),  -- Isabella (seated)
(21, 'class-4', 5),  -- Lucas (seated)
(22, 'class-4', 18),  -- Mia (seated)
(23, 'class-4', 1),  -- Logan (seated)
(28, 'class-4', 13), -- William (seated)
(29, 'class-4', 29), -- Alexander (seated)
(30, 'class-4', 9), -- Charlotte (seated)
(31, 'class-4', NULL), -- Benjamin (not seated)
(32, 'class-4', NULL), -- Amelia (not seated)
(33, 'class-4', NULL), -- Henry (not seated)
(34, 'class-4', NULL), -- Harper (not seated)
(35, 'class-4', NULL), -- Sebastian (not seated)
(36, 'class-4', NULL); -- Evelyn (not seated)

-- class-5: 80% enrollment (24 students out of 30 capacity)
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(41, 'class-5', 23),  -- Luke (seated)
(42, 'class-5', 4),  -- Elizabeth (seated)
(43, 'class-5', 16),  -- Gabriel (seated)
(44, 'class-5', 28),  -- Sofia (seated)
(45, 'class-5', 10),  -- Samuel (seated)
(46, 'class-5', 21), -- Avery (seated)
(47, 'class-5', 8), -- Anthony (seated)
(48, 'class-5', 17), -- Ella (seated)
(49, 'class-5', 26), -- Christopher (seated)
(50, 'class-5', 3), -- Madison (seated)
(1, 'class-5', 20),  -- Philip (seated) - multi-class enrollment
(2, 'class-5', 24),  -- Darrell (seated) - multi-class enrollment
(3, 'class-5', 15),  -- Maria (seated) - multi-class enrollment
(4, 'class-5', 1),  -- Jessica (seated) - multi-class enrollment
(6, 'class-5', NULL); -- Codyerzofazima (not seated) - multi-class enrollment

-- Multi-class enrollments (~80% of students in multiple classes)
-- Add most students from class-3 to class-2
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(7, 'class-2', 11),   -- Zest in class-2 (seated) - multi-class
(8, 'class-2', 29),   -- James in class-2 (seated) - multi-class
(9, 'class-2', 5),   -- Sarah in class-2 (seated) - multi-class
(10, 'class-2', 17),  -- Michael in class-2 (seated) - multi-class
(11, 'class-2', 26), -- Emma in class-2 (seated) - multi-class
(12, 'class-2', NULL), -- David in class-2 (not seated) - multi-class
(13, 'class-2', NULL), -- Lisa in class-2 (not seated) - multi-class
(14, 'class-2', NULL), -- Robert in class-2 (not seated) - multi-class
(15, 'class-2', NULL), -- Raven in class-2 (not seated) - multi-class
(16, 'class-2', NULL); -- Olivia in class-2 (not seated) - multi-class

-- Add most students from class-5 to class-4
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(37, 'class-4', 7), -- Owen in class-4 (seated) - multi-class
(38, 'class-4', 20), -- Abigail in class-4 (seated) - multi-class
(41, 'class-4', 3), -- Luke in class-4 (seated) - multi-class
(47, 'class-4', NULL), -- Anthony in class-4 (not seated) - multi-class
(48, 'class-4', NULL), -- Ella in class-4 (not seated) - multi-class
(49, 'class-4', NULL), -- Christopher in class-4 (not seated) - multi-class
(50, 'class-4', NULL); -- Madison in class-4 (not seated) - multi-class

-- Add students from class-2 to class-3
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(1, 'class-3', 10),  -- Philip in class-3 (seated) - multi-class
(2, 'class-3', 22),  -- Darrell in class-3 (seated) - multi-class
(3, 'class-3', NULL), -- Maria in class-3 (not seated) - multi-class
(4, 'class-3', NULL), -- Jessica in class-3 (not seated) - multi-class
(5, 'class-3', NULL); -- Ashley in class-3 (not seated) - multi-class

-- Add students from class-3 to class-4
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(7, 'class-4', 6),  -- Zest in class-4 (seated) - multi-class
(8, 'class-4', 24),  -- James in class-4 (seated) - multi-class
(9, 'class-4', NULL), -- Sarah in class-4 (not seated) - multi-class
(12, 'class-4', NULL); -- David in class-4 (not seated) - multi-class

-- Add students from class-4 to class-5
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(19, 'class-5', 12), -- Ava in class-5 (seated) - multi-class
(20, 'class-5', 30), -- Isabella in class-5 (seated) - multi-class
(21, 'class-5', NULL), -- Lucas in class-5 (not seated) - multi-class
(24, 'class-5', NULL); -- Noah in class-5 (not seated) - multi-class

-- Add students from class-3 to class-5
INSERT INTO class_enrollments (student_id, class_id, seat_number) VALUES 
(7, 'class-5', 9),  -- Zest in class-5 (seated) - multi-class (now in 4 classes!)
(8, 'class-5', NULL), -- James in class-5 (not seated) - multi-class
(9, 'class-5', NULL), -- Sarah in class-5 (not seated) - multi-class
(10, 'class-5', NULL); -- Michael in class-5 (not seated) - multi-class

-- Basic health check table to verify database connection
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;