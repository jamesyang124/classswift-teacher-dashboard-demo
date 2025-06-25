import React from 'react';
import {
  StyledInfoField,
  StyledInfoLabel,
  StyledClassInfo,
  StyledInfoRowHorizontal
} from '../../styles/components';
import { CopyButton } from '../common';
import { useQRCode } from '../../hooks/useQRCode';

interface ClassData {
  classId: string;
  className: string;
  joinLink?: string;
}

interface ClassInfoProps {
  classData: ClassData;
  isDirectMode?: boolean;
}

export const ClassInfo: React.FC<ClassInfoProps> = ({ classData, isDirectMode = true }) => {
  const { qrData, loading } = useQRCode(classData.classId, isDirectMode);
  
  const joinLink = qrData?.joinLink || classData.joinLink || '';

  return (
    <StyledClassInfo>
      <StyledInfoRowHorizontal>
        <StyledInfoField>
          <StyledInfoLabel>ID: {classData.classId}</StyledInfoLabel>
          <CopyButton textToCopy={classData.classId} />
        </StyledInfoField>
        <StyledInfoField>
          <StyledInfoLabel>Link</StyledInfoLabel>
          <CopyButton 
            textToCopy={joinLink} 
            disabled={loading || !joinLink}
          />
        </StyledInfoField>
      </StyledInfoRowHorizontal>
    </StyledClassInfo>
  );
};