import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyledStudentGrid, StyledScrollContainer } from '../../styles/components';
import { StudentCard } from './StudentCard';
import { updateStudentPoints } from '../../store/slices/studentSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Student } from '../../types/student';

interface StudentGridProps {
  formatSeatNumber: (seatNumber: number) => string;
  getSeatUpdate: (seatNumber: number) => Student | undefined;
  hasAnimation: (seatNumber: number) => boolean;
}

export const StudentGrid: React.FC<StudentGridProps> = ({
  formatSeatNumber,
  getSeatUpdate,
  hasAnimation
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, totalCapacity, loading, error } = useSelector((state: RootState) => state.student);

  const handleUpdatePoints = (studentId: number, change: number) => {
    dispatch(updateStudentPoints({ studentId, change }));
  };

  // Create a map of seat number to student
  // Only include students who have been assigned a seat (entered the class)
  const seatMap = new Map<number, Student>();
  students.forEach(student => {
    if (student.seatNumber !== null && student.seatNumber !== undefined) {
      seatMap.set(student.seatNumber, student);
    }
  });

  // Generate grid slots based on total capacity
  const generateGridSlots = () => {
    const slots = [];
    for (let seatNumber = 1; seatNumber <= totalCapacity; seatNumber++) {
      // Check for real-time seat updates first, but prefer Redux store for points
      const seatUpdate = getSeatUpdate(seatNumber);
      const reduxStudent = seatMap.get(seatNumber);
      
      // Use Redux student if available (for up-to-date points), otherwise use seat update
      const student = reduxStudent || seatUpdate;
      
      if (student && !student.isGuest) {
        // Seated student (either from store or real-time update)
        slots.push(
          <StudentCard 
            key={`seat-${seatNumber}`}
            student={student}
            onUpdatePoints={handleUpdatePoints}
            formatSeatNumber={formatSeatNumber}
            hasRealtimeUpdate={hasAnimation(seatNumber)}
          />
        );
      } else {
        // Empty seat - create placeholder
        const emptyStudent: Student = {
          id: seatNumber,
          name: 'Guest',
          classId: 0,
          seatNumber: seatNumber,
          createdAt: '',
          updatedAt: '',
          points: 0,
          isGuest: true // Use isGuest to indicate empty seat
        };
        slots.push(
          <StudentCard 
            key={`empty-${seatNumber}`}
            student={emptyStudent}
            onUpdatePoints={() => {}} // No action for empty seats
            formatSeatNumber={formatSeatNumber}
            hasRealtimeUpdate={false}
          />
        );
      }
    }
    return slots;
  };

  if (loading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <StyledScrollContainer>
      <StyledStudentGrid>
        {generateGridSlots()}
      </StyledStudentGrid>
    </StyledScrollContainer>
  );
};