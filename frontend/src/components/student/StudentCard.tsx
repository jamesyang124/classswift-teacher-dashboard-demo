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
}

export const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onUpdatePoints, 
  formatSeatNumber 
}) => {
  return (
    <StyledStudentCard $isGuest={student.isGuest}>
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