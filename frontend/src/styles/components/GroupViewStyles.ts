import styled from 'styled-components';

export const StyledGroupContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  padding: 24px;
  padding-top: 0px;
  
  display: flex;
  flex-direction: column;
  gap: 26px;


  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }

  background-color: white;
  border-radius: 12px;

  max-height: 400px;
  overflow-y: auto;

  margin-right: 10px;
  padding-right: 14px;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: white;
  }

  &::-webkit-scrollbar-track {
    background-color: white;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #c1c1c1;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
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