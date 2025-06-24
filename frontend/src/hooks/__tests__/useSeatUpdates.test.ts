import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSeatUpdates } from '../useSeatUpdates';
import type { Student } from '../../types/student';

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  animationFrameId++;
  setTimeout(callback, 0);
  return animationFrameId;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

// Mock console.log to avoid noise in tests
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('useSeatUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    animationFrameId = 0;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const createMockStudent = (overrides?: Partial<Student>): Student => ({
    id: 1,
    name: 'John Doe',
    seatNumber: 1,
    score: 0,
    isGuest: false,
    ...overrides,
  });

  it('should initialize with default capacity of 30', () => {
    const { result } = renderHook(() => useSeatUpdates());

    expect(result.current.getSeatUpdate(1)).toBeUndefined();
    expect(result.current.hasSeatUpdate(1)).toBe(false);
    expect(result.current.hasAnimation(1)).toBe(false);
  });

  it('should initialize with custom capacity', () => {
    const { result } = renderHook(() => useSeatUpdates(10));

    // Should work within custom capacity
    expect(result.current.getSeatUpdate(5)).toBeUndefined();
    expect(result.current.hasSeatUpdate(5)).toBe(false);
  });

  it('should update a seat with student data', async () => {
    const { result } = renderHook(() => useSeatUpdates());
    const student = createMockStudent({ name: 'Alice', seatNumber: 5 });

    await act(async () => {
      result.current.updateSeat(5, student);
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait for async update
    });

    expect(result.current.hasSeatUpdate(5)).toBe(true);
    expect(result.current.getSeatUpdate(5)).toEqual(expect.objectContaining({
      name: 'Alice',
      seatNumber: 5,
    }));
  });

  it('should assign lowest available seat when seatNumber is 0', async () => {
    const { result } = renderHook(() => useSeatUpdates(5));
    const student1 = createMockStudent({ name: 'Alice', seatNumber: 2 });
    const student2 = createMockStudent({ name: 'Bob', seatNumber: 0 }); // Should get seat 1

    await act(async () => {
      result.current.updateSeat(2, student1);
      result.current.updateSeat(0, student2);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasSeatUpdate(1)).toBe(true);
    expect(result.current.getSeatUpdate(1)).toEqual(expect.objectContaining({
      name: 'Bob',
      seatNumber: 1,
    }));
    expect(result.current.hasSeatUpdate(2)).toBe(true);
    expect(result.current.getSeatUpdate(2)).toEqual(expect.objectContaining({
      name: 'Alice',
      seatNumber: 2,
    }));
  });

  it('should handle seat assignment when all seats are full', async () => {
    const { result } = renderHook(() => useSeatUpdates(2));
    const student1 = createMockStudent({ name: 'Alice', seatNumber: 1 });
    const student2 = createMockStudent({ name: 'Bob', seatNumber: 2 });
    const student3 = createMockStudent({ name: 'Charlie', seatNumber: 0 }); // Should not be assigned

    await act(async () => {
      result.current.updateSeat(1, student1);
      result.current.updateSeat(2, student2);
      result.current.updateSeat(0, student3);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Charlie should not be assigned anywhere
    expect(result.current.hasSeatUpdate(1)).toBe(true);
    expect(result.current.hasSeatUpdate(2)).toBe(true);
    
    // Check that Charlie is not in any seat
    for (let i = 1; i <= 2; i++) {
      const seatStudent = result.current.getSeatUpdate(i);
      expect(seatStudent?.name).not.toBe('Charlie');
    }
  });

  it('should update multiple seats at once', async () => {
    const { result } = renderHook(() => useSeatUpdates());
    const students = [
      createMockStudent({ name: 'Alice', seatNumber: 1 }),
      createMockStudent({ name: 'Bob', seatNumber: 2 }),
      createMockStudent({ name: 'Charlie', seatNumber: 3 }),
    ];

    await act(async () => {
      result.current.updateMultipleSeats(students);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasSeatUpdate(1)).toBe(true);
    expect(result.current.hasSeatUpdate(2)).toBe(true);
    expect(result.current.hasSeatUpdate(3)).toBe(true);
    expect(result.current.getSeatUpdate(1)?.name).toBe('Alice');
    expect(result.current.getSeatUpdate(2)?.name).toBe('Bob');
    expect(result.current.getSeatUpdate(3)?.name).toBe('Charlie');
  });

  it('should clear all updates', async () => {
    const { result } = renderHook(() => useSeatUpdates());
    const student = createMockStudent({ name: 'Alice', seatNumber: 1 });

    await act(async () => {
      result.current.updateSeat(1, student);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasSeatUpdate(1)).toBe(true);

    act(() => {
      result.current.clearUpdates();
    });

    expect(result.current.hasSeatUpdate(1)).toBe(false);
    expect(result.current.getSeatUpdate(1)).toBeUndefined();
  });

  it('should sync with existing students array', () => {
    const { result } = renderHook(() => useSeatUpdates());
    const students = [
      createMockStudent({ name: 'Alice', seatNumber: 1 }),
      createMockStudent({ name: 'Bob', seatNumber: 3 }),
      createMockStudent({ name: 'Charlie', seatNumber: null }), // Should be filtered out
    ];

    act(() => {
      result.current.syncWithStudents(students);
    });

    expect(result.current.hasSeatUpdate(1)).toBe(true);
    expect(result.current.hasSeatUpdate(3)).toBe(true);
    expect(result.current.hasSeatUpdate(2)).toBe(false); // Charlie not seated
    expect(result.current.getSeatUpdate(1)?.name).toBe('Alice');
    expect(result.current.getSeatUpdate(3)?.name).toBe('Bob');
  });

  it('should initialize with empty seats and overlay enrolled students', () => {
    const { result } = renderHook(() => useSeatUpdates());
    const enrolledStudents = [
      createMockStudent({ name: 'Alice', seatNumber: 2 }),
      createMockStudent({ name: 'Bob', seatNumber: 4 }),
    ];

    act(() => {
      result.current.syncWithInitialStudents(enrolledStudents, 5);
    });

    // All seats should be initialized
    for (let i = 1; i <= 5; i++) {
      expect(result.current.hasSeatUpdate(i)).toBe(true);
    }

    // Enrolled students should be in their assigned seats
    expect(result.current.getSeatUpdate(2)?.name).toBe('Alice');
    expect(result.current.getSeatUpdate(4)?.name).toBe('Bob');

    // Empty seats should have empty guest data
    expect(result.current.getSeatUpdate(1)?.name).toBe('');
    expect(result.current.getSeatUpdate(1)?.isGuest).toBe(true);
    expect(result.current.getSeatUpdate(3)?.name).toBe('');
    expect(result.current.getSeatUpdate(3)?.isGuest).toBe(true);
    expect(result.current.getSeatUpdate(5)?.name).toBe('');
    expect(result.current.getSeatUpdate(5)?.isGuest).toBe(true);
  });

  it('should only initialize once with syncWithInitialStudents', () => {
    const { result } = renderHook(() => useSeatUpdates());
    const students1 = [createMockStudent({ name: 'Alice', seatNumber: 1 })];
    const students2 = [createMockStudent({ name: 'Bob', seatNumber: 2 })];

    act(() => {
      result.current.syncWithInitialStudents(students1, 3);
    });

    expect(result.current.getSeatUpdate(1)?.name).toBe('Alice');

    // Second call should not reinitialize
    act(() => {
      result.current.syncWithInitialStudents(students2, 3);
    });

    // Should still have Alice, not Bob
    expect(result.current.getSeatUpdate(1)?.name).toBe('Alice');
    expect(result.current.getSeatUpdate(2)?.name).toBe('');
  });

  it('should track animations for newly seated students', async () => {
    const { result } = renderHook(() => useSeatUpdates());
    const student = createMockStudent({ name: 'Alice', seatNumber: 1 });

    await act(async () => {
      result.current.updateSeat(1, student);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasAnimation(1)).toBe(true);

    // Animation should clear after timeout
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.hasAnimation(1)).toBe(false);
  });

  it('should not animate when updating same student', async () => {
    const { result } = renderHook(() => useSeatUpdates());
    const student1 = createMockStudent({ name: 'Alice', seatNumber: 1, score: 5 });
    const student2 = createMockStudent({ name: 'Alice', seatNumber: 1, score: 10 }); // Same name

    await act(async () => {
      result.current.updateSeat(1, student1);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasAnimation(1)).toBe(true);

    // Clear animation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.hasAnimation(1)).toBe(false);

    // Update same student - should not animate
    await act(async () => {
      result.current.updateSeat(1, student2);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasAnimation(1)).toBe(false); // Should not animate
    expect(result.current.getSeatUpdate(1)?.score).toBe(10); // But should update data
  });

  it('should animate when different student takes same seat', async () => {
    const { result } = renderHook(() => useSeatUpdates());
    const student1 = createMockStudent({ name: 'Alice', seatNumber: 1 });
    const student2 = createMockStudent({ name: 'Bob', seatNumber: 1 }); // Different name, same seat

    await act(async () => {
      result.current.updateSeat(1, student1);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Clear first animation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.hasAnimation(1)).toBe(false);

    // Different student takes seat - should animate
    await act(async () => {
      result.current.updateSeat(1, student2);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.hasAnimation(1)).toBe(true);
    expect(result.current.getSeatUpdate(1)?.name).toBe('Bob');
  });

  it('should handle requestAnimationFrame cancellation on clearUpdates', () => {
    const { result } = renderHook(() => useSeatUpdates());
    const student = createMockStudent({ name: 'Alice', seatNumber: 1 });

    act(() => {
      result.current.updateSeat(1, student);
      result.current.clearUpdates(); // Should cancel pending animation frame
    });

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('should filter out students with null or undefined seatNumber in syncWithStudents', () => {
    const { result } = renderHook(() => useSeatUpdates());
    const students = [
      createMockStudent({ name: 'Alice', seatNumber: 1 }),
      createMockStudent({ name: 'Bob', seatNumber: null }),
      createMockStudent({ name: 'Charlie', seatNumber: undefined }),
    ] as Student[];

    act(() => {
      result.current.syncWithStudents(students);
    });

    expect(result.current.hasSeatUpdate(1)).toBe(true);
    expect(result.current.getSeatUpdate(1)?.name).toBe('Alice');
    
    // Bob and Charlie should not be in any seat since they have null/undefined seatNumber
    for (let i = 2; i <= 30; i++) {
      expect(result.current.hasSeatUpdate(i)).toBe(false);
    }
  });
});