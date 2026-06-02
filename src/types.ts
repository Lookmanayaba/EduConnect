export interface Student {
  id: string;
  name: string;
  classId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  birthDate: string;
  registrationNumber: string;
  historicalYears: string[];
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  email: string;
  classIds: string[]; // classes assigned
}

export interface ClassRoom {
  id: string;
  name: string;
  level: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  value: number; // out of 20
  coefficient: number;
  date: string;
  title: string;
  quarter: number; // 1, 2, 3
  teacherId: string;
  isValidated: boolean; // validated by admin
}

export interface Absence {
  id: string;
  studentId: string;
  date: string;
  type: 'absence' | 'delay';
  duration?: string; // e.g. "1h", "Matinée", "Journée entière"
  reason?: string;
  justified: boolean;
  justificationText?: string;
  quarter: number;
}

export interface Homework {
  id: string;
  classId: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  fileUrl?: string;
  fileName?: string;
  completedBy: string[]; // student IDs who submitted/completed
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  role: string;
}

export interface SchoolMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher' | 'student' | 'admin';
  receiverId: string;
  receiverName: string;
  receiverRole: 'parent' | 'teacher' | 'student' | 'admin';
  content: string;
  timestamp: string;
}

export interface SchoolPayment {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptNo?: string;
}

export interface AIAnalysisResult {
  studentId: string;
  summary: string;
  difficultyDetected: boolean;
  warnings: string[];
  suggestions: string[];
  teacherComment: string;
  timestamp: string;
  source?: string;
}

export interface ScheduleEvent {
  id: string;
  classId: string;
  subject: string;
  teacherName: string;
  room: string;
  dayOfWeek: number; // 1: Lundi, 2: Mardi, 3: Mercredi, 4: Jeudi, 5: Vendredi
  startTime: string; // e.g. "08:15"
  endTime: string; // e.g. "10:00"
  color?: string;
  notes?: string;
}

export interface SchoolNotification {
  id: string;
  title: string;
  content: string;
  type: 'grade' | 'homework' | 'announcement';
  date: string;
  isRead: boolean;
  targetRole?: 'parent' | 'student' | 'teacher' | 'admin' | 'all';
}

