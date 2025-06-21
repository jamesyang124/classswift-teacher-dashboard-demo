# Optional SQL seed data for integration/e2e tests
INSERT INTO classes (id, public_id, name, student_count, total_capacity, is_active)
VALUES ('class-1', 'X58E9647', '302 Science', 0, 30, true)
ON CONFLICT DO NOTHING;

INSERT INTO students (name, class_id, seat_number)
VALUES ('Philip', 'class-1', 1),
       ('Darrell', 'class-1', 2),
       ('Cody', 'class-1', 3),
       ('Alice', 'class-1', NULL)
ON CONFLICT DO NOTHING;
