import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';
import type { QRCodeData } from '../types/api';

// Static cache for QR code responses (since they don't change for a classId)
const qrCodeCache = new Map<string, QRCodeData>();
const fetchPromises = new Map<string, Promise<QRCodeData>>();

export const useQRCode = (classId: string) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const memoizedResult = useMemo(() => {
    // Return cached data immediately if available
    const cached = qrCodeCache.get(classId);
    if (cached) {
      return { data: cached, fromCache: true };
    }
    return { data: null, fromCache: false };
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    // If we have cached data, use it immediately
    if (memoizedResult.fromCache && memoizedResult.data) {
      console.log('Using cached QR code for class:', classId);
      setQrData(memoizedResult.data);
      setLoading(false);
      setError(null);
      return;
    }

    // Check if we're already fetching this classId
    const existingPromise = fetchPromises.get(classId);
    if (existingPromise) {
      existingPromise
        .then(data => {
          setQrData(data);
          setLoading(false);
          setError(null);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to fetch QR code');
          setLoading(false);
        });
      return;
    }

    const fetchQRCode = async (): Promise<QRCodeData> => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching QR code for class:', classId);
        const response = await apiService.getClassQRCode(classId);
        console.log('QR code response:', response);
        
        // Cache the response
        qrCodeCache.set(classId, response.data);
        fetchPromises.delete(classId); // Remove promise from pending
        
        return response.data;
      } catch (err) {
        fetchPromises.delete(classId); // Remove promise from pending
        throw err;
      }
    };

    // Store the promise to prevent duplicate requests
    const promise = fetchQRCode();
    fetchPromises.set(classId, promise);

    promise
      .then(data => {
        setQrData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('QR code fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch QR code');
        setLoading(false);
      });
  }, [classId, memoizedResult]);

  return useMemo(() => ({ qrData, loading, error }), [qrData, loading, error]);
};