import { useEffect, useState, useRef } from 'react';
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
import { updateClassCapacity, updateStudents, clearAllScores } from '../../store/slices/studentSlice';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSeatUpdates } from '../../hooks/useSeatUpdates';
import { clearClassSeats } from '../../store/slices/classSlice';
import type { RootState, AppDispatch } from '../../store';

const ClassMgmtModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { classInfo, loading, error } = useSelector((state: RootState) => state.class);
  const { students, totalCapacity, availableSlots } = useSelector((state: RootState) => state.student);

  const [activeTab, setActiveTab] = useState<'student' | 'group'>('student');
  const { connect, disconnect, lastMessage } = useWebSocket();
  // useSeatUpdates should always be in sync with students from Redux
  const seatUpdates = useSeatUpdates();
  const { updateMultipleSeats, getSeatUpdate, hasAnimation, clearUpdates, syncWithInitialStudents } = seatUpdates;

  const classId = 'X58E9647';

  // Keep seatUpdates in sync with students from Redux after fetchClassInfoAndStudents
  // Use syncWithInitialStudents for initial load (NO animation)
  const initialSyncRef = useRef(false);
  useEffect(() => {
    if (students && students.length > 0 && !initialSyncRef.current) {
      syncWithInitialStudents(students);
      initialSyncRef.current = true;
    }
  }, [students, syncWithInitialStudents]);

  useEffect(() => {
    dispatch(fetchClassInfoAndStudents(classId));
    connect(classId);
    // Only disconnect on component unmount, not on dependency changes
    return () => {
      clearUpdates();
      initialSyncRef.current = false; // Reset for next mount
      // Note: WebSocket connection is maintained across re-renders for better UX
      // Only explicitly disconnect when component is completely unmounted
    };
  }, [dispatch, classId, connect, clearUpdates]); // Include all dependencies

  // Note: WebSocket connection persists across modal open/close cycles
  // Only disconnect when user explicitly leaves the class or app closes

  // Handle WebSocket messages with seat updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'class_updated') {
      console.log('🔄 WebSocket class_updated received:', lastMessage.data);
      // Update class capacity metrics from WebSocket
      if (lastMessage.data.totalCapacity !== undefined) {
        dispatch(updateClassCapacity({
          totalCapacity: lastMessage.data.totalCapacity,
          enrolledCount: lastMessage.data.enrolledCount,
          availableSlots: lastMessage.data.availableSlots,
        }));
      }
      // Update seat information using the hook (WITH animation for WebSocket updates)
      if (lastMessage.data.students && Array.isArray(lastMessage.data.students)) {
        // First update Redux store
        dispatch(updateStudents(lastMessage.data.students));
        // Then trigger animations for seat changes
        updateMultipleSeats(lastMessage.data.students);
      }
    }
  }, [lastMessage, dispatch, updateMultipleSeats]);

  const formatSeatNumber = (id: number) => {
    return id.toString().padStart(2, '0');
  };

  const handleClearAllScores = () => {
    dispatch(clearAllScores());
  };

  // Replace handleResetAllSeats to use the async thunk for backend reset
  const handleResetAllSeats = async () => {
    // Dispatch the async thunk to clear seats in backend and broadcast
    await dispatch(clearClassSeats(classId));
    // Also clear seat updates (for local UI animation reset)
    clearUpdates();
    initialSyncRef.current = false;
  };

  const renderContent = () => {
    if (activeTab === 'group') {
      return (
        <GroupView 
          formatSeatNumber={formatSeatNumber}
          getSeatUpdate={getSeatUpdate}
          hasAnimation={hasAnimation}
        />
      );
    }

    return (
      <StudentGrid 
        formatSeatNumber={formatSeatNumber}
        getSeatUpdate={getSeatUpdate}
        hasAnimation={hasAnimation}
      />
    );
  };

  // Calculate seated count (students who are not guests and have a seatNumber assigned)
  const seatedCount = totalCapacity - availableSlots;

  return (
    <StyledModalContent>
      <CloseButton>×</CloseButton>
      <ModalHeader />
      <ModalTitle>
        <ClassInfo>
          <ClassName>
            {loading ? 'Loading...' : error ? 'Error loading class' : classInfo?.name || '302 Science'}
          </ClassName>
          <StudentCount><IoPersonSharp /> {seatedCount}/{totalCapacity}</StudentCount>
        </ClassInfo>
      </ModalTitle>
        
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClearAllScores={handleClearAllScores}
        onResetAllSeats={handleResetAllSeats}
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