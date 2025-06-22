import styled from 'styled-components';

export const StyledQRCodeSection = styled.div`
  padding: 0 calc(${props => props.theme.spacing.lg} + 2%);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledQRCodeContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.white};
`;

export const StyledQRCodeImage = styled.img`
  width: 90%;
  height: 90%;
  display: block;
  object-fit: contain;
`;