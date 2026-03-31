export type Role = "admin";

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

export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show";

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  location: string;
  specialty: MedicalSpecialty;
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
