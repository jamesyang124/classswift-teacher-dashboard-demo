import type { QRCodeResponse, APIResponse } from '../types/api';
import type { ClassResponse } from '../types/class';
import type { StudentsResponse } from '../types/student';
import { config } from '../config/env';

export const apiService = {
  async getClassInfo(classId: string): Promise<APIResponse<ClassResponse>> {
    const response = await fetch(`${config.api.baseUrl}/classes/${classId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch class info: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getClassQRCode(classId: string): Promise<QRCodeResponse> {
    const response = await fetch(`${config.api.baseUrl}/classes/${classId}/qr`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getClassStudents(classId: string): Promise<APIResponse<StudentsResponse>> {
    const response = await fetch(`${config.api.baseUrl}/classes/${classId}/students`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch class students: ${response.statusText}`);
    }
    
    return response.json();
  }
};