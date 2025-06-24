import React from 'react';
import {
  StyledStudentCard,
  StyledSeatHeader,
  StyledStudentName,
  StyledScoreContainer,
  StyledScoreBadge,
  StyledScoreButton,
  StyledGuestOverlay
} from '../../styles/components';
import type { Student } from '../../types/student';

interface StudentCardProps {
  student: Student;
  onUpdateScore: (studentId: number, change: number) => void;
  formatSeatNumber: (seatNumber: number) => string;
  hasRealtimeUpdate?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onUpdateScore, 
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
        <span>{student.name}</span>
      </StyledStudentName>
      <StyledScoreContainer>
        <StyledScoreButton 
          $type="decrease" 
          $disabled={student.isGuest || student.score <= 0}
          disabled={student.isGuest || student.score <= 0}
          onClick={() => !student.isGuest && student.score > 0 && student.id && onUpdateScore(student.id, -1)}
        >
          -1
        </StyledScoreButton>
        <StyledScoreBadge $score={student.score} $isGuest={student.isGuest}>
          {student.score}
        </StyledScoreBadge>
        <StyledScoreButton 
          $type="increase" 
          $disabled={student.isGuest || student.score >= 100}
          disabled={student.isGuest || student.score >= 100}
          onClick={() => !student.isGuest && student.score < 100 && student.id && onUpdateScore(student.id, 1)}
        >
          +1
        </StyledScoreButton>
        {student.isGuest && <StyledGuestOverlay />}
      </StyledScoreContainer>
    </StyledStudentCard>
  );
};