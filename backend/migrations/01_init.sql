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
('Sebastian')
ON CONFLICT DO NOTHING;

-- Remove old student_preferred_seats inserts
DELETE FROM student_preferred_seats;

-- Helper to shuffle an integer array in-place (define this ONCE, outside the DO block)
CREATE OR REPLACE FUNCTION array_shuffle(arr integer[]) RETURNS integer[] AS $$
DECLARE
  len INTEGER := array_length(arr, 1);
  i INTEGER;
  j INTEGER;
  tmp INTEGER;
BEGIN
  IF len IS NULL THEN RETURN arr; END IF;
  FOR i IN REVERSE len..2 LOOP
    j := floor(random() * i + 1);
    tmp := arr[i];
    arr[i] := arr[j];
    arr[j] := tmp;
  END LOOP;
  RETURN arr;
END;
$$ LANGUAGE plpgsql;

-- Assign students to classes with preferred seat numbers as specified
-- class-1: 0% of 30 (0 students)
-- class-2: 90% of 30 (27 students), random seat 1-30, random student_id
-- class-3: 60% of 30 (18 students), random seat 1-30, random student_id
-- class-4: 40% of 30 (12 students), random seat 1-30, random student_id
-- class-5: 20% of 30 (6 students), random seat 1-30, random student_id

DO $$
DECLARE
  all_student_ids integer[] := ARRAY(SELECT generate_series(1, 35));
  class_ids text[] := ARRAY['class-1', 'class-2', 'class-3', 'class-4', 'class-5'];
  class_counts integer[] := ARRAY[0, 30, 30, 30, 30];
  seat_list integer[];
  selected_ids integer[];
BEGIN
  FOR class_idx IN 1..array_length(class_ids, 1) LOOP
    selected_ids := (SELECT array_shuffle(all_student_ids))[1:class_counts[class_idx]];

    seat_list := array_shuffle(ARRAY(SELECT generate_series(1, 30)));

    FOR i IN 1..class_counts[class_idx] LOOP
      INSERT INTO student_preferred_seats (student_id, class_id, preferred_seat_number)
      VALUES (
        selected_ids[i],
        class_ids[class_idx],
        seat_list[i]
      );
    END LOOP;
  END LOOP;
END $$;

-- Optionally, drop the shuffle function if you don't want it to persist:
-- DROP FUNCTION IF EXISTS array_shuffle(integer[]);

-- Basic health check table to verify database connection
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;