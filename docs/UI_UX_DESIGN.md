# ClassSwift Teacher Dashboard - UI/UX Design

## Overview

This document contains the visual design requirements and user experience guidelines for the ClassSwift Teacher Dashboard application, based on the wireframe design and interface specifications.

## Wireframe Analysis

The interface consists of two primary modal panels operating independently:

### Left Modal - Class Joining Interface
- **Header**: "Join 302 Science" with back navigation ("< Back to Class List") - left-aligned
- **Close Button**: X button in top-right corner
- **Class Information Section**:
  - ID: "X58E9647" with blue copy button (left-aligned in same line with Link)
  - Link: blue copy button only (no URL display) for easy sharing
- **QR Code Display**: Large QR code (360x360px) for mobile scanning with 5% margin from container (no title, maximized to fit both height and width within left modal)
- **Version Information**: "Version 1.1.7" displayed at bottom

### Right Modal - Student Management Interface
- **Header**: Class name "302 Science" with student count indicator "👥 16/30"
- **Close Button**: X button in top-right corner
- **Three-dot Menu**: "⋮" in top-right for additional actions
- **Tab Navigation**: 
  - "Student List" (active/blue)
  - "Group" (inactive/gray)
- **Student Grid Layout**: 5-column responsive grid (seats 01-20 visible)

## Visual Design Specifications

### Color Scheme
- **Primary Blue**: #3B82F6 (active students, copy buttons, active tabs)
- **Success Green**: #10B981 (positive points indicators)
- **Warning Red**: #EF4444 (negative points indicators)
- **Neutral Gray**: #9CA3AF (inactive elements, guest students)
- **Background**: White (#FFFFFF) for modal content
- **Modal Backdrop**: Semi-transparent overlay

### Student Card Design
- **Enrolled Students**: Blue header background (#3B82F6) for authenticated students
- **Guest Seats**: Gray header background (#9CA3AF) for empty/non-enrolled seats
- **Card Structure**:
  - **Seat ID** prominently displayed in header (1, 2, 3... up to classroom capacity)
  - Student name in center (or "Guest" for unassigned seats)
  - Point indicators at bottom (red/green badges with +/- controls)
  - Point management controls disabled for guest seats
- **Seat ID Display**: 
  - Primary identifier for each seat position
  - Clearly visible in top-left corner of each card
  - Consistent formatting across all seats
  - Helps teachers identify specific physical seats

### Point System Visual Design
- **Negative Points**: Red circular badges with white numbers
- **Positive Points**: Green circular badges with white numbers
- **Point Controls**: 
  - Small +/- buttons adjacent to point displays
  - Minus button disabled when student has 0 points (visual indication)
  - Controls disabled for guest seats
- **Zero State**: Gray badges for students with no points
- **Guest Seats**: Point controls and badges remain gray and non-interactive

### Typography
- **Header Text**: Bold, 18px for modal titles
- **Student Names**: Medium, 16px for primary identification
- **Seat Numbers**: Bold, 14px in header sections
- **Point Numbers**: Medium, 12px in colored badges
- **Button Text**: Medium, 12px for copy buttons and controls

### Layout Specifications
- **Left Modal Width**: Approximately 400px for optimal QR code display with responsive layout
- **Right Modal Width**: Approximately 800px for 5-column student grid
- **Student Cards**: Equal width in 5-column grid
- **Card Height**: Consistent across all student entries
- **Spacing**: 8px gap between student cards
- **Padding**: 16px internal padding for modal content
- **Border Radius**: 8px for cards and buttons

### Interactive Elements
- **Copy Buttons**: Blue background with white text and copy icon
- **Point Controls**: 
  - Small clickable +/- buttons for enrolled students
  - Disabled state styling for guest seats
  - Minus button disabled when points = 0
- **Tab Navigation**: Clear active/inactive states
- **Close Buttons**: Standard X icon in corners
- **Three-dot Menu**:
  - Dropdown trigger (⋮) in top-right corner
  - Right-aligned dropdown with:
    - "Reset Points" - Clear all student points to zero
    - "Fresh Session" - Complete session reset
  - Click outside to close without action

### Responsive Behavior
- **Desktop**: Dual modal layout as shown
- **Tablet**: Stacked modal approach
- **Mobile**: Single modal with tab switching

### Accessibility Considerations
- **Color Contrast**: Sufficient contrast ratios for all text
- **Touch Targets**: Minimum 44px for mobile interactions
- **Focus States**: Clear keyboard navigation indicators
- **Screen Reader**: Proper ARIA labels for all interactive elements

## User Experience Guidelines

### Seat-based Student Joining Flow
1. Teacher displays left modal with classroom QR code for class identification
2. Students scan seat-specific QR codes at their physical seats
3. Students complete seat-based authentication process  
4. Enrolled students appear immediately in specific seat positions in right modal grid
5. Seat cards transform from gray "Guest" to blue with student name
6. Real-time updates without page refresh

### Point Management Flow
1. Teacher opens right modal
2. Locates student by seat ID in grid layout
3. Uses +/- controls to adjust points (enrolled students only)
4. Minus button becomes disabled when student reaches 0 points
5. Immediate visual feedback with color-coded badges
6. Guest seats remain non-interactive with gray styling

### Navigation Patterns
- **Modal Independence**: Both modals operate simultaneously
- **Clear Exit Points**: X buttons for closing modals
- **Persistent State**: Interface maintains state during session