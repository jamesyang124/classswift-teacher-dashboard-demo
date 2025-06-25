// Simplified QR Image component
import React from 'react';
import styled from 'styled-components';
import { StyledQRCodeImage } from '../../styles';
import { useQRCode } from '../../hooks/useQRCode';
import { mockStudentJoin } from '../../utils/mockJoin';

interface QRImageComponentProps {
  alt: string;
  classId: string;
  isDirectMode: boolean;
}

export const QRImage: React.FC<QRImageComponentProps> = ({ alt, classId, isDirectMode = true }) => {
  const { qrData, loading, error } = useQRCode(classId, isDirectMode);

  const handleQRClick = async () => {
    if (isDirectMode) { // Direct mode - not clickable, just return
      return;
    }
    // Demo mode - simulate scanning
    console.log('🎯 QR Code clicked in demo mode - simulating student join');
    await mockStudentJoin(classId);
  };

  if (loading) {
    return <div>Loading QR Code...</div>;
  }

  if (error) {
    return <div>Error loading QR code: {error}</div>;
  }

  if (!qrData?.qrCodeBase64) {
    return <div>No QR Code available</div>;
  }

  // In demo mode (!isDirectMode), make QR code clickable
  if (!isDirectMode) {
    return (
      <ClickableQRImage 
        src={qrData.qrCodeBase64}
        alt={`${alt} (Click to simulate scan)`}
        onClick={handleQRClick}
        title="Click to simulate student joining via QR code"
      />
    );
  }

  // In scan mode (isDirectMode), normal static QR code - NOT clickable
  return (
    <StaticQRImage 
      src={qrData.qrCodeBase64}
      alt={alt}
      title="Scan with your device camera"
    />
  );
};

const ClickableQRImage = styled(StyledQRCodeImage)`
  cursor: pointer;
`;

const StaticQRImage = styled(StyledQRCodeImage)`
  cursor: default;
  pointer-events: none; /* Ensures no click events */
`;