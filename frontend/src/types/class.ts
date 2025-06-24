export interface ClassData {
  publicId: string;
  name: string;
  joinLink: string;
  qrCodeUrl?: string;
}

export interface ClassInfo {
  publicId: string; // Use publicId as the main identifier
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResponse {
  class: ClassInfo;
  joinLink: string;
}

export interface ClassSeatMap {
  [seatNumber: number]: {
    studentId?: number;
    studentName: string;
    isGuest: boolean;
    isEmpty: boolean;
    score: number;
  };
}

export interface ClassWithSeatMap extends ClassInfo {
  seatMap: ClassSeatMap;
  totalCapacity: number;
  availableSlots: number;
  initialized?: boolean; // Use this flag to track initialization
}