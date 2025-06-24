-- Initial database setup for ClassSwift Teacher Dashboard
-- This file will be executed when the PostgreSQL container starts

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes Table: Core classroom entities
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(255) PRIMARY KEY,                    -- Internal unique class identifier
    public_id VARCHAR(255) UNIQUE NOT NULL,        -- Public class identifier for QR codes (e.g., "X58E9647")
    name VARCHAR(255) NOT NULL,                     -- Human-readable class name (e.g., "302 Science")
    student_count INTEGER DEFAULT 0,       -- Current number of enrolled students
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

-- Student Preferred Seats Table: Many-to-many relationship with preferred seat assignments
CREATE TABLE IF NOT EXISTS student_preferred_seats (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,                   -- Reference to student
    class_id VARCHAR(255) NOT NULL,               -- Reference to class
    preferred_seat_number INTEGER NOT NULL,       -- Preferred seat number for student in this class
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_preferred_seat_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_preferred_seat_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT chk_preferred_seat_positive CHECK (preferred_seat_number > 0),
    CONSTRAINT unique_student_class_preferred UNIQUE (student_id, class_id),
    CONSTRAINT unique_preferred_seat_per_class UNIQUE (class_id, preferred_seat_number)
);

-- Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_classes_public_id ON classes(public_id);
CREATE INDEX IF NOT EXISTS idx_preferred_seats_student_id ON student_preferred_seats(student_id);
CREATE INDEX IF NOT EXISTS idx_preferred_seats_class_id ON student_preferred_seats(class_id);
CREATE INDEX IF NOT EXISTS idx_preferred_seats_seat_number ON student_preferred_seats(class_id, preferred_seat_number);

-- Views for Common Queries
CREATE OR REPLACE VIEW class_students_view AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    sps.class_id,
    c.name as class_name,
    c.public_id,
    sps.preferred_seat_number as seat_number,
    sps.created_at,
    sps.updated_at
FROM students s
INNER JOIN student_preferred_seats sps ON s.id = sps.student_id
LEFT JOIN classes c ON sps.class_id = c.id;

CREATE OR REPLACE VIEW class_summary AS
SELECT 
    c.*,
    COUNT(sps.id) as total_students_with_preferred_seats
FROM classes c
LEFT JOIN student_preferred_seats sps ON c.id = sps.class_id
GROUP BY c.id, c.public_id, c.name, c.student_count, c.total_capacity, c.is_active, c.created_at, c.updated_at;

-- Triggers for Data Consistency
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle preferred seat changes (INSERT/DELETE on student_preferred_seats)
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

DROP TRIGGER IF EXISTS trigger_preferred_seats_class_count ON student_preferred_seats;
CREATE TRIGGER trigger_preferred_seats_class_count
    AFTER INSERT OR DELETE ON student_preferred_seats
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

DROP TRIGGER IF EXISTS trigger_preferred_seats_updated_at ON student_preferred_seats;
CREATE TRIGGER trigger_preferred_seats_updated_at
    BEFORE UPDATE ON student_preferred_seats
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

-- class-2: 20% enrollment (4 students out of 30 capacity)
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(1, 'class-2', 15),   -- Philip
(2, 'class-2', 3),    -- Darrell
(3, 'class-2', 22),   -- Maria
(4, 'class-2', 8);    -- Jessica

-- class-3: 40% enrollment (12 students out of 30 capacity)
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(7, 'class-3', 12),   -- Zest
(8, 'class-3', 25),   -- James
(9, 'class-3', 7),    -- Sarah
(10, 'class-3', 19),  -- Michael
(11, 'class-3', 2),   -- Emma
(12, 'class-3', 30),  -- David
(13, 'class-3', 14),  -- Lisa
(14, 'class-3', 6),   -- Robert
(19, 'class-3', 17),  -- Ava in class-3 - multi-class
(20, 'class-3', 4),   -- Isabella in class-3 - multi-class
(24, 'class-3', 11),  -- Noah in class-3 - multi-class
(25, 'class-3', 23);  -- Liam in class-3 - multi-class

-- class-4: 60% enrollment (8 students out of 30 capacity)
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(19, 'class-4', 11),  -- Ava
(20, 'class-4', 27),  -- Isabella
(21, 'class-4', 5),   -- Lucas
(22, 'class-4', 18),  -- Mia
(23, 'class-4', 1),   -- Logan
(28, 'class-4', 13),  -- William
(29, 'class-4', 29),  -- Alexander
(30, 'class-4', 9);   -- Charlotte

-- class-5: 80% enrollment (12 students out of 30 capacity)
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(41, 'class-5', 23),  -- Luke
(42, 'class-5', 4),   -- Elizabeth
(43, 'class-5', 16),  -- Gabriel
(44, 'class-5', 28),  -- Sofia
(45, 'class-5', 10),  -- Samuel
(46, 'class-5', 21),  -- Avery
(47, 'class-5', 8),   -- Anthony
(48, 'class-5', 17),  -- Ella
(49, 'class-5', 26),  -- Christopher
(50, 'class-5', 3),   -- Madison
(1, 'class-5', 20),   -- Philip - multi-class
(2, 'class-5', 24);   -- Darrell - multi-class

-- Multi-class preferred seats
-- Add some students from class-3 to class-2  
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(7, 'class-2', 11),   -- Zest in class-2 - multi-class
(8, 'class-2', 29),   -- James in class-2 - multi-class
(9, 'class-2', 5),    -- Sarah in class-2 - multi-class
(10, 'class-2', 17),  -- Michael in class-2 - multi-class
(11, 'class-2', 26);  -- Emma in class-2 - multi-class

-- Add some students from class-5 to class-4
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(41, 'class-4', 3),   -- Luke in class-4 - multi-class
(42, 'class-4', 7),   -- Elizabeth in class-4 - multi-class
(43, 'class-4', 20);  -- Gabriel in class-4 - multi-class

-- Add some students from class-2 to class-3
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(1, 'class-3', 10),   -- Philip in class-3 - multi-class
(2, 'class-3', 22);   -- Darrell in class-3 - multi-class

-- Add some students from class-3 to class-4
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(7, 'class-4', 6),    -- Zest in class-4 - multi-class
(8, 'class-4', 24);   -- James in class-4 - multi-class

-- Add some students from class-4 to class-5
INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number) VALUES 
(19, 'class-5', 12),  -- Ava in class-5 - multi-class
(20, 'class-5', 30);  -- Isabella in class-5 - multi-class

-- Basic health check table to verify database connection
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;