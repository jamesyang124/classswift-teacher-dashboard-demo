import { useRef, useState, useCallback } from 'react';
import type { Student } from '../types/student';

interface BatchUpdate {
  seatNumber: number;
  student: Student;
}

export const useSeatUpdates = (totalCapacity: number = 30) => {
  // useRef for efficient batch storage - no re-renders
  const seatUpdatesRef = useRef<Map<number, Student>>(new Map());
  const pendingUpdatesRef = useRef<BatchUpdate[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const initializedRef = useRef(false); // Track if initial students have been set
  
  // useState only for triggering re-renders when needed
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [animatedSeats, setAnimatedSeats] = useState<Set<number>>(new Set());

  // Helper to find the lowest available seat number (1-totalCapacity)
  const findLowestAvailableSeat = () => {
    const occupied = new Set<number>([...seatUpdatesRef.current.keys()]);
    for (let i = 1; i <= totalCapacity; i++) {
      if (!occupied.has(i)) return i;
    }
    return null;
  };

  // Helper to resolve seat number (0 means assign lowest available)
  const resolveSeatNumber = (seatNumber: number): number | null => {
    if (seatNumber === 0) {
      const lowest = findLowestAvailableSeat();
      return lowest !== null ? lowest : null;
    }
    return seatNumber;
  };

  // Batch append using requestAnimationFrame
  const processBatchUpdates = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const updates = pendingUpdatesRef.current;
      if (updates.length === 0) return;

      // Only animate seats that transition from empty to occupied
      const newAnimatedSeats = new Set<number>();
      updates.forEach(({ seatNumber, student }) => {
        let actualSeatNumber = resolveSeatNumber(seatNumber);
        if (actualSeatNumber === null) {
          // All seats are full, do nothing
          return;
        }
        const prev = seatUpdatesRef.current.get(actualSeatNumber);
        // Use student.name as unique identifier
        const prevName = prev?.name;
        const newName = student?.name;
        // Check if this is a newly seated student:
        // 1. There was no previous student at this seat, OR
        // 2. Previous student was different (seat reassignment by name)
        const isNewlySeated = (!prev && student) || (prev && student && prevName !== newName);
        // Debug logging for mock join animation
        if (isNewlySeated) {
          console.log(`🪑 Seat ${actualSeatNumber}: ${prev ? `${prev.name}` : ''} -> ${student.name} (animate: ${isNewlySeated})`);
        }
        // Update the seat data
        seatUpdatesRef.current.set(actualSeatNumber, { ...student, seatNumber: actualSeatNumber });
        // Only animate if this is a newly seated student (empty -> occupied or seat change)
        if (isNewlySeated) {
          newAnimatedSeats.add(actualSeatNumber);
        }
      });

      // Clear pending updates
      pendingUpdatesRef.current = [];

      // Only trigger re-render and animation if there are actual changes
      if (newAnimatedSeats.size > 0) {
        setUpdateTrigger(prev => prev + 1);
        setAnimatedSeats(newAnimatedSeats);

        // Clear animations after 1 second
        setTimeout(() => {
          setAnimatedSeats(new Set());
        }, 1000);
      }

      animationFrameRef.current = null;
    });
  }, [totalCapacity]);

  const updateSeat = useCallback((seatNumber: number, student: Student) => {
    pendingUpdatesRef.current.push({ seatNumber: seatNumber, student: { ...student, seatNumber: seatNumber } });
    processBatchUpdates();
  }, [processBatchUpdates, totalCapacity]);

  const updateMultipleSeats = useCallback((students: Student[]) => {
    // Batch append multiple updates
    students.forEach(student => {
      pendingUpdatesRef.current.push({ 
        seatNumber: student.seatNumber, 
        student: { ...student, seatNumber: student.seatNumber }
      });
    });
    processBatchUpdates();
  }, [processBatchUpdates, totalCapacity]);

  const clearUpdates = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    seatUpdatesRef.current.clear();
    pendingUpdatesRef.current = [];
    setAnimatedSeats(new Set());
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const getSeatUpdate = useCallback((seatNumber: number): Student | undefined => {
    return seatUpdatesRef.current.get(seatNumber);
  }, [updateTrigger]); // Depend on updateTrigger to get fresh data

  const hasSeatUpdate = useCallback((seatNumber: number): boolean => {
    return seatUpdatesRef.current.has(seatNumber);
  }, [updateTrigger]); // Depend on updateTrigger to get fresh data

  const hasAnimation = useCallback((seatNumber: number): boolean => {
    return animatedSeats.has(seatNumber);
  }, [animatedSeats]);

  // Add a sync method to update seatUpdatesRef from a new students array
  const syncWithStudents = useCallback((students: Student[]) => {
    seatUpdatesRef.current = new Map(
      students
        .filter(s => s.seatNumber !== null && s.seatNumber !== undefined)
        .map(s => [s.seatNumber as number, s])
    );
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Initialize all seats as "Empty" guests, then overlay enrolled students
  const syncWithInitialStudents = useCallback((students: Student[], totalCapacity: number) => {
    if (!initializedRef.current) {
      // Create initial empty seat map with all seats as ""
      const initialSeatMap = new Map<number, Student>();
      for (let i = 1; i <= totalCapacity; i++) {
        initialSeatMap.set(i, {
          // No id for empty seats - they are guests
          name: '',
          seatNumber: i,
          score: 0,
          isGuest: true
        });
      }
      
      // Overlay enrolled students on their assigned seats
      students
        .filter(s => s.seatNumber !== null && s.seatNumber !== undefined)
        .forEach(s => {
          initialSeatMap.set(s.seatNumber as number, s);
        });
      
      seatUpdatesRef.current = initialSeatMap;
      setUpdateTrigger(prev => prev + 1); // Trigger re-render for initial sync
      initializedRef.current = true;
    }
  }, []);

  return {
    updateSeat,
    updateMultipleSeats,
    clearUpdates,
    getSeatUpdate,
    hasSeatUpdate,
    hasAnimation,
    syncWithStudents, // expose sync method
    syncWithInitialStudents, // initialize with "Empty" seats, then overlay enrolled students
  };
};