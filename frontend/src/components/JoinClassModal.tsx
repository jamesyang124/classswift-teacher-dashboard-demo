import { useState } from 'react';
import styled from 'styled-components';
import { MdContentCopy } from 'react-icons/md';

interface JoinClassModalProps {}

// Mock data based on TECHNICAL_DESIGN.md specifications
const mockClassData = {
  classId: 'X58E9647',
  className: '302 Science',
  joinLink: 'https://www.classswift.viewsonic.io/join/X58E9647',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=https://www.classswift.viewsonic.io/join/X58E9647'
};

const JoinClassModal: React.FC<JoinClassModalProps> = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <ModalContent>
      <ModalHeader>
        <BackButton>
          ← Back to Class List
        </BackButton>
        <CloseButton>×</CloseButton>
      </ModalHeader>

        <ModalTitle>Join {mockClassData.className}</ModalTitle>

        <ClassInfoSection>
          <InfoRowHorizontal>
            <InfoField>
              <InfoLabel>ID: {mockClassData.classId}</InfoLabel>
              <CopyButton 
                onClick={() => copyToClipboard(mockClassData.classId, 'classId')}
                $copied={copiedField === 'classId'}
              >
                <MdContentCopy style={{ fontSize: '14px' }} />
              </CopyButton>
            </InfoField>
            <InfoField>
              <InfoLabel>Link</InfoLabel>
              <CopyButton 
                onClick={() => copyToClipboard(mockClassData.joinLink, 'joinLink')}
                $copied={copiedField === 'joinLink'}
              >
                <MdContentCopy style={{ fontSize: '14px' }} />
              </CopyButton>
            </InfoField>
          </InfoRowHorizontal>
        </ClassInfoSection>

        <QRCodeSection>
          <QRCodeContainer>
            <QRCodeImage 
              src={mockClassData.qrCodeUrl} 
              alt={`QR Code for joining ${mockClassData.className}`}
            />
          </QRCodeContainer>
        </QRCodeSection>

        <VersionInfo>Version 1.1.7</VersionInfo>
    </ModalContent>
  );
};


const ModalContent = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 400px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.theme.shadows.xl};
  position: relative;
  border: 2px solid #4338CA;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.gray[200]};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.sizes.button};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
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

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.h2};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: #374151;
  text-align: left;
  padding: ${props => props.theme.spacing.lg};
  margin: 0;
`;

const ClassInfoSection = styled.div`
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const InfoRowHorizontal = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 400px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const InfoField = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
  min-width: 0;
`;

const InfoLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.body};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;


const CopyButton = styled.button<{ $copied: boolean }>`
  background: ${props => props.$copied ? props.theme.colors.success : props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 0;
  font-size: ${props => props.theme.typography.sizes.caption};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  &:hover {
    background: ${props => props.$copied ? props.theme.colors.success : '#2563EB'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const QRCodeSection = styled.div`
  padding: 0% 0%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
`;

const QRCodeContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.white};
`;

const QRCodeImage = styled.img`
  width: 85%;
  height: 100%;
  display: block;
  object-fit: contain;
`;


const VersionInfo = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.sizes.caption};
  color: ${props => props.theme.colors.gray[400]};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
`;


export default JoinClassModal;