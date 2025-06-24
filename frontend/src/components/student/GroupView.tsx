import React from 'react';
import { 
  StyledGroupContainer, 
  StyledGroupSection, 
  StyledGroupTitle, 
  StyledGroupStudents,
  StyledScrollContainer
} from '../../styles/components';
import { StudentCard } from './StudentCard';
import type { Student } from '../../types/student';

interface GroupViewProps {
  formatSeatNumber: (seatNumber: number) => string;
  getSeatData: (seatNumber: number) => Student;
  totalCapacity: number;
  handleUpdateScore: (studentId: number, change: number) => void;
}

export const GroupView: React.FC<GroupViewProps> = ({
  formatSeatNumber,
  getSeatData,
  totalCapacity,
  handleUpdateScore
}) => {

  const createGroups = () => {
    // Group students by seat number, only if not empty
    const students: Student[] = [];
    for (let seatNumber = 1; seatNumber <= totalCapacity; seatNumber++) {
      const student = getSeatData(seatNumber);
      if (!student.isEmpty) {
        students.push(student);
      }
    }
    // Group into arrays of 5 by seat number order
    const groups = [];
    for (let i = 0; i < students.length; i += 5) {
      groups.push(students.slice(i, i + 5));
    }
    return groups;
  };

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
                  key={student.id ? `gpe-${student.id}` : `gps-${student.seatNumber}`}
                  student={student}
                  onUpdateScore={student.id ? handleUpdateScore : () => {}}
                  formatSeatNumber={formatSeatNumber}
                  hasRealtimeUpdate={false} // TODO: Implement animation detection
                />
              ))}
            </StyledGroupStudents>
          </StyledGroupSection>
        ))}
      </StyledGroupContainer>
    </StyledScrollContainer>
  );
};