import type { ThemeType } from './theme.types';

// Theme configuration based on UI/UX design specifications
export const theme: ThemeType = {
  colors: {
    primary: '#3B82F6',        // Primary Blue for active elements
    success: '#10B981',        // Success Green for positive points
    danger: '#EF4444',         // Warning Red for negative points
    neutral: '#9CA3AF',        // Neutral Gray for inactive elements
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Background gradient
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      h1: '24px',
      h2: '20px',
      h3: '18px',
      body: '16px',
      button: '14px',
      caption: '12px',
    },
    weights: {
      normal: 400,
      medium: 500,
      bold: 700,
    }
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  }
};

export type { ThemeType } from './theme.types';