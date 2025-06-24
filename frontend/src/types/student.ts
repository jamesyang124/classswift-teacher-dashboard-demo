export interface Student {
  id?: number; // Optional for guest users
  name: string;
  seatNumber: number;
  score: number;
  isGuest: boolean;
  isEmpty?: boolean; // For empty seats
  createdAt?: string;
  updatedAt?: string;
}