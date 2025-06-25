// Centralized environment configuration
// All environment variables and derived constants should be defined here

/**
 * Environment Variables
 */
const env = {
  // API Configuration
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
  // Demo/Development Configuration  
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
  
  // Build Mode
  MODE: import.meta.env.MODE,
} as const;

// Helper function to get WebSocket URL from HTTP URL
const getWebSocketUrl = (fullUrl: string) => {
  try {
    const url = new URL(fullUrl);
    // Convert http/https to ws/wss
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
  } catch {
    // Fallback for invalid URLs
    return fullUrl.replace(/^https?/, 'ws').replace(/\/api\/v1$/, '');
  }
};

/**
 * Derived Constants
 */
export const config = {
  // API Endpoints
  api: {
    baseUrl: env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    wsBaseUrl: getWebSocketUrl(env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'),
    
    // WebSocket URL builder
    getWebSocketUrl: (classId: string) => {
      const wsBase = getWebSocketUrl(env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1');
      return `${wsBase}/api/v1/classes/${classId}/ws`;
    },
  },
  
  // Feature Flags
  features: {
    isDemoMode: env.VITE_DEMO_MODE === 'true',
    isProduction: env.MODE === 'production',
    isDevelopment: env.MODE === 'development',
  },
  
  // Application Settings
  app: {
    name: 'ClassSwift Teacher Dashboard',
    version: env.VITE_APP_VERSION || '1.0.0', // Fallback to current version
  },
} as const;

/**
 * Legacy exports for backward compatibility
 * @deprecated Use config.api.baseUrl instead
 */
export const API_BASE_URL = config.api.baseUrl;

/**
 * @deprecated Use config.features.isDemoMode instead  
 */
export const isDemoMode = config.features.isDemoMode;