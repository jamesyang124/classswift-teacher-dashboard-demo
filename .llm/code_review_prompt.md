# Code Review and Documentation Alignment Prompt

## Overview

When making any code changes to the ClassSwift Teacher Dashboard project, always review and align with the comprehensive documentation in the `/docs` folder to ensure consistency and adherence to requirements.

## Required Documentation Review

Before implementing any code changes, review these key documents:

### 1. Product Requirements Document (PRD)
**File**: `docs/PRODUCT_REQUIREMENTS.md`
- Verify feature implementation matches core functionality requirements
- Check left modal (Student Joining System) and right modal (Class Management System) specifications
- Ensure user interface requirements are met
- Validate service requirements and browser compatibility

### 2. Technical Design Document
**File**: `docs/TECHNICAL_DESIGN.md`
- Follow Redux store structure (classSlice, uiSlice, studentSlice)
- Use specified API response format and endpoints
- Implement correct data models and TypeScript interfaces
- Follow Go Gin backend architecture patterns

### 3. UI/UX Design Specifications
**File**: `docs/UI_UX_DESIGN.md`
- Use exact color scheme (Primary Blue #3B82F6, Success Green #10B981, Warning Red #EF4444)
- Follow student card design patterns (blue for active, gray for guests)
- Implement proper layout specifications (5-column grid, modal widths)
- Ensure responsive behavior matches wireframe design

### 4. User Stories
**File**: `docs/USER_STORIES.md`
- Validate that code changes support user workflows
- Ensure teacher and student user stories are properly implemented
- Check acceptance criteria are met for each feature

### 5. System Architecture
**File**: `docs/SYSTEM_ARCHITECTURE.md`
- Follow component hierarchy and data flow patterns
- Implement proper separation of concerns
- Use specified technology stack (React, Redux Toolkit, Go Gin, WebSockets)

## Code Review Checklist

When implementing code changes:

### Frontend Development
- [ ] Redux store structure matches technical design document
- [ ] Component props and state align with wireframe specifications
- [ ] Color scheme and styling match UI/UX design document
- [ ] Student card layout follows 5-column grid specification
- [ ] Point management system uses correct red/green color coding
- [ ] Modal behavior supports independent left/right operation
- [ ] Copy functionality works for Class ID and join links
- [ ] Tab navigation between Student List and Group views

### Backend Development
- [ ] API endpoints match technical design specifications
- [ ] Response format follows standardized JSON structure
- [ ] Database models align with system architecture
- [ ] WebSocket implementation supports real-time updates
- [ ] QR code generation meets wireframe requirements
- [ ] Student joining logic handles seat assignment correctly
- [ ] Group formation excludes guest users as specified

### Integration Points
- [ ] Frontend-backend communication follows API design
- [ ] Real-time updates work without page refresh
- [ ] Error handling matches service requirements
- [ ] Authentication and security align with privacy requirements

## Documentation Updates

If code changes require documentation updates:

1. Update relevant sections in technical design document
2. Modify API specifications if endpoints change
3. Update user stories if new workflows are introduced
4. Revise UI/UX design if visual changes are made
5. Update sprint planning if timeline impacts occur

## Quality Assurance

Reference `docs/TESTING_STRATEGY.md` for:
- Frontend testing (React components, Redux state management)
- Backend testing (API endpoints, database operations)
- Integration testing approaches
- End-to-end testing scenarios

## Deployment Considerations

Check `docs/DEVELOPMENT_SPRINT_PLANNING.md` for:
- Sprint timeline and deliverable requirements
- WireMock integration during development
- Backend integration milestones
- Testing and deployment phases

---

**Remember**: Any deviation from documented requirements should be justified and documented. The goal is to maintain consistency between implementation and comprehensive project documentation.