import styled from 'styled-components';

export const StyledVersionInfo = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  font-size: 11px;
  font-family: ${props => props.theme.typography.fontFamily};
  color: ${props => props.theme.colors.gray[500]};
`;

export const StyledInfoRowHorizontal = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 400px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing.sm};
  }
`;

export const StyledInfoField = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex: 1;
  min-width: 0;
`;

export const StyledInfoLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.body};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  max-width: 14ch; /* Limit ID to 14 characters, truncate with ellipsis if longer */
`;

export const StyledModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.h2};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: #374151;
  text-align: left;
  padding: 0;
  padding-left: ${props => props.theme.spacing.lg};
  margin: 0;
  padding-bottom: 10px;
  max-width: 50%; /* Limit classroom name to 50% of modal width */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;