import React, { useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { StyledCopyButton } from '../../styles';

interface CopyButtonProps {
  textToCopy: string;
  size?: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  textToCopy, 
  size = '14px', 
  className 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <StyledCopyButton 
      onClick={copyToClipboard}
      $copied={copied}
      className={className}
    >
      <MdContentCopy style={{ fontSize: size }} />
    </StyledCopyButton>
  );
};

export default CopyButton;