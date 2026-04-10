export type Role = "admin" | "appointment_officer";

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

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DoctorAvailabilitySchedule {
  doctorId: string;
  days: DayOfWeek[];
  useUniformTime: boolean;
  uniformTime?: TimeSlot;
  customTimes?: Record<DayOfWeek, TimeSlot>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  location: string;
  state?: string;
  address?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "female" | "male" | "other";
}

// Doctor representation for admin management
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: MedicalSpecialty;
  location: string;
  state?: string;
  phone?: string;
  qualifications?: string;
  avatar?: string;
  isActive?: boolean;
  availabilitySchedule?: DoctorAvailabilitySchedule;
}

// Patient/User representation for admin management
export interface Patient {
  id: string;
  name: string;
  email: string;
  location: string;
  phone?: string;
  dateOfBirth?: string;
  isActive?: boolean;
}

export type AppointmentStatus =
  | "pending"
  | "scheduled"
  | "confirmed"
  | "rescheduled"
  | "rejected"
  | "completed"
  | "no-show";

export type VisitType = "Physical" | "Telemedicine";

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  location: string;
  specialty: MedicalSpecialty;
  visitType?: VisitType;
  reasonForVisit?: string;
  additionalComment?: string;
  isUrgent?: boolean;
  rescheduleReason?: string;
  lockedBy?: string; // Email or ID of officer currently working on this
  lockedAt?: string; // Timestamp when locked
}

export type ResultStatus = "pending" | "ready" | "rejected";

export type AuditAction = 
  | "accepted"
  | "rejected"
  | "rescheduled"
  | "completed";

export interface AuditLog {
  id: string;
  appointmentId: string;
  patientName: string;
  action: AuditAction;
  performedBy: string; // Officer email or name
  performedAt: string; // Timestamp
  details?: string; // Additional info like reschedule reason
}

export interface OfficerStatistics {
  officerEmail: string;
  officerName: string;
  totalProcessed: number;
  accepted: number;
  rejected: number;
  rescheduled: number;
  completed: number;
  lastActive?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  category: "system" | "admin_activity";
  roles: Role[];
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

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  bio?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  id: string;
  phone: string;
  emailPrimary: string;
  emailSecondary?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  officeHours: string;
  emergencyHours: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  patientCategory: "Staff" | "Retiree" | "Dependent";
  title: string;
  message: string;
  serviceType: "Physical Appointment" | "Telemedicine";
  createdAt: string;
  updatedAt: string;
}
