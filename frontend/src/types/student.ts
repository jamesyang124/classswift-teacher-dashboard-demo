export interface Student {
  id: number;
  name: string;
  classId: number;
  seatNumber?: number;
  createdAt: string;
  updatedAt: string;
  score: number;
  isGuest: boolean;
}

export interface StudentsResponse {
  students: Student[];
  totalCapacity: number;
  enrolledCount: number;
  availableSlots: number;
}