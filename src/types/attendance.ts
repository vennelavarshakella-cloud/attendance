export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EXCUSED' | 'DENIED' | 'PROXY_WARNING';

export type ScanMethod = 'RFID_TAP' | 'NFC_MOBILE' | 'BARCODE_SCAN' | 'SMART_QR';

export interface Student {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  department: string;
  major: string;
  yearLevel: string;
  avatarUrl: string;
  rfidUid: string;
  barcode: string;
  smartQrData: string;
  parentName: string;
  parentPhone: string;
  emergencyContact: string;
  bloodGroup: string;
  validThru: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'MEDICAL_LEAVE';
  totalClasses: number;
  attendedClasses: number;
  lateArrivals: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  department: string;
  avatarUrl: string;
  rfidUid: string;
  timestamp: string;
  terminalId: string;
  terminalName: string;
  location: string;
  method: ScanMethod;
  status: AttendanceStatus;
  lateMinutes?: number;
  sessionCode?: string;
  sessionName?: string;
  room?: string;
  alertDispatched: boolean;
  notes?: string;
}

export interface LectureSession {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  timeSlot: string;
  expectedStudents: number;
  enrolledStudentIds: string[];
  terminalId: string;
}

export interface TerminalReader {
  id: string;
  name: string;
  location: string;
  roomCode: string;
  type: 'GATE_TURNSTILE' | 'DOOR_READER' | 'LECTURE_PODIUM' | 'MOBILE_SCANNER';
  frequency: string;
  ipAddress: string;
  firmware: string;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  activeSessionId?: string;
  totalScansToday: number;
}

export interface ParentNotification {
  id: string;
  timestamp: string;
  studentName: string;
  studentNumber: string;
  parentPhone: string;
  type: 'ENTRY_GATE' | 'CLASSROOM_ON_TIME' | 'LATE_ARRIVAL' | 'ABSENCE_ALERT' | 'UNAUTHORIZED_ACCESS';
  message: string;
  channel: 'SMS' | 'WHATSAPP';
  status: 'DELIVERED' | 'DISPATCHING';
}
