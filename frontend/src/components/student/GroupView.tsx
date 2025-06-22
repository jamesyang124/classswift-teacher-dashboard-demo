import React from 'react';
import { 
  StyledGroupContainer, 
  StyledGroupSection, 
  StyledGroupTitle, 
  StyledGroupStudents,
  StyledScrollContainer
} from '../../styles/components';
import { StudentCard } from './StudentCard';

interface Student {
  id: number;
  name: string;
  points: number;
  isGuest: boolean;
}

interface GroupViewProps {
  students: Student[];
  onUpdatePoints: (studentId: number, change: number) => void;
  formatSeatNumber: (id: number) => string;
}

export const GroupView: React.FC<GroupViewProps> = ({
  students,
  onUpdatePoints,
  formatSeatNumber
}) => {
  const createGroups = () => {
    const activeStudents = students.filter(student => !student.isGuest);
    const groups = [];
    
    for (let i = 0; i < activeStudents.length; i += 5) {
      groups.push(activeStudents.slice(i, i + 5));
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
                key={student.id} 
                student={student}
                onUpdatePoints={onUpdatePoints}
                formatSeatNumber={formatSeatNumber}
              />
            ))}
          </StyledGroupStudents>
        </StyledGroupSection>
      ))}
    </StyledGroupContainer>
    </StyledScrollContainer>
  );
};