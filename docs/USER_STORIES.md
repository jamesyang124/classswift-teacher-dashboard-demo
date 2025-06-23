# ClassSwift Teacher Dashboard - User Stories

## Overview

This document contains user stories based on the wireframe design, describing the functionality from the perspective of teachers and students using the ClassSwift Teacher Dashboard system.

## Teacher User Stories

### Class Setup and QR Code Generation

**As a teacher,**  
**I want to generate a QR code for my class**  
**So that students can easily join my class session through the ClassSwift ViewSonic platform.**

**Acceptance Criteria:**
- When I open the left modal, I can see a large, scannable QR code
- The QR code contains an application redirect URL that redirects to https://www.classswift.viewsonic.io/
- The QR code is clearly displayed and readable on projection screens
- Class information (ID: X58E9647) is visible alongside the QR code with truncation if needed
- I can copy the Class ID with one click using the blue copy button
- I can copy the join link with one click using the blue copy button
- The interface shows "Join 302 Science" as the class title (truncated if exceeds 50% modal width)
- Static Teacher App version information is displayed at the bottom for reference

### Student Management and Monitoring

**As a teacher,**  
**I want to view all students in a grid layout**  
**So that I can monitor class attendance and manage student participation.**

**Acceptance Criteria:**
- When I open the right modal, I can see students arranged in a 5-column grid
- Each student card shows **Seat ID** (1, 2, 3... up to classroom capacity), student name, and current points
- **Enrolled students** have blue header backgrounds after seat-based authentication
- **Guest seats** have gray header backgrounds showing "Guest" (empty or non-enrolled)
- The header shows current enrollment "👥 16/30" indicating 16 out of 30 students
- I can switch between "Student List" and "Group" tabs
- The three-dot menu (⋮) provides "Reset Scores" and "Fresh Session" options (UI display only, non-functional)

### Scoring System

**As a teacher,**  
**I want to assign scores (0-100) to individual students**  
**So that I can track student performance and participation in real-time.**

**Acceptance Criteria:**
- Each **enrolled student** card displays current score (0-100 range, non-negative integers)
- I can click + or - buttons to adjust scores for enrolled students only
- **Minus button is disabled when student has 0 score** (enforces minimum constraint)
- Score changes are immediately reflected in the blue badges
- **Scores reset to 0 when the student panel is opened**
- Students with zero scores show gray badges with "0"
- **Guest seats cannot have scores modified** - controls remain gray and disabled

### Real-time Student Joining

**As a teacher,**  
**I want to see students appear in the grid immediately when they join through the redirect flow**  
**So that I can monitor class attendance without manual refresh.**

**Acceptance Criteria:**
- When students complete authentication via ClassSwift ViewSonic platform, they appear automatically in their specific seat position
- Student names replace "Guest" placeholders in real-time for that specific Seat ID
- Blue header background replaces gray background for authenticated seats
- The student count updates automatically (16/30, max 30 students)
- No page refresh is required to see new students
- **Seat assignments are locked** - one student per seat for entire session

### Class Navigation and Control

**As a teacher,**  
**I want to easily navigate between different views and close modals independently**  
**So that I can efficiently manage my classroom interface.**

**Acceptance Criteria:**
- I can click "< Back to Class List" to return to main class selection
- I can close left modal using X button (only closes left modal, no navigation)
- I can close right modal using X button (only closes right modal, no navigation)
- Both modals can operate independently and simultaneously
- When no modals are open, I see a blank state or return to Class List view
- Tab navigation allows switching between "Student List" and "Group" views
- The three-dot menu provides UI-only display:
  - **"Reset Scores"**: UI display only (non-functional)
  - **"Fresh Session"**: UI display only (non-functional)

## Student User Stories

### Quick Class Joining

**As a student,**  
**I want to join my class by scanning the classroom QR code**  
**So that I can authenticate through ClassSwift ViewSonic and appear in the teacher's dashboard.**

**Acceptance Criteria:**
- I can scan the **classroom QR code** displayed on the teacher's screen using my mobile device
- The QR code redirects me to https://www.classswift.viewsonic.io/ for authentication
- After completing authentication, I am redirected back to the application
- The QR code works with standard camera apps and QR scanners
- After scanning, I complete **seat-based authentication** process
- Upon successful authentication, I receive a **session token** for this seat
- My name appears in the teacher's student grid at my specific **Seat ID** without delay
- My seat card changes from gray "Guest" to blue with my name

### Alternative Joining Methods

**As a student,**  
**I want to use the Class ID for initial class identification**  
**So that I can access the correct class session before seat authentication.**

**Acceptance Criteria:**
- I can use the Class ID (X58E9647) to identify the correct class session
- I can use the classroom join link for class identification
- After class identification, I must still complete **seat-based authentication** at my physical seat
- **Session token** is only generated after successful seat authentication
- My authenticated seat assignment is reflected immediately in the teacher's interface

## Guest User Stories

### Limited Class Participation

**As a guest user (empty seat or non-enrolled student),**  
**I want to be represented in the classroom capacity**  
**So that teachers can manage physical classroom space and group formation.**

**Acceptance Criteria:**
- I appear in the student grid as "Guest" with a specific **Seat ID**
- My seat card has a gray header background instead of blue
- I am excluded from automatic group formation initially
- My score remains at 0 and shows gray badges (non-interactive)
- **Score controls are disabled** for guest seats
- Teachers can manually drag guest seats between groups as needed
- **No authentication required** - guest seats exist by default to represent classroom capacity

### Text Truncation Handling

**As a teacher,**  
**I want long text to be properly truncated in the interface**  
**So that the layout remains clean and functional regardless of text length.**

**Acceptance Criteria:**
- Class ID text can use full available width and truncates with ellipsis if needed
- Classroom name is limited to 50% of modal width maximum and truncates with ellipsis
- Student names that exceed available space are truncated with ellipsis
- Truncated text shows full content on hover (tooltip)
- Interface layout remains stable with long text inputs

## System User Stories

### Group Formation

**As the system,**  
**I want to automatically organize enrolled students into groups of 5**  
**So that teachers can easily manage collaborative activities.**

**Acceptance Criteria:**
- **Enrolled students only** are automatically grouped in sets of 5 based on seat authentication order
- **Uneven divisions** create additional smaller groups (e.g., 23 students = 4 groups of 5 + 1 group of 3)
- **Guest seats** are grouped separately after enrolled student groups are formed
- Group view shows clear visual separation between groups
- Groups are numbered sequentially (Group 1, Group 2, Group 3, etc.)
- **Local client-side storage** maintains group assignments during session

### Real-time Synchronization

**As the system,**  
**I want to maintain real-time synchronization between seat authentication and student display**  
**So that teachers have accurate, up-to-date seat assignment information.**

**Acceptance Criteria:**
- **Seat authentication** completions appear instantly in specific seat positions
- **Session tokens** are validated and stored for browser refresh persistence
- Score changes are immediately visible across all interfaces
- Student count updates automatically as students complete authentication
- **Seat assignment conflicts** are prevented (one student per seat)
- No manual refresh required for any real-time updates
- Multiple simultaneous authentications are handled without seat conflicts
- **WebSocket updates** broadcast seat assignments to teacher dashboard