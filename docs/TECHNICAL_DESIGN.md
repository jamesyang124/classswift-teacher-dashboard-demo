# ClassSwift Teacher Dashboard - Technical Design Document

## Overview

This document contains the technical specifications and design patterns for the ClassSwift Teacher Dashboard application, including data structures, API design, and implementation details. Updated to reflect the completed seat management system with websocket-based real-time updates, client-side seat assignment, and comprehensive cross-class student exclusivity.

## Data Structure & API Design

### Frontend Technology Stack
- **React**: 19.1.0 with enhanced concurrent features
- **TypeScript**: Strict type checking enabled
- **Redux Toolkit**: Latest version for modern Redux with built-in best practices
- **React-Redux**: Latest version with optimized hooks integration
- **Styled-Components**: Latest version for CSS-in-JS styling
- **React Router**: Latest version for modern routing with data loading
- **Build Tool**: Vite for fast development and optimized production builds
- **Development**: Docker container with volume mounting and HMR

### Development Environment Configuration
- **Docker Compose**: Multi-service orchestration with PostgreSQL, Redis, and Adminer
- **Docker Watch**: Live reloading for both frontend (Vite HMR) and backend (Air)
- **Volume Mounting**: Source code mounted for development, dependencies cached
- **Environment Variables**: Centralized configuration for API URLs and database connections
- **Port Mapping**: Frontend (5173), Backend (3000), Database (5432), Redis (6379), Adminer (8080)

### TypeScript Interfaces

```typescript
// Frontend interfaces for seat management system
interface ClassSeat {
  studentId?: number;
  studentName: string;
  isGuest: boolean;
  isEmpty: boolean;
  score: number;
}

interface ClassSeatMap {
  [seatNumber: number]: ClassSeat;
}

interface ClassWithSeatMap {
  publicId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  seatMap: ClassSeatMap;
  totalCapacity: number;
  availableSlots: number;
  initialized?: boolean;
}

interface JoiningStudent {
  name: string;
  seatNumber: number;
  id?: number; // Optional - undefined for guest users
  preferredSeatNumber?: number;
  fromClassId?: string;
}

interface WebSocketMessage {
  type: 'class_update';
  classId: string;
  joiningStudent: JoiningStudent;
  timestamp: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
```

### Redux Store Structure

```typescript
// Multi-class seat management state structure
interface ClassesState {
  classes: { [classId: string]: ClassWithSeatMap };
  currentClassId: string | null;
  joinLinks: { [classId: string]: string };
  loading: boolean;
  error: string | null;
}

// Key features of the seat management system:
// - Client-side seat assignment with preferred seat logic
// - Real-time websocket updates for cross-class student movement
// - Student exclusivity (cannot be in multiple classes simultaneously)
// - Sophisticated initialization (first-open vs re-open behavior)
// - Guest user support with 'Guest' display name
// - Automatic available slot calculation from seat map
// - No API dependencies for seat operations (fully client-side)
```

### Seat Management Implementation

#### Core Logic Functions

```typescript
// Seat assignment algorithm with preferred seat logic
const assignSeatNumber = (
  preferredSeatNumber: number | null, 
  seatMap: ClassSeatMap, 
  totalCapacity: number
): number => {
  // If preferred seat is available and valid, use it
  if (preferredSeatNumber && 
      preferredSeatNumber > 0 && 
      preferredSeatNumber <= totalCapacity && 
      seatMap[preferredSeatNumber] && 
      seatMap[preferredSeatNumber].isEmpty) {
    return preferredSeatNumber;
  }
  
  // Fallback to lowest available seat in ASC order
  for (let i = 1; i <= totalCapacity; i++) {
    if (seatMap[i] && seatMap[i].isEmpty) {
      return i;
    }
  }
  
  return 0; // No seats available
};

// Available slots calculation from seat map
const calculateAvailableSlots = (seatMap: ClassSeatMap, totalCapacity: number): number => {
  let emptyCount = 0;
  for (let i = 1; i <= totalCapacity; i++) {
    if (seatMap[i] && seatMap[i].isEmpty) {
      emptyCount++;
    }
  }
  return emptyCount;
};
```

#### Key Redux Actions

1. **syncWithInitialStudents**: Initialize class with empty seats (first-open behavior)
2. **updateSeatFromWebSocket**: Handle real-time student joining with cross-class exclusivity
3. **removeStudentFromAllClasses**: Remove student from all classes when moving
4. **clearClassSeats**: Reset all seats to empty (client-side only)

#### WebSocket Event Handling

- **Event Type**: `class_update`
- **Guest Users**: No ID provided, displayed as "Guest"
- **Enrolled Students**: ID provided, supports preferred seat assignment
- **Cross-Class Movement**: Automatic cleanup from previous class before assignment

### Styled-Components Theme

```typescript
// Theme Configuration
const theme = {
  colors: {
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#EF4444',
    neutral: '#6B7280',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

// Component Styling Example
const StyledStudentCard = styled.div<{ isGuest: boolean }>`
  background: ${props => props.isGuest ? props.theme.colors.neutral : props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md};
  border-radius: 8px;
  position: relative;
  
  .seat-id {
    position: absolute;
    top: 4px;
    left: 8px;
    font-size: 12px;
    font-weight: bold;
    color: white;
  }
  
  .point-controls {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm};
  }
`;
```

### Client-Side Seat Management Flow

The current implementation uses client-side seat assignment with websocket coordination:

1. **Class QR Code System**: 
   - Single QR code per class (not per seat) containing class join URL
   - QR code URL: `http://localhost:3000/api/v1/classes/:classId/join`
   - Frontend displays QR code in left modal for students to scan

2. **Student Join Process**:
   - Student scans class QR code with mobile device
   - Mobile app/browser makes `POST /api/v1/classes/:classId/join` with student name
   - Backend looks up student by name to determine enrollment status
   - Backend broadcasts `class_update` websocket event to teacher dashboard
   - **No seat assignment on backend** - purely notification system

3. **Client-Side Seat Assignment**:
   - Teacher dashboard receives websocket `class_update` event
   - Redux `updateSeatFromWebSocket` action processes the student data
   - Client-side `assignSeatNumber` function determines optimal seat:
     - **Enrolled students**: Use preferred seat if available, fallback to lowest ASC
     - **Guest users**: Assign lowest available seat, display as "Guest"
   - Real-time UI update shows student in assigned seat

4. **Cross-Class Student Exclusivity**:
   - Redux automatically searches all classes for existing student
   - Removes student from previous class before assigning new seat
   - Updates available slot counts for both affected classes
   - Single student can only be in one class at a time

5. **Real-time Coordination**:
   - WebSocket events trigger immediate Redux state updates
   - No API calls needed for seat operations (fully client-side)
   - Teacher dashboard shows real-time seat assignments
   - Sophisticated initialization behavior (first-open vs re-open modal)

### Backend Data Models

```go
// Go Backend Models/Types
package main

import (
    "time"
)

// Core Models - Multi-class enrollment system with normalized schema
type Student struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    Name      string    `json:"name" gorm:"not null"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type ClassEnrollment struct {
    ID         uint      `json:"id" gorm:"primaryKey"`
    StudentID  uint      `json:"studentId" gorm:"not null;index"`
    ClassID    string    `json:"classId" gorm:"not null;index"`
    SeatNumber *int      `json:"seatNumber"` // NULL = not seated, 1-30 = seated
    EnrolledAt time.Time `json:"enrolledAt" gorm:"default:CURRENT_TIMESTAMP"`
    UpdatedAt  time.Time `json:"updatedAt"`
    
    // Foreign key relationships
    Student Student `json:"student" gorm:"foreignKey:StudentID"`
    Class   Class   `json:"class" gorm:"foreignKey:ClassID"`
}

type Class struct {
    ID           string    `json:"id" gorm:"primaryKey"`
    PublicID     string    `json:"publicId" gorm:"uniqueIndex;not null"`
    Name         string    `json:"name" gorm:"not null"`
    StudentCount int       `json:"studentCount" gorm:"default:0"`
    TotalCapacity int      `json:"totalCapacity" gorm:"default:30"`
    IsActive     bool      `json:"isActive" gorm:"default:true"`
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`
}

// StudentWithEnrollment represents student data with enrollment context
type StudentWithEnrollment struct {
    ID         uint      `json:"id"`
    Name       string    `json:"name"`
    ClassID    string    `json:"classId"`
    SeatNumber *int      `json:"seatNumber"`
    EnrolledAt time.Time `json:"enrolledAt"`
    UpdatedAt  time.Time `json:"updatedAt"`
}

// Response-only struct for API responses with computed fields
type ClassResponse struct {
    Class
    JoinLink string `json:"joinLink"` // Computed by backend
}

// API Response Models
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message,omitempty"`
    Errors  []string    `json:"errors,omitempty"`
}

// WebSocket Models
type WebSocketMessage struct {
    Type      string      `json:"type"`
    ClassID   string      `json:"classId"`
    Data      interface{} `json:"data"`
    Timestamp time.Time   `json:"timestamp"`
}
```

### API Routes & Request/Response Definitions

```
// API Endpoints - Multi-class enrollment system
GET    /api/v1/classes                   - Get all classes list
GET    /api/v1/classes/:classId          - Get class information with students
GET    /api/v1/classes/:classId/students - Get students enrolled in class
GET    /api/v1/classes/:classId/qr       - Get QR code and join link
GET    /api/v1/classes/:classId/join     - QR code join endpoint (redirects)
POST   /api/v1/classes/:classId/reset-seats - Reset all seated students to null
```

**API Request/Response Examples:**

```json
// GET /api/v1/classes/X58E9647
// Response:
{
  "success": true,
  "data": {
    "id": "class-1",
    "publicId": "X58E9647",
    "name": "302 Science",
    "studentCount": 4,
    "totalCapacity": 30,
    "isActive": true,
    "joinLink": "http://localhost:3000/api/v1/classes/X58E9647/join",
    "createdAt": "2025-06-21T10:15:00Z",
    "updatedAt": "2025-06-21T10:15:00Z"
  }
}

// GET /api/v1/classes
// Response:
{
  "success": true,
  "data": [
    {
      "id": "class-1",
      "publicId": "X58E9647",
      "name": "302 Science",
      "studentCount": 16,
      "totalCapacity": 30,
      "isActive": true,
      "createdAt": "2025-06-21T10:15:00Z",
      "updatedAt": "2025-06-21T10:15:00Z"
    }
  ]
}

// POST /api/v1/classes/X58E9647/join (Primary student interaction endpoint)
// Request: { "studentName": "John Doe" }
// Response: HTTP 200 + triggers websocket class_update event to teacher dashboard
// Handles both enrolled students (with preferred seats) and guest users
{
  "success": true,
  "message": "Successfully joined class",
  "data": {
    "studentName": "John Doe",
    "classId": "X58E9647",
    "isGuest": false
  }
}

// GET /api/v1/classes/X58E9647/qr
// Response:
{
  "success": true,
  "data": {
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "joinLink": "http://localhost:3000/api/v1/classes/X58E9647/join",
    "redirectUrl": "https://www.classswift.viewsonic.io/",
    "classId": "X58E9647"
  }
}

// Note: joinLink is dynamically composed by backend as:
// BASE_URL + "/api/v1/classes/" + publicId + "/join"
// This joinLink is used by student devices to join classes

// WebSocket Events (Real-time communication)
// Event: class_update
// Sent to: Teacher dashboard websocket connection
// Triggered by: Student joining via POST /api/join
// Payload:
{
  "type": "class_update",
  "classId": "X58E9647",
  "joiningStudent": {
    "name": "John Doe",
    "id": 123,                    // Optional: undefined for guest users
    "seatNumber": 0,              // Always 0 from backend (client assigns actual seat)
    "preferredSeatNumber": 5      // Optional: preferred seat for enrolled students
  },
  "timestamp": "2025-12-24T10:30:00Z"
}
```

### Database Schema Design

```sql
-- PostgreSQL Database Schema for ClassSwift Teacher Dashboard
-- Multi-class enrollment system with normalized schema

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
    id SERIAL PRIMARY KEY,                         -- Auto-incrementing enrollment ID
    student_id INTEGER NOT NULL,                   -- Reference to student
    class_id VARCHAR(255) NOT NULL,               -- Reference to class
    seat_number INTEGER,                          -- Physical seat number (NULL = not seated, 1-30 = seated)
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

CREATE VIEW class_summary AS
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

CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample schema supports multi-class enrollment with normalized relationships
-- Migration script contains comprehensive test data with realistic enrollment patterns
```

### Frontend Implementation Notes

The TypeScript interfaces above are used throughout the React application to ensure type safety and consistency with the backend API responses. The multi-class enrollment system allows students to be enrolled in multiple classes simultaneously, with each enrollment having independent seat assignments.

### Component Integration Example

```typescript
// Dashboard Component with Real-time Updates
const Dashboard: React.FC = () => {
  const classId = "X58E9647"; // From route params or props
  const students = useAppSelector(state => state.students.students);
  const wsState = useWebSocket(classId);
  
  return (
    <div>
      {/* Connection Status Indicator */}
      <ConnectionStatus connected={wsState.connected} />
      
      {/* Student Grid - Updates automatically via WebSocket */}
      <StudentGrid students={students} />
      
      {/* Real-time notification for new joins */}
      {wsState.lastMessage?.type === 'STUDENT_JOINED' && (
        <Toast message={`${wsState.lastMessage.data.name} joined the class!`} />
      )}
    </div>
  );
};

// Student Card Component with Real-time Updates
const StudentCard: React.FC<{ student: Student }> = ({ student }) => {
  const dispatch = useAppDispatch();
  
  const handlePointsUpdate = (type: 'positive' | 'negative', action: 'add' | 'subtract') => {
    // Optimistic update
    dispatch(studentSlice.actions.updateStudentPoints({ 
      studentId: student.id, 
      type, 
      action 
    }));
    
    // API call
    updateStudentPoints(student.id, { type, action })
      .catch(() => {
        // Revert on error
        dispatch(studentSlice.actions.updateStudentPoints({ 
          studentId: student.id, 
          type, 
          action: action === 'add' ? 'subtract' : 'add' 
        }));
      });
  };

  return (
    <StyledStudentCard isGuest={student.isGuest}>
      <StudentName>{student.name || 'Guest'}</StudentName>
      <PointsContainer>
        <PositivePoints>
          <button onClick={() => handlePointsUpdate('positive', 'add')}>+</button>
          <span>{student.positivePoints}</span>
          <button onClick={() => handlePointsUpdate('positive', 'subtract')}>-</button>
        </PositivePoints>
        <NegativePoints>
          <button onClick={() => handlePointsUpdate('negative', 'add')}>+</button>
          <span>{student.negativePoints}</span>
          <button onClick={() => handlePointsUpdate('negative', 'subtract')}>-</button>
        </NegativePoints>
      </PointsContainer>
    </StyledStudentCard>
  );
};
```