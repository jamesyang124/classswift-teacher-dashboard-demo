// Demo/Development configuration
// This file can be excluded from production builds
import { config } from './env';

export const isDemoMode = config.features.isDemoMode;

// Dynamic import for mock functionality - only loads in demo mode
export const loadMockUtils = async () => {
  if (!isDemoMode) {
    return null;
  }
  
  try {
    const mockModule = await import('../utils/mockJoin');
    return mockModule;
  } catch {
    return null;
  }
};

// Optional click handler for QR code demo functionality
export const createQRClickHandler = async (classId: string) => {
  if (!isDemoMode) {
    return null;
  }

  const mockUtils = await loadMockUtils();
  if (!mockUtils) {
    return null;
  }

  return (e: React.MouseEvent) => {
    e.preventDefault();
    mockUtils.mockStudentJoin(classId);
  };
};