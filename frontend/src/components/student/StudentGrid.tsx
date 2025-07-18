import React, { useMemo, useCallback } from 'react';
import { StyledStudentGrid, StyledScrollContainer } from '../../styles/components';
import { StudentCard } from './StudentCard';
import type { Student } from '../../types/student';

interface StudentGridProps {
  formatSeatNumber: (seatNumber: number) => string;
  getSeatData: (seatNumber: number) => Student;
  totalCapacity: number;
  handleUpdateScore: (studentId: number, change: number) => void;
}

export const StudentGrid: React.FC<StudentGridProps> = ({
  formatSeatNumber,
  getSeatData,
  totalCapacity,
  handleUpdateScore
}) => {
  const noOpHandler = useCallback(() => {}, []);

  // Generate slots with actual student data - optimized with memoization
  const gridSlots = useMemo(() => {
    const slots = [];
    for (let seatNumber = 1; seatNumber <= totalCapacity; seatNumber++) {
      const student = getSeatData(seatNumber);
      
      slots.push(
        <StudentCard 
          key={`seat-${seatNumber}`}
          student={student}
          onUpdateScore={student.id ? handleUpdateScore : noOpHandler}
          formatSeatNumber={formatSeatNumber}
          hasRealtimeUpdate={false}
        />
      );
    }
    return slots;
  }, [totalCapacity, getSeatData, handleUpdateScore, formatSeatNumber, noOpHandler]);

  return (
    <StyledScrollContainer>
      <StyledStudentGrid>
        {gridSlots}
      </StyledStudentGrid>
    </StyledScrollContainer>
  );
};