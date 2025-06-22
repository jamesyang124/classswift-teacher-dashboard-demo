import React, { useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { StyledCopyButton } from '../../styles';

interface CopyButtonProps {
  textToCopy: string;
  disabled?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  textToCopy, 
  disabled = false
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (disabled || !textToCopy) return;
    
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
      disabled={disabled}
    >
      <MdContentCopy style={{ fontSize: '14px' }} />
    </StyledCopyButton>
  );
};

export default CopyButton;