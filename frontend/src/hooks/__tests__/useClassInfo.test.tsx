import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useClassInfo } from '../useClassInfo';
import classesReducer, { setCurrentClass, syncWithInitialStudents, fetchClassInfo } from '../../store/slices/classSlice';
import type { ClassesState } from '../../store/slices/classSlice';

// Mock the dispatch functions
const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

// Create a test store factory
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
const createWrapper = (store: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useClassInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default values when class does not exist', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useClassInfo('TEST123'), { wrapper });

    expect(result.current.classInfo).toBeUndefined();
    expect(result.current.currentClass).toBeNull();
    expect(result.current.joinLink).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.seatMap).toEqual({});
    expect(result.current.totalCapacity).toBe(30);
    expect(result.current.availableSlots).toBe(30);
  });

  it('should return class info when class exists', () => {
    const mockClassData = {
      publicId: 'TEST123',
      name: 'Test Class',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      seatMap: {
        1: { studentName: 'John', isGuest: false, isEmpty: false, score: 10 },
        2: { studentName: '', isGuest: false, isEmpty: true, score: 0 },
      },
      totalCapacity: 30,
      availableSlots: 29,
    };

    const store = createTestStore({
      classes: { 'TEST123': mockClassData },
      currentClassId: 'TEST123',
      joinLinks: { 'TEST123': 'http://localhost:3000/join/TEST123' },
    });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useClassInfo('TEST123'), { wrapper });

    expect(result.current.classInfo).toEqual(mockClassData);
    expect(result.current.currentClass).toEqual(mockClassData);
    expect(result.current.joinLink).toBe('http://localhost:3000/join/TEST123');
    expect(result.current.seatMap).toEqual(mockClassData.seatMap);
    expect(result.current.totalCapacity).toBe(30);
    expect(result.current.availableSlots).toBe(29);
  });

  it('should dispatch setCurrentClass when classId changes', () => {
    const store = createTestStore({ currentClassId: 'OLD123' });
    const wrapper = createWrapper(store);

    renderHook(() => useClassInfo('NEW123'), { wrapper });

    expect(mockDispatch).toHaveBeenCalledWith(setCurrentClass('NEW123'));
  });

  it('should dispatch syncWithInitialStudents when class does not exist', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    renderHook(() => useClassInfo('NEW123'), { wrapper });

    expect(mockDispatch).toHaveBeenCalledWith(syncWithInitialStudents({ classId: 'NEW123' }));
  });

  it('should dispatch fetchClassInfo when class has no name', () => {
    const mockClassDataNoName = {
      publicId: 'TEST123',
      name: '',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      seatMap: {},
      totalCapacity: 30,
      availableSlots: 30,
    };

    const store = createTestStore({
      classes: { 'TEST123': mockClassDataNoName },
    });
    const wrapper = createWrapper(store);

    renderHook(() => useClassInfo('TEST123'), { wrapper });

    expect(mockDispatch).toHaveBeenCalledWith(setCurrentClass('TEST123'));
    // fetchClassInfo returns a thunk function, so we check a function was dispatched
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('should not dispatch fetchClassInfo when class already has name', () => {
    const mockClassData = {
      publicId: 'TEST123',
      name: 'Test Class',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      seatMap: {},
      totalCapacity: 30,
      availableSlots: 30,
    };

    const store = createTestStore({
      classes: { 'TEST123': mockClassData },
      currentClassId: 'TEST123',
    });
    const wrapper = createWrapper(store);

    mockDispatch.mockClear();
    renderHook(() => useClassInfo('TEST123'), { wrapper });

    expect(mockDispatch).not.toHaveBeenCalledWith(fetchClassInfo('TEST123'));
  });

  it('should handle loading and error states', () => {
    const store = createTestStore({
      loading: true,
      error: 'Failed to load class',
    });
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useClassInfo('TEST123'), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Failed to load class');
  });

  it('should return empty object for seatMap when classInfo is undefined', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useClassInfo('NONEXISTENT'), { wrapper });

    expect(result.current.seatMap).toEqual({});
  });

  it('should return default capacity values when classInfo is undefined', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useClassInfo('NONEXISTENT'), { wrapper });

    expect(result.current.totalCapacity).toBe(30);
    expect(result.current.availableSlots).toBe(30);
  });

  it('should not dispatch setCurrentClass when currentClassId is already correct', () => {
    const store = createTestStore({ currentClassId: 'TEST123' });
    const wrapper = createWrapper(store);

    mockDispatch.mockClear();
    renderHook(() => useClassInfo('TEST123'), { wrapper });

    expect(mockDispatch).not.toHaveBeenCalledWith(setCurrentClass('TEST123'));
  });

  it('should handle empty classId gracefully', () => {
    const store = createTestStore();
    const wrapper = createWrapper(store);

    const { result } = renderHook(() => useClassInfo(''), { wrapper });

    expect(result.current.classInfo).toBeUndefined();
    expect(result.current.seatMap).toEqual({});
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});