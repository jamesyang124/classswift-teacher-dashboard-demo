import styled from 'styled-components';

export const StyledCloseButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: 20px;
  color: ${props => props.theme.colors.gray[400]};
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;
  position: relative;
  top: -28px;
  right: -24px;

  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

export const StyledCopyButton = styled.button<{ $copied: boolean }>`
  background: ${props => props.$copied ? props.theme.colors.success : '#3B82F6'};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 0;
  font-size: ${props => props.theme.typography.sizes.caption};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  &:hover {
    background: ${props => props.$copied ? props.theme.colors.success : '#0891B2'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

export const StyledBackButton = styled.button`
  background: none;
  border: none;
  outline: none;
  color: ${props => props.theme.colors.gray[600]};
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;

  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  padding: 0;
`;

export const StyledMenuContainer = styled.div`
  position: relative;
  margin-left: auto;
  margin-right: 30px;
`;

export const StyledMenuButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: 20px;
  color: ${props => props.theme.colors.gray[400]};
  cursor: pointer;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    background: ${props => props.theme.colors.gray[100]};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

export const StyledDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.white};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 160px;
  margin-top: 4px;
`;

export const StyledDropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  outline: none;
  padding: 12px 16px;
  text-align: left;
  font-size: ${props => props.theme.typography.sizes.body};
  color: ${props => props.theme.colors.gray[700]};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:first-child {
    border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  }
  
  &:hover {
    background: ${props => props.theme.colors.gray[100]};
  }
  
  &:focus {
    outline: none;
    background: ${props => props.theme.colors.gray[200]};
  }
`;