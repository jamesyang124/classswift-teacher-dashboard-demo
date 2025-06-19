# ClassSwift Teacher Dashboard - UI/UX Design

## Overview

This document contains the visual design requirements and user experience guidelines for the ClassSwift Teacher Dashboard application, based on the wireframe design and interface specifications.

## Wireframe Analysis

The interface consists of two primary modal panels operating independently:

### Left Modal - Class Joining Interface
- **Header**: "Join 302 Science" with back navigation ("< Back to Class List")
- **Close Button**: X button in top-right corner
- **Class Information Section**:
  - Class ID: "X58E9647" with blue copy button
  - Join Link: with blue copy button for easy sharing
- **QR Code Display**: Large, high-contrast QR code for mobile scanning
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
- **Active Students**: Blue header background (#3B82F6)
- **Guest Students**: Gray header background (#9CA3AF)
- **Card Structure**:
  - Seat number in header (01, 02, 03...)
  - Student name in center
  - Point indicators at bottom (red/green badges with +/- controls)

### Point System Visual Design
- **Negative Points**: Red circular badges with white numbers
- **Positive Points**: Green circular badges with white numbers
- **Point Controls**: Small +/- buttons adjacent to point displays
- **Zero State**: Gray badges for students with no points

### Typography
- **Header Text**: Bold, 18px for modal titles
- **Student Names**: Medium, 16px for primary identification
- **Seat Numbers**: Bold, 14px in header sections
- **Point Numbers**: Medium, 12px in colored badges
- **Button Text**: Medium, 12px for copy buttons and controls

### Layout Specifications
- **Modal Width**: Approximately 600px each
- **Student Cards**: Equal width in 5-column grid
- **Card Height**: Consistent across all student entries
- **Spacing**: 8px gap between student cards
- **Padding**: 16px internal padding for modal content
- **Border Radius**: 8px for cards and buttons

### Interactive Elements
- **Copy Buttons**: Blue background with white text and copy icon
- **Point Controls**: Small clickable +/- buttons
- **Tab Navigation**: Clear active/inactive states
- **Close Buttons**: Standard X icon in corners
- **Three-dot Menu**: Dropdown trigger in top-right

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

### Student Joining Flow
1. Teacher displays left modal with QR code
2. Students scan QR code with mobile devices
3. Students appear immediately in right modal grid
4. Real-time updates without page refresh

### Point Management Flow
1. Teacher opens right modal
2. Locates student in grid layout
3. Uses +/- controls to adjust points
4. Immediate visual feedback with color-coded badges

### Navigation Patterns
- **Modal Independence**: Both modals operate simultaneously
- **Clear Exit Points**: X buttons for closing modals
- **Persistent State**: Interface maintains state during session