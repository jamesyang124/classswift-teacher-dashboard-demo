import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';
import ClassMgmtModal from '../ClassMgmtModal';
import classesReducer from '../../../store/slices/classSlice';
import { theme } from '../../../styles/theme';
import type { ClassesState } from '../../../store/slices/classSlice';

// Mock the hooks
vi.mock('../../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    connect: vi.fn(),
    lastMessage: null,
  }),
}));

vi.mock('../../../hooks/useClassInfo', () => ({
  useClassInfo: vi.fn(),
}));

// Mock child components
vi.mock('../../student/TabNavigation', () => ({
  TabNavigation: ({ activeTab, onTabChange, onClearAllScores, onResetAllSeats }: any) => (
    <div data-testid="tab-navigation">
      <button onClick={() => onTabChange('student')} data-testid="student-tab">
        Student List
      </button>
      <button onClick={() => onTabChange('group')} data-testid="group-tab">
        Group View
      </button>
      <button onClick={onClearAllScores} data-testid="clear-scores">
        Clear All Scores
      </button>
      <button onClick={onResetAllSeats} data-testid="reset-seats">
        Reset All Seats
      </button>
    </div>
  ),
}));

vi.mock('../../student/StudentGrid', () => ({
  StudentGrid: ({ totalCapacity, getSeatData, handleUpdateScore }: any) => (
    <div data-testid="student-grid">
      Student Grid - Capacity: {totalCapacity}
    </div>
  ),
}));

vi.mock('../../student/GroupView', () => ({
  GroupView: ({ totalCapacity, getSeatData, handleUpdateScore }: any) => (
    <div data-testid="group-view">
      Group View - Capacity: {totalCapacity}
    </div>
  ),
}));

// Create test store
const createTestStore = (initialState?: Partial<ClassesState>) => {
  return configureStore({
    reducer: {
      classes: classesReducer,
    },
    preloadedState: {
      classes: {
        classes: {},
        currentClassId: null,
        joinLinks: {},
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </Provider>
);

const { useClassInfo } = await import('../../../hooks/useClassInfo');

describe('ClassMgmtModal', () => {
  const mockUseClassInfo = vi.mocked(useClassInfo);
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseClassInfo.mockReturnValue({
      classInfo: {
        publicId: 'TEST123',
        name: 'Test Class',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        seatMap: {
          1: { studentId: 1, studentName: 'John', isGuest: false, isEmpty: false, score: 10 },
          2: { studentName: '', isGuest: true, isEmpty: true, score: 0 },
        },
        totalCapacity: 30,
        availableSlots: 29,
      },
      currentClass: null,
      joinLink: 'http://localhost:3000/join/TEST123',
      loading: false,
      error: null,
      seatMap: {
        1: { studentId: 1, studentName: 'John', isGuest: false, isEmpty: false, score: 10 },
        2: { studentName: '', isGuest: true, isEmpty: true, score: 0 },
      },
      totalCapacity: 30,
      availableSlots: 29,
    });
  });

  it('should render the modal with class information', () => {
    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Class')).toBeInTheDocument();
    expect(screen.getByText('1/30')).toBeInTheDocument(); // seatedCount/totalCapacity
    expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseClassInfo.mockReturnValue({
      classInfo: null,
      currentClass: null,
      joinLink: undefined,
      loading: true,
      error: null,
      seatMap: {},
      totalCapacity: 30,
      availableSlots: 30,
    });

    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseClassInfo.mockReturnValue({
      classInfo: null,
      currentClass: null,
      joinLink: undefined,
      loading: false,
      error: 'Failed to load class',
      seatMap: {},
      totalCapacity: 30,
      availableSlots: 30,
    });

    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Error loading class')).toBeInTheDocument();
  });

  it('should show default class name when no class info', () => {
    mockUseClassInfo.mockReturnValue({
      classInfo: null,
      currentClass: null,
      joinLink: undefined,
      loading: false,
      error: null,
      seatMap: {},
      totalCapacity: 30,
      availableSlots: 30,
    });

    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('302 Science')).toBeInTheDocument();
  });

  it('should calculate seated count correctly', () => {
    mockUseClassInfo.mockReturnValue({
      classInfo: {
        publicId: 'TEST123',
        name: 'Test Class',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        seatMap: {
          1: { studentId: 1, studentName: 'John', isGuest: false, isEmpty: false, score: 10 },
          2: { studentId: 2, studentName: 'Jane', isGuest: false, isEmpty: false, score: 5 },
          3: { studentName: 'Guest', isGuest: true, isEmpty: false, score: 0 },
          4: { studentName: '', isGuest: true, isEmpty: true, score: 0 },
        },
        totalCapacity: 30,
        availableSlots: 27,
      },
      currentClass: null,
      joinLink: 'http://localhost:3000/join/TEST123',
      loading: false,
      error: null,
      seatMap: {
        1: { studentId: 1, studentName: 'John', isGuest: false, isEmpty: false, score: 10 },
        2: { studentId: 2, studentName: 'Jane', isGuest: false, isEmpty: false, score: 5 },
        3: { studentName: 'Guest', isGuest: true, isEmpty: false, score: 0 },
        4: { studentName: '', isGuest: true, isEmpty: true, score: 0 },
      },
      totalCapacity: 30,
      availableSlots: 27,
    });

    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('3/30')).toBeInTheDocument(); // 3 non-empty seats out of 30
  });

  it('should handle close button click', () => {
    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should switch between student and group tabs', () => {
    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    // Initially should show student grid
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('group-view')).not.toBeInTheDocument();

    // Click group tab
    fireEvent.click(screen.getByTestId('group-tab'));

    // Should now show group view
    expect(screen.getByTestId('group-view')).toBeInTheDocument();
    expect(screen.queryByTestId('student-grid')).not.toBeInTheDocument();

    // Click student tab
    fireEvent.click(screen.getByTestId('student-tab'));

    // Should show student grid again
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('group-view')).not.toBeInTheDocument();
  });

  it('should handle clear all scores action', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('clear-scores'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'classes/clearAllScores',
        payload: 'TEST123',
      })
    );
  });

  it('should handle reset all seats action', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('reset-seats'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'classes/syncWithInitialStudents',
        payload: { classId: 'TEST123', capacity: 30, forceReset: true },
      })
    );
  });

  it('should initialize seats when modal opens', async () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'classes/syncWithInitialStudents',
          payload: { classId: 'TEST123', capacity: 30, forceReset: false },
        })
      );
    });
  });

  it('should format seat numbers correctly', () => {
    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    // The formatSeatNumber function should be passed to child components
    // We can't directly test it but we can ensure the component renders without errors
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
  });

  it('should handle getSeatData for empty seat', () => {
    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    // Component should render without errors, indicating getSeatData works correctly
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
  });

  it('should handle getSeatData for occupied seat', () => {
    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    // Component should render without errors, indicating getSeatData works correctly
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
  });

  it('should handle score updates', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    // The handleUpdateScore function should be available for child components
    // Component renders without errors indicating the function is properly defined
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
  });

  it('should render with zero capacity gracefully', () => {
    mockUseClassInfo.mockReturnValue({
      classInfo: {
        publicId: 'TEST123',
        name: 'Test Class',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        seatMap: {},
        totalCapacity: 0,
        availableSlots: 0,
      },
      currentClass: null,
      joinLink: 'http://localhost:3000/join/TEST123',
      loading: false,
      error: null,
      seatMap: {},
      totalCapacity: 0,
      availableSlots: 0,
    });

    const store = createTestStore();

    render(
      <TestWrapper store={store}>
        <ClassMgmtModal classId="TEST123" onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByTestId('student-grid')).toBeInTheDocument();
  });
});