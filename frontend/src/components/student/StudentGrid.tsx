import React from 'react';
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

  // Generate grid slots based on total capacity
  const generateGridSlots = () => {
    const slots = [];
    for (let seatNumber = 1; seatNumber <= totalCapacity; seatNumber++) {
      const student = getSeatData(seatNumber);
      
      slots.push(
        <StudentCard 
          key={`seat-${seatNumber}`}
          student={student}
          onUpdateScore={student.id ? handleUpdateScore : () => {}} // Only allow score updates for enrolled students
          formatSeatNumber={formatSeatNumber}
          hasRealtimeUpdate={false} // TODO: Implement animation detection
        />
      );
    }
    return slots;
  };

  return (
    <StyledScrollContainer>
      <StyledStudentGrid>
        {generateGridSlots()}
      </StyledStudentGrid>
    </StyledScrollContainer>
  );
};