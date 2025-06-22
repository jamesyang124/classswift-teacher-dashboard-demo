import React from 'react';
import { 
  StyledQRCodeSection, 
  StyledQRCodeContainer, 
  StyledQRCodeImage 
} from '../../styles';
import { useQRCode } from '../../hooks/useQRCode';

interface QRCodeDisplayProps {
  classId: string;
  alt: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ classId, alt }) => {
  const { qrData, loading, error } = useQRCode(classId);

  if (loading) {
    return (
      <StyledQRCodeSection>
        <StyledQRCodeContainer>
          <div>Loading QR Code...</div>
        </StyledQRCodeContainer>
      </StyledQRCodeSection>
    );
  }

  if (error) {
    return (
      <StyledQRCodeSection>
        <StyledQRCodeContainer>
          <div>Error loading QR Code: {error}</div>
        </StyledQRCodeContainer>
      </StyledQRCodeSection>
    );
  }

  if (!qrData) {
    return (
      <StyledQRCodeSection>
        <StyledQRCodeContainer>
          <div>No QR Code available</div>
        </StyledQRCodeContainer>
      </StyledQRCodeSection>
    );
  }

  return (
    <StyledQRCodeSection>
      <StyledQRCodeContainer>
        <StyledQRCodeImage 
          src={qrData.qrCodeBase64} 
          alt={alt}
        />
      </StyledQRCodeContainer>
    </StyledQRCodeSection>
  );
};