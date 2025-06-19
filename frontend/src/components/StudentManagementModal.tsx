import { useState } from 'react';
import styled from 'styled-components';

interface Student {
  id: number;
  name: string;
  points: number;
  isGuest: boolean;
}

// Mock data based on wireframe
const initialStudents: Student[] = [
  { id: 1, name: 'Philip', points: 1, isGuest: false },
  { id: 2, name: 'Darrell', points: 2, isGuest: false },
  { id: 3, name: 'Guest', points: 0, isGuest: true },
  { id: 4, name: 'Cody', points: 8, isGuest: false },
  { id: 5, name: 'Guest', points: 0, isGuest: true },
  { id: 6, name: 'Guest', points: 0, isGuest: true },
  { id: 7, name: 'Bessie', points: 0, isGuest: false },
  { id: 8, name: 'Wendy', points: 2, isGuest: false },
  { id: 9, name: 'Guest', points: 0, isGuest: true },
  { id: 10, name: 'Esther', points: 0, isGuest: false },
  { id: 11, name: 'Guest', points: 0, isGuest: true },
  { id: 12, name: 'Gloria', points: 0, isGuest: false },
  { id: 13, name: 'Guest', points: 0, isGuest: true },
  { id: 14, name: 'Lee', points: 1, isGuest: false },
  { id: 15, name: 'Guest', points: 0, isGuest: true },
  { id: 16, name: 'Ann', points: 0, isGuest: false },
  { id: 17, name: 'Jacob', points: 7, isGuest: false },
  { id: 18, name: 'Calvin', points: 1, isGuest: false },
  { id: 19, name: 'Guest', points: 0, isGuest: true },
  { id: 20, name: 'Joe', points: 0, isGuest: false },
];

const StudentManagementModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'group'>('student');
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const formatSeatNumber = (id: number) => {
    return id.toString().padStart(2, '0');
  };

  const updateStudentPoints = (studentId: number, change: number) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, points: Math.max(0, student.points + change) }
        : student
    ));
  };

  return (
    <ModalContent>
      <ModalHeader>
        <ClassInfo>
          <ClassName>302 Science</ClassName>
          <StudentCount>👥 16/30</StudentCount>
        </ClassInfo>
        <HeaderActions>
          <MenuButton>⋮</MenuButton>
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
      </TabNavigation>

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
                - 1
              </PointsButton>
              <PointsBadge $points={student.points} $isGuest={student.isGuest}>
                {student.points}
              </PointsBadge>
              <PointsButton 
                $type="increase" 
                $disabled={student.isGuest}
                onClick={() => !student.isGuest && updateStudentPoints(student.id, 1)}
              >
                + 1
              </PointsButton>
              {student.isGuest && <GuestOverlay />}
            </PointsContainer>
          </StudentCard>
        ))}
      </StudentGrid>
    </ModalContent>
  );
};

const ModalContent = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 800px;
  height: fit-content;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 2px solid #D97706;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
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
  font-size: 20px;
  color: ${props => props.theme.colors.gray[400]};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${props => props.theme.colors.gray[400]};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const TabNavigation = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.sizes.button};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[500]};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const StudentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StudentCard = styled.div<{ $isGuest: boolean }>`
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.white};
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
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
  padding: ${props => props.theme.spacing.sm};
`;

const StudentName = styled.div<{ $isGuest: boolean }>`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.sm};
  text-align: center;
  font-size: ${props => props.theme.typography.sizes.button};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.gray[800]};
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PointsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm};
  position: relative;
`;

const PointsBadge = styled.div<{ $points: number; $isGuest: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 4px 8px;
  color: ${props => 
    props.$isGuest ? props.theme.colors.gray[400] :
    props.theme.colors.gray[900]
  };
  font-size: ${props => props.theme.typography.sizes.body};
  font-weight: ${props => props.theme.typography.weights.bold};
  min-width: 32px;
`;

const PointsButton = styled.button<{ $type: 'increase' | 'decrease'; $disabled?: boolean }>`
  background: ${props => 
    props.$disabled ? props.theme.colors.gray[200] :
    props.$type === 'increase' ? props.theme.colors.success : 
    props.$type === 'decrease' ? props.theme.colors.danger : 
    props.theme.colors.gray[300]
  };
  border: none;
  color: ${props => 
    props.$disabled ? props.theme.colors.gray[400] : props.theme.colors.white
  };
  width: 28px;
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

  &:hover {
    background: ${props => 
      props.$disabled ? props.theme.colors.gray[200] :
      props.$type === 'increase' ? '#059669' : 
      props.$type === 'decrease' ? '#DC2626' : 
      props.theme.colors.gray[400]
    };
    transform: ${props => props.$disabled ? 'none' : 'scale(1.1)'};
  }

  &:active {
    transform: ${props => props.$disabled ? 'none' : 'scale(0.95)'};
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