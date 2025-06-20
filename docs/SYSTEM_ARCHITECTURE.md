# ClassSwift Teacher Dashboard - System Architecture

## Overview

This document outlines the high-level system architecture for the ClassSwift Teacher Dashboard, a comprehensive classroom management system.

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 19.1.0 with TypeScript
- **Frontend Build Tool**: Vite for fast development and optimized builds
- **Frontend Styling**: Styled-Components for component-based styling
- **Frontend State Management**: Redux Toolkit for predictable state management
- **Frontend Routing**: React Router DOM for client-side routing
- **Backend API**: Go with Gin framework for high-performance REST API
- **Database**: PostgreSQL 15 for data persistence
- **Cache**: Redis for session storage and WebSocket state management
- **Development Environment**: Docker Compose with Docker Watch
- **Type Safety**: TypeScript with strict type checking
- **Development**: Vite HMR + Go Air live reload in containers

### Redux State Management
- **Store Configuration**: Redux Toolkit 2.2.5 for simplified state management
- **React Integration**: React-Redux 9.1.2 with hooks API
- **Slice Structure**: 
  - `classSlice`: Class information and student data
  - `uiSlice`: Modal states, active tabs, loading states
  - `studentSlice`: Student points, seat assignments, and group management
  - `websocketSlice`: Real-time connection state and seat assignment messaging
- **Middleware**: Redux Thunk for async operations (built into RTK)
- **DevTools**: Redux DevTools integration for debugging

### Styled-Components Architecture
- **Theme Provider**: Centralized theme management with colors, fonts, and spacing
- **Component Styling**: Isolated component styles with props-based theming
- **Responsive Design**: Styled-components with media queries
- **TypeScript Integration**: Full type safety with TypeScript definitions
- **Animation**: CSS-in-JS animations and transitions

### Vite Configuration
- **Development**: Lightning-fast HMR and instant server start
- **Build Optimization**: Rollup-based production builds with tree shaking
- **TypeScript**: Native TypeScript support with fast compilation
- **Asset Handling**: Optimized asset processing and static imports
- **ESLint Integration**: Modern ESLint configuration with TypeScript rules

### Go Gin API Backend
- **Framework**: Go Gin for high-performance HTTP server
- **Database**: PostgreSQL/MySQL for data persistence
- **ORM**: GORM for database operations
- **Authentication**: JWT middleware for secure authentication
- **CORS**: Cross-Origin Resource Sharing configuration
- **Middleware**: Logging, recovery, and rate limiting
- **API Documentation**: Swagger/OpenAPI integration
- **WebSocket Support**: Real-time communication via Gorilla WebSocket

### API Integration
- **Seat Authentication API**: Endpoints for seat-based student authentication
- **Session Token Management**: JWT-based tokens with seat ID, student ID, and expiration
- **Error Handling**: Comprehensive error management with seat conflict resolution
- **Loading States**: Visual indicators during authentication and seat assignment
- **WebSocket Integration**: Real-time seat assignment broadcasts and connection management
- **Local Storage**: Session token persistence for browser refresh handling
- **Connection Management**: Automatic reconnection and error handling for WebSocket connections

## System Components

```
System Architecture
├── Frontend (React)
│   ├── Components (Seat-based UI)
│   ├── Redux Store (Seat assignments)
│   ├── WebSocket Service (Seat messaging)
│   ├── Local Storage (Session tokens)
│   └── Styled Components
├── Backend (Go Gin)
│   ├── Seat Authentication API
│   ├── Session Token Management
│   ├── WebSocket Hub (Seat assignments)
│   ├── JWT Middleware
│   └── Database ORM
├── Database (PostgreSQL)
│   ├── Classes
│   ├── Students (with seat assignments)
│   ├── Seats (capacity management)
│   ├── Session Tokens
│   └── Groups
└── External Services
    ├── QR Code API (Seat-specific)
    └── Authentication Service
```

## Frontend Architecture

### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Modal, etc.)
│   ├── forms/           # Form-specific components
│   └── charts/          # Data visualization components
├── pages/               # Route-based page components
│   ├── Dashboard/
│   ├── Students/
│   ├── Groups/
│   └── ClassJoin/
├── store/               # Redux store configuration
├── services/            # API service layers
│   ├── api.ts          # REST API functions
│   ├── seatAuth.ts     # Seat authentication service
│   ├── websocket.ts    # WebSocket service (seat messaging)
│   ├── storage.ts      # Local storage utilities (session tokens)
│   └── tokenManager.ts # Session token management
├── utils/               # Utility functions
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

## Backend Architecture

### API Structure
```
src/
├── controllers/         # Request handlers
├── middleware/          # Authentication, validation, logging
├── models/             # Database models (GORM)
├── routes/             # API route definitions
├── services/           # Business logic layer
│   ├── classService.go    # Class management logic
│   ├── studentService.go  # Student operations
│   ├── seatService.go     # Seat assignment and authentication
│   ├── tokenService.go    # Session token generation and validation
│   └── websocketHub.go    # WebSocket connection and seat messaging
├── utils/              # Helper functions
├── utils/              # Helper functions
└── config/             # Environment configuration
```

## Database Design

### Core Entities
- **Classes** (classroom organization with capacity)
- **Students** (student profiles with seat assignments and points)
- **Seats** (physical seat management - ID 1 to capacity)
- **Session Tokens** (seat-based authentication tokens)
- **Groups** (auto-generated 5-student groups excluding guests)
- **WebSocket Connections** (real-time seat assignment communication)

### Key Relationships
- Classes → Seats (one-to-many, based on classroom capacity)
- Seats → Students (one-to-one per session, with session tokens)
- Students ↔ Groups (many-to-many, enrolled students only)
- Classes → Session Tokens (one-to-many, seat-specific)
- Seats → QR Codes (one-to-one, seat-specific generation)
- Classes ↔ WebSocket Connections (one-to-many for seat assignment updates)

## Security Architecture

### Authentication & Authorization
- **Teacher Authentication**: JWT-based authentication with Go Gin middleware
- **Student Authentication**: Seat-based QR code authentication with session tokens
- **Session Token Management**: JWT tokens containing studentId, classId, seatId, timestamp, expiration
- **Seat Assignment Security**: One seat per student per session enforcement
- **Token Validation**: Server-side validation with seat conflict prevention

### Data Protection
- Input validation and sanitization for seat authentication
- SQL injection prevention (GORM ORM)
- CORS protection for API endpoints
- Session token encryption and secure storage
- Seat assignment conflict prevention and validation

## Performance Considerations

### Frontend Optimization
- Code splitting with Vite and React Router dynamic imports
- Component memoization for expensive operations (React 19.1 optimizations)
- Redux Toolkit state normalization and RTK Query integration
- Lazy loading for route components with React.lazy and Suspense
- React 19.1 automatic batching and concurrent features
- Vite's fast build times and tree shaking for optimal bundles

### Backend Optimization
- Go Gin's high-performance HTTP handling
- Database query optimization with GORM
- Connection pooling
- Efficient JSON serialization

## Deployment Architecture

### Development Environment (Docker Compose)
- **Container Orchestration**: Docker Compose with Docker Watch for live reloading
- **Frontend Container**: Vite dev server with HMR, volume-mounted source code
- **Backend Container**: Go with Air live reload, auto-restart on file changes
- **Database Container**: PostgreSQL 15 with persistent volumes
- **Cache Container**: Redis for session storage and WebSocket state
- **Development Tools**: Adminer for database administration
- **Networking**: Internal Docker network with exposed ports for external access

### Docker Watch Configuration
- **Frontend**: Sync `src/` changes for instant HMR, rebuild on `package.json` changes
- **Backend**: Sync all Go files with Air live reload, ignore temporary files
- **Hot Reloading**: Both frontend and backend automatically restart on code changes
- **Volume Mounting**: Source code mounted for development, node_modules cached

### Production Environment
- **Frontend**: Static build deployment with Nginx (containerized)
- **Backend**: Go binary deployment (multi-stage Docker build)
- **Database**: Managed PostgreSQL (AWS RDS/Google Cloud SQL)
- **Cache**: Managed Redis (AWS ElastiCache/Redis Cloud)
- **CDN**: Static asset delivery optimization
- **Container Orchestration**: Kubernetes or Docker Swarm for production scaling