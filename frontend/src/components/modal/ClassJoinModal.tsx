import { FaChevronLeft } from "react-icons/fa6";
import { ClassInfo } from '../class';
import { QRCodeDisplay } from '../common';
import { 
  StyledVersionInfo,
  StyledModalContent,
  StyledModalHeader,
  StyledModalTitle,
  StyledCloseButton,
  StyledBackButton } from '../../styles';
import { config } from '../../config';
import styled from "styled-components";
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface ClassJoinModalProps {
  onClose?: () => void;
  onBackToClassList?: () => void;
  classId: string;
}

const ClassJoinModal: React.FC<ClassJoinModalProps> = ({ onClose, onBackToClassList, classId }) => {
  const className = useSelector((state: RootState) => state.class.classInfo?.name || '');
  const classData = { classId, className };
  return (
    <ModalContent>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <StyledModalHeader>
        <StyledBackButton onClick={onBackToClassList}>
          <FaChevronLeft style={{ fontSize: '12px', marginRight: '4px' }} /> Back to Class List
        </StyledBackButton>
      </StyledModalHeader>

      <StyledModalTitle>Join {classData.className}</StyledModalTitle>
        <ClassInfo classData={classData} />
        <QRCodeDisplay 
          classId={classData.classId}
          alt={`QR Code for joining ${classData.className}`}
        />

        <StyledVersionInfo>Version {config.app.version}</StyledVersionInfo>
    </ModalContent>
  );
};

const ModalContent = styled(StyledModalContent)`
  max-width: 400px;
`;

const CloseButton = styled(StyledCloseButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export default ClassJoinModal;