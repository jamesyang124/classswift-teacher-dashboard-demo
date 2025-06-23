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

-- Students Table: Student records with current class assignment
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,                         -- Auto-incrementing student ID
    name VARCHAR(255) NOT NULL,                    -- Full student name
    class_id VARCHAR(255),                         -- Current class (nullable)
    seat_number INTEGER,                          -- Physical seat number (NULL = not seated)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT chk_seat_number_positive CHECK (seat_number IS NULL OR seat_number > 0)
);

-- Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_classes_public_id ON classes(public_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- Views for Common Queries
CREATE OR REPLACE VIEW class_students_view AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.class_id,
    c.name as class_name,
    c.public_id,
    s.seat_number,
    s.created_at,
    s.updated_at,
    CASE WHEN s.seat_number IS NOT NULL THEN true ELSE false END as is_seated
FROM students s
LEFT JOIN classes c ON s.class_id = c.id;

CREATE OR REPLACE VIEW class_summary AS
SELECT 
    c.*,
    COUNT(s.id) as total_students,
    COUNT(CASE WHEN s.seat_number IS NOT NULL THEN s.id END) as seated_students,
    COUNT(CASE WHEN s.seat_number IS NULL THEN s.id END) as unassigned_students
FROM classes c
LEFT JOIN students s ON c.id = s.class_id
GROUP BY c.id, c.public_id, c.name, c.student_count, c.total_capacity, c.is_active, c.created_at, c.updated_at;

-- Triggers for Data Consistency
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update old class count (when student leaves)
    IF TG_OP = 'UPDATE' AND OLD.class_id IS NOT NULL AND OLD.class_id != NEW.class_id THEN
        UPDATE classes 
        SET student_count = student_count - 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = OLD.class_id;
    ELSIF TG_OP = 'DELETE' AND OLD.class_id IS NOT NULL THEN
        UPDATE classes 
        SET student_count = student_count - 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = OLD.class_id;
    END IF;
    
    -- Update new class count (when student joins)
    IF TG_OP = 'UPDATE' AND NEW.class_id IS NOT NULL AND OLD.class_id != NEW.class_id THEN
        UPDATE classes 
        SET student_count = student_count + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.class_id;
    ELSIF TG_OP = 'INSERT' AND NEW.class_id IS NOT NULL THEN
        UPDATE classes 
        SET student_count = student_count + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.class_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_student_class_count ON students;
CREATE TRIGGER trigger_student_class_count
    AFTER INSERT OR UPDATE OR DELETE ON students
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

-- Sample Data for Development
INSERT INTO classes (id, public_id, name) VALUES 
('class-1', 'X58E9647', '302 Science'),
('class-2', 'A12B3456', '101 Math'),
('class-3', 'B23C4567', '205 History'),
('class-4', 'C34D5678', 'Art Studio'),
('class-5', 'D45E6789', 'English Literature Is Way Too Good For Sleep')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (name, class_id, seat_number) VALUES 
-- class-1
('Philip', 'class-1', 1),
('Darrell', 'class-1', 2),
('Maria', 'class-1', 3),
('Jessica', 'class-1', NULL),
('Ashley', 'class-1', NULL),
-- class-2
('Codyerzofazima', 'class-2', 1),
('Zest', 'class-2', 2),
('James', 'class-2', 3),
('Sarah', 'class-2', NULL),
('Michael', 'class-2', NULL),
-- class-3
('Emma', 'class-3', 1),
('David', 'class-3', 2),
('Lisa', 'class-3', 3),
('Robert', 'class-3', NULL),
('Raven', 'class-3', NULL),
-- class-4
('Olivia', 'class-4', 1),
('Ethan', 'class-4', 2),
('Mason', 'class-4', NULL),
('Ava', 'class-4', NULL),
('Isabella', 'class-4', 3),
('Lucas', 'class-4', 4),
-- class-5
('Mia', 'class-5', 1),
('Logan', 'class-5', 2),
('Noah', 'class-5', NULL),
('Liam', 'class-5', NULL),
('Jacob', 'class-5', 3),
('Sophia', 'class-5', 4),
('William', 'class-5', NULL)
ON CONFLICT DO NOTHING;

-- Basic health check table to verify database connection
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;