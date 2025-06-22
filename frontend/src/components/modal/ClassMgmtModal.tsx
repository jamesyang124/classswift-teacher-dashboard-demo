import { useState } from 'react';
import styled from 'styled-components';
import { TabNavigation, StudentGrid, GroupView } from '../student';
import { 
  StyledCloseButton,
  StyledModalContent,
  StyledModalHeader,
  StyledClassInfo,
  StyledModalTitle,
 } from '../../styles/components';
import { IoPersonSharp } from "react-icons/io5";


interface Student {
  id: number;
  name: string;
  points: number;
  isGuest: boolean;
}

// Mock data based on wireframe - matches exact layout and points
const initialStudents: Student[] = [
  { id: 1, name: 'Philip', points: 2, isGuest: false },
  { id: 2, name: 'Darrell', points: 5, isGuest: false },
  { id: 3, name: 'Guest', points: 0, isGuest: true },
  { id: 4, name: 'Cody', points: 9, isGuest: false },
  { id: 5, name: 'Guest', points: 0, isGuest: true },
  { id: 6, name: 'Guest', points: 0, isGuest: true },
  { id: 7, name: 'Bessie', points: 0, isGuest: false },
  { id: 8, name: 'Wendy', points: 3, isGuest: false },
  { id: 9, name: 'Guest', points: 0, isGuest: true },
  { id: 10, name: 'Esther', points: 1, isGuest: false },
  { id: 11, name: 'Guest', points: 0, isGuest: true },
  { id: 12, name: 'Gloria', points: 1, isGuest: false },
  { id: 13, name: 'Guest', points: 0, isGuest: true },
  { id: 14, name: 'Lee', points: 2, isGuest: false },
  { id: 15, name: 'Guest', points: 0, isGuest: true },
  { id: 16, name: 'Ann', points: 0, isGuest: false },
  { id: 17, name: 'Jacob', points: 8, isGuest: false },
  { id: 18, name: 'Calvin', points: 2, isGuest: false },
  { id: 19, name: 'Guest', points: 0, isGuest: true },
  { id: 20, name: 'Joe', points: 0, isGuest: false },
  { id: 21, name: 'Guest', points: 0, isGuest: true },
  { id: 22, name: 'Guest', points: 0, isGuest: false },
  { id: 23, name: 'Guest', points: 0, isGuest: false },
  { id: 24, name: 'Guest', points: 0, isGuest: false },
  { id: 25, name: 'Guest', points: 0, isGuest: false },
  { id: 26, name: 'Guest', points: 0, isGuest: false },
  { id: 27, name: 'Guest', points: 0, isGuest: false },
  { id: 28, name: 'Guest', points: 0, isGuest: false },
  { id: 29, name: 'Guest', points: 0, isGuest: false },
  { id: 30, name: 'Guest', points: 0, isGuest: true },
];

const ClassMgmtModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'group'>('student');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const maxCapacity = initialStudents.length;

  const formatSeatNumber = (id: number) => {
    return id.toString().padStart(2, '0');
  };

  const updateStudentPoints = (studentId: number, change: number) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, points: student.points + change }
        : student
    ));
  };


  const renderContent = () => {
    if (activeTab === 'group') {
      return (
        <GroupView 
          students={students}
          onUpdatePoints={updateStudentPoints}
          formatSeatNumber={formatSeatNumber}
        />
      );
    }

    return (
      <StudentGrid 
        students={students}
        onUpdatePoints={updateStudentPoints}
        formatSeatNumber={formatSeatNumber}
      />
    );
  };

  return (
    <StyledModalContent>
      <CloseButton>×</CloseButton>
      <ModalHeader />
      <ModalTitle>
        <ClassInfo>
          <ClassName>302 Science</ClassName>
          <StudentCount><IoPersonSharp /> {students.filter(s => !s.isGuest).length}/{maxCapacity}</StudentCount>
        </ClassInfo>
      </ModalTitle>
        
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {renderContent()}
      
    </StyledModalContent>
  );
};

const CloseButton = styled(StyledCloseButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const ModalHeader = styled(StyledModalHeader)`
  padding-bottom: 14px;
`;

const ModalTitle = styled(StyledModalTitle)`
  padding-bottom: 0;
`;

const ClassInfo = styled(StyledClassInfo)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  margin-bottom: 0;
`;

const ClassName = styled.h2`
  font-size: ${props => props.theme.typography.sizes.h2};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
`;

const StudentCount = styled.span`
  font-size: ${props => props.theme.typography.sizes.button};
  color: ${props => props.theme.colors.gray[600]};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export default ClassMgmtModal;