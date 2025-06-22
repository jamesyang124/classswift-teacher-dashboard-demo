// Type definitions for theme object

export type ThemeColors = {
  primary: string;
  success: string;
  danger: string;
  neutral: string;
  background: string;
  white: string;
  black: string;
  gray: {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
};

export type ThemeTypography = {
  fontFamily: string;
  sizes: {
    h1: string;
    h2: string;
    h3: string;
    body: string;
    button: string;
    caption: string;
  };
  weights: {
    normal: number;
    medium: number;
    bold: number;
  };
};

export type ThemeBorderRadius = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  round: string;
};

export type ThemeShadows = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type ThemeBreakpoints = {
  mobile: string;
  tablet: string;
  desktop: string;
};

export type ThemeType = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
};
