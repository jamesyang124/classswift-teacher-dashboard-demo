import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import type { ClassInfo } from '../types/class';

interface ClassListProps {
  onSelectClass?: (classId: string) => void;
}

export const ClassList: React.FC<ClassListProps> = ({ onSelectClass }) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all classes for the list
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getClasses();
        setClasses(response.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleClassClick = (classId: string) => {
    if (onSelectClass) {
      onSelectClass(classId);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>Your Classes</Title>
        <LoadingMessage>Loading classes...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Your Classes</Title>
        <ErrorMessage>Error: {error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Your Classes</Title>
      {classes.length === 0 ? (
        <EmptyMessage>No classes found</EmptyMessage>
      ) : (
        <ClassGrid>
          {classes.map((classInfo) => (
            <ClassCard
              key={classInfo.publicId}
              onClick={() => handleClassClick(classInfo.publicId)}
              $isActive={classInfo.isActive}
            >
              <ClassHeader>
                <ClassName>{classInfo.name}</ClassName>
                <ClassStatus $isActive={classInfo.isActive}>
                  {classInfo.isActive ? 'Active' : 'Inactive'}
                </ClassStatus>
              </ClassHeader>
              <ClassDetails>
                <ClassId>ID: {classInfo.publicId}</ClassId>
                <ClassDate>
                  Created: {new Date(classInfo.createdAt).toLocaleDateString()}
                </ClassDate>
              </ClassDetails>
            </ClassCard>
          ))}
        </ClassGrid>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 900px) {
    padding: ${props => props.theme.spacing.md};
    max-width: 100%;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.h1};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.sizes.body};
  padding: ${props => props.theme.spacing.xl};
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.danger};
  font-size: ${props => props.theme.typography.sizes.body};
  padding: ${props => props.theme.spacing.xl};
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.sizes.body};
  padding: ${props => props.theme.spacing.xl};
`;

const ClassGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md} 0;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const ClassCard = styled.div<{ $isActive: boolean }>`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.$isActive ? props.theme.colors.success : props.theme.colors.neutral};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ClassHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ClassName = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.h2};
  font-weight: ${props => props.theme.typography.weights.medium};
  margin: 0;
  flex: 1;
`;

const ClassStatus = styled.span<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? props.theme.colors.success : props.theme.colors.gray[400]};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.sizes.caption};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

const ClassDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ClassId = styled.div`
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.sizes.caption};
  font-family: ${props => props.theme.typography.fontFamily};
`;

const ClassDate = styled.div`
  color: ${props => props.theme.colors.gray[600]};
  font-size: ${props => props.theme.typography.sizes.caption};
`;