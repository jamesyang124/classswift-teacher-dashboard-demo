import React from 'react';
import { 
  StyledQRCodeSection, 
  StyledQRCodeContainer
} from '../../styles';
import { useQRCode } from '../../hooks/useQRCode';
import { QRImage } from './QRImage';

interface QRCodeDisplayProps {
  classId: string;
  alt: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = React.memo(({ classId, alt }) => {
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
        <QRImage 
          src={qrData.qrCodeBase64}
          alt={alt}
          classId={classId}
        />
      </StyledQRCodeContainer>
    </StyledQRCodeSection>
  );
});