# ClassSwift Teacher Dashboard

[![React](https://img.shields.io/badge/React-19.1+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go&logoColor=white)](https://golang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com/)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-green?style=flat&logo=gitbook&logoColor=white)](docs/README.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

A comprehensive classroom management system that enables teachers to track student engagement, manage groups, and facilitate seamless class joining through QR codes and real-time synchronization.

## Quick Start

### Prerequisites
- Docker Desktop (includes Docker Compose)
- Git
- Make (optional, for convenient commands)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd classswift-teacher-dashboard-demo

# Start development environment (choose one)
make dev                    # Using Makefile (recommended)
docker-compose up --watch   # Direct Docker Compose command
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database Admin: http://localhost:8080 (Adminer)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Features

### QR Code Class Joining
- **Instant Access**: Students scan QR codes to join classes immediately
- **Multiple Join Methods**: QR code, Class ID, or direct join link
- **Real-time Updates**: Students appear in teacher dashboard without refresh

### Student Management
- **Visual Grid Layout**: 5-column responsive student grid with seat assignments
- **Point System**: Real-time positive/negative point tracking with color-coded badges
- **Guest Support**: Limited participation for non-enrolled students
- **Auto-grouping**: Automatic 5-student group formation for collaborative activities

### Teacher Dashboard
- **Dual Modal Interface**: Independent left (QR joining) and right (student management) modals
- **Live Monitoring**: Real-time student engagement tracking
- **Easy Controls**: One-click point adjustments and copy-to-clipboard functionality
- **Tab Navigation**: Switch between individual student view and group view

## Technology Stack

### Frontend
- **React 19.1** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Redux Toolkit** for predictable state management
- **Styled Components** for component-based styling
- **WebSocket Client** for real-time communication

### Backend
- **Go 1.21** with Gin framework for high-performance API
- **WebSocket Server** for real-time synchronization
- **PostgreSQL 15** database for data persistence
- **Redis** for session storage and WebSocket state
- **RESTful API** with standardized JSON responses

### Development Environment
- **Docker Compose** with Docker Watch for live reloading
- **Multi-container orchestration** (frontend, backend, database, cache)
- **Volume mounting** for instant code changes
- **Adminer** for database administration

## Project Status

**Current Phase**: Documentation Complete - Ready for Implementation

This project follows a documentation-first approach with comprehensive specifications:

- ✅ Product Requirements Document
- ✅ System Architecture Design
- ✅ Technical Implementation Specifications
- ✅ UI/UX Design Guidelines with Wireframe
- ✅ User Stories and Acceptance Criteria
- ✅ Testing Strategy
- ✅ 4-Day Sprint Development Plan
- 🔄 **Next**: Frontend Implementation (Sprint 1 - June 20, 2025)

## Project Structure

```
classswift-teacher-dashboard-demo/
├── docs/                           # Comprehensive documentation
│   ├── README.md                    # Documentation navigation guide
│   ├── PRODUCT_REQUIREMENTS.md     # Complete feature specifications
│   ├── SYSTEM_ARCHITECTURE.md      # High-level system design
│   ├── TECHNICAL_DESIGN.md         # Implementation details & code examples
│   ├── UI_UX_DESIGN.md            # Visual design specs based on wireframe
│   ├── USER_STORIES.md            # User workflows & acceptance criteria
│   ├── USER_SCENARIOS.md          # Detailed user interaction scenarios
│   ├── TESTING_STRATEGY.md        # QA approach for frontend/backend
│   ├── DEVELOPMENT_SPRINT_PLANNING.md # 4-day implementation timeline
│   ├── WIRE_FRAME.png             # Visual interface mockup
│   └── spikes/                    # Development spikes and prototypes
│       ├── SPIKES_20250620.md     # Development spike documentation
│       ├── SCREENSHOT_20250620_1.png # UI prototype screenshots
│       └── SCREENSHOT_20250620_2.png # UI prototype screenshots
├── .llm/                          # AI development guidelines
│   └── code_review_prompt.md      # Documentation alignment requirements
├── frontend/                      # React TypeScript application
└── backend/                       # Go Gin API server
```

## Interface Preview

The application features a clean dual-modal interface:

### Left Modal - Class Joining
- Large QR code display for easy scanning
- Class ID (e.g., "X58E9647") with copy button
- Join link sharing functionality
- Class information and navigation

### Right Modal - Student Management
- 5-column grid showing all students (01-20+ seats)
- Color-coded student cards (blue for active, gray for guests)
- Real-time point management with +/- controls
- Tab navigation between Student List and Group views

*See [WIRE_FRAME.png](docs/WIRE_FRAME.png) for complete visual reference.*

## Development Commands

Simple Makefile commands for common Docker operations:

```bash
make help     # Show available commands
make dev      # Start development with live reloading
make up       # Start services in background
make down     # Stop all services
make logs     # Show service logs
make clean    # Clean restart (removes data)
```

### Quick Development Workflow

```bash
# Start development
make dev

# View logs (in another terminal)
make logs

# Clean restart when needed
make clean
```

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React + Vite  │◄──►│   Go + Gin      │◄──►│  PostgreSQL     │
│   Port: 5173    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │     Redis       │
                    │   Port: 6379    │
                    └─────────────────┘
```

### Individual Development (Alternative)
```bash
# Frontend (requires Node.js 20+)
cd frontend
npm install
npm run dev

# Backend (requires Go 1.21+)
cd backend
go mod download
go run .
```

### Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [Documentation Overview](docs/README.md) | Complete navigation guide to all docs | All stakeholders |
| [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) | Feature specifications & requirements | All stakeholders |
| [System Architecture](docs/SYSTEM_ARCHITECTURE.md) | High-level design & tech stack | Developers, architects |
| [Technical Design](docs/TECHNICAL_DESIGN.md) | Implementation details & code examples | Developers |
| [UI/UX Design](docs/UI_UX_DESIGN.md) | Visual specifications & wireframe analysis | Designers, developers |
| [User Stories](docs/USER_STORIES.md) | User workflows & acceptance criteria | Product managers, QA |
| [User Scenarios](docs/USER_SCENARIOS.md) | Detailed user interaction scenarios | Product managers, UX |
| [Testing Strategy](docs/TESTING_STRATEGY.md) | QA approach & testing methods | QA engineers, developers |
| [Sprint Planning](docs/DEVELOPMENT_SPRINT_PLANNING.md) | 4-day development timeline | Project managers |
| [Development Spikes](docs/spikes/SPIKES_20250620.md) | Development spikes and prototypes | Developers |
| [Wireframe](docs/WIRE_FRAME.png) | Visual interface mockup | Designers, developers |
| [UI Screenshots](docs/spikes/) | UI prototype screenshots | Designers, developers |

## Contributing

This project follows a documentation-first development approach with Docker-based development:

1. **Start with Docker**: Use `make dev` for full-stack development
2. **Review Documentation**: Start with `docs/README.md` for complete navigation
3. **Follow Guidelines**: Check `.llm/code_review_prompt.md` before making changes
4. **Maintain Consistency**: Ensure code aligns with documented specifications
5. **Test in Containers**: All development and testing should work in Docker environment
6. **Update Documentation**: Modify relevant docs if requirements change

### Docker Development Workflow
- Use `make dev` or `make frontend-dev` for instant code reloading
- Frontend changes sync automatically to container
- Backend restarts with Air on Go file changes
- Database and Redis available for integration testing
- All services networking configured automatically

## Development Timeline

**Sprint-based Development (June 20-23, 2025)**

*For detailed sprint planning, deliverables, and risk mitigation, see [DEVELOPMENT_SPRINT_PLANNING.md](docs/DEVELOPMENT_SPRINT_PLANNING.md)*

- **Sprint 1 (June 20)**: Docker setup + Frontend container + Left modal UI
- **Sprint 2 (June 21)**: Backend container + Right modal UI + Database integration  
- **Sprint 3 (June 22)**: Backend APIs + Frontend-backend integration + WebSocket setup
- **Sprint 4 (June 23)**: Testing, optimization & production Docker builds

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.