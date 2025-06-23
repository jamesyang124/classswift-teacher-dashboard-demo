import { useRef, useState, useCallback } from 'react';
import type { Student } from '../types/student';

interface BatchUpdate {
  seatNumber: number;
  student: Student;
}

export const useSeatUpdates = () => {
  // useRef for efficient batch storage - no re-renders
  const seatUpdatesRef = useRef<Map<number, Student>>(new Map());
  const pendingUpdatesRef = useRef<BatchUpdate[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const initializedRef = useRef(false); // Track if initial students have been set
  
  // useState only for triggering re-renders when needed
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [animatedSeats, setAnimatedSeats] = useState<Set<number>>(new Set());

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
        const prev = seatUpdatesRef.current.get(seatNumber);
        
        // Check if this is a newly seated student:
        // 1. There was no previous student at this seat, OR
        // 2. Previous student was different (seat reassignment)
        const isNewlySeated = (!prev && student) || (prev && student && prev.id !== student.id);
        
        // Debug logging for mock join animation
        if (isNewlySeated) {
          console.log(`🪑 Seat ${seatNumber}: ${prev ? `${prev.name}` : 'empty'} -> ${student.name} (animate: ${isNewlySeated})`);
        }
        
        // Update the seat data
        seatUpdatesRef.current.set(seatNumber, student);
        
        // Only animate if this is a newly seated student (empty -> occupied or seat change)
        if (isNewlySeated) {
          newAnimatedSeats.add(seatNumber);
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
  }, []);

  const updateSeat = useCallback((seatNumber: number, student: Student) => {
    pendingUpdatesRef.current.push({ seatNumber, student });
    processBatchUpdates();
  }, [processBatchUpdates]);

  const updateMultipleSeats = useCallback((students: Student[]) => {
    // Batch append multiple updates
    students.forEach(student => {
      if (student.seatNumber !== null && student.seatNumber !== undefined) {
        pendingUpdatesRef.current.push({ 
          seatNumber: student.seatNumber, 
          student 
        });
      }
    });
    processBatchUpdates();
  }, [processBatchUpdates]);

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

  // Only allow the first syncWithStudents (from getClassStudents) to set the base
  const syncWithInitialStudents = useCallback((students: Student[]) => {
    if (!initializedRef.current) {
      seatUpdatesRef.current = new Map(
        students
          .filter(s => s.seatNumber !== null && s.seatNumber !== undefined)
          .map(s => [s.seatNumber as number, s])
      );
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
    syncWithInitialStudents, // only for first API result
  };
};