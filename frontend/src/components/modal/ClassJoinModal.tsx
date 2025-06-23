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

interface ClassJoinModalProps {}

// Mock data based on TECHNICAL_DESIGN.md specifications
const mockClassData = {
  classId: 'X58E9647',
  className: '302 Science'
};

const ClassJoinModal: React.FC<ClassJoinModalProps> = () => {
  return (
    <ModalContent>
      <CloseButton>×</CloseButton>
      
      <StyledModalHeader>
        <StyledBackButton>
          <FaChevronLeft style={{ fontSize: '12px', marginRight: '4px' }} /> Back to Class List
        </StyledBackButton>
      </StyledModalHeader>

      <StyledModalTitle>Join {mockClassData.className}</StyledModalTitle>
        <ClassInfo classData={mockClassData} />
        <QRCodeDisplay 
          classId={mockClassData.classId}
          alt={`QR Code for joining ${mockClassData.className}`}
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