import styled from 'styled-components';

export const StyledGroupContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  padding: 24px;
  padding-top: 0px;
  
  display: flex;
  flex-direction: column;
  gap: 26px;
  max-height: 400px;
  overflow-y: auto;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }

  background-color: white;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
`;

export const StyledGroupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const StyledGroupTitle = styled.h3`
  font-size: 14px;
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.gray[900]};
  margin: 0;
  margin-bottom: -5px;
  text-align: end;
`;

export const StyledGroupStudents = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.theme.spacing.sm};
  padding-top: 0px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;