-- Initial database setup for ClassSwift Teacher Dashboard
-- This file will be executed when the PostgreSQL container starts

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Basic health check table to verify database connection
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;