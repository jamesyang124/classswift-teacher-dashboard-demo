import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { QRCodeData } from '../types/api';

export const useQRCode = (classId: string) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching QR code for class:', classId);
        const response = await apiService.getClassQRCode(classId);
        console.log('QR code response:', response);
        setQrData(response.data);
      } catch (err) {
        console.error('QR code fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch QR code');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchQRCode();
    }
  }, [classId]);

  return { qrData, loading, error };
};