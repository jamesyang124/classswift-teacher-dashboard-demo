# ClassSwift Teacher Dashboard - User Stories

## Overview

This document contains user stories based on the wireframe design, describing the functionality from the perspective of teachers and students using the ClassSwift Teacher Dashboard system.

## Teacher User Stories

### Class Setup and QR Code Generation

**As a teacher,**  
**I want to generate a QR code for my class**  
**So that students can easily join my class session using their mobile devices.**

**Acceptance Criteria:**
- When I open the left modal, I can see a large, scannable QR code
- The QR code is clearly displayed and readable on projection screens
- Class information (ID: X58E9647) is visible alongside the QR code
- I can copy the Class ID with one click using the blue copy button
- I can copy the join link with one click using the blue copy button
- The interface shows "Join 302 Science" as the class title
- Version information is displayed at the bottom for reference

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
- The three-dot menu (⋮) provides "Reset Points" and "Fresh Session" options

### Point Management System

**As a teacher,**  
**I want to award or deduct points for individual students**  
**So that I can track student behavior and participation in real-time.**

**Acceptance Criteria:**
- Each **enrolled student** card displays current positive points (green badges) and negative points (red badges)
- I can click + or - buttons to adjust points for enrolled students only
- **Minus button is disabled when student has 0 points** (enforces minimum constraint)
- Point changes are immediately reflected in the colored badges
- Students with no points show gray badges with "0"
- **Guest seats cannot have points modified** - controls remain gray and disabled
- Examples from wireframe:
  - Philip: -1 negative, +1 positive (red badge with 2, green badge with 1)
  - Darrell: -3 negative, +1 positive
  - Cody: -1 negative, +1 positive (showing 9 and 1)
  - Esther: -1 negative, +1 positive

### Real-time Student Joining

**As a teacher,**  
**I want to see students appear in the grid immediately when they join**  
**So that I can monitor class attendance without manual refresh.**

**Acceptance Criteria:**
- When students complete **seat-based authentication**, they appear automatically in their specific seat position
- Student names replace "Guest" placeholders in real-time for that specific Seat ID
- Blue header background replaces gray background for authenticated seats
- The student count updates automatically (16/30)
- No page refresh is required to see new students
- **Seat assignments are locked** - one student per seat for entire session

### Class Navigation and Control

**As a teacher,**  
**I want to easily navigate between different views and close modals**  
**So that I can efficiently manage my classroom interface.**

**Acceptance Criteria:**
- I can click "< Back to Class List" to return to main class selection
- I can close either modal using the X button in the top-right corner
- Both modals can operate independently and simultaneously
- Tab navigation allows switching between "Student List" and "Group" views
- The three-dot menu provides:
  - **"Reset Points"**: Clear all student points to zero
  - **"Fresh Session"**: Complete session reset requiring re-authentication

## Student User Stories

### Quick Class Joining

**As a student,**  
**I want to join my class by scanning my seat's QR code**  
**So that I can authenticate to my specific seat and appear in the teacher's dashboard.**

**Acceptance Criteria:**
- I can scan the **seat-specific QR code** at my physical seat using my mobile device
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
- My points remain at 0 and show gray badges (non-interactive)
- **Point controls are disabled** for guest seats
- Teachers can manually drag guest seats between groups as needed
- **No authentication required** - guest seats exist by default to represent classroom capacity

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
- Point changes are immediately visible across all interfaces
- Student count updates automatically as students complete authentication
- **Seat assignment conflicts** are prevented (one student per seat)
- No manual refresh required for any real-time updates
- Multiple simultaneous authentications are handled without seat conflicts
- **WebSocket updates** broadcast seat assignments to teacher dashboard