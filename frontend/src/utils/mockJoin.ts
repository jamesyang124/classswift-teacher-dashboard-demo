import { apiService } from '../services/api';
import { config } from '../config/env';

// Mock API call function - consolidated here with all mock logic
const mockApiJoinRequest = async (classId: string, studentName: string, seatNumber: number): Promise<Response> => {
  const joinUrl = `${config.api.baseUrl}/classes/${classId}/join?seat=${seatNumber}`;
  
  const response = await fetch(joinUrl, {
    method: 'GET',
    headers: {
      'X-Student-Name': studentName,
    },
    redirect: 'manual', // Don't follow redirects automatically
  });
  
  return response;
};

export const mockStudentJoin = async (classId: string): Promise<void> => {
  if (!classId) return;

  try {
    // Get all students from class
    const studentsResponse = await apiService.getClassStudents(classId);
    const allStudents = studentsResponse.data?.students || [];

    if (allStudents.length === 0) {
      console.log('No students available for demo');
      return;
    }

    // Filter for enrolled but unseated students (seatNumber is null or undefined)
    const unseatedStudents = allStudents.filter(student => 
      !student.isGuest && (student.seatNumber === null || student.seatNumber === undefined)
    );

    if (unseatedStudents.length === 0) {
      console.log('No unseated enrolled students available for demo');
      return;
    }

    // Find all occupied seat numbers
    const occupiedSeats = new Set(
      allStudents
        .filter(student => student.seatNumber !== null && student.seatNumber !== undefined)
        .map(student => student.seatNumber)
    );

    // Find available seats (assuming 30 total seats)
    const totalSeats = 30;
    const availableSeats = [];
    for (let seatNum = 1; seatNum <= totalSeats; seatNum++) {
      if (!occupiedSeats.has(seatNum)) {
        availableSeats.push(seatNum);
      }
    }

    if (availableSeats.length === 0) {
      console.log('No available seats for demo');
      return;
    }

    // Randomly select an unseated student
    const randomStudent = unseatedStudents[Math.floor(Math.random() * unseatedStudents.length)];
    console.log(`Selected unseated student: ${randomStudent.name}`);

    // Randomly select an available seat
    const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
    console.log(`Assigning to available seat ${randomSeat}...`);

    // Attempt to join using consolidated mock API call
    const joinResponse = await mockApiJoinRequest(classId, randomStudent.name, randomSeat);
    
    if (joinResponse.status === 302 || joinResponse.status === 200 || joinResponse.status === 0) {
      console.log(joinResponse)
      console.log(`✅ ${randomStudent.name} joined seat ${randomSeat}!`);
    }

  } catch (error) {
    console.error('Mock join error:', error);
  }
};