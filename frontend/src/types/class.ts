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