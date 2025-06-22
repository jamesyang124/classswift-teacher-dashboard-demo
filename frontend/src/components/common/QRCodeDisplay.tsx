import React from 'react';
import { 
  StyledQRCodeSection, 
  StyledQRCodeContainer, 
  StyledQRCodeImage 
} from '../../styles';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  alt: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeUrl, alt }) => {
  return (
    <StyledQRCodeSection>
      <StyledQRCodeContainer>
        <StyledQRCodeImage 
          src={qrCodeUrl} 
          alt={alt}
        />
      </StyledQRCodeContainer>
    </StyledQRCodeSection>
  );
};