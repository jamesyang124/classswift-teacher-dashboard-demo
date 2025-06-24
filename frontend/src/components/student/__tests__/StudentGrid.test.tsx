import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { StudentGrid } from '../StudentGrid';
import { theme } from '../../../styles/theme';
import type { Student } from '../../../types/student';

// Mock StudentCard component
vi.mock('../StudentCard', () => ({
  StudentCard: ({ student, onUpdateScore, formatSeatNumber, hasRealtimeUpdate }: any) => (
    <div data-testid={`student-card-${student.seatNumber}`}>
      <div data-testid="student-name">{student.name || 'Empty'}</div>
      <div data-testid="seat-number">{formatSeatNumber(student.seatNumber)}</div>
      <div data-testid="score">{student.score}</div>
      <div data-testid="is-guest">{student.isGuest ? 'guest' : 'enrolled'}</div>
      <div data-testid="is-empty">{student.isEmpty ? 'empty' : 'occupied'}</div>
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

describe('StudentGrid', () => {
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

  it('should render grid with correct number of seats', () => {
    render(
      <TestWrapper>
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={5}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render 5 student cards
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByTestId(`student-card-${i}`)).toBeInTheDocument();
    }

    // Should call getSeatData for each seat
    expect(mockGetSeatData).toHaveBeenCalledTimes(5);
    for (let i = 1; i <= 5; i++) {
      expect(mockGetSeatData).toHaveBeenCalledWith(i);
    }
  });

  it('should render empty grid when capacity is 0', () => {
    render(
      <TestWrapper>
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={0}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    expect(mockGetSeatData).not.toHaveBeenCalled();
    expect(screen.queryByTestId(/student-card-/)).not.toBeInTheDocument();
  });

  it('should render enrolled students correctly', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
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
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={3}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Check enrolled student in seat 1
    const seat1 = screen.getByTestId('student-card-1');
    expect(seat1).toHaveTextContent('John Doe');
    expect(seat1).toHaveTextContent('10');
    expect(seat1).toHaveTextContent('enrolled');
    expect(seat1).toHaveTextContent('occupied');

    // Check empty seats
    const seat2 = screen.getByTestId('student-card-2');
    expect(seat2).toHaveTextContent('Empty');
    expect(seat2).toHaveTextContent('guest');
    expect(seat2).toHaveTextContent('empty');
  });

  it('should render guest students correctly', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
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
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={3}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Check guest student in seat 2
    const seat2 = screen.getByTestId('student-card-2');
    expect(seat2).toHaveTextContent('Guest');
    expect(seat2).toHaveTextContent('guest');
    expect(seat2).toHaveTextContent('occupied');
  });

  it('should format seat numbers correctly', () => {
    render(
      <TestWrapper>
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={3}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should call formatSeatNumber for each seat
    expect(mockFormatSeatNumber).toHaveBeenCalledTimes(3);
    expect(mockFormatSeatNumber).toHaveBeenCalledWith(1);
    expect(mockFormatSeatNumber).toHaveBeenCalledWith(2);
    expect(mockFormatSeatNumber).toHaveBeenCalledWith(3);

    // Check formatted seat numbers are displayed
    expect(screen.getByTestId('student-card-1')).toHaveTextContent('01');
    expect(screen.getByTestId('student-card-2')).toHaveTextContent('02');
    expect(screen.getByTestId('student-card-3')).toHaveTextContent('03');
  });

  it('should enable score updates only for enrolled students', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
          score: 10,
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
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={3}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Enrolled student should have score button
    const enrolledStudentCard = screen.getByTestId('student-card-1');
    expect(enrolledStudentCard.querySelector('[data-testid="score-button"]')).toBeInTheDocument();

    // Guest and empty seats should not have score button
    const guestStudentCard = screen.getByTestId('student-card-2');
    expect(guestStudentCard.querySelector('[data-testid="score-button"]')).not.toBeInTheDocument();

    const emptyStudentCard = screen.getByTestId('student-card-3');
    expect(emptyStudentCard.querySelector('[data-testid="score-button"]')).not.toBeInTheDocument();
  });

  it('should handle score updates for enrolled students', () => {
    mockGetSeatData.mockImplementation((seatNumber: number): Student => {
      if (seatNumber === 1) {
        return {
          id: 1,
          name: 'John Doe',
          seatNumber: 1,
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
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={2}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    const scoreButton = screen.getByTestId('score-button');
    scoreButton.click();

    expect(mockHandleUpdateScore).toHaveBeenCalledTimes(1);
    expect(mockHandleUpdateScore).toHaveBeenCalledWith(1, 1);
  });

  it('should handle large capacity efficiently', () => {
    render(
      <TestWrapper>
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={100}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Should render all 100 seats
    expect(mockGetSeatData).toHaveBeenCalledTimes(100);
    for (let i = 1; i <= 100; i++) {
      expect(screen.getByTestId(`student-card-${i}`)).toBeInTheDocument();
    }
  });

  it('should pass correct props to StudentCard', () => {
    const mockStudent: Student = {
      id: 1,
      name: 'John Doe',
      seatNumber: 1,
      score: 10,
      isGuest: false,
      isEmpty: false,
    };

    mockGetSeatData.mockReturnValue(mockStudent);

    render(
      <TestWrapper>
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={1}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    const studentCard = screen.getByTestId('student-card-1');
    expect(studentCard).toHaveTextContent('John Doe');
    expect(studentCard).toHaveTextContent('01');
    expect(studentCard).toHaveTextContent('10');
    expect(studentCard).toHaveTextContent('enrolled');
    expect(studentCard).toHaveTextContent('occupied');
  });

  it('should render with mixed student types', () => {
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
        <StudentGrid
          formatSeatNumber={mockFormatSeatNumber}
          getSeatData={mockGetSeatData}
          totalCapacity={5}
          handleUpdateScore={mockHandleUpdateScore}
        />
      </TestWrapper>
    );

    // Check enrolled student 1
    expect(screen.getByTestId('student-card-1')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('student-card-1')).toHaveTextContent('enrolled');

    // Check guest student 2
    expect(screen.getByTestId('student-card-2')).toHaveTextContent('Guest');
    expect(screen.getByTestId('student-card-2')).toHaveTextContent('guest');

    // Check enrolled student 3
    expect(screen.getByTestId('student-card-3')).toHaveTextContent('Jane Smith');
    expect(screen.getByTestId('student-card-3')).toHaveTextContent('enrolled');

    // Check empty seats 4 and 5
    expect(screen.getByTestId('student-card-4')).toHaveTextContent('Empty');
    expect(screen.getByTestId('student-card-4')).toHaveTextContent('empty');
    expect(screen.getByTestId('student-card-5')).toHaveTextContent('Empty');
    expect(screen.getByTestId('student-card-5')).toHaveTextContent('empty');
  });
});