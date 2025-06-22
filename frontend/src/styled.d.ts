import 'styled-components';
import { ThemeType } from './styles/theme.types';

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}