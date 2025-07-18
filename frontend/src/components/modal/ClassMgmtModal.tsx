import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
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
import { useWebSocket } from '../../hooks/useWebSocket';
import { useClassInfo } from '../../hooks/useClassInfo';
import { 
  syncWithInitialStudents, 
  updateSeatFromWebSocket,
  updateStudentScore,
  clearAllScores
} from '../../store/slices/classSlice';
import type { AppDispatch } from '../../store';

interface ClassMgmtModalProps {
  onClose?: () => void;
  classId: string;
}

const ClassMgmtModal: React.FC<ClassMgmtModalProps> = ({ onClose, classId }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use the new classes store via useClassInfo hook
  const { 
    classInfo, 
    loading, 
    error, 
    seatMap, 
    totalCapacity
  } = useClassInfo(classId);

  const [activeTab, setActiveTab] = useState<'student' | 'group'>('student');
  const [isInitialized, setIsInitialized] = useState(false);
  const { connect, lastMessage } = useWebSocket();

  // Defer heavy initialization to avoid blocking modal expansion
  useEffect(() => {
    // Use requestIdleCallback to initialize after modal is visible
    const initializeModal = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (classId && totalCapacity > 0) {
            dispatch(syncWithInitialStudents({ classId, capacity: totalCapacity, forceReset: false }));
            connect(classId);
            setIsInitialized(true);
          }
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          if (classId && totalCapacity > 0) {
            dispatch(syncWithInitialStudents({ classId, capacity: totalCapacity, forceReset: false }));
            connect(classId);
            setIsInitialized(true);
          }
        }, 0);
      }
    };

    initializeModal();
  }, [classId, totalCapacity, dispatch, connect]);

  // Handle websocket class updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'class_updated') {
      console.log('🔄 WebSocket class_updated received:', lastMessage.data);
      if (lastMessage.data.joiningStudent) {
        const student = lastMessage.data.joiningStudent;
        if (student && student.seatNumber !== undefined && student.seatNumber !== null && student.name) {
          // Dispatch to the classes store to update seat map
          dispatch(updateSeatFromWebSocket({
            classId,
            joiningStudent: {
              name: student.name,
              seatNumber: student.seatNumber,
              id: student.id // Will be undefined for guest students
            }
          }));
        }
      }
    }
  }, [lastMessage, dispatch, classId]);

  const formatSeatNumber = useCallback((id: number) => id.toString().padStart(2, '0'), []);

  const handleClearAllScores = useCallback(() => {
    dispatch(clearAllScores(classId));
  }, [dispatch, classId]);

  const handleResetAllSeats = useCallback(() => {
    // Reset seats entirely on client side - no backend API call needed
    dispatch(syncWithInitialStudents({ classId, capacity: totalCapacity, forceReset: true }));
  }, [dispatch, classId, totalCapacity]);

  // Helper function to get seat data from the seat map - memoized to prevent recreation
  const getSeatData = useCallback((seatNumber: number) => {
    const seat = seatMap[seatNumber];
    if (!seat || seat.isEmpty) {
      return {
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true
      };
    }
    
    return {
      id: seat.studentId,
      name: seat.studentName,
      seatNumber,
      score: seat.score,
      isGuest: seat.isGuest,
      isEmpty: seat.isEmpty
    };
  }, [seatMap]);

  // Helper function to handle score updates
  const handleUpdateScore = useCallback((studentId: number, change: number) => {
    dispatch(updateStudentScore({ classId, studentId, change }));
  }, [dispatch, classId]);

  const renderContent = useMemo(() => {
    // Show loading state until initialization is complete
    if (!isInitialized) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          margin: '16px'
        }}>
          <div style={{ marginBottom: '16px' }}>Loading classroom...</div>
          <LoadingSpinner />
        </div>
      );
    }

    if (activeTab === 'group') {
      return (
        <GroupView 
          formatSeatNumber={formatSeatNumber}
          getSeatData={getSeatData}
          totalCapacity={totalCapacity}
          handleUpdateScore={handleUpdateScore}
        />
      );
    }
    return (
      <StudentGrid 
        formatSeatNumber={formatSeatNumber}
        getSeatData={getSeatData}
        totalCapacity={totalCapacity}
        handleUpdateScore={handleUpdateScore}
      />
    );
  }, [activeTab, formatSeatNumber, getSeatData, totalCapacity, handleUpdateScore, isInitialized]);

  // Calculate seated count directly from seat map to ensure accuracy - memoized
  const seatedCount = useMemo(() => 
    Object.values(seatMap).filter(seat => !seat.isEmpty).length,
    [seatMap]
  );

  return (
    <StyledModalContent>
      <CloseButton onClick={onClose}>×</CloseButton>
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
        classId={classId}
      />
      {renderContent}
    </StyledModalContent>
  );
};

const CloseButton = styled(StyledCloseButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e3e3e3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ModalHeader = styled(StyledModalHeader)`
  padding-bottom: 14px;
`;

const ModalTitle = styled(StyledModalTitle)`
  padding-bottom: 0;
  max-width: 100%;
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
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StudentCount = styled.span`
  font-size: ${props => props.theme.typography.sizes.button};
  color: ${props => props.theme.colors.gray[600]};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export default ClassMgmtModal;