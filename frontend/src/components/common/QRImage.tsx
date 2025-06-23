// Environment-aware QR Image component
import React, { useState, useEffect } from 'react';
import { StyledQRCodeImage } from '../../styles';
import { createQRImageProps, type QRImageProps } from '../../utils/qrImageProps';

interface QRImageComponentProps {
  src: string;
  alt: string;
  classId: string;
}

/**
 * Smart QR Image component that automatically switches between:
 * - Development/Demo: Interactive with click simulation
 * - Production: Static display only
 */
export const QRImage: React.FC<QRImageComponentProps> = ({ src, alt, classId }) => {
  const [qrImageProps, setQrImageProps] = useState<QRImageProps | null>(null);

  useEffect(() => {
    createQRImageProps(src, alt, classId).then(props => {
      setQrImageProps(props);
    });
  }, [src, alt, classId]);

  if (!qrImageProps) {
    return null; // or loading spinner
  }

  return <StyledQRCodeImage {...qrImageProps} />;
};