import type { QRCodeResponse, APIResponse } from '../types/api';
import type { ClassResponse, ClassInfo } from '../types/class';
import { config } from '../config/env';

export const apiService = {
  async getClasses(): Promise<APIResponse<ClassInfo[]>> {
    const response = await fetch(`${config.api.baseUrl}/classes`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch classes: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getClassInfo(classId: string): Promise<APIResponse<ClassResponse>> {
    const response = await fetch(`${config.api.baseUrl}/classes/${classId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch class info: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getClassQRCode(classId: string, isDirectMode: boolean = false): Promise<QRCodeResponse> {
    const queryParam = isDirectMode ? '?mode=direct' : '';
    const response = await fetch(`${config.api.baseUrl}/classes/${classId}/qr${queryParam}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code: ${response.statusText}`);
    }
    
    return response.json();
  },
};