import React, { useMemo, useCallback } from 'react';
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

const realtimeStyle = {
  transform: 'scale(1.05)',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.3s ease'
};

const normalStyle = {
  transform: 'scale(1)',
  transition: 'all 0.3s ease'
};

export const StudentCard: React.FC<StudentCardProps> = React.memo(({ 
  student, 
  onUpdateScore, 
  formatSeatNumber,
  hasRealtimeUpdate = false
}) => {
  const className = useMemo(() => 
    `${student.isGuest ? 'student-empty' : 'student-occupied'} ${hasRealtimeUpdate ? 'realtime-update' : ''}`,
    [student.isGuest, hasRealtimeUpdate]
  );

  const cardStyle = useMemo(() => 
    hasRealtimeUpdate ? realtimeStyle : normalStyle,
    [hasRealtimeUpdate]
  );

  const handleDecreaseScore = useCallback(() => {
    if (!student.isGuest && student.score > 0 && student.id) {
      onUpdateScore(student.id, -1);
    }
  }, [student.isGuest, student.score, student.id, onUpdateScore]);

  const handleIncreaseScore = useCallback(() => {
    if (!student.isGuest && student.score < 100 && student.id) {
      onUpdateScore(student.id, 1);
    }
  }, [student.isGuest, student.score, student.id, onUpdateScore]);

  const canDecrease = !student.isGuest && student.score > 0;
  const canIncrease = !student.isGuest && student.score < 100;

  return (
    <StyledStudentCard 
      $isGuest={student.isGuest}
      data-seat={student.seatNumber}
      className={className}
      style={cardStyle}
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
          $disabled={!canDecrease}
          disabled={!canDecrease}
          onClick={handleDecreaseScore}
        >
          -1
        </StyledScoreButton>
        <StyledScoreBadge $score={student.score} $isGuest={student.isGuest}>
          {student.score}
        </StyledScoreBadge>
        <StyledScoreButton 
          $type="increase" 
          $disabled={!canIncrease}
          disabled={!canIncrease}
          onClick={handleIncreaseScore}
        >
          +1
        </StyledScoreButton>
        {student.isGuest && <StyledGuestOverlay />}
      </StyledScoreContainer>
    </StyledStudentCard>
  );
});