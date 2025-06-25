import { config } from '../config/env';

// List of all possible student names for random generation
export const ALL_ENROLLED_STUDENT_NAMES = [
  'Philip','Darrell','Maria','Jessica','Ashley','Codyerzofazima','Zest','James','Sarah','Michael',
  'Emma','David','Lisa','Robert','Raven','Olivia','Ethan','Mason','Ava','Isabella','Lucas','Mia',
  'Logan','Noah','Liam','Jacob','Sophia','William','Alexander','Charlotte','Benjamin','Amelia',
  'Henry','Harper','Sebastian'
];

// List of 30 unique names NOT in ALL_ENROLLED_STUDENT_NAMES
export const NOT_ENROLLED_NAMES = [
  'Brandon','Tiffany','Derek','Monica','Trevor','Paige','Spencer','Jillian','Grant','Hailey',
  'Preston','Melanie','Tristan','Jocelyn','Dylan','Kendall','Shane','Autumn','Miles'
];

// Mock API call function - consolidated here with all mock logic
const mockApiJoinRequest = async (classId: string, studentName: string): Promise<Response> => {
  const joinUrl = `${config.api.baseUrl}/classes/${classId}/join`;
  
  const response = await fetch(joinUrl, {
    method: 'GET',
    headers: {
      'X-Student-Name': studentName,
    },
    redirect: 'manual', // Don't follow redirects automatically
  });
  
  return response;
};

// Global map to track used names per classId
const usedNamesMap: Record<string, Set<string>> = {};

function getRandomFromArray(arr: string[], exclude: Set<string>): string {
  const available = arr.filter(name => !exclude.has(name));
  if (available.length === 0) return "";
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

export const mockStudentJoin = async (classId: string): Promise<void> => {
  if (!classId) return;

  try {
    // Pick pool by probability
    const pickGuest = Math.random() < 0.4; // 2/5 probability for guest
    if (!usedNamesMap[classId]) {
      usedNamesMap[classId] = new Set();
    }
    const usedNames = usedNamesMap[classId];
    const availableEnrolled = ALL_ENROLLED_STUDENT_NAMES.filter(name => !usedNames.has(name));
    const availableGuests = NOT_ENROLLED_NAMES.filter(name => !usedNames.has(name));
    let name: string = "";

    // If both pools are empty, reset
    if (availableEnrolled.length === 0 && availableGuests.length === 0) {
      usedNamesMap[classId] = new Set();
      return;
    }

    // 60% chance from enrolled pool, 40% from guest
    if (!pickGuest && availableEnrolled.length > 0) {
      name = getRandomFromArray(ALL_ENROLLED_STUDENT_NAMES, usedNames);
    } else if (availableGuests.length > 0) {
      name = getRandomFromArray(NOT_ENROLLED_NAMES, usedNames);
    } else if (availableEnrolled.length > 0) {
      name = getRandomFromArray(ALL_ENROLLED_STUDENT_NAMES, usedNames);
    }

    usedNames.add(name);
    console.log(`Mock joining: ${name}`);
    const joinResponse = await mockApiJoinRequest(classId, name);
    if (joinResponse.status === 302 || joinResponse.status === 200 || joinResponse.status === 0) {
      console.log(`✅ ${name} attempt to join!`);
    } else {
      console.warn(`❌ Failed to join: ${name}`);
    }
  } catch (error) {
    console.error('Mock join error:', error);
  }
};

// Add specific student type joining functions
export const mockGuestJoin = async (classId: string): Promise<void> => {
  if (!classId) return;

  try {
    if (!usedNamesMap[classId]) {
      usedNamesMap[classId] = new Set();
    }
    const usedNames = usedNamesMap[classId];
    const availableGuests = NOT_ENROLLED_NAMES.filter(name => !usedNames.has(name));
    
    if (availableGuests.length === 0) {
      console.warn('No more guest names available');
      return;
    }

    const name = getRandomFromArray(NOT_ENROLLED_NAMES, usedNames);
    usedNames.add(name);
    console.log(`Mock guest joining: ${name}`);
    const joinResponse = await mockApiJoinRequest(classId, name);
    if (joinResponse.status === 302 || joinResponse.status === 200 || joinResponse.status === 0) {
      console.log(`✅ ${name} (guest) attempt to join!`);
    } else {
      console.warn(`❌ Failed to join: ${name} (guest)`);
    }
  } catch (error) {
    console.error('Mock guest join error:', error);
  }
};

export const mockEnrolledJoin = async (classId: string): Promise<void> => {
  if (!classId) return;

  try {
    if (!usedNamesMap[classId]) {
      usedNamesMap[classId] = new Set();
    }
    const usedNames = usedNamesMap[classId];
    const availableEnrolled = ALL_ENROLLED_STUDENT_NAMES.filter(name => !usedNames.has(name));
    
    if (availableEnrolled.length === 0) {
      console.warn('No more enrolled student names available');
      return;
    }

    const name = getRandomFromArray(ALL_ENROLLED_STUDENT_NAMES, usedNames);
    usedNames.add(name);
    console.log(`Mock enrolled student joining: ${name}`);
    const joinResponse = await mockApiJoinRequest(classId, name);
    if (joinResponse.status === 302 || joinResponse.status === 200 || joinResponse.status === 0) {
      console.log(`✅ ${name} (enrolled) attempt to join!`);
    } else {
      console.warn(`❌ Failed to join: ${name} (enrolled)`);
    }
  } catch (error) {
    console.error('Mock enrolled join error:', error);
  }
};

export const mockMultipleStudentJoin = async (classId: string, count: number): Promise<void> => {
  if (!classId || count <= 0) return;

  console.log(`Adding ${count} random students...`);
  for (let i = 0; i < count; i++) {
    await mockStudentJoin(classId);
    // Small delay between joins to avoid overwhelming the system
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  console.log(`Finished adding ${count} students`);
};  