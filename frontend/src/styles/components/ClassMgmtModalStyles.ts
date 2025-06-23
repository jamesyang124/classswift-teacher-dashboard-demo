// Student component styles placeholder
import styled from "styled-components";

export const StyledClassInfo = styled.div`
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

export const StyledTabNavigation = styled.div`
  display: flex;
  padding-left: 24px;
`;

export const StyledTab = styled.button<{ $active: boolean }>`
  background: white;
  border: none;
  outline: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: 14px;
  font-weight: ${props => props.theme.typography.weights.medium};
  font-family: ${props => props.theme.typography.fontFamily};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.gray[500]};
  cursor: pointer;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  
  transition: all 0.2s ease;
  height: 32px;
  display: flex;
  align-items: center;
  margin-right: 5px;

  &:focus {
    outline: none;
    border: none;
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;