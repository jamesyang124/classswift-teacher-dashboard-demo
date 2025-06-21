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
  negativePoints: number;
  positivePoints: number;
  isGuest: boolean;
}

interface ClassData {
  classId: string;
  className: string;
  studentCount: number;
  maxStudents: number;
  students: Student[];
  qrCodeUrl: string;
  joinLink: string;
  createdAt: string;
  isActive: boolean;
}

interface Group {
  id: number;
  students: Student[];
}

interface WebSocketMessage {
  type: 'STUDENT_JOINED' | 'STUDENT_LEFT' | 'POINTS_UPDATED' | 'CLASS_UPDATED';
  classId: string;
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
  pointsHistory: PointsAction[];
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
    createGroups: (state, action) => { /* ... */ },
    resetStudentData: (state) => { /* ... */ },
    addStudent: (state, action) => { /* ... */ },
    removeStudent: (state, action) => { /* ... */ }
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
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm};
  }
`;
```

### QR Code Generation and Class Joining Flow

The QR code generation follows this specific flow:

1. **QR Code Generation**: 
   - Frontend requests QR code via `GET /api/v1/classes/:classId/qr`
   - Backend generates QR code containing URL: `http://localhost:3000/api/v1/classes/:classId/join`
   - QR code is displayed in the left modal for students to scan

2. **Student QR Code Scanning**:
   - Student scans QR code with mobile device
   - Mobile app/browser makes `GET /api/v1/classes/:classId/join` with token in Authorization header
   - Backend validates token, extracts student ID, and adds student to class
   - Backend broadcasts student join event via WebSocket to update teacher dashboard
   - Backend redirects student to `https://www.classswift.viewsonic.io`

3. **Token Authentication**:
   - Token must be provided in `Authorization` header (supports `Bearer` prefix)
   - Token contains student identity and is validated server-side
   - Invalid tokens return 401 Unauthorized

4. **Real-time Updates**:
   - Successfully joined students trigger WebSocket broadcast
   - Teacher dashboard receives immediate updates via WebSocket connection
   - Student appears in right modal grid automatically

### Backend Data Models

```go
// Go Backend Models/Types
package main

import (
    "time"
)

// Core Models
type Student struct {
    ID                uint   `json:"id" gorm:"primaryKey"`
    Name              string `json:"name"`
    StudentExternalID string `json:"studentExternalId" gorm:"uniqueIndex"`
    CreatedAt         time.Time `json:"createdAt"`
    UpdatedAt         time.Time `json:"updatedAt"`
}

type Class struct {
    ID            string    `json:"id" gorm:"primaryKey"`
    PublicID      string    `json:"publicId" gorm:"uniqueIndex;not null"`
    Name          string    `json:"name"`
    StudentCount  int       `json:"studentCount"`
    TotalCapacity int       `json:"totalCapacity"`
    IsActive      bool      `json:"isActive"`
    CreatedAt     time.Time `json:"createdAt"`
    UpdatedAt     time.Time `json:"updatedAt"`
    ClassStudents []ClassStudent `json:"classStudents" gorm:"foreignKey:ClassID"`
}

type ClassStudent struct {
    StudentID      uint      `json:"studentId" gorm:"primaryKey"`
    ClassID        string    `json:"classId" gorm:"primaryKey"`
    NegativePoints int       `json:"negativePoints"`
    PositivePoints int       `json:"positivePoints"`
    IsGuest        bool      `json:"isGuest"`
    SeatNumber     string    `json:"seatNumber"`
    EnrolledAt     time.Time `json:"enrolledAt"`
    UpdatedAt      time.Time `json:"updatedAt"`
    Student        Student   `json:"student" gorm:"foreignKey:StudentID"`
    Class          Class     `json:"class" gorm:"foreignKey:ClassID"`
}

type Group struct {
    ID           uint           `json:"id" gorm:"primaryKey"`
    ClassID      string         `json:"classId"`
    Name         string         `json:"name"`
    CreatedAt    time.Time      `json:"createdAt"`
    UpdatedAt    time.Time      `json:"updatedAt"`
    ClassStudents []ClassStudent `json:"classStudents" gorm:"many2many:group_students;jointable_foreignkey:student_id;association_jointable_foreignkey:class_id"`
}


// WebSocket Models
type WebSocketMessage struct {
    Type      string      `json:"type"`
    ClassID   string      `json:"classId"`
    Data      interface{} `json:"data"`
    Timestamp time.Time   `json:"timestamp"`
}
```

### Database Schema Design

```sql
-- PostgreSQL Database Schema for ClassSwift Teacher Dashboard

-- Classes Table: Core classroom entities
CREATE TABLE classes (
    id VARCHAR(255) PRIMARY KEY,                    -- Internal unique class identifier
    public_id VARCHAR(255) UNIQUE NOT NULL,        -- Public class identifier for QR codes/external use (e.g., "X58E9647")
    name VARCHAR(255) NOT NULL,                     -- Human-readable class name (e.g., "302 Science")
    student_count INTEGER DEFAULT 0,               -- Current number of active students
    total_capacity INTEGER DEFAULT 30,             -- Maximum students allowed in class
    is_active BOOLEAN DEFAULT TRUE,                -- Whether class is currently active
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table: Master student records (independent of classes)
CREATE TABLE students (
    id SERIAL PRIMARY KEY,                         -- Auto-incrementing student ID
    first_name VARCHAR(255) NOT NULL,              -- Student first name
    last_name VARCHAR(255),                        -- Student last name (optional)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Students Table: Junction table for student-class enrollment with points
CREATE TABLE class_students (
    student_id INTEGER NOT NULL,                   -- Foreign key to students
    class_id VARCHAR(255) NOT NULL,               -- Foreign key to classes
    negative_points INTEGER DEFAULT 0 CHECK (negative_points >= 0), -- Red badge points for this class
    positive_points INTEGER DEFAULT 0 CHECK (positive_points >= 0), -- Green badge points for this class
    is_guest BOOLEAN DEFAULT FALSE,               -- Guest users vs enrolled students
    seat_number VARCHAR(10),                      -- Physical seat assignment (optional)
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (student_id, class_id),           -- Compound primary key ensures one enrollment per student per class
    CONSTRAINT fk_class_students_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Groups Table: 5-student group formations
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    class_id VARCHAR(255) NOT NULL,               -- Foreign key to classes
    name VARCHAR(100) NOT NULL,                   -- Group name (e.g., "Group 1", "Team Alpha")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_groups_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Group Students Junction Table: Many-to-many relationship
CREATE TABLE group_students (
    group_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,                  -- Foreign key to students
    class_id VARCHAR(255) NOT NULL,               -- Foreign key to classes (same as group's class)
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (group_id, student_id),
    CONSTRAINT fk_group_students_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_students_class_student FOREIGN KEY (student_id, class_id) REFERENCES class_students(student_id, class_id) ON DELETE CASCADE
);



-- Indexes for Performance Optimization
CREATE INDEX idx_classes_public_id ON classes(public_id);
CREATE INDEX idx_students_name ON students(first_name, last_name);
CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
CREATE INDEX idx_class_students_is_guest ON class_students(is_guest);
CREATE INDEX idx_groups_class_id ON groups(class_id);
CREATE INDEX idx_group_students_composite ON group_students(student_id, class_id);

-- Views for Common Queries
CREATE VIEW class_students_view AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    CONCAT(s.first_name, COALESCE(' ' || s.last_name, '')) as full_name,
    cs.class_id,
    cs.positive_points,
    cs.negative_points,
    cs.is_guest,
    cs.seat_number,
    cs.enrolled_at,
    cs.updated_at
FROM students s
JOIN class_students cs ON s.id = cs.student_id;

CREATE VIEW class_summary AS
SELECT 
    c.*,
    COUNT(DISTINCT cs.student_id) as current_student_count,
    COUNT(DISTINCT CASE WHEN cs.is_guest = false THEN cs.student_id END) as enrolled_student_count,
    COUNT(DISTINCT CASE WHEN cs.is_guest = true THEN cs.student_id END) as guest_student_count,
    AVG(cs.positive_points) as avg_positive_points,
    AVG(cs.negative_points) as avg_negative_points
FROM classes c
LEFT JOIN class_students cs ON c.id = cs.class_id
GROUP BY c.id, c.public_id, c.name, c.student_count, c.total_capacity, c.is_active, c.created_at, c.updated_at;

-- Triggers for Data Consistency
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
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
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_class_student_count_insert
    AFTER INSERT ON class_students
    FOR EACH ROW
    EXECUTE FUNCTION update_class_student_count();

CREATE TRIGGER trigger_class_student_count_delete
    AFTER DELETE ON class_students
    FOR EACH ROW
    EXECUTE FUNCTION update_class_student_count();

-- Function to automatically create groups (5 students each, excluding guests)
CREATE OR REPLACE FUNCTION auto_create_groups(class_id_param VARCHAR(255))
RETURNS INTEGER AS $$
DECLARE
    student_count INTEGER;
    group_count INTEGER;
    group_id INTEGER;
    class_student_rec RECORD;
    current_group_size INTEGER := 0;
BEGIN
    -- Count non-guest students in this class
    SELECT COUNT(*) INTO student_count 
    FROM class_students 
    WHERE class_id = class_id_param AND is_guest = false;
    
    -- Delete existing groups for this class
    DELETE FROM groups WHERE class_id = class_id_param;
    
    -- Calculate number of groups needed
    group_count := CEIL(student_count / 5.0);
    
    -- Create groups
    FOR i IN 1..group_count LOOP
        INSERT INTO groups (class_id, name) 
        VALUES (class_id_param, 'Group ' || i)
        RETURNING id INTO group_id;
        
        -- Assign class students to this group
        current_group_size := 0;
        FOR class_student_rec IN 
            SELECT student_id FROM class_students 
            WHERE class_id = class_id_param AND is_guest = false
            AND student_id NOT IN (SELECT student_id FROM group_students WHERE class_id = class_id_param)
            LIMIT 5
        LOOP
            INSERT INTO group_students (group_id, student_id, class_id) 
            VALUES (group_id, class_student_rec.student_id, class_id_param);
            current_group_size := current_group_size + 1;
        END LOOP;
    END LOOP;
    
    RETURN group_count;
END;
$$ LANGUAGE plpgsql;
```

### Frontend API Integration

```typescript
// WebSocket Service Implementation
class WebSocketService {
  private ws: WebSocket | null = null;
  private classId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  constructor(classId: string) {
    this.classId = classId;
  }

  connect(dispatch: AppDispatch): void {
    const wsUrl = `ws://localhost:3000/ws/classes/${this.classId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      dispatch(websocketSlice.actions.connectionEstablished());
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      dispatch(websocketSlice.actions.messageReceived(message));
      
      // Handle different message types
      switch (message.type) {
        case 'STUDENT_JOINED':
          dispatch(studentSlice.actions.addStudent(message.data));
          break;
        case 'STUDENT_LEFT':
          dispatch(studentSlice.actions.removeStudent(message.data));
          break;
        case 'POINTS_UPDATED':
          dispatch(studentSlice.actions.updateStudentPoints(message.data));
          break;
      }
    };

    this.ws.onclose = () => {
      dispatch(websocketSlice.actions.connectionLost());
      this.handleReconnect(dispatch);
    };

    this.ws.onerror = (error) => {
      dispatch(websocketSlice.actions.connectionError(error.toString()));
    };
  }

  private handleReconnect(dispatch: AppDispatch): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(dispatch);
      }, this.reconnectInterval);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// React Hook for WebSocket Connection
const useWebSocket = (classId: string) => {
  const dispatch = useAppDispatch();
  const wsState = useAppSelector(state => state.websocket);
  const wsServiceRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    if (classId) {
      wsServiceRef.current = new WebSocketService(classId);
      wsServiceRef.current.connect(dispatch);
    }

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, [classId, dispatch]);

  return wsState;
};

// API Integration Functions
const fetchClassData = async (classId: string): Promise<ClassData> => {
  const response = await fetch(`/api/v1/classes/${classId}`);
  if (!response.ok) throw new Error('Failed to fetch class data');
  return response.json();
};

const fetchStudents = async (classId: string): Promise<Student[]> => {
  const response = await fetch(`/api/v1/classes/${classId}/students`);
  if (!response.ok) throw new Error('Failed to fetch students');
  return response.json();
};

const updateStudentPoints = async (
  studentId: number, 
  pointsUpdate: { type: string; action: string }
): Promise<void> => {
  const response = await fetch(`/api/v1/students/${studentId}/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pointsUpdate)
  });
  if (!response.ok) throw new Error('Failed to update points');
};
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