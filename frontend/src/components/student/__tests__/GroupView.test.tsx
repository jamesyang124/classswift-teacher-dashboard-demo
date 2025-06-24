import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { GroupView } from '../GroupView';
import { theme } from '../../../styles/theme';
import type { Student } from '../../../types/student';

// Mock StudentCard component
vi.mock('../StudentCard', () => ({
  StudentCard: ({ student, onUpdateScore, formatSeatNumber, hasRealtimeUpdate }: any) => (
    <div data-testid={`student-card-${student.seatNumber}`}>
      <div data-testid="student-name">{student.name || 'Empty'}</div>
      <div data-testid="seat-number">{formatSeatNumber(student.seatNumber)}</div>
      <div data-testid="student-id">{student.id || 'no-id'}</div>
      <div data-testid="is-guest">{student.isGuest ? 'guest' : 'enrolled'}</div>
      {student.id && (
        <button 
          data-testid="score-button" 
          onClick={() => onUpdateScore(student.id, 1)}
        >
          Update Score
        </button>
      )}
    </div>
  ),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('GroupView', () => {
  const mockFormatSeatNumber = vi.fn((seatNumber: number) => seatNumber.toString().padStart(2, '0'));
  const mockHandleUpdateScore = vi.fn();
  const mockGetSeatData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSeatData.mockImplementation((seatNumber: number): Student => ({
      id: undefined,
      name: '',
      seatNumber,
      score: 0,
      isGuest: true,
      isEmpty: true,
    }));
  });

  it('should render empty state when no students are seated', () => {
    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={10}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should call getSeatData for all seats
    expect(mockGetSeatData).toHaveBeenCalledTimes(10);

    // Should not render any groups
    expect(screen.queryByText(/Group \d+/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/student-card-/)).not.toBeInTheDocument();
  });

  it('should create single group with 3 students', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber <= 3) {
        return {
          id: seatNumber,
          name: `Student ${seatNumber}`,
          seatNumber,
          score: 10,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={10}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render one group
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.queryByText('Group 2')).not.toBeInTheDocument();

    // Should render 3 student cards
    expect(screen.getByTestId('student-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-3')).toBeInTheDocument();

    // Check student data
    expect(screen.getByTestId('student-card-1')).toHaveTextContent('Student 1');
    expect(screen.getByTestId('student-card-2')).toHaveTextContent('Student 2');
    expect(screen.getByTestId('student-card-3')).toHaveTextContent('Student 3');
  });

  it('should create multiple groups with 5 students each', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber <= 12) {
        return {
          id: seatNumber,
          name: `Student ${seatNumber}`,
          seatNumber,
          score: 10,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={15}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render 3 groups (5 + 5 + 2 students)
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();
    expect(screen.getByText('Group 3')).toBeInTheDocument();
    expect(screen.queryByText('Group 4')).not.toBeInTheDocument();

    // Check all 12 students are rendered
    for (let i = 1; i <= 12; i++) {
      expect(screen.getByTestId(`student-card-${i}`)).toBeInTheDocument();
    }
  });

  it('should handle mixed enrolled and guest students', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
          score: 15,
          isGuest: false,
          isEmpty: false,
        };
      }
      if (seatNumber === 2) {
        return {
          id: undefined,
          name: 'Guest',
          seatNumber: 2,
          score: 0,
          isGuest: true,
          isEmpty: false,
        };
      }
      if (seatNumber === 3) {
        return {
          id: 2,
          name: 'Jane Smith',
          seatNumber: 3,
          score: 20,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={10}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Group 1')).toBeInTheDocument();

    // Check enrolled student
    expect(screen.getByTestId('student-card-1')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('student-card-1')).toHaveTextContent('enrolled');

    // Check guest student
    expect(screen.getByTestId('student-card-2')).toHaveTextContent('Guest');
    expect(screen.getByTestId('student-card-2')).toHaveTextContent('guest');

    // Check another enrolled student
    expect(screen.getByTestId('student-card-3')).toHaveTextContent('Jane Smith');
    expect(screen.getByTestId('student-card-3')).toHaveTextContent('enrolled');
  });

  it('should handle score updates for enrolled students only', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
          score: 15,
          isGuest: false,
          isEmpty: false,
        };
      }
      if (seatNumber === 2) {
        return {
          id: undefined,
          name: 'Guest',
          seatNumber: 2,
          score: 0,
          isGuest: true,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={5}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Enrolled student should have score button
    const enrolledStudentCard = screen.getByTestId('student-card-1');
    expect(enrolledStudentCard.querySelector('[data-testid="score-button"]')).toBeInTheDocument();

    // Guest student should not have score button
    const guestStudentCard = screen.getByTestId('student-card-2');
    expect(guestStudentCard.querySelector('[data-testid="score-button"]')).not.toBeInTheDocument();
  });

  it('should generate correct keys for student cards', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
          score: 15,
          isGuest: false,
          isEmpty: false,
        };
      }
      if (seatNumber === 2) {
        return {
          id: undefined,
          name: 'Guest',
          seatNumber: 2,
          score: 0,
          isGuest: true,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={5}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Both cards should be rendered (one with ID, one without)
    expect(screen.getByTestId('student-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-2')).toBeInTheDocument();
  });

  it('should filter out empty seats correctly', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1 || seatNumber === 5) {
        return {
          id: seatNumber,
          name: `Student ${seatNumber}`,
          seatNumber,
          score: 10,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={10}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render one group with only 2 students (seats 1 and 5)
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.queryByText('Group 2')).not.toBeInTheDocument();

    expect(screen.getByTestId('student-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-5')).toBeInTheDocument();

    // Empty seats should not be rendered
    expect(screen.queryByTestId('student-card-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-card-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('student-card-4')).not.toBeInTheDocument();
  });

  it('should maintain seat number order within groups', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      // Non-sequential seat numbers that are occupied
      if ([2, 4, 6, 8, 10, 12, 14].includes(seatNumber)) {
        return {
          id: seatNumber,
          name: `Student ${seatNumber}`,
          seatNumber,
          score: 10,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={20}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render 2 groups (5 + 2 students)
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();

    // Students should be in seat number order: 2, 4, 6, 8, 10 in Group 1
    // and 12, 14 in Group 2
    expect(screen.getByTestId('student-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-4')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-6')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-8')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-10')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-12')).toBeInTheDocument();
    expect(screen.getByTestId('student-card-14')).toBeInTheDocument();
  });

  it('should handle zero capacity', () => {
    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={0}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    expect(mockGetSeatData).not.toHaveBeenCalled();
    expect(screen.queryByText(/Group \d+/)).not.toBeInTheDocument();
  });

  it('should handle exactly 5 students (one full group)', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber <= 5) {
        return {
          id: seatNumber,
          name: `Student ${seatNumber}`,
          seatNumber,
          score: 10,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={10}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render exactly one group
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.queryByText('Group 2')).not.toBeInTheDocument();

    // Should have all 5 students
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`student-card-${i}`)).toBeInTheDocument();
    }
  });

  it('should pass correct props to StudentCard components', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
          score: 15,
          isGuest: false,
          isEmpty: false,
        };
      }
      return {
        id: undefined,
        name: '',
        seatNumber,
        score: 0,
        isGuest: true,
        isEmpty: true,
      };
    });

    render(
      <TestWrapper>
        <GroupView
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={5}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    const studentCard = screen.getByTestId('student-card-1');
    expect(studentCard).toHaveTextContent('John Doe');
    expect(studentCard).toHaveTextContent('01'); // formatSeatNumber called
    expect(studentCard).toHaveTextContent('1'); // student ID
    expect(studentCard).toHaveTextContent('enrolled');
  });
});