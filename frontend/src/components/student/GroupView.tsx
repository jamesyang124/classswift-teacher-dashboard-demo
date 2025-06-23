import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  StyledGroupContainer, 
  StyledGroupSection, 
  StyledGroupTitle, 
  StyledGroupStudents,
  StyledScrollContainer
} from '../../styles/components';
import { StudentCard } from './StudentCard';
import { updateStudentScore } from '../../store/slices/studentSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Student } from '../../types/student';

interface GroupViewProps {
  formatSeatNumber: (seatNumber: number) => string;
  getSeatUpdate: (seatNumber: number) => Student | undefined;
  hasAnimation: (seatNumber: number) => boolean;
}

export const GroupView: React.FC<GroupViewProps> = ({
  formatSeatNumber,
  getSeatUpdate,
  hasAnimation
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, totalCapacity, loading, error } = useSelector((state: RootState) => state.student);

  const handleUpdateScore = (studentId: number, change: number) => {
    dispatch(updateStudentScore({ studentId, change }));
  };

  const createGroups = () => {
    // Get enrolled students and guest seats, both sorted by seat number
    const enrolledStudents = [];
    const guestSeats = [];
    
    // Create a map of seat number to student
    const seatMap = new Map<number, Student>();
    students.forEach(student => {
      if (student.seatNumber !== null && student.seatNumber !== undefined) {
        seatMap.set(student.seatNumber, student);
      }
    });
    
    // Generate all seats up to capacity with real-time updates
    for (let seatNumber = 1; seatNumber <= totalCapacity; seatNumber++) {
      // Check for real-time seat updates first, but prefer Redux store for scores
      const seatUpdate = getSeatUpdate(seatNumber);
      const reduxStudent = seatMap.get(seatNumber);
      
      // Use Redux student if available (for up-to-date scores), otherwise use seat update
      const student = reduxStudent || seatUpdate;
      
      if (student && !student.isGuest) {
        enrolledStudents.push(student);
      } else {
        // Create guest seat placeholder
        const guestSeat: Student = {
          id: seatNumber,
          name: 'Guest',
          classId: 0,
          seatNumber: seatNumber,
          createdAt: '',
          updatedAt: '',
          score: 0,
          isGuest: true
        };
        guestSeats.push(guestSeat);
      }
    }
    
    // Combine enrolled students first, then guest seats
    const allStudents = [...enrolledStudents, ...guestSeats];
    const groups = [];
    
    for (let i = 0; i < allStudents.length; i += 5) {
      groups.push(allStudents.slice(i, i + 5));
    }
    
    return groups;
  };

  if (loading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const groups = createGroups();

  return (
    <StyledScrollContainer>
    <StyledGroupContainer>
      {groups.map((group, groupIndex) => (
        <StyledGroupSection key={groupIndex}>
          <StyledGroupTitle>Group {groupIndex + 1}</StyledGroupTitle>
          <StyledGroupStudents>
            {group.map((student) => (
              <StudentCard 
                key={student.isGuest ? `gps-${student.seatNumber}` : `gpe-${student.id}`}
                student={student}
                onUpdateScore={handleUpdateScore}
                formatSeatNumber={formatSeatNumber}
                hasRealtimeUpdate={hasAnimation(student.seatNumber!)}
              />
            ))}
          </StyledGroupStudents>
        </StyledGroupSection>
      ))}
    </StyledGroupContainer>
    </StyledScrollContainer>
  );
};