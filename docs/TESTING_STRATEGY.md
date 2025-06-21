# ClassSwift Teacher Dashboard - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for ClassSwift Teacher Dashboard, covering both frontend and backend testing approaches to ensure code quality, reliability, and performance.

## Testing Strategy

### Frontend Testing
- **Unit Testing**: Test individual React components and utility functions
- **Component Testing**: Test component interactions and state management
- **Client State Management Testing**: Test Redux implementation and state handling
  - **Action Testing**: Test Redux action creators and payload validation
  - **Reducer Testing**: Test state mutations and immutability
  - **Selector Testing**: Test state selection logic and memoization
  - **Store Testing**: Test complete Redux store integration and middleware
- **UI Testing**: Test user interface behavior and visual rendering

### Backend Testing
- **Unit Testing**: Test individual functions and business logic
- **API Testing**: Test REST endpoints and request/response handling
- **Database Testing**: Test data persistence and query operations
- **Service Testing**: Test service layer integration and error handling

### Optional Testing Approaches
- **End-to-End (E2E) Testing**: Full user workflow testing across frontend and backend
- **Integration Testing**: Test component interactions and data flow between systems
- **Performance Testing**: Load testing and response time validation
- **Cross-browser Testing**: Compatibility testing across supported browsers

## Scenario-based Testing

### Core User Scenarios Testing
Based on USER_SCENARIOS.md, the following scenario-based test cases should be implemented:

#### Scenario 1: Starting a New Class Session
**Test Cases:**
- Verify left modal displays class ID (X58E9647) and QR code correctly
- Test QR code generation and display functionality
- Validate copy buttons work for Class ID and join link
- Ensure right modal shows initial state with guest seats only
- Test real-time student arrival monitoring

#### Scenario 2: Managing Student Points
**Test Cases:**
- Test point increment (+) functionality for enrolled students
- Test point decrement (-) functionality with 0-point minimum constraint
- Verify minus button is disabled when student has 0 points
- Test color-coded badges (red for negative, green for positive, gray for zero)
- Validate point changes persist during session but reset on refresh
- Ensure guest seats cannot have points modified

#### Scenario 3: Seat-based Student Authentication
**Test Cases:**
- Test seat QR code scanning simulation
- Verify student appears in specific seat position after authentication
- Test seat assignment locking (one student per seat per session)
- Validate enrolled student cards show blue headers with seat IDs
- Test session token generation and validation
- Ensure duplicate seat assignments are prevented

#### Scenario 4: Late Joining Student Integration
**Test Cases:**
- Test student joining after initial group formation
- Verify automatic group rebalancing for late joiners
- Test drag-and-drop manual group adjustment functionality
- Validate group assignments update correctly

#### Scenario 5: Guest Seat Management
**Test Cases:**
- Verify guest seats display with gray headers and seat IDs
- Test that guest seats are excluded from automatic grouping
- Validate guest seats can be manually dragged between groups
- Ensure guest seats show seat IDs (1 to capacity range)

#### Scenario 6: Automatic Group Formation
**Test Cases:**
- Test automatic 5-student group creation from enrolled students
- Verify uneven division handling (e.g., 23 students = 4 groups of 5 + 1 group of 3)
- Test guest seats grouping after enrolled student groups
- Validate group numbering (Group 1, Group 2, Group 3, etc.)
- Test local client-side group storage persistence

#### Scenario 7: Menu System Operations
**Test Cases:**
- Test three-dot menu (⋮) dropdown functionality
- Verify "Reset Points" clears all student points to zero
- Test "Fresh Session" completely resets session state
- Validate menu closes when clicking outside
- Test right-aligned dropdown positioning

### Edge Case Testing

#### Authentication Edge Cases
- Invalid seat QR code scanning attempts
- Seat conflict resolution (student tries to join occupied seat)
- Session token expiration handling
- Network connectivity issues during authentication

#### Point Management Edge Cases
- Rapid clicking of +/- buttons
- Point management during student joining
- Point persistence across browser refresh
- Large point values display

#### Group Management Edge Cases
- Group formation with minimum/maximum student counts
- Drag-and-drop conflicts between groups
- Group rebalancing with various student counts
- Manual group adjustments persistence

#### UI/UX Edge Cases
- Modal interactions with both modals open simultaneously
- Responsive behavior across different screen sizes
- Large classroom capacity testing (50+ seats)
- Real-time updates with multiple simultaneous operations

### Performance Testing Scenarios
- Large classroom capacity (50+ students) load testing
- Multiple simultaneous student authentications
- Real-time WebSocket message handling under load
- Client-side state management with large datasets

### Accessibility Testing Scenarios
- Keyboard navigation through all interface elements
- Screen reader compatibility for seat IDs and point systems
- Color contrast validation for seat status indicators
- Touch target size validation for mobile point controls

### Cross-browser Compatibility Scenarios
- QR code display and scanning across mobile browsers
- WebSocket connection stability across browser types
- Local storage persistence behavior
- Point control interactions on touch devices

## Test Implementation Guidelines

### Frontend Test Structure
```javascript
// Seat-based authentication testing
describe('Seat Authentication', () => {
  test('should assign student to specific seat after successful authentication', () => {
    // Test seat assignment logic
  });
  
  test('should prevent duplicate seat assignments', () => {
    // Test seat conflict prevention
  });
});

// Point management testing with constraints
describe('Point Management', () => {
  test('should disable minus button when student has 0 points', () => {
    // Test point constraint logic
  });
  
  test('should prevent point modification for guest seats', () => {
    // Test guest seat restrictions
  });
});
```

### Backend Test Structure
```go
// Seat-based authentication API testing
func TestSeatAuthentication(t *testing.T) {
    // Test seat assignment endpoint
    // Validate session token generation
    // Test seat conflict handling
}

// Group formation logic testing
func TestGroupFormation(t *testing.T) {
    // Test automatic 5-student grouping
    // Test uneven division handling
    // Validate guest seat exclusion
}
```

### Integration Test Scenarios
- Full seat authentication flow from QR scan to dashboard display
- Real-time WebSocket updates during multiple student joins
- Point management synchronization across UI components
- Group formation and manual adjustment workflows

This scenario-based testing approach ensures comprehensive coverage of all user workflows and edge cases defined in the user scenarios documentation.