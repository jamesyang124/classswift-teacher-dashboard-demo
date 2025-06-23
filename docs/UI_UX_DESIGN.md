# ClassSwift Teacher Dashboard - UI/UX Design

## Overview

This document contains the visual design requirements and user experience guidelines for the ClassSwift Teacher Dashboard application, based on the wireframe design and interface specifications.

## Wireframe Analysis

The interface consists of two primary modal panels operating independently:

### Left Modal - Class Joining Interface
- **Header**: "Join 302 Science" with back navigation ("< Back to Class List") - left-aligned
- **Close Button**: X button in top-right corner
- **Class Information Section**:
  - ID: "X58E9647" with blue copy button (left-aligned in same line with Link, truncated if exceeds available width)
  - Link: blue copy button only (no URL display) for easy sharing
- **QR Code Display**: Large QR code (360x360px) containing application redirect URL that redirects students to https://www.classswift.viewsonic.io/ (no title, maximized to fit both height and width within left modal)
- **Version Information**: Static Teacher App version string displayed at bottom

### Right Modal - Student Management Interface
- **Header**: Class name "302 Science" (truncated if exceeds 50% of modal width) with student count indicator "16/30" and extra icon
- **Close Button**: X button in top-right corner
- **Three-dot Menu**: "⋮" in top-right for additional actions
- **Tab Navigation**: 
  - "Student List" (active/blue)
  - "Group" (inactive/gray)
- **Student Grid Layout**: 5-column responsive grid (seats 01-20 visible)

## Visual Design Specifications

### Color Scheme
- **Primary Blue**: #3B82F6 (active students, copy buttons, active tabs, score badges)
- **Neutral Gray**: #9CA3AF (inactive elements, guest students, zero scores)
- **Background**: White (#FFFFFF) for modal content
- **Modal Backdrop**: Semi-transparent overlay

### Student Card Design
- **Enrolled Students**: Blue header background (#3B82F6) for authenticated students
- **Guest Seats**: Gray header background (#9CA3AF) for empty/non-enrolled seats
- **Card Structure**:
  - **Seat ID** prominently displayed in header (1, 2, 3... up to classroom capacity)
  - Student name in center (or "Guest" for unassigned seats)
  - Score indicator at bottom (0-100 value with +/- controls)
  - Score management controls disabled for guest seats
- **Seat ID Display**: 
  - Primary identifier for each seat position
  - Clearly visible in top-left corner of each card
  - Consistent formatting across all seats
  - Helps teachers identify specific physical seats

### Scoring System Visual Design
- **Score Display**: Single score badge showing 0-100 value (non-negative integers)
- **Score Colors**: Blue background for active students, gray for guests
- **Score Controls**: 
  - Small +/- buttons adjacent to score displays
  - Minus button disabled when student has 0 score (visual indication)
  - Controls disabled for guest seats
- **Score Reset**: Scores reset to 0 when student panel opens
- **Guest Seats**: Score controls and badges remain gray and non-interactive

### Typography
- **Header Text**: Bold, 18px for modal titles
- **Student Names**: Medium, 16px for primary identification
- **Seat Numbers**: Bold, 14px in header sections
- **Score Numbers**: Medium, 12px in colored badges
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
- **Score Controls**: 
  - Small clickable +/- buttons for enrolled students
  - Disabled state styling for guest seats
  - Minus button disabled when score = 0
- **Tab Navigation**: Clear active/inactive states
- **Close Buttons**: Standard X icon in corners
- **Three-dot Menu**:
  - Dropdown trigger (⋮) in top-right corner
  - Right-aligned dropdown with:
    - "Reset Scores" - UI display only (non-functional)
    - "Fresh Session" - UI display only (non-functional)
  - Click outside to close without action
  - Actions are UI-only for current phase

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

### Student Joining Flow with Redirect
1. Teacher displays left modal with QR code containing application redirect URL
2. Students scan QR code which redirects them to https://www.classswift.viewsonic.io/
3. Students complete authentication process on ClassSwift ViewSonic platform
4. Students are redirected back to application with session tokens
5. Enrolled students appear immediately in specific seat positions in right modal grid
6. Seat cards transform from gray "Guest" to blue with student name
7. Real-time updates without page refresh

### Score Management Flow
1. Teacher opens right modal (scores reset to 0 when panel opens)
2. Locates student by seat ID in grid layout
3. Uses +/- controls to adjust scores 0-100 (enrolled students only)
4. Minus button becomes disabled when student reaches 0 score
5. Immediate visual feedback with score display
6. Guest seats remain non-interactive with gray styling

### Navigation Patterns
- **Modal Independence**: Both modals operate simultaneously, closing one modal does not affect the other or cause navigation changes
- **Clear Exit Points**: X buttons for closing individual modals only
- **Background State**: When no modals are open, display blank state or return to Class List view
- **Text Truncation**: ID text uses full available width with ellipsis, classroom names limited to 50% modal width with ellipsis
- **Persistent State**: Interface maintains state during session