import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { QRCodeData } from '../types/api';

// Static cache for QR code responses
const qrCodeCache = new Map<string, QRCodeData>();

export const useQRCode = (classId: string, isDirectMode: boolean = false) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${classId}-${isDirectMode ? 'direct' : 'normal'}`;

  useEffect(() => {
    if (!classId) return;

    // Check cache first
    const cached = qrCodeCache.get(cacheKey);
    if (cached) {
      setQrData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    // Fetch new data
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getClassQRCode(classId, isDirectMode);
        
        // Cache the response
        qrCodeCache.set(cacheKey, response.data);
        setQrData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('QR code fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch QR code');
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [classId, isDirectMode, cacheKey]);

  return { qrData, loading, error };
};