import React from 'react';
import {
  StyledStudentCard,
  StyledSeatHeader,
  StyledStudentName,
  StyledPointsContainer,
  StyledPointsBadge,
  StyledPointsButton,
  StyledGuestOverlay
} from '../../styles/components';
import type { Student } from '../../types/student';

interface StudentCardProps {
  student: Student;
  onUpdatePoints: (studentId: number, change: number) => void;
  formatSeatNumber: (seatNumber: number) => string;
  hasRealtimeUpdate?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onUpdatePoints, 
  formatSeatNumber,
  hasRealtimeUpdate = false
}) => {
  return (
    <StyledStudentCard 
      $isGuest={student.isGuest}
      data-seat={student.seatNumber}
      className={`${student.isGuest ? 'student-empty' : 'student-occupied'} ${hasRealtimeUpdate ? 'realtime-update' : ''}`}
      style={{
        transform: hasRealtimeUpdate ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hasRealtimeUpdate ? '0 4px 12px rgba(59, 130, 246, 0.3)' : undefined,
        transition: 'all 0.3s ease'
      }}
    >
      <StyledSeatHeader $isGuest={student.isGuest}>
        {formatSeatNumber(student.seatNumber!)}
      </StyledSeatHeader>
      <StyledStudentName $isGuest={student.isGuest}>
        {student.name}
      </StyledStudentName>
      <StyledPointsContainer>
        <StyledPointsButton 
          $type="decrease" 
          $disabled={student.isGuest || student.points <= 0}
          disabled={student.isGuest || student.points <= 0}
          onClick={() => !student.isGuest && student.points > 0 && onUpdatePoints(student.id, -1)}
        >
          -1
        </StyledPointsButton>
        <StyledPointsBadge $points={student.points} $isGuest={student.isGuest}>
          {student.points}
        </StyledPointsBadge>
        <StyledPointsButton 
          $type="increase" 
          $disabled={student.isGuest}
          disabled={student.isGuest}
          onClick={() => !student.isGuest && onUpdatePoints(student.id, 1)}
        >
          +1
        </StyledPointsButton>
        {student.isGuest && <StyledGuestOverlay />}
      </StyledPointsContainer>
    </StyledStudentCard>
  );
};