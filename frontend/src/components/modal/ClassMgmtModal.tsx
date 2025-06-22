import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { fetchClassInfoAndStudents } from '../../store/slices/classSlice';
import type { RootState, AppDispatch } from '../../store';

const ClassMgmtModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { classInfo, loading, error } = useSelector((state: RootState) => state.class);
  const { students, totalCapacity, enrolledCount } = useSelector((state: RootState) => state.student);
  
  const [activeTab, setActiveTab] = useState<'student' | 'group'>('student');

  useEffect(() => {
    const classId = 'X58E9647';
    dispatch(fetchClassInfoAndStudents(classId));
  }, [dispatch]);

  const formatSeatNumber = (id: number) => {
    return id.toString().padStart(2, '0');
  };

  const renderContent = () => {
    if (activeTab === 'group') {
      return (
        <GroupView 
          formatSeatNumber={formatSeatNumber}
        />
      );
    }

    return (
      <StudentGrid 
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
          <ClassName>
            {loading ? 'Loading...' : error ? 'Error loading class' : classInfo?.name || '302 Science'}
          </ClassName>
          <StudentCount><IoPersonSharp /> {enrolledCount}/{totalCapacity}</StudentCount>
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