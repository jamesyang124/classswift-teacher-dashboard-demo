import React from 'react';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { StyledTabNavigation, StyledTab, StyledMenuButton } from '../../styles/components';

interface TabNavigationProps {
  activeTab: 'student' | 'group';
  onTabChange: (tab: 'student' | 'group') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <StyledTabNavigation>
      <StyledTab 
        $active={activeTab === 'student'} 
        onClick={() => onTabChange('student')}
      >
        Student List
      </StyledTab>
      <StyledTab 
        $active={activeTab === 'group'} 
        onClick={() => onTabChange('group')}
      >
        Group
      </StyledTab>
      <StyledMenuButton>
        <HiOutlineDotsVertical/>
      </StyledMenuButton>
    </StyledTabNavigation>
  );
};