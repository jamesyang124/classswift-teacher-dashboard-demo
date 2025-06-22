export interface ClassData {
  classId: string;
  className: string;
  joinLink: string;
  qrCodeUrl?: string;
}

export interface ClassInfo {
  id: number;
  publicId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassResponse {
  class: ClassInfo;
  joinLink: string;
}