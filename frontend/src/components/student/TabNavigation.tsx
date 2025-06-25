import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { StyledTabNavigation, StyledTab, StyledMenuContainer, StyledMenuButton, StyledDropdownMenu, StyledDropdownItem } from '../../styles/components';
import { mockGuestJoin, mockEnrolledJoin, mockMultipleStudentJoin } from '../../utils/mockJoin';

interface TabNavigationProps {
  activeTab: 'student' | 'group';
  onTabChange: (tab: 'student' | 'group') => void;
  onClearAllScores: () => void;
  onResetAllSeats: () => void;
  classId: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  onClearAllScores, 
  onResetAllSeats,
  classId
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClearAllScores = () => {
    onClearAllScores();
    setIsMenuOpen(false);
  };

  const handleResetAllSeats = () => {
    onResetAllSeats();
    setIsMenuOpen(false);
  };

  const handleAddGuest = async () => {
    await mockGuestJoin(classId);
    setIsMenuOpen(false);
  };

  const handleAddEnrolled = async () => {
    await mockEnrolledJoin(classId);
    setIsMenuOpen(false);
  };

  const handleAdd10Students = async () => {
    await mockMultipleStudentJoin(classId, 10);
    setIsMenuOpen(false);
  };

  const handleAdd30Students = async () => {
    await mockMultipleStudentJoin(classId, 30);
    setIsMenuOpen(false);
  };

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
      <StyledMenuContainer ref={menuRef}>
        <StyledMenuButton onClick={handleMenuToggle}>
          <HiOutlineDotsVertical/>
        </StyledMenuButton>
        {isMenuOpen && (
          <StyledDropdownMenu>
            <StyledDropdownItem onClick={handleAddGuest}>
              Add 1 Guest
            </StyledDropdownItem>
            <StyledDropdownItem onClick={handleAddEnrolled}>
              Add 1 Enrolled
            </StyledDropdownItem>
            <StyledDropdownItem onClick={handleAdd10Students}>
              Add 10 Students
            </StyledDropdownItem>
            <StyledDropdownItem onClick={handleAdd30Students}>
              Add 30 Students
            </StyledDropdownItem>
            <StyledDropdownItem onClick={handleClearAllScores}>
              Clear All Scores
            </StyledDropdownItem>
            <StyledDropdownItem onClick={handleResetAllSeats}>
              Reset All Seats
            </StyledDropdownItem>
          </StyledDropdownMenu>
        )}
      </StyledMenuContainer>
    </StyledTabNavigation>
  );
};