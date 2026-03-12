export type Role = "patient" | "doctor" | "admin" | "super_admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "rejected";

export type ResultStatus = "pending" | "ready";

export type MedicalSpecialty =
  | "General Practice"
  | "Gynecology"
  | "Physiotherapy"
  | "Pediatrics"
  | "Cardiology"
  | "Dermatology"
  | "Orthopedics"
  | "Psychiatry"
  | "Radiology"
  | "Surgery";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  location: string;
  state?: string;
  address?: string;
  avatar?: string;
  qualifications?: string;
  specialty?: MedicalSpecialty; // For doctors
  idNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "female" | "male" | "other";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContact?: string;
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  doctorName: string;
  doctorId?: string;
  specialty?: MedicalSpecialty;
  date: string;
  time: string;
  durationMinutes?: number;
  consultationType?: "in-person" | "telehealth";
  location: string;
  status: AppointmentStatus;
  reason: string;
  patientNotes?: string;
  notes?: string;
  prescriptions?: Array<{
    id: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
}

export interface ChatConversation {
  id: string;
  appointmentId: string;
  title: string;
  lastMessage: string;
  unreadCount: number;
  participants: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  body: string;
  sentAt: string;
  own?: boolean;
}

export interface MedicalResult {
  id: string;
  patientName?: string;
  testName: string;
  date: string;
  status: ResultStatus;
  summary: string;
  doctor: string;
  labName?: string;
  specimen?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  collectedAt?: string;
  reportedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  category: "appointments" | "results" | "system" | "admin_activity";
  roles: Role[];
}

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface DoctorAvailability {
  doctorId: string;
  doctorName: string;
  availableDays: DayOfWeek[];
  timeSlots: TimeSlot[];
  bookedSlots: Array<{
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
  }>;
}

export interface KeyService {
  id: string;
  title: string;
  description: string;
}

export interface Statistic {
  id: string;
  value: string;
  label: string;
  sublabel: string;
  icon: "clock" | "building" | "users" | "award" | "heart" | "star";
}

export type ServiceCategory =
  | "Emergency Services"
  | "Specialized Care"
  | "Dental Care"
  | "Primary Care"
  | "Surgical Services"
  | "Diagnostic Services"
  | "Women's Health"
  | "Pediatric Care"
  | "Mental Health"
  | "Rehabilitation";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  location: string;
  shortDescription: string;
  fullDescription: string;
  bannerImageUrl?: string;
  iconImageUrl?: string;
  keyServices: KeyService[];
  createdAt: string;
  updatedAt: string;
}
