import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { config } from '../config/env';
import type { ClassInfo } from '../types/class';

interface ClassListProps {
  onSelectClass?: (classId: string) => void;
  scanModes?: Record<string, boolean>;
  onToggleMode?: (classId: string) => void;
  getCurrentMode?: (classId: string) => boolean;
}

// Memoized ClassCard component to prevent unnecessary re-renders
const ClassCardComponent = React.memo<{
  classInfo: ClassInfo;
  onClassClick: (classId: string) => void;
  onModeToggle: (classId: string, event: React.MouseEvent) => void;
  getCurrentMode?: (classId: string) => boolean;
}>(({ classInfo, onClassClick, onModeToggle, getCurrentMode }) => {
  const isScanMode = getCurrentMode ? getCurrentMode(classInfo.publicId) : true;
  
  const handleClick = useCallback(() => {
    onClassClick(classInfo.publicId);
  }, [onClassClick, classInfo.publicId]);
  
  const handleToggle = useCallback((e: React.MouseEvent) => {
    onModeToggle(classInfo.publicId, e);
  }, [onModeToggle, classInfo.publicId]);

  const createdDate = useMemo(() => 
    new Date(classInfo.createdAt).toLocaleDateString(),
    [classInfo.createdAt]
  );

  return (
    <ClassCard
      onClick={handleClick}
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
        <ClassDateRow>
          <ClassDate>
            Created: {createdDate}
          </ClassDate>
          {config.features.isDemoMode && (
            <ModeToggleButton
              onClick={handleToggle}
              $isScanMode={isScanMode}
            >
              {isScanMode ? '📷 Scan Mode' : '📱 Demo Mode'}
            </ModeToggleButton>
          )}
        </ClassDateRow>
      </ClassDetails>
    </ClassCard>
  );
});

export const ClassList: React.FC<ClassListProps> = ({ onSelectClass, onToggleMode, getCurrentMode }) => {
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

  const handleClassClick = useCallback((classId: string) => {
    if (onSelectClass) {
      onSelectClass(classId);
    }
  }, [onSelectClass]);

  const handleModeToggle = useCallback((classId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent class card click
    if (onToggleMode) {
      onToggleMode(classId);
    }
  }, [onToggleMode]);

  if (loading) {
    return (
      <Container>
        <Title>Active Classes</Title>
        <LoadingMessage>Loading classes...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Active Classes</Title>
        <ErrorMessage>Error: {error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Active Classes</Title>
      {classes.length === 0 ? (
        <EmptyMessage>No classes found</EmptyMessage>
      ) : (
        <ClassGrid>
          {classes.map((classInfo) => (
            <ClassCardComponent
              key={classInfo.publicId}
              classInfo={classInfo}
              onClassClick={handleClassClick}
              onModeToggle={handleModeToggle}
              getCurrentMode={getCurrentMode}
            />
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
  display: flex;
  flex-direction: column;
  align-items: center;

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
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} 0;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
`;

const ClassCard = styled.div<{ $isActive: boolean }>`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 14px;
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
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const ClassDateRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ModeToggleButton = styled.button<{ $isScanMode: boolean }>`
  background: ${props => props.$isScanMode ? '#2196F3' : '#FF9800'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: ${props => props.$isScanMode ? '#1976D2' : '#F57C00'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;