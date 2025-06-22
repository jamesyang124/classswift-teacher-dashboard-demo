import React from 'react';
import { StyledStudentGrid } from '../../styles/components';
import { StudentCard } from './StudentCard';

interface Student {
  id: number;
  name: string;
  points: number;
  isGuest: boolean;
}

interface StudentGridProps {
  students: Student[];
  onUpdatePoints: (studentId: number, change: number) => void;
  formatSeatNumber: (id: number) => string;
}

export const StudentGrid: React.FC<StudentGridProps> = ({
  students,
  onUpdatePoints,
  formatSeatNumber
}) => {
  return (
    <StyledStudentGrid>
      {students.map((student) => (
        <StudentCard 
          key={student.id} 
          student={student}
          onUpdatePoints={onUpdatePoints}
          formatSeatNumber={formatSeatNumber}
        />
      ))}
    </StyledStudentGrid>
  );
};