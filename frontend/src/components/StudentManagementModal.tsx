import { useState } from 'react';
import styled from 'styled-components';
import { HiOutlineDotsVertical } from "react-icons/hi";


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

const StudentManagementModal: React.FC = () => {
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

  const createGroups = () => {
    const activeStudents = students.filter(student => !student.isGuest);
    const groups = [];
    
    for (let i = 0; i < activeStudents.length; i += 5) {
      groups.push(activeStudents.slice(i, i + 5));
    }
    
    return groups;
  };

  const renderContent = () => {
    if (activeTab === 'group') {
      const groups = createGroups();
      
      return (
        <GroupContainer>
          {groups.map((group, groupIndex) => (
            <GroupSection key={groupIndex}>
              <GroupTitle>Group {groupIndex + 1}</GroupTitle>
              <GroupStudents>
                {group.map((student) => (
                  <StudentCard key={student.id} $isGuest={student.isGuest}>
                    <SeatHeader $isGuest={student.isGuest}>
                      {formatSeatNumber(student.id)}
                    </SeatHeader>
                    <StudentName $isGuest={student.isGuest}>
                      {student.name}
                    </StudentName>
                    <PointsContainer>
                      <PointsButton 
                        $type="decrease" 
                        $disabled={student.isGuest || student.points <= 0}
                        disabled={student.isGuest || student.points <= 0}
                        onClick={() => !student.isGuest && student.points > 0 && updateStudentPoints(student.id, -1)}
                      >
                        -1
                      </PointsButton>
                      <PointsBadge $points={student.points} $isGuest={student.isGuest}>
                        {student.points}
                      </PointsBadge>
                      <PointsButton 
                        $type="increase" 
                        $disabled={student.isGuest}
                        onClick={() => !student.isGuest && updateStudentPoints(student.id, 1)}
                      >
                        +1
                      </PointsButton>
                      {student.isGuest && <GuestOverlay />}
                    </PointsContainer>
                  </StudentCard>
                ))}
              </GroupStudents>
            </GroupSection>
          ))}
        </GroupContainer>
      );
    }

    return (
      <StudentGrid>
        {students.map((student) => (
          <StudentCard key={student.id} $isGuest={student.isGuest}>
            <SeatHeader $isGuest={student.isGuest}>
              {formatSeatNumber(student.id)}
            </SeatHeader>
            <StudentName $isGuest={student.isGuest}>
              {student.name}
            </StudentName>
            <PointsContainer>
              <PointsButton 
                $type="decrease" 
                $disabled={student.isGuest || student.points <= 0}
                disabled={student.isGuest || student.points <= 0}
                onClick={() => !student.isGuest && student.points > 0 && updateStudentPoints(student.id, -1)}
              >
                -1
              </PointsButton>
              <PointsBadge $points={student.points} $isGuest={student.isGuest}>
                {student.points}
              </PointsBadge>
              <PointsButton 
                $type="increase" 
                $disabled={student.isGuest}
                disabled={student.isGuest}
                onClick={() => !student.isGuest && updateStudentPoints(student.id, 1)}
              >
                +1
              </PointsButton>
              {student.isGuest && <GuestOverlay />}
            </PointsContainer>
          </StudentCard>
        ))}
      </StudentGrid>
    );
  };
  // <CiMenuKebab></CiMenuKebab>

  return (
    <ModalContent>
      
      <ModalHeader>
        <ClassInfo>
          <ClassName>302 Science</ClassName>
          <StudentCount>👥 {students.filter(s => !s.isGuest).length}/{maxCapacity}</StudentCount>
        </ClassInfo>
        <HeaderActions>
          <CloseButton>×</CloseButton>
        </HeaderActions>
      </ModalHeader>
      <TabNavigation>
        <Tab 
          $active={activeTab === 'student'} 
          onClick={() => setActiveTab('student')}
        >
          Student List
        </Tab>
        <Tab 
          $active={activeTab === 'group'} 
          onClick={() => setActiveTab('group')}
        >
          Group
        </Tab>
        <MenuButton>
          <HiOutlineDotsVertical/>
        </MenuButton>
      </TabNavigation>
      

      {renderContent()}
      
    </ModalContent>
  );
};

const ModalContent = styled.div`
  background: #F3F4F6;
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  height: fit-content;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 2px solid #D97706;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  padding-bottom: 0;
  padding-top: 32px;
`;

const ClassInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const ClassName = styled.h2`
  font-size: ${props => props.theme.typography.sizes.h3};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
`;

const StudentCount = styled.span`
  font-size: ${props => props.theme.typography.sizes.button};
  color: ${props => props.theme.colors.gray[600]};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: 20px;
  color: ${props => props.theme.colors.gray[400]};
  cursor: pointer;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;
  margin-left: auto;

  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: 20px;
  color: ${props => props.theme.colors.gray[400]};
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;
  position: relative;
  top: -28px;
  right: -24px;

  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const TabNavigation = styled.div`
  display: flex;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  outline: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.sizes.button};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[500]};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;
  height: 32px;
  display: flex;
  align-items: center;

  &:focus {
    outline: none;
    border: none;
    border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const StudentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  padding-top: 21px;
  padding-bottom: 8px;
  max-height: 400px;
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  background-color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
`;

const StudentCard = styled.div<{ $isGuest: boolean }>`
  border: 2px solid ${props => props.$isGuest ? '#9CA3AF' : '#3B82F6'};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.white};
  overflow: hidden;
  transition: all 0.2s ease;
  height: 87px;
  display: flex;
  flex-direction: column;

  &:hover {
    border: 2px solid ${props => props.$isGuest ? '#9CA3AF' : '#1D4ED8'};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const SeatHeader = styled.div<{ $isGuest: boolean }>`
  background: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  font-weight: ${props => props.theme.typography.weights.bold};
  font-size: ${props => props.theme.typography.sizes.button};
  text-align: center;
  padding: 4px ${props => props.theme.spacing.sm};
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StudentName = styled.div<{ $isGuest: boolean }>`
  padding: 4px ${props => props.theme.spacing.sm};
  text-align: center;
  font-size: ${props => props.theme.typography.sizes.button};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.gray[800]};
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid ${props => props.$isGuest ? '#9CA3AF' : '#3B82F6'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: ${props => props.theme.spacing.sm};
    right: ${props => props.theme.spacing.sm};
    height: 1px;
    background: ${props => props.$isGuest ? '#9CA3AF' : '#3B82F6'};
    border-radius: 0 0 ${props => props.theme.borderRadius.sm} ${props => props.theme.borderRadius.sm};
  }
`;

const PointsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  padding: 2px;
  position: relative;
`;

const PointsBadge = styled.div<{ $points: number; $isGuest: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.black};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 2px 6px;
  font-size: 14px;
  font-weight: ${props => props.theme.typography.weights.bold};
  min-width: 24px;
  height: 18px;
`;

const PointsButton = styled.button<{ $type: 'increase' | 'decrease'; $disabled?: boolean }>`
  background: ${props => 
    props.$disabled ? props.theme.colors.gray[200] :
    props.$type === 'increase' ? props.theme.colors.success : 
    props.$type === 'decrease' ? props.theme.colors.danger : 
    props.theme.colors.gray[300]
  };
  border: none;
  outline: none;
  color: ${props => 
    props.$disabled ? props.theme.colors.gray[400] : props.theme.colors.white
  };
  width: 24px;
  height: 18px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 10px;
  font-weight: bold;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  white-space: nowrap;
  
  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    background: ${props => 
      props.$disabled ? props.theme.colors.gray[200] :
      props.$type === 'increase' ? '#059669' : 
      props.$type === 'decrease' ? '#DC2626' : 
      props.theme.colors.gray[400]
    };
    transform: ${props => props.$disabled ? 'none' : 'scale(1.05)'};
  }

  &:active {
    transform: ${props => props.$disabled ? 'none' : 'scale(0.95)'};
  }
`;

const GroupContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  padding: 24px;
  padding-top: 0px;
  
  display: flex;
  flex-direction: column;
  gap: 26px;
  max-height: 400px;
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }

  background-color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
`;

const GroupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const GroupTitle = styled.h3`
  font-size: 14px;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
  margin-bottom: -5px;
  text-align: end;
`;

const GroupStudents = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.theme.spacing.sm};
  padding-top: 0px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const GuestOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  cursor: not-allowed;
  z-index: 1;
`;

export default StudentManagementModal;