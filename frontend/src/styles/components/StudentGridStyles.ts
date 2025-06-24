import styled from 'styled-components';

export const StyledStudentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  padding-top: 21px;
  padding-bottom: 8px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  background-color: white;
  border-radius: 12px;

  max-height: 400px;
  height: 400px;
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

export const StyledScrollContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
`;