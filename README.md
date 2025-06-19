# ClassSwift Teacher Dashboard

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go&logoColor=white)](https://golang.org/)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-green?style=flat&logo=gitbook&logoColor=white)](docs/README.md)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

A comprehensive classroom management system that enables teachers to track student engagement, manage groups, and facilitate seamless class joining through QR codes and real-time synchronization.

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
- **React 18** with TypeScript for type-safe development
- **Redux Toolkit** for predictable state management
- **Styled Components** for component-based styling
- **WebSocket Client** for real-time communication

### Backend
- **Go** with Gin framework for high-performance API
- **WebSocket Server** for real-time synchronization
- **PostgreSQL** database for data persistence
- **RESTful API** with standardized JSON responses

### Development Tools
- **WireMock** for API mocking during frontend development
- **Jest** for frontend testing
- **Go Test** for backend unit testing
- **ESLint & Prettier** for code quality

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
│   ├── PRODUCT_REQUIREMENTS.md     # Complete feature specifications
│   ├── SYSTEM_ARCHITECTURE.md      # High-level system design
│   ├── TECHNICAL_DESIGN.md         # Implementation details & code examples
│   ├── UI_UX_DESIGN.md            # Visual design specs based on wireframe
│   ├── USER_STORIES.md            # User workflows & acceptance criteria
│   ├── TESTING_STRATEGY.md        # QA approach for frontend/backend
│   ├── DEVELOPMENT_SPRINT_PLANNING.md # 4-day implementation timeline
│   └── WIRE_FRAME.png             # Visual interface mockup
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

## Getting Started

### Prerequisites
- Node.js 18+ for frontend development
- TypeScript 5.0+ (installed via npm)
- Go 1.24+ for backend development
- PostgreSQL 15+ for database
- Redux Toolkit 2.0+ (installed via npm)
- Modern browser with WebSocket support

### Development Setup

*Note: Implementation will begin with Sprint 1 on June 20, 2025. Setup commands will be added as the codebase is developed.*

### Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [Documentation Overview](docs/README.md) | Complete navigation guide to all docs | All stakeholders |
| [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) | Feature specifications & requirements | All stakeholders |
| [System Architecture](docs/SYSTEM_ARCHITECTURE.md) | High-level design & tech stack | Developers, architects |
| [Technical Design](docs/TECHNICAL_DESIGN.md) | Implementation details & code examples | Developers |
| [UI/UX Design](docs/UI_UX_DESIGN.md) | Visual specifications & wireframe analysis | Designers, developers |
| [User Stories](docs/USER_STORIES.md) | User workflows & acceptance criteria | Product managers, QA |
| [Testing Strategy](docs/TESTING_STRATEGY.md) | QA approach & testing methods | QA engineers, developers |
| [Sprint Planning](docs/DEVELOPMENT_SPRINT_PLANNING.md) | 4-day development timeline | Project managers |
| [Wireframe](docs/WIRE_FRAME.png) | Visual interface mockup | Designers, developers |

## Contributing

This project follows a documentation-first development approach:

1. **Review Documentation**: Start with `docs/README.md` for complete navigation
2. **Follow Guidelines**: Check `.llm/code_review_prompt.md` before making changes
3. **Maintain Consistency**: Ensure code aligns with documented specifications
4. **Update Documentation**: Modify relevant docs if requirements change

## Development Timeline

**Sprint-based Development (June 20-23, 2025)**

*For detailed sprint planning, deliverables, and risk mitigation, see [DEVELOPMENT_SPRINT_PLANNING.md](docs/DEVELOPMENT_SPRINT_PLANNING.md)*

- **Sprint 1 (June 20)**: Frontend setup + Left modal UI + WireMock integration
- **Sprint 2 (June 21)**: Right modal UI + Go backend setup  
- **Sprint 3 (June 22)**: Backend APIs + Frontend-backend integration
- **Sprint 4 (June 23)**: Testing, optimization & deployment

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.