import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClassInfoAndStudents } from '../store/slices/classSlice';
import type { RootState, AppDispatch } from '../store';

/**
 * Custom hook to provide class info and students for a given classId.
 * Fetches from backend only if not already loaded or if classId changes.
 */
export function useClassInfo(classId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const { classInfo, loading, error } = useSelector((state: RootState) => state.class);

  useEffect(() => {
    if (classId && (!classInfo || classInfo.publicId !== classId)) {
      dispatch(fetchClassInfoAndStudents(classId));
    }
  }, [classId, classInfo, dispatch]);

  return { classInfo, loading, error };
}
