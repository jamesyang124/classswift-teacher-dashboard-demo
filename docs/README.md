# ClassSwift Teacher Dashboard - Documentation

This folder contains comprehensive project documentation for the ClassSwift Teacher Dashboard, a classroom management system with QR code-based student joining and real-time engagement tracking.

## 📋 Core Documentation

### [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md)
Complete product requirements document outlining:
- Core functionality (left modal for student joining, right modal for class management)
- User interface and experience requirements
- Service requirements and browser compatibility
- Security, quality assurance, and deployment specifications

### [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md)
High-level system design covering:
- Component hierarchy and data flow
- Technology stack (React 19.1.0, Vite, Redux Toolkit, Go Gin, WebSockets)
- Database design and API architecture
- Integration patterns and scalability considerations

### [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md)
Detailed technical specifications including:
- Complete TypeScript 5.4.5 interfaces and Redux store structure
- Go Gin API endpoints with request/response examples
- Database schema and models
- Styled-components theme configuration
- WebSocket implementation details

## 🎨 Design & User Experience

### [UI_UX_DESIGN.md](UI_UX_DESIGN.md)
Visual design specifications based on wireframe analysis:
- Color scheme (Blue #3B82F6, Green #10B981, Red #EF4444)
- Student card layouts and point system design
- Modal specifications and responsive behavior
- Typography and interactive element guidelines

### [WIRE_FRAME.png](WIRE_FRAME.png)
Visual wireframe showing the dual modal interface:
- Left modal: QR code display and class joining information
- Right modal: 5-column student grid with point management
- Student card examples with real data (Philip, Darrell, Cody, etc.)

### [USER_STORIES.md](USER_STORIES.md)
Comprehensive user stories covering:
- Teacher workflows (QR generation, student management, point tracking)
- Student joining processes (QR scanning, alternative methods)
- Guest user limitations and system behaviors
- Real-time synchronization and group formation

## 🧪 Testing & Development

### [TESTING_STRATEGY.md](TESTING_STRATEGY.md)
Testing approach for frontend and backend:
- Frontend: Unit, component, client state management, and UI testing
- Backend: Unit, API, database, and service testing
- Optional approaches: E2E, integration, performance, and cross-browser testing

### [DEVELOPMENT_SPRINT_PLANNING.md](DEVELOPMENT_SPRINT_PLANNING.md)
4-day sprint plan (June 20-23, 2025):
- **Day 1**: Frontend setup + left modal UI + WireMock integration
- **Day 2**: Right modal UI + Go backend setup
- **Day 3**: Backend APIs + frontend-backend integration
- **Day 4**: Testing, polish, and deployment

## 🔗 Quick Navigation

| Document | Purpose | Key Content |
|----------|---------|-------------|
| [PRD](PRODUCT_REQUIREMENTS.md) | Requirements | Feature specs, user requirements, success metrics |
| [Architecture](SYSTEM_ARCHITECTURE.md) | System Design | Component structure, tech stack, data flow |
| [Technical](TECHNICAL_DESIGN.md) | Implementation | Code examples, APIs, database schema |
| [UI/UX](UI_UX_DESIGN.md) | Visual Design | Colors, layouts, wireframe analysis |
| [User Stories](USER_STORIES.md) | User Workflows | Teacher/student scenarios, acceptance criteria |
| [Testing](TESTING_STRATEGY.md) | Quality Assurance | Testing approaches for frontend/backend |
| [Sprint Plan](DEVELOPMENT_SPRINT_PLANNING.md) | Development | Timeline, deliverables, risk mitigation |

## 📚 Documentation Usage

### For Developers
1. Start with [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) to understand what to build
2. Review [WIRE_FRAME.png](WIRE_FRAME.png) to see the visual interface
3. Reference [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) for implementation details
4. Follow [UI_UX_DESIGN.md](UI_UX_DESIGN.md) for styling and layout specifications
5. Use [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for quality assurance approach

### For Project Management
1. Review [USER_STORIES.md](USER_STORIES.md) for user workflows and acceptance criteria
2. Follow [DEVELOPMENT_SPRINT_PLANNING.md](DEVELOPMENT_SPRINT_PLANNING.md) for timeline and deliverables
3. Monitor [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for technical dependencies

### For Designers
1. Reference [UI_UX_DESIGN.md](UI_UX_DESIGN.md) for current design specifications
2. Use [WIRE_FRAME.png](WIRE_FRAME.png) as the visual reference
3. Check [USER_STORIES.md](USER_STORIES.md) for user experience requirements

---

**Note**: All documentation is interconnected and should be reviewed together for complete project understanding. Always check `.llm/code_review_prompt.md` for guidance on maintaining alignment between code and documentation.

*Last Updated: June 20, 2025*
