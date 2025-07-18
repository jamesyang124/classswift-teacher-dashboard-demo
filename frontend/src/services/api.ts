import type { QRCodeResponse, APIResponse } from '../types/api';
import type { ClassResponse, ClassInfo } from '../types/class';
import { config } from '../config/env';

// Simple cache for API responses to avoid duplicate requests under CPU throttling
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds cache

// Simple debounce helper for API calls
const debounceMap = new Map<string, NodeJS.Timeout>();

const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  key: string
): T => {
  return ((...args: any[]) => {
    const existingTimeout = debounceMap.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          debounceMap.delete(key);
        }
      }, delay);
      
      debounceMap.set(key, timeout);
    });
  }) as T;
};

const getCachedResponse = (key: string) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

export const apiService = {
  async getClasses(): Promise<APIResponse<ClassInfo[]>> {
    const cacheKey = 'classes';
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${config.api.baseUrl}/classes`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch classes: ${response.statusText}`);
    }
    
    const data = await response.json();
    setCachedResponse(cacheKey, data);
    return data;
  },

  getClassInfo: debounce(async (classId: string): Promise<APIResponse<ClassResponse>> => {
    const cacheKey = `class-${classId}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${config.api.baseUrl}/classes/${classId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch class info: ${response.statusText}`);
    }
    
    const data = await response.json();
    setCachedResponse(cacheKey, data);
    return data;
  }, 300, 'getClassInfo'),

  getClassQRCode: debounce(async (classId: string, isDirectMode: boolean = false): Promise<QRCodeResponse> => {
    const cacheKey = `qr-${classId}-${isDirectMode}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;

    const queryParam = isDirectMode ? '?mode=direct' : '';
    const response = await fetch(`${config.api.baseUrl}/classes/${classId}/qr${queryParam}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code: ${response.statusText}`);
    }
    
    const data = await response.json();
    setCachedResponse(cacheKey, data);
    return data;
  }, 200, 'getClassQRCode'),
};