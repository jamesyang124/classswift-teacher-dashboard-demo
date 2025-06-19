# ClassSwift Teacher Dashboard - Technical Design Document

## Overview

This document contains the technical specifications and design patterns for the ClassSwift Teacher Dashboard application, including data structures, API design, and implementation details.

## Data Structure & API Design

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

### Go Gin API Endpoints

```go
// Go Gin API Structure
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/gorilla/websocket"
)

// Models
type Student struct {
    ID             uint   `json:"id" gorm:"primaryKey"`
    Name           string `json:"name"`
    NegativePoints int    `json:"negativePoints"`
    PositivePoints int    `json:"positivePoints"`
    IsGuest        bool   `json:"isGuest"`
    ClassID        string `json:"classId"`
}

type Class struct {
    ID            string    `json:"id" gorm:"primaryKey"`
    Name          string    `json:"name"`
    StudentCount  int       `json:"studentCount"`
    TotalCapacity int       `json:"totalCapacity"`
    JoinLink      string    `json:"joinLink"`
    QRCodeURL     string    `json:"qrCodeUrl"`
    Students      []Student `json:"students" gorm:"foreignKey:ClassID"`
}

type WebSocketMessage struct {
    Type      string      `json:"type"`
    ClassID   string      `json:"classId"`
    Data      interface{} `json:"data"`
    Timestamp time.Time   `json:"timestamp"`
}

type WebSocketHub struct {
    clients    map[string]map[*websocket.Conn]bool // classId -> connections
    register   chan *WebSocketClient
    unregister chan *WebSocketClient
    broadcast  chan WebSocketMessage
    upgrader   websocket.Upgrader
}

type WebSocketClient struct {
    conn    *websocket.Conn
    classId string
}

// API Routes
func setupRoutes(router *gin.Engine, hub *WebSocketHub) {
    api := router.Group("/api/v1")
    
    // Class routes
    api.GET("/classes/:classId", getClass)
    api.POST("/classes", createClass)
    api.PUT("/classes/:classId", updateClass)
    api.DELETE("/classes/:classId", deleteClass)
    
    // Student routes
    api.GET("/classes/:classId/students", getStudents)
    api.POST("/classes/:classId/students", addStudent)
    api.POST("/classes/:classId/join", func(c *gin.Context) {
        handleStudentJoin(c, hub)
    })
    api.PUT("/students/:studentId/points", updateStudentPoints)
    api.DELETE("/students/:studentId", removeStudent)
    
    // QR Code routes
    api.GET("/classes/:classId/qr", generateQRCode)
    
    // WebSocket routes
    router.GET("/ws/classes/:classId", func(c *gin.Context) {
        handleWebSocketConnection(c, hub)
    })
    
    // Group routes
    api.GET("/classes/:classId/groups", getGroups)
    api.POST("/classes/:classId/groups", createGroups)
}

// Handler Examples
func getClass(c *gin.Context) {
    classId := c.Param("classId")
    
    // Mocked Response for Development
    c.JSON(200, gin.H{
        "classId": classId,
        "className": "302 Science",
        "studentCount": 16,
        "maxStudents": 30,
        "joinLink": fmt.Sprintf("https://www.classswift.viewsonic.io/join/%s", classId),
        "qrCodeUrl": fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.classswift.viewsonic.io/join/%s", classId),
        "createdAt": "2025-06-20T09:00:00Z",
        "isActive": true,
        "students": []Student{
            {ID: 1, Name: "Alice Johnson", PositivePoints: 5, NegativePoints: 2, IsGuest: false},
            {ID: 2, Name: "Bob Smith", PositivePoints: 3, NegativePoints: 1, IsGuest: false},
            {ID: 3, Name: "Charlie Brown", PositivePoints: 7, NegativePoints: 0, IsGuest: false},
            {ID: 4, Name: "Diana Prince", PositivePoints: 4, NegativePoints: 3, IsGuest: false},
            {ID: 5, Name: "Guest User", PositivePoints: 0, NegativePoints: 0, IsGuest: true},
        },
    })
}

func generateQRCode(c *gin.Context) {
    classId := c.Param("classId")
    joinUrl := fmt.Sprintf("https://www.classswift.viewsonic.io/join/%s", classId)
    
    // Generate QR code using external service (for development)
    qrCodeUrl := fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=%s", 
        url.QueryEscape(joinUrl))
    
    c.JSON(200, gin.H{
        "classId": classId,
        "joinUrl": joinUrl,
        "qrCodeUrl": qrCodeUrl,
        "size": "200x200",
        "format": "png",
    })
}

// WebSocket Hub Management
func NewWebSocketHub() *WebSocketHub {
    return &WebSocketHub{
        clients:    make(map[string]map[*websocket.Conn]bool),
        register:   make(chan *WebSocketClient),
        unregister: make(chan *WebSocketClient),
        broadcast:  make(chan WebSocketMessage),
        upgrader: websocket.Upgrader{
            CheckOrigin: func(r *http.Request) bool {
                return true // Allow all origins in development
            },
        },
    }
}

func (h *WebSocketHub) Run() {
    for {
        select {
        case client := <-h.register:
            if h.clients[client.classId] == nil {
                h.clients[client.classId] = make(map[*websocket.Conn]bool)
            }
            h.clients[client.classId][client.conn] = true
            
        case client := <-h.unregister:
            if clients, ok := h.clients[client.classId]; ok {
                if _, ok := clients[client.conn]; ok {
                    delete(clients, client.conn)
                    client.conn.Close()
                }
            }
            
        case message := <-h.broadcast:
            if clients, ok := h.clients[message.ClassID]; ok {
                for conn := range clients {
                    if err := conn.WriteJSON(message); err != nil {
                        delete(clients, conn)
                        conn.Close()
                    }
                }
            }
        }
    }
}

func handleWebSocketConnection(c *gin.Context, hub *WebSocketHub) {
    classId := c.Param("classId")
    
    conn, err := hub.upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        return
    }
    
    client := &WebSocketClient{conn: conn, classId: classId}
    hub.register <- client
    
    defer func() {
        hub.unregister <- client
    }()
    
    for {
        var msg WebSocketMessage
        if err := conn.ReadJSON(&msg); err != nil {
            break
        }
        // Handle incoming messages if needed
    }
}

func handleStudentJoin(c *gin.Context, hub *WebSocketHub) {
    classId := c.Param("classId")
    
    // Parse student token and validate
    type JoinRequest struct {
        Token string `json:"token"`
    }
    
    var req JoinRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request"})
        return
    }
    
    // Validate token and get student info (mock implementation)
    studentInfo := Student{
        ID:   1,
        Name: "John Doe",
        // ... other fields
    }
    
    // Broadcast student join event
    message := WebSocketMessage{
        Type:      "STUDENT_JOINED",
        ClassID:   classId,
        Data:      studentInfo,
        Timestamp: time.Now(),
    }
    
    hub.broadcast <- message
    
    c.JSON(200, gin.H{
        "success":   true,
        "student":   studentInfo,
        "seatId":    "seat_01", // From enrollment data
    })
}

func updateStudentPoints(c *gin.Context) {
    studentId := c.Param("studentId")
    
    type PointsUpdate struct {
        Type   string `json:"type"`   // "positive" or "negative"
        Action string `json:"action"` // "add" or "subtract"
    }
    
    var update PointsUpdate
    if err := c.ShouldBindJSON(&update); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request body"})
        return
    }
    
    // Database update logic here
    c.JSON(200, gin.H{"success": true})
}
```

### Database Schema

```sql
-- PostgreSQL Schema
CREATE TABLE classes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    student_count INTEGER DEFAULT 0,
    total_capacity INTEGER DEFAULT 30,
    join_link TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    negative_points INTEGER DEFAULT 0,
    positive_points INTEGER DEFAULT 0,
    is_guest BOOLEAN DEFAULT FALSE,
    class_id VARCHAR(255) REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_is_guest ON students(is_guest);
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