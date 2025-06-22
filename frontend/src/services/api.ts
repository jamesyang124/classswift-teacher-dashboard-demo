import type { QRCodeResponse, APIResponse } from '../types/api';
import type { ClassResponse } from '../types/class';
import type { StudentsResponse } from '../types/student';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiService = {
  async getClassInfo(classId: string): Promise<APIResponse<ClassResponse>> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch class info: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getClassQRCode(classId: string): Promise<QRCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/qr`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getClassStudents(classId: string): Promise<APIResponse<StudentsResponse>> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch class students: ${response.statusText}`);
    }
    
    return response.json();
  }
};