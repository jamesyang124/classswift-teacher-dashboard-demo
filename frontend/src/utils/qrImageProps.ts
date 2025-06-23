// QR Image props utility - handles dev/demo vs production behavior
import { createQRClickHandler, isDemoMode } from '../config';

export interface QRImageProps {
  src: string;
  alt: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  title?: string;
}

/**
 * Creates appropriate props for QR code image based on environment
 * - Development/Demo: Interactive with click handler, pointer cursor, tooltip
 * - Production: Static image with default styling
 */
export const createQRImageProps = async (
  src: string, 
  alt: string, 
  classId: string
): Promise<QRImageProps> => {
  const baseProps: QRImageProps = {
    src,
    alt,
  };

  // Production mode - return basic props
  if (!isDemoMode) {
    return {
      ...baseProps,
      style: { cursor: 'default' },
    };
  }

  // Development/Demo mode - add interactive functionality
  const clickHandler = await createQRClickHandler(classId);
  
  return {
    ...baseProps,
    onClick: clickHandler || undefined,
    style: { 
      cursor: clickHandler ? 'pointer' : 'default' 
    },
    title: clickHandler ? "Click to simulate student joining via QR code" : undefined,
  };
};