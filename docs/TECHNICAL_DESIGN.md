# ClassSwift Teacher Dashboard - Technical Design Document

## Overview

This document contains the technical specifications and design patterns for the ClassSwift Teacher Dashboard application, including data structures, API design, and implementation details.

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
interface Student {
  id: number;
  name: string;
  seatId: number; // Seat ID (1 to classroom capacity)
  score: number; // 0-100 range, non-negative integers
  isGuest: boolean;
  sessionToken?: string; // For seat-based authentication
  joinedAt: string;
}

interface ClassData {
  classId: string;
  className: string;
  studentCount: number;
  maxStudents: number; // Classroom capacity (max 30)
  students: Student[];
  guestSeats: number; // Number of guest/empty seats
  qrCodeUrl: string; // Contains app redirect URL
  joinLink: string; // App redirect URL that redirects to ClassSwift ViewSonic
  redirectUrl: string; // https://www.classswift.viewsonic.io/
  createdAt: string;
  isActive: boolean;
  sessionId: string; // For session management
}

interface Group {
  id: number;
  students: Student[];
}

interface SessionToken {
  studentId: number;
  classId: string;
  seatId: number;
  joinedAt: string;
  expiresAt: string;
}

interface WebSocketMessage {
  type: 'STUDENT_JOINED' | 'STUDENT_LEFT' | 'SCORE_UPDATED' | 'CLASS_UPDATED' | 'SEAT_ASSIGNED';
  classId: string;
  seatId?: number;
  data: any;
  timestamp: string;
}
```

### Redux Store Structure

```typescript
// Store Configuration
interface RootState {
  class: ClassState;
  ui: UIState;
  students: StudentsState;
  websocket: WebSocketState;
}

interface ClassState {
  classData: ClassData | null;
  loading: boolean;
  error: string | null;
}

interface UIState {
  showJoinModal: boolean;
  showStudentModal: boolean;
  activeTab: 'student' | 'group';
  showMenu: boolean;
}

interface StudentsState {
  students: Student[];
  groups: Group[];
  scoreHistory: ScoreAction[];
  seatAssignments: { [seatId: number]: Student | null }; // Seat-based mapping
  guestSeats: number[]; // Array of guest seat IDs
  scoresReset: boolean; // Track if scores were reset when panel opened
}

interface WebSocketState {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
}

// Redux Actions
const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    setClassData: (state, action) => { /* ... */ },
    setLoading: (state, action) => { /* ... */ },
    setError: (state, action) => { /* ... */ }
  }
});

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    updateStudentPoints: (state, action) => { /* ... */ },
    createGroups: (state, action) => { /* Auto-group enrolled students, then guest seats */ },
    resetStudentData: (state) => { /* Reset to guest seats only */ },
    assignStudentToSeat: (state, action) => { /* Seat-based assignment */ },
    removeStudentFromSeat: (state, action) => { /* Convert to guest seat */ },
    updateSeatAssignments: (state, action) => { /* Update seat mapping */ },
    resetPointsToZero: (state) => { /* Menu system bulk operation */ },
    freshSessionReset: (state) => { /* Complete session reset */ }
  }
});

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectionEstablished: (state) => { state.connected = true; state.error = null; },
    connectionLost: (state) => { state.connected = false; state.reconnecting = true; },
    connectionError: (state, action) => { state.error = action.payload; state.connected = false; },
    messageReceived: (state, action) => { state.lastMessage = action.payload; },
    seatAssigned: (state, action) => { /* Handle seat assignment events */ },
    seatReleased: (state, action) => { /* Handle seat release events */ },
    clearError: (state) => { state.error = null; }
  }
});
```

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

### Seat-based Authentication and Class Joining Flow

The seat-based authentication follows this specific flow:

1. **Seat QR Code Generation**: 
   - Each physical seat has a unique QR code containing seat-specific URL
   - QR codes include both seat ID and class ID: `http://localhost:3000/api/v1/classes/:classId/seats/:seatId/join`
   - Frontend displays classroom QR code in left modal for class ID sharing

2. **Seat-based Student Authentication**:
   - Student scans seat-specific QR code with mobile device
   - Mobile app/browser makes `POST /api/v1/classes/:classId/seats/:seatId/join` with student credentials
   - Backend validates student enrollment and seat availability
   - Backend generates session token containing: studentId, classId, seatId, timestamp, expiration
   - Backend assigns seat exclusively to authenticated student for entire session
   - Backend broadcasts seat assignment event via WebSocket to teacher dashboard

3. **Session Token Management**:
   - Session tokens stored in client local storage for browser refresh persistence
   - Tokens include expiration time and are validated server-side
   - One seat per student policy enforced - prevents duplicate assignments
   - Invalid tokens or seat conflicts return 401 Unauthorized

4. **Seat Assignment Rules**:
   - Each seat (ID 1 to capacity) can only be occupied by one student per session
   - Seat assignments are locked for entire class session
   - Guest seats appear as gray cards (empty or non-enrolled students)
   - Enrolled students appear as blue cards with seat ID display

5. **Real-time Updates**:
   - Successfully authenticated students trigger WebSocket broadcast with seat assignment
   - Teacher dashboard receives immediate seat-specific updates
   - Student appears in specific seat position in right modal grid
   - Guest seats can be manually managed by teacher through drag-and-drop

### Backend Data Models

```go
// Go Backend Models/Types
package main

import (
    "time"
)

// Core Models - Updated for simplified 2-table schema
type Student struct {
    ID         uint      `json:"id" gorm:"primaryKey"`
    Name       string    `json:"name" gorm:"not null"`
    ClassID    *string   `json:"classId" gorm:"index"` // Nullable foreign key
    SeatNumber *int      `json:"seatNumber"` // NULL = not seated, value = seated
    CreatedAt  time.Time `json:"createdAt"`
    UpdatedAt  time.Time `json:"updatedAt"`
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
// API Endpoints
GET    /api/v1/classes/:classId          - Get class information with students
GET    /api/v1/classes/:classId/students - Get students in class
GET    /api/v1/classes/:classId/qr       - Get QR code and join link
GET    /api/v1/classes/:classId/join     - QR code join endpoint (redirects)
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

// GET /api/v1/classes/X58E9647/students
// Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Philip",
      "classId": "class-1",
      "seatNumber": 1,
      "createdAt": "2025-06-21T10:15:00Z",
      "updatedAt": "2025-06-21T10:15:00Z"
    },
    {
      "id": 4,
      "name": "Alice",
      "classId": "class-1",
      "seatNumber": null,
      "createdAt": "2025-06-21T10:20:00Z",
      "updatedAt": "2025-06-21T10:20:00Z"
    },
    {
      "id": 5,
      "name": "Guest",
      "classId": "class-1",
      "seatNumber": 4,
      "createdAt": "2025-06-21T10:25:00Z",
      "updatedAt": "2025-06-21T10:25:00Z"
    }
  ]
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
// This joinLink is what appears in the QR code and redirects to ClassSwift ViewSonic

// GET /api/v1/classes/X58E9647/join (QR scan redirect endpoint)
// Headers: X-Student-Name: "Alice" (optional, defaults to "Guest")
// Response: 302 Redirect to https://www.classswift.viewsonic.io/
// Purpose: QR code contains this URL, which redirects students to ClassSwift ViewSonic platform
```

### Database Schema Design

```sql
-- PostgreSQL Database Schema for ClassSwift Teacher Dashboard
-- Simplified schema based on client-side group management

-- Classes Table: Core classroom entities
CREATE TABLE classes (
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
CREATE TABLE students (
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
CREATE INDEX idx_classes_public_id ON classes(public_id);
CREATE INDEX idx_students_class_id ON students(class_id);

-- Views for Common Queries
CREATE VIEW class_students_view AS
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

-- Sample Data for Development
INSERT INTO classes (id, public_id, name, total_capacity) VALUES 
('class-1', 'X58E9647', '302 Science', 30);

INSERT INTO students (name, class_id, seat_number) VALUES 
('Philip', 'class-1', 1),
('Darrell', 'class-1', 2),
('Cody', 'class-1', 3),
('Alice', 'class-1', NULL), -- Student in class but not seated
('Guest', 'class-1', 4);
```

### Frontend TypeScript Interfaces

```typescript
// Updated TypeScript Interfaces for simplified schema

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

interface Student {
  id: number;
  name: string;
  classId?: string;
  seatNumber?: number; // NULL = not seated, value = seated at that position
  createdAt: string;
  updatedAt: string;
}

interface ClassData {
  id: string;
  publicId: string;
  name: string;
  studentCount: number;
  totalCapacity: number;
  isActive: boolean;
  joinLink: string; // Computed by backend
  createdAt: string;
  updatedAt: string;
}

interface WebSocketMessage {
  type: 'STUDENT_JOINED' | 'STUDENT_LEFT' | 'CLASS_UPDATED';
  classId: string;
  data: any;
  timestamp: string;
}
```

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