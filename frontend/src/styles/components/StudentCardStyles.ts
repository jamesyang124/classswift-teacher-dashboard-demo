import styled from 'styled-components';

export const StyledStudentCard = styled.div<{ $isGuest: boolean }>`
  border: 2px solid ${props => props.$isGuest ? '#9CA3AF' : '#3B82F6'};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.white};
  overflow: hidden;
  transition: all 0.2s ease;
  height: 87px;
  display: flex;
  flex-direction: column;

  &:hover {
    border: 2px solid ${props => props.$isGuest ? '#9CA3AF' : '#1D4ED8'};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

export const StyledSeatHeader = styled.div<{ $isGuest: boolean }>`
  background: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  font-weight: ${props => props.theme.typography.weights.bold};
  font-size: ${props => props.theme.typography.sizes.button};
  text-align: center;
  padding: 4px ${props => props.theme.spacing.sm};
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledStudentName = styled.div<{ $isGuest: boolean }>`
  padding: 4px ${props => props.theme.spacing.sm};
  text-align: center;
  font-size: ${props => props.theme.typography.sizes.button};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.gray[800]};
  height: 42px;
  border-bottom: 2px solid ${props => props.$isGuest ? '#9CA3AF' : '#3B82F6'};
  position: relative;
  width: 100%;
  box-sizing: border-box;
  
  /* Create a centered, truncated text container */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Inner span for text truncation */
  & > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: inline-block;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: ${props => props.theme.spacing.sm};
    right: ${props => props.theme.spacing.sm};
    height: 1px;
    background: ${props => props.$isGuest ? '#9CA3AF' : '#3B82F6'};
    border-radius: 0 0 ${props => props.theme.borderRadius.sm} ${props => props.theme.borderRadius.sm};
  }
`;

export const StyledScoreContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  padding: 2px;
  position: relative;
`;

export const StyledScoreBadge = styled.div<{ $score: number; $isGuest: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${props => props.$isGuest ? props.theme.colors.gray[400] : props.theme.colors.black};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 2px 6px;
  font-size: 14px;
  font-weight: ${props => props.theme.typography.weights.bold};
  min-width: 24px;
  height: 18px;
`;

export const StyledScoreButton = styled.button<{ $type: 'increase' | 'decrease'; $disabled?: boolean }>`
  background: ${props =>
    props.$disabled ? props.theme.colors.gray[200] :
      props.$type === 'increase' ? props.theme.colors.success :
        props.$type === 'decrease' ? props.theme.colors.danger :
          props.theme.colors.gray[300]
  };
  border: none;
  outline: none;
  color: ${props =>
    props.$disabled ? props.theme.colors.gray[400] : props.theme.colors.white
  };
  width: 24px;
  height: 18px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 10px;
  font-weight: bold;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  white-space: nowrap;
  
  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    background: ${props =>
    props.$disabled ? props.theme.colors.gray[200] :
      props.$type === 'increase' ? '#059669' :
        props.$type === 'decrease' ? '#DC2626' :
          props.theme.colors.gray[400]
  };
    transform: ${props => props.$disabled ? 'none' : 'scale(1.05)'};
  }

  &:active {
    transform: ${props => props.$disabled ? 'none' : 'scale(0.95)'};
  }
`;

export const StyledGuestOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  cursor: not-allowed;
  z-index: 1;
`;