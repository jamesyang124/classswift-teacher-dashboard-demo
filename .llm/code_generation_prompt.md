# Code Generation Prompt

This file provides guidance for code generation based on the comprehensive documentation in the `/docs` folder.

## Core Principle: Documentation-First Implementation

All code generation MUST strictly adhere to the specifications defined in the documentation files. No implementation should deviate from the documented requirements without explicit justification and documentation updates.

## Required Documentation Review Before Code Generation

Before generating any code, MUST review these files in order:

1. **CLAUDE.md** - Project instructions and overrides (HIGHEST PRIORITY)
2. **PRODUCT_REQUIREMENTS.md** - Core functionality and business logic
3. **UI_UX_DESIGN.md** - Visual design, layout, and user interaction patterns
4. **TECHNICAL_DESIGN.md** - Implementation details, interfaces, and architecture
5. **USER_SCENARIOS.md** - **User workflows, system assumptions, and implementation scope**
6. **SYSTEM_ARCHITECTURE.md** - High-level system design and component relationships
7. **USER_STORIES.md** - User workflows and acceptance criteria
8. **TESTING_STRATEGY.md** - Quality requirements and testing approach

## Code Generation Guidelines

### Frontend Implementation
- **Framework**: React with TypeScript (versions from CLAUDE.md and package.json)
- **Build Tool**: Vite with Docker container development environment
- **State Management**: Redux Toolkit with documented slice structure
- **Styling**: Styled-components with theme from TECHNICAL_DESIGN.md
- **UI Components**: Must match wireframe specifications in UI_UX_DESIGN.md
- **Data Models**: Use TypeScript interfaces from TECHNICAL_DESIGN.md
- **Project Structure**: Follow CLAUDE.md project organization
- **Development**: Docker Compose with Docker Watch for live reloading

### Backend Implementation  
- **Framework**: Go with Gin router (as specified in TECHNICAL_DESIGN.md)
- **Development**: Docker container with Air live reload
- **API Design**: RESTful endpoints with standardized response format
- **Database**: PostgreSQL with schema from TECHNICAL_DESIGN.md
- **Cache**: Redis for session storage and WebSocket state
- **Authentication**: JWT-based system as documented
- **Environment**: Docker Compose orchestration with database and cache services

### Key Implementation Requirements

#### Implementation Scope (from USER_SCENARIOS.md)
**Included in Demo:**
1. Starting a New Class Session (Left modal QR/Class ID display)
2. Managing Student Points (Point system with +/- buttons, minimum 0)
3. Joining Class as Registered Student (Blue cards with seat IDs)
4. Late Joining Student (Active group rebalancing)
5. Guest Seats in Classroom (Gray cards with seat IDs, all seats start as guests)
6. Automatic Group Formation (Local client-side grouping, 5 students per group)
7. Menu System Operations (Three-dot menu with bulk operations)

**System Assumptions (from USER_SCENARIOS.md):**
- Seats numbered 1 to capacity, all start as guest seats
- Session persistence via local storage (no database persistence for groups/points)
- Group naming: Group1, Group2, Group3, etc.
- No undo functionality - single student drag operations only
- Point system: minimum 0, disable minus button at 0 points
- Seat ID as primary student identifier in UI

#### Dual Modal System (Critical)
- Left modal: QR code display, class joining functionality
- Right modal: Student management, point tracking
- Independent operation as specified in UI_UX_DESIGN.md

#### Student Management Features
- Real-time updates when students join via QR
- Point system with color-coded badges (red negative, green positive)
- 5-student group formation with remainder handling
- Blue cards for active students, gray for guests
- Late joiner integration with automatic group rebalancing

#### Data Flow Requirements
- Redux store structure from TECHNICAL_DESIGN.md
- API endpoints exactly as documented
- WebSocket integration for real-time updates (if implemented)
- Local storage for session persistence and group assignments

## Mandatory Checks Before Code Generation

1. **Wireframe Alignment**: Does the code match WIRE_FRAME.png specifications?
2. **Scenario Scope**: Is the implementation within USER_SCENARIOS.md defined scope?
3. **System Assumptions**: Do implementation details follow USER_SCENARIOS.md assumptions?
4. **Technical Consistency**: Are TypeScript interfaces and API contracts followed?
5. **UI/UX Compliance**: Do colors, layout, and interactions match design specs?
6. **Architecture Adherence**: Is the component structure as documented?
7. **Testing Coverage**: Can the code be tested per TESTING_STRATEGY.md?

## Code Quality Standards

- **TypeScript**: Strict typing, no `any` types
- **Error Handling**: Comprehensive error states and user feedback
- **Performance**: Optimized renders, proper memoization
- **Accessibility**: ARIA labels, keyboard navigation support
- **Testing**: Unit and integration test compatibility

## Documentation Update Requirements

If code generation requires deviation from documented specifications:

1. **Document the change** in relevant .md files
2. **Justify the deviation** with technical reasoning  
3. **Update dependent documentation** to maintain consistency
4. **Follow change review process** from code_review_prompt.md

### Version Change Protocol

When making code changes or version updates:

1. **Review CLAUDE.md** for current version specifications
2. **Update package.json** with new dependency versions
3. **Check documentation alignment**:
   - SYSTEM_ARCHITECTURE.md for major framework versions (React, Redux Toolkit)
   - TECHNICAL_DESIGN.md for significant API or interface changes
   - DEVELOPMENT_SPRINT_PLANNING.md for technology stack references
4. **Update only necessary version references** in documentation:
   - Major framework versions (React 19.x → 20.x)
   - Breaking API changes requiring documentation updates
   - Significant capability additions that affect architecture
5. **Avoid documenting patch/minor versions** unless they introduce breaking changes
6. **Single source of truth**: CLAUDE.md and package.json hold authoritative version information

### Development Workflow

All code generation should support the Docker Compose development environment:

- **Local Development**: Use `docker-compose up --watch` for full-stack development
- **Frontend**: Vite HMR in container with volume-mounted source code
- **Backend**: Go Air live reload in container with database and Redis
- **Database**: PostgreSQL container with persistent storage and migrations
- **Testing**: All services available for integration testing in containers

## Sprint Timeline Alignment

Code generation should align with the 4-day sprint plan (June 20-23, 2025):

- **Day 1**: Docker setup, frontend container, left modal, API mocking
- **Day 2**: Backend container, right modal UI, database integration
- **Day 3**: Backend APIs, frontend-backend integration, WebSocket setup
- **Day 4**: Testing, polish, production Docker builds

## Implementation Priorities

1. **Core Functionality**: QR joining, student management, point tracking
2. **UI Fidelity**: Exact wireframe implementation
3. **Real-time Features**: Live updates, WebSocket integration
4. **Error Handling**: Comprehensive user feedback
5. **Performance**: Optimal loading and rendering
6. **Testing**: Full coverage per testing strategy

## Code Generation Output Format

Generated code should include:
- **File headers** with purpose and documentation references
- **TypeScript interfaces** matching TECHNICAL_DESIGN.md
- **Component documentation** explaining wireframe alignment
- **Error handling** with user-friendly messages
- **Test setup** compatible with testing strategy

## Validation Checklist

Before finalizing any generated code:

- [ ] Matches documented TypeScript interfaces
- [ ] Implements wireframe design exactly
- [ ] Follows Redux store structure
- [ ] Uses documented API endpoints
- [ ] Includes proper error handling
- [ ] Supports documented user workflows
- [ ] Maintains performance requirements
- [ ] Enables comprehensive testing

This prompt ensures all generated code maintains strict alignment with the comprehensive documentation foundation established for the ClassSwift Teacher Dashboard project.