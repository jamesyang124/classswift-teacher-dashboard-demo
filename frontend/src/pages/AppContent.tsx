import { useEffect, useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import ClassJoinModal from '../components/modal/ClassJoinModal'
import ClassMgmtModal from '../components/modal/ClassMgmtModal'
import { ClassList } from './ClassList'
import { webSocketManager } from '../services/webSocketManager'
import { useClassInfo } from '../hooks/useClassInfo'

interface AppContentProps {
  // No props needed
}

export const AppContent: React.FC<AppContentProps> = () => {
  const [showLeftModal, setShowLeftModal] = useState(false);
  const [showRightModal, setShowRightModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [directScanModes, setDirectScanModes] = useState<Record<string, boolean>>({});
  
  // Use useClassInfo hook when a class is selected (inside Provider context)
  useClassInfo(selectedClassId || '');

  // App-level WebSocket cleanup for browser events
  useEffect(() => {
    console.log('🚀 App mounted, setting up WebSocket cleanup handlers');
    
    const handleBeforeUnload = () => {
      console.log('📦 Page unloading, disconnecting WebSocket');
      webSocketManager.disconnect();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('👁️ Page hidden, user likely navigating away');
        // Don't disconnect immediately - user might be switching tabs
        // WebSocket will handle reconnection if needed
      } else if (document.visibilityState === 'visible') {
        console.log('👁️ Page visible, user returned');
        // Connection will be re-established if needed by components
      }
    };

    // Only handle actual page unload/refresh, not tab switches
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🛑 App unmounting, cleaning up event listeners only');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Note: WebSocket should persist even if App component unmounts (React StrictMode)
      // Only disconnect on actual browser page unload (beforeunload event)
    };
  }, []);

  const handleSelectClass = useCallback((classId: string) => {
    // Batch state updates to prevent multiple re-renders
    setSelectedClassId(classId);
    setShowLeftModal(true);  
    setShowRightModal(true);
  }, []);

  // Get current mode for selected class (defaults to scan mode) - memoized
  const getCurrentScanMode = useCallback((classId: string) => {
    return directScanModes[classId] !== undefined ? directScanModes[classId] : true;
  }, [directScanModes]);

  const handleModeToggle = useCallback((classId: string) => {
    setDirectScanModes(prev => ({
      ...prev,
      [classId]: !getCurrentScanMode(classId)
    }));
  }, [getCurrentScanMode]);

  const handleCloseLeftModal = useCallback(() => {
    setShowLeftModal(false);
  }, []);

  const handleCloseRightModal = useCallback(() => {
    setShowRightModal(false);
  }, []);

  const handleBackToClassList = useCallback(() => {
    // Close both modals and return to class list
    setShowLeftModal(false);
    setShowRightModal(false);
  }, []);

  return (
    <AppContainer>
      <ClassListContainer>
        <ClassList 
          onSelectClass={handleSelectClass}
          onToggleMode={handleModeToggle}
          getCurrentMode={getCurrentScanMode}
        />
      </ClassListContainer>
      
      {/* Modals overlay on top of class list */}
      {(showLeftModal || showRightModal) && selectedClassId && (
        <ModalOverlay>
          <ModalContainer $showLeftModal={showLeftModal} $showRightModal={showRightModal}>
            {showLeftModal && (
              <ClassJoinModal 
                onClose={handleCloseLeftModal} 
                onBackToClassList={handleBackToClassList} 
                classId={selectedClassId} 
                isDirectMode={getCurrentScanMode(selectedClassId)} 
              />
            )}
            {showRightModal && (
              <ClassMgmtModal 
                onClose={handleCloseRightModal} 
                classId={selectedClassId} 
              />
            )}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AppContainer>
  )
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #3952A4 0%, #50C7C5 25%, #FAD613 50%, #E11C28 75%, #CB2B5C 100%);
  position: relative;
`;

const ClassListContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    align-items: flex-start;
    padding: ${props => props.theme.spacing.md};
  }
`;

const ModalContainer = styled.div<{ $showLeftModal: boolean; $showRightModal: boolean }>`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  max-width: 1200px;
  width: 100%;
  align-items: flex-start;
  justify-content: ${props => 
    props.$showLeftModal && props.$showRightModal ? 'center' :
    props.$showLeftModal ? 'center' :
    props.$showRightModal ? 'center' : 'center'
  };
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    max-width: 600px;
    align-items: center;
    margin-top: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.md};
    min-height: calc(100vh - ${props => props.theme.spacing.md} * 2);
  }
`;