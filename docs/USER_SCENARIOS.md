# User Scenarios

This document outlines specific user scenarios and workflows for the ClassSwift Teacher Dashboard system. **Status: Implementation Complete - All core scenarios implemented and demo-ready.**

## Overview

User scenarios describe realistic situations and step-by-step workflows that teachers and students will encounter when using the ClassSwift system. These scenarios complement the user stories and provide detailed context for implementation and testing.

## System Assumptions

The following assumptions underlie all scenarios:

### Authentication & Multi-Class Enrollment System ✅ **IMPLEMENTED**
1. **Multi-Class Enrollment**: Students can be enrolled in multiple classes simultaneously with independent seat assignments
2. **Normalized Database Schema**: Uses class_enrollments junction table with proper foreign key constraints
3. **Randomized Seat Assignment**: Students receive randomized seat numbers (1-30 or null) upon enrollment
4. **Session Management**: Authentication through ClassSwift ViewSonic platform with redirect flow
5. **Real-time Updates**: WebSocket-based real-time updates with animation system for newly seated students

### Seat Management ✅ **IMPLEMENTED**
4. **Multi-Class Seat System**: Each class has independent seat assignments with unique constraints per class
5. **Initial State**: All seats start as guest seats (gray cards) by default with 30-seat capacity
6. **Database Persistence**: Seat assignments stored in class_enrollments table with proper constraints
7. **One Seat Per Student Per Class**: Each student can have one seat per class but multiple seats across classes
8. **Seat Reset Functionality**: Teachers can reset all seated students to null via "Reset All Seats" menu option
9. **Guest Seats**: Seats without enrolled students appear as gray cards representing empty positions
10. **Animation System**: Smooth CSS transitions when students join with animation priority for real-time updates
11. **Class Context**: Seat assignments are independent per class with proper navigation between classes

### Group Management
12. **Group Formation Logic**: Uneven student divisions create additional groups (e.g., 23 students = 4 groups of 5 + 1 group of 3)
13. **Group Naming**: Sequential UI text starting from Group 1, Group 2, Group 3, etc.
14. **Group Management**: No undo functionality - teachers manually drag students between groups one at a time
15. **Single Student Operations**: Cross-group bulk operations not allowed due to tablet compatibility requirements
16. **Session Reset**: Fresh session option in menu requires students to re-scan seat QR codes then classroom QR code

## Implementation Status ✅ **COMPLETED**

The following scenarios are **fully implemented** in this demo:
- Scenario 1: Starting a New Class Session (Left modal QR/Class ID display) ✅
- Scenario 2: Managing Student Scores (Score system 0-100 with +/- buttons) ✅
- Scenario 3: Joining Class as Registered Student (Blue cards with randomized seat IDs) ✅
- Scenario 4: Late Joining Student (Multi-class enrollment support) ✅
- Scenario 5: Guest Seats in Classroom (Gray cards with 30-seat capacity) ✅
- Scenario 6: Automatic Group Formation (Client-side grouping with rounded containers) ✅
- Scenario 7: Menu System Operations (Reset All Seats functional, Fresh Session UI-only) ✅
- **NEW**: Multi-Class Navigation (Class List integration with real database classes) ✅
- **NEW**: Animation System (Smooth transitions for newly seated students) ✅
- **NEW**: Database Schema (Normalized with proper constraints and foreign keys) ✅

The following scenarios are **deferred for future phases**:
- Advanced authentication flows
- Token expiration handling
- Seat switching between enrolled students
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

### Scenario 2: Managing Student Scores ✅ **IMPLEMENTED**

**Context**: Teacher wants to give feedback to students through 0-100 score system for various behaviors or actions.

**Workflow**:
1. Teacher observes student behavior/action (positive or negative)
2. Teacher clicks + button next to student's name to increase score
3. Student score increases with blue badge display (0-100 range)
4. Teacher clicks - button next to student's name to decrease score
5. Student score decreases unless already at 0 (minimum constraint enforced)
6. When student has 0 score, minus button becomes disabled/unclickable
7. Teacher continues monitoring score totals and adjusting as needed
8. **Multi-class support**: Scores are independent per class enrollment

**Expected Outcome**: Score system maintains 0-100 range with minimum value enforcement and allows flexible feedback across multiple classes.

## Student Scenarios

### Scenario 3: Joining Class as Registered Student ✅ **IMPLEMENTED**

**Context**: Alex arrives to class and needs to check in digitally with multi-class enrollment support.

**Workflow**:
1. Alex sees QR code displayed in classroom
2. Scans QR code with phone camera
3. System redirects to ClassSwift ViewSonic for authentication
4. Alex completes authentication and is redirected back
5. Alex appears on teacher dashboard with blue card showing randomized seat ID (1-30)
6. **Animation effect**: Smooth CSS transition for newly seated student
7. Alex is automatically assigned to a group based on enrollment order
8. **Database persistence**: Enrollment stored in normalized class_enrollments table

**Expected Outcome**: Seamless check-in process with randomized seat assignment, smooth animations, and multi-class enrollment support.

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

### Scenario 6: Automatic Group Formation ✅ **IMPLEMENTED**

**Context**: Teacher wants to form balanced groups for collaborative activity with multi-class support.

**Workflow**:
1. Registered students have joined class with various enrollment patterns (0%, 20%, 40%, 60%, 80%)
2. Teacher navigates to Group tab
3. System automatically creates groups of 5 students each from enrolled students
4. **Visual containers**: Groups displayed with rounded border containers for clear separation
5. Guest seats are grouped after enrolled student groups are formed
6. Group dashboard displays students with same UI as student list (blue cards for enrolled, gray for guests, score badges)
7. **Multi-class context**: Group formation works independently for each class
8. Group assignments remain in client-side state during session

**Expected Outcome**: Fair, automatic group distribution with visual containers, multi-class support, and consistent UI elements across different classes.

### Scenario 7: Menu System Operations ✅ **IMPLEMENTED**

**Context**: Teacher needs to access system controls and bulk operations through the three-dot menu.

**Workflow**:
1. Teacher clicks three-dot menu button (...) in top-right corner
2. Dropdown menu appears with right-aligned positioning
3. Menu options available:
   - **Reset All Seats**: Functional - resets all seated students to null in current class
   - **Fresh Session**: UI display only (non-functional for demo)
4. Teacher selects "Reset All Seats"
5. System executes WebSocket broadcast and updates database
6. All students in current class are reset to null seat assignments
7. Clicking outside menu area closes dropdown without action

**Expected Outcome**: Functional seat reset capability with WebSocket real-time updates and database persistence, plus UI-only Fresh Session option.

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

### **Implementation Status - All Features Complete**
- ✅ **Fully Implemented**: Left modal display, score management (0-100), student cards, guest seats, grouping
- ✅ **Multi-Class System**: Normalized database schema, independent seat assignments per class
- ✅ **Real-time Features**: WebSocket updates, animation system, seat reset functionality
- ✅ **Class Navigation**: Class List integration with real database classes
- ✅ **Database Schema**: Proper constraints, foreign keys, unique indexes

### **7+ Main Scenarios Implemented**
1. Class session setup (modal navigation) ✅
2. Score management (0-100 range, constraints enforced) ✅
3. Student joining (blue cards, randomized seat assignment) ✅
4. Multi-class enrollment (students in multiple classes) ✅
5. Guest seat representation (gray cards, 30-seat capacity) ✅
6. Group formation (automatic + visual containers) ✅
7. Menu system operations (functional seat reset) ✅
8. **NEW**: Animation system (smooth transitions) ✅
9. **NEW**: Class List navigation (real database integration) ✅
10. **NEW**: WebSocket real-time updates ✅

#### **System Integration**
- **Error handling**: Backend failures, network issues
- **Multi-teacher**: Multiple teachers viewing same class
- **State synchronization**: Between left/right modals
- **Performance**: Large classroom capacity (50+ seats)

---

*Note: These scenarios should be used for user acceptance testing and feature validation during development.*