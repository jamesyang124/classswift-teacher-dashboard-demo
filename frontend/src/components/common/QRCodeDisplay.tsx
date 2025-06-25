import React from 'react';
import { 
  StyledQRCodeSection, 
  StyledQRCodeContainer
} from '../../styles';
import { QRImage } from './QRImage';

interface QRCodeDisplayProps {
  classId: string;
  alt: string;
  isDirectMode?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ classId, alt, isDirectMode = true }) => {
  return (
    <StyledQRCodeSection>
      <StyledQRCodeContainer>
        <QRImage 
          alt={alt}
          classId={classId}
          isDirectMode={isDirectMode}
        />
      </StyledQRCodeContainer>
    </StyledQRCodeSection>
  );
};