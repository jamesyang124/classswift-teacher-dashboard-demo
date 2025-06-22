import styled from "styled-components";

export const StyledModalContent = styled.div`
  background: #F3F4F6;
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  height: fit-content;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 2px solid #D97706;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const StyledModalHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  padding-bottom: 0;
`;