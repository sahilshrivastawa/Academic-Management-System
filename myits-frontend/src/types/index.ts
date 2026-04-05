// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
  role: 'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST';
  mobileNo: string;
  otp: string;
}

export interface RegisterRequest {
  password: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST';
  rollNo?: string;
  branch?: string;
  course?: string;
  designation?: string;
  houseCoordinator?: string;
  mobileNo?: string;
  year?: number;
  house?: string;
  department?: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface ResetPasswordRequest {
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'FACULTY' | 'GUEST';
  mobileNo: string;
  otp: string;
  newPassword: string;
}

export interface OtpSendRequest {
  email: string;
  mobileNo: string;
  purpose: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';
}

export interface OtpSendResponse {
  message: string;
  expiresInSeconds: number;
  otpForTesting: string;
}

// User
export interface User {
  id: number;
  email: string;
  role: string;
}

// Student
export interface Student {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  enrollmentNo: string;
  branch: string;
  academicYear: number;
  course: string;
  degree: string;
  program: string;
  mobileNo: string;
  house: string;
}

export interface StudentRequest {
  userId: number;
  enrollmentNo: string;
  branch: string;
  academicYear: number;
  course: string;
  mobileNo: string;
  house: string;
}

export interface StudentSelfProfileRequest {
  enrollmentNo: string;
  branch: string;
  academicYear: number;
  course: string;
  mobileNo: string;
  house: string;
}

export interface StudentBulkImportResult {
  totalRows: number;
  createdStudents: number;
  updatedStudents: number;
  skippedRows: number;
  messages: string[];
}

export interface StudentMessageRequest {
  receiverStudentId: number;
  subject: string;
  message: string;
}

export interface StudentMessage {
  id: number;
  senderStudentId: number;
  senderName: string;
  senderEmail: string;
  receiverStudentId: number;
  receiverName: string;
  receiverEmail: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface StudentAiDashboard {
  summary: string;
  enrolledCourses: number;
  attendancePercentage: number;
  pendingAssignments: number;
  messages: number;
  attendancePrediction: number;
  academicProgressAnalysis: string;
  recommendations: string[];
  chatbotPrompt: string;
}

export interface AttendancePredictionRequest {
  pastAttendanceList: number[];
}

export interface AttendancePrediction {
  predictedAttendance: number;
  riskLevel: string;
  aiWarning: string;
}

export interface StudentChatbotRequest {
  message: string;
}

export interface StudentChatbotResponse {
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface AcademicPerformanceCourseInput {
  courseName: string;
  score: number;
}

export interface AcademicPerformanceRequest {
  attendance: number;
  activity: number;
  courses: AcademicPerformanceCourseInput[];
}

export interface AcademicPerformanceResult {
  performanceLevel: string;
  weakSubject: string;
  recommendation: string;
}

// Admin
export interface Admin {
  id: number;
  name: string;
  email: string;
  department: string;
  userId: number;
}

export interface AdminRequest {
  name: string;
  email: string;
  department: string;
  userId: number;
}

export interface FacultyDirectory {
  id: number;
  userId: number;
  name: string;
  email: string;
  designation: string;
  department: string;
  houseCoordinator: string;
  mobileNo: string;
}

export interface FacultyBulkImportResult {
  totalRows: number;
  createdFaculty: number;
  updatedFaculty: number;
  skippedRows: number;
  messages: string[];
}

// Guest
export interface Guest {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  visitDate: string;
}

export interface GuestRequest {
  name: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  visitDate: string;
}

// Course
export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  credits: number;
  department: string;
  semester: number;
}

export interface CourseRequest {
  courseName: string;
  courseCode: string;
  credits: number;
  department: string;
  semester: number;
}

// Enrollment
export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  grade: string;
}

export interface EnrollmentRequest {
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  grade?: string;
}

export interface StudentCourseView {
  studentId: number;
  studentName: string;
  email: string;
  academicYear: number;
  department: string;
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  enrollmentDate: string;
  grade: string;
}
