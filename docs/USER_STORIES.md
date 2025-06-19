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
- Each student card shows seat number (01, 02, 03...), student name, and current points
- Active students have blue header backgrounds (Philip, Darrell, Cody, etc.)
- Guest students have gray header backgrounds and show "Guest" as name
- The header shows current enrollment "👥 16/30" indicating 16 out of 30 students
- I can switch between "Student List" and "Group" tabs
- The three-dot menu (⋮) provides additional class management options

### Point Management System

**As a teacher,**  
**I want to award or deduct points for individual students**  
**So that I can track student behavior and participation in real-time.**

**Acceptance Criteria:**
- Each student card displays current positive points (green badges) and negative points (red badges)
- I can click + or - buttons to adjust points for any student
- Point changes are immediately reflected in the colored badges
- Students with no points show gray badges with "0"
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
- When students scan the QR code, they appear automatically in available seats
- Student names replace "Guest" placeholders in real-time
- The student count updates automatically (16/30)
- No page refresh is required to see new students
- Students are assigned to sequential seat numbers (01, 02, 03...)

### Class Navigation and Control

**As a teacher,**  
**I want to easily navigate between different views and close modals**  
**So that I can efficiently manage my classroom interface.**

**Acceptance Criteria:**
- I can click "< Back to Class List" to return to main class selection
- I can close either modal using the X button in the top-right corner
- Both modals can operate independently and simultaneously
- Tab navigation allows switching between "Student List" and "Group" views
- The three-dot menu provides access to additional class management features

## Student User Stories

### Quick Class Joining

**As a student,**  
**I want to join my class by scanning a QR code**  
**So that I can quickly access the class session without typing complex codes.**

**Acceptance Criteria:**
- I can scan the QR code using my mobile device camera
- The QR code works with standard camera apps and QR scanners
- After scanning, I am immediately added to the class roster
- My name appears in the teacher's student grid without delay
- I am assigned to the next available seat number

### Alternative Joining Methods

**As a student,**  
**I want to join the class using the Class ID or join link**  
**So that I have backup options if QR scanning doesn't work.**

**Acceptance Criteria:**
- I can manually enter the Class ID (X58E9647) to join
- I can use the direct join link shared by the teacher
- Both methods result in the same automatic seat assignment
- My entry is reflected immediately in the teacher's interface

## Guest User Stories

### Limited Class Participation

**As a guest user,**  
**I want to join the class session with restricted capabilities**  
**So that I can participate without full student privileges.**

**Acceptance Criteria:**
- I appear in the student grid with "Guest" as my name
- My seat card has a gray header background instead of blue
- I am excluded from automatic group formation
- My points remain at 0 and show gray badges
- Teachers can still manage my participation through the interface

## System User Stories

### Group Formation

**As the system,**  
**I want to automatically organize students into groups of 5**  
**So that teachers can easily manage collaborative activities.**

**Acceptance Criteria:**
- Students are automatically grouped in sets of 5 based on joining order
- Guest users are excluded from group formation
- Group view shows clear visual separation between groups
- Groups are numbered sequentially (Group 1, Group 2, etc.)

### Real-time Synchronization

**As the system,**  
**I want to maintain real-time synchronization between QR joining and student display**  
**So that teachers have accurate, up-to-date class information.**

**Acceptance Criteria:**
- Student joins via QR code appear instantly in the grid
- Point changes are immediately visible across all interfaces
- Student count updates automatically as students join/leave
- No manual refresh required for any real-time updates
- Multiple simultaneous joins are handled without conflicts