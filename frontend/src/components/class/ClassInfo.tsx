import React from 'react';
import {
  StyledInfoField,
  StyledInfoLabel,
  StyledClassInfo,
  StyledInfoRowHorizontal
} from '../../styles/components';
import { CopyButton } from '../common';

interface ClassData {
  classId: string;
  className: string;
  joinLink: string;
}

interface ClassInfoProps {
  classData: ClassData;
}

export const ClassInfo: React.FC<ClassInfoProps> = ({ classData }) => {
  return (
    <StyledClassInfo>
      <StyledInfoRowHorizontal>
        <StyledInfoField>
          <StyledInfoLabel>ID: {classData.classId}</StyledInfoLabel>
          <CopyButton textToCopy={classData.classId} />
        </StyledInfoField>
        <StyledInfoField>
          <StyledInfoLabel>Link</StyledInfoLabel>
          <CopyButton textToCopy={classData.joinLink} />
        </StyledInfoField>
      </StyledInfoRowHorizontal>
    </StyledClassInfo>
  );
};