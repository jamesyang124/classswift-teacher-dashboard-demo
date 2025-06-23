export interface Student {
  id: number;
  name: string;
  seatNumber?: number;
  score: number;
  isGuest: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentWithEnrollment extends Student {
  classId: string;
  enrolledAt: string;
}

export interface StudentsResponse {
  students: StudentWithEnrollment[];
  totalCapacity: number;
  enrolledCount: number;
  availableSlots: number;
}