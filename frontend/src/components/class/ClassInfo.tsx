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
}

export const ClassInfo: React.FC<ClassInfoProps> = ({ classData }) => {
  const { qrData, loading } = useQRCode(classData.classId);
  
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