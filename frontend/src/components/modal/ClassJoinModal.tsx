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
import styled from "styled-components";

interface ClassJoinModalProps {}

// Mock data based on TECHNICAL_DESIGN.md specifications
const mockClassData = {
  classId: 'X58E9647',
  className: '302 Science',
  joinLink: 'https://www.classswift.viewsonic.io/join/X58E9647',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=https://www.classswift.viewsonic.io/join/X58E9647'
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
          qrCodeUrl={mockClassData.qrCodeUrl}
          alt={`QR Code for joining ${mockClassData.className}`}
        />

        <StyledVersionInfo>Version 1.1.7</StyledVersionInfo>
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