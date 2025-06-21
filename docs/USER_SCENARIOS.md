# User Scenarios

This document outlines specific user scenarios and workflows for the ClassSwift Teacher Dashboard system.

## Overview

User scenarios describe realistic situations and step-by-step workflows that teachers and students will encounter when using the ClassSwift system. These scenarios complement the user stories and provide detailed context for implementation and testing.

## System Assumptions

The following assumptions underlie all scenarios:

### Authentication & Session Management
1. **Seat-based Authentication**: Enrolled students enter the classroom, find a physical seat, and scan a QR code specific to that seat
2. **Authentication Process**: QR code scanning initiates an authentication process that verifies student enrollment
3. **Session Token**: Upon successful authentication, student receives a session token containing:
   - Student ID (unique identifier for enrolled student)
   - Class ID (current class session identifier)
   - Seat ID (physical seat number, 1 to classroom capacity)
   - Joined timestamp (when student joined the session)
   - Token expiration time (session duration limit)

### Seat Management
4. **Seat Assignment**: Each seat has a unique ID (1 to capacity) and can only be occupied by one student per session
5. **Initial State**: All seats start as guest seats (gray cards) by default
6. **Seat Persistence**: Once a student scans the QR code for a specific seat, that seat assignment is locked for the entire class session
7. **One Seat Per Student**: Each enrolled student can only be assigned to one seat during the class session
8. **Seat Changes**: Students can only change to empty seats or guest seats, or through a mutual agreement flow with another enrolled student (not implemented in this demo)
9. **Guest Seats**: Seats without authenticated students appear as gray cards representing either empty seats or non-enrolled attendees
10. **Student Identification**: UI displays seat ID as primary identifier for students
11. **Session Persistence**: Client device retains previous session info on browser refresh (local storage, no database persistence)

### Group Management
12. **Group Formation Logic**: Uneven student divisions create additional groups (e.g., 23 students = 4 groups of 5 + 1 group of 3)
13. **Group Naming**: Sequential UI text starting from Group1, Group2, Group3, etc.
14. **Group Management**: No undo functionality - teachers manually drag students between groups one at a time
15. **Single Student Operations**: Cross-group bulk operations not allowed due to tablet compatibility requirements
16. **Session Reset**: Fresh session option in menu requires students to re-scan seat QR codes then classroom QR code

## Demo Implementation Scope

The following scenarios are **included** in this demo implementation:
- Scenario 1: Starting a New Class Session (Left modal QR/Class ID display)
- Scenario 2: Managing Student Points (Point system with +/- buttons)
- Scenario 3: Joining Class as Registered Student (Blue cards with seat IDs)
- Scenario 4: Late Joining Student (Active group rebalancing)
- Scenario 5: Guest Seats in Classroom (Gray cards with seat IDs)
- Scenario 6: Automatic Group Formation (Local client-side grouping)
- Scenario 7: Menu System Operations (Three-dot menu with bulk operations)

The following scenarios are **not implemented** but will have **mock backend responses if necessary for demo**:
- Seat-based QR code scanning and authentication process
- Session token generation and validation
- Seat switching flows between enrolled students
- Token expiration handling
- Early leavers: Students leaving mid-session

## Teacher Scenarios

### Scenario 1: Starting a New Class Session

**Context**: Teacher wants to allow students to join the classroom session digitally.

**Workflow**:
1. Teacher opens ClassSwift dashboard (defaults to right modal showing classroom student info)
2. Teacher opens left modal to access class ID (e.g., X58E9647) and QR code
3. Teacher displays QR code on classroom projector or screen
4. Students join by scanning QR code or entering class ID directly
5. Teacher monitors real-time student arrivals on right modal dashboard

**Expected Outcome**: Students can join the session using the class ID, and teacher can track arrivals in real-time.

### Scenario 2: Managing Student Points

**Context**: Teacher wants to give feedback to students through point system for various behaviors or actions.

**Workflow**:
1. Teacher observes student behavior/action (positive or negative)
2. Teacher clicks + button next to student's name for positive actions
3. Student receives positive point (green badge)
4. Teacher clicks - button next to student's name for negative actions  
5. Student receives negative point (red badge), unless already at 0 points
6. When student has 0 points, minus button becomes disabled/unclickable
7. Teacher continues monitoring point totals and adjusting as needed

**Expected Outcome**: Point system maintains minimum value of 0 and allows flexible feedback for any student action or behavior.

## Student Scenarios

### Scenario 3: Joining Class as Registered Student

**Context**: Alex arrives to class and needs to check in digitally.

**Workflow**:
1. Alex sees QR code displayed in classroom
2. Scans QR code with phone camera
3. System recognizes Alex as registered student
4. Alex appears on teacher dashboard with blue card showing seat ID (1-capacity range)
5. Alex is automatically assigned to a group

**Expected Outcome**: Seamless check-in process with seat ID assignment and immediate visibility to teacher.

### Scenario 4: Late Joining Student

**Context**: Student arrives after automatic group formation has already occurred.

**Workflow**:
1. Student scans QR code for available seat
2. Student appears on dashboard with blue card showing seat ID
3. System actively updates group assignments to accommodate late joiner
4. Student is automatically placed in group with available space or new group is created
5. Teacher can manually adjust group assignment if needed via drag-and-drop

**Expected Outcome**: Late joiners are seamlessly integrated into existing group structure with automatic rebalancing.

### Scenario 5: Guest Seats in Classroom

**Context**: Teacher needs to track physical classroom capacity including empty seats or non-enrolled students.

**Workflow**:
1. Dashboard displays gray cards representing guest seats with seat IDs (1-capacity range)
2. Guest seats represent either empty physical seats or students not enrolled in this class
3. Guest cards do not require QR code scanning to appear
4. Guest seats are initially grouped after registered students complete their automatic grouping
5. Teacher can drag guest seats to different groups as needed for classroom management

**Expected Outcome**: Teacher can manage both enrolled students and guest seats flexibly within group structure using seat ID system.

## Group Management Scenarios

### Scenario 6: Automatic Group Formation

**Context**: Teacher wants to form balanced groups for collaborative activity.

**Workflow**:
1. Registered students have joined class (count varies by session)
2. Teacher initiates group formation
3. System automatically creates groups of 5 students each from registered students (stored locally on teacher's device)
4. Guest seats are grouped after registered student groups are formed
5. Group dashboard displays students with same UI as student list (blue cards for registered, gray for guests, point badges)
6. Teacher can drag student cards between groups for manual adjustments
7. Group assignments remain only on teacher's client device (no database persistence)

**Expected Outcome**: Fair, automatic group distribution with flexible manual reorganization using consistent UI elements, persisted locally for session.

### Scenario 7: Menu System Operations

**Context**: Teacher needs to access system controls and bulk operations through the three-dot menu.

**Workflow**:
1. Teacher clicks three-dot menu button (...) in top-right corner
2. Dropdown menu appears with right-aligned positioning
3. Menu options available:
   - Reset Points: Clear all student points to zero
   - Fresh Session: Reset entire session (requires students to re-scan seat QR codes then classroom QR code)
4. Teacher selects desired option
5. System executes action and closes menu
6. Clicking outside menu area closes dropdown without action

**Expected Outcome**: Centralized access to system management functions with clear dropdown interface and bulk operation capabilities.

## Edge Cases and Error Scenarios

### Scenario 8: Duplicate Student Join Attempts

**Context**: Student accidentally scans QR code multiple times.

**Workflow**:
1. Student scans QR code
2. Successfully joins class
3. Student scans same QR code again
4. System recognizes duplicate attempt
5. Shows "Already joined" message
6. No duplicate entry created

**Expected Outcome**: System prevents duplicate entries and provides clear feedback.

---

## Summary and Potential Missing Elements

### **Core System Model**
- **Seat-based authentication**: Students scan QR codes at physical seats (numbered 1-capacity)
- **Session tokens**: Include student ID, class ID, seat ID, timestamp, expiration
- **Dual modal UI**: Left (QR/Class ID) + Right (student management)
- **Point system**: 0 minimum, disabled minus at 0, color-coded badges
- **Group formation**: Auto 5-student groups, local storage only

### **Demo Implementation Scope**
- ✅ **Implemented**: Left modal display, point management, student cards, guest seats, grouping
- 🔧 **Mock if needed**: Authentication, tokens, seat switching, expiration handling
- 🤔 **Consider**: WebSocket real-time updates

### **7 Main Scenarios Covered**
1. Class session setup (modal navigation)
2. Point management (constraints defined)
3. Student joining (blue cards, seat assignment)
4. Late joining student (active group rebalancing)
5. Guest seat representation (gray cards, no scanning)
6. Group formation (automatic + manual drag)
7. Menu system operations (bulk operations and settings)

#### **System Integration**
- **Error handling**: Backend failures, network issues
- **Multi-teacher**: Multiple teachers viewing same class
- **State synchronization**: Between left/right modals
- **Performance**: Large classroom capacity (50+ seats)

---

*Note: These scenarios should be used for user acceptance testing and feature validation during development.*