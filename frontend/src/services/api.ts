import type { QRCodeResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiService = {
  async getClassQRCode(classId: string): Promise<QRCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/qr`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code: ${response.statusText}`);
    }
    
    return response.json();
  }
};