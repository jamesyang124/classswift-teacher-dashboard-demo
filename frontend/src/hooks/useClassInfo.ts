import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClassInfo, setCurrentClass, syncWithInitialStudents } from '../store/slices/classSlice';
import type { RootState, AppDispatch } from '../store';

/**
 * Custom hook to provide class info for a given classId.
 * Fetches from backend only if not already loaded or if classId changes.
 * Also handles setting the current class and initializing seat map.
 */
export function useClassInfo(classId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { classes, currentClassId, joinLinks, loading, error } = useSelector((state: RootState) => state.classes);

  const currentClass = currentClassId ? classes[currentClassId] : null;
  const classInfo = classes[classId];
  const joinLink = joinLinks[classId];

  useEffect(() => {
    if (classId) {
      // Set current class
      if (currentClassId !== classId) {
        dispatch(setCurrentClass(classId));
      }

      // Initialize with default seat map if not exists
      if (!classInfo) {
        dispatch(syncWithInitialStudents({ classId }));
      }

      // Fetch class data if not already loaded
      if (!classInfo || !classInfo.name) {
        dispatch(fetchClassInfo(classId));
      }
    }
  }, [classId, classInfo, currentClassId, dispatch]);

  return { 
    classInfo, 
    currentClass, 
    joinLink, 
    loading, 
    error,
    seatMap: classInfo?.seatMap || {},
    totalCapacity: classInfo?.totalCapacity || 30,
    availableSlots: classInfo?.availableSlots || 30
  };
}
