# NMSL Portal - Complete NestJS Backend Specification

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Endpoints](#api-endpoints)
7. [Business Logic & Rules](#business-logic--rules)
8. [Key Features](#key-features)
9. [Environment Configuration](#environment-configuration)
10. [Testing Requirements](#testing-requirements)
11. [Deployment Considerations](#deployment-considerations)

---

## Project Overview

**NMSL Portal** is a comprehensive healthcare management system for Nigerian Medical Services Limited (NMSL). The system manages:
- Patient appointments with exclusive locking mechanism for appointment officers
- Doctor management and availability scheduling
- User management (admins, appointment officers, patients)
- Medical services catalog
- Audit tracking and officer performance statistics
- Board members and trusted partners
- Contact information management
- Healthcare statistics

### Key Stakeholders
- **Admins**: Full system access, can override appointment locks, manage all resources
- **Appointment Officers**: Process appointments with exclusive locks, limited admin access
- **Patients/Users**: Book appointments, view services

---

## Technology Stack

### Required Technologies
```json
{
  "runtime": "Node.js 20+",
  "framework": "NestJS 10+",
  "database": "PostgreSQL 15+",
  "orm": "TypeORM or Prisma",
  "authentication": "JWT (JSON Web Tokens)",
  "validation": "class-validator, class-transformer",
  "documentation": "Swagger/OpenAPI",
  "logging": "Winston or Pino",
  "testing": "Jest",
  "cache": "Redis (for appointment locks and sessions)"
}
```

### Dependencies
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install bcrypt
npm install redis ioredis @nestjs/cache-manager cache-manager-ioredis
npm install date-fns
```

---

## Architecture

### Module Structure
```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── types/
│       └── index.ts
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── redis.config.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── sign-in.dto.ts
│   │       ├── sign-up.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       └── reset-password.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── doctors/
│   │   ├── doctors.module.ts
│   │   ├── doctors.controller.ts
│   │   ├── doctors.service.ts
│   │   ├── entities/
│   │   │   ├── doctor.entity.ts
│   │   │   └── doctor-availability.entity.ts
│   │   └── dto/
│   │       ├── create-doctor.dto.ts
│   │       └── update-availability.dto.ts
│   ├── appointments/
│   │   ├── appointments.module.ts
│   │   ├── appointments.controller.ts
│   │   ├── appointments.service.ts
│   │   ├── appointment-lock.service.ts (Redis-based locking)
│   │   ├── entities/
│   │   │   └── appointment.entity.ts
│   │   └── dto/
│   │       ├── create-appointment.dto.ts
│   │       ├── update-appointment-status.dto.ts
│   │       ├── reschedule-appointment.dto.ts
│   │       ├── lock-appointment.dto.ts
│   │       └── unlock-appointment.dto.ts
│   ├── audit/
│   │   ├── audit.module.ts
│   │   ├── audit.controller.ts
│   │   ├── audit.service.ts
│   │   ├── entities/
│   │   │   └── audit-log.entity.ts
│   │   └── dto/
│   │       └── get-audit-logs.dto.ts
│   ├── services/
│   │   ├── services.module.ts
│   │   ├── services.controller.ts
│   │   ├── services.service.ts
│   │   ├── entities/
│   │   │   ├── service.entity.ts
│   │   │   └── key-service.entity.ts
│   │   └── dto/
│   │       ├── create-service.dto.ts
│   │       └── update-service.dto.ts
│   ├── partners/
│   │   ├── partners.module.ts
│   │   ├── partners.controller.ts
│   │   ├── partners.service.ts
│   │   ├── entities/
│   │   │   └── partner.entity.ts
│   │   └── dto/
│   │       ├── create-partner.dto.ts
│   │       └── update-partner.dto.ts
│   ├── board-members/
│   │   ├── board-members.module.ts
│   │   ├── board-members.controller.ts
│   │   ├── board-members.service.ts
│   │   ├── entities/
│   │   │   └── board-member.entity.ts
│   │   └── dto/
│   │       ├── create-board-member.dto.ts
│   │       └── update-board-member.dto.ts
│   ├── contact/
│   │   ├── contact.module.ts
│   │   ├── contact.controller.ts
│   │   ├── contact.service.ts
│   │   ├── entities/
│   │   │   └── contact-info.entity.ts
│   │   └── dto/
│   │       └── update-contact.dto.ts
│   └── statistics/
│       ├── statistics.module.ts
│       ├── statistics.controller.ts
│       ├── statistics.service.ts
│       ├── entities/
│       │   └── statistic.entity.ts
│       └── dto/
│           └── update-statistics.dto.ts
└── database/
    ├── migrations/
    └── seeds/
```

---

## Database Schema

### TypeORM Entities

#### 1. User Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed with bcrypt

  @Column({ type: 'enum', enum: ['admin', 'appointment_officer'] })
  role: 'admin' | 'appointment_officer';

  @Column()
  location: string; // One of: Abuja, Lagos, Benin, Kaduna, Port Harcourt, Warri

  @Column({ nullable: true })
  state: string; // Nigerian state

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['female', 'male', 'other'], nullable: true })
  gender: 'female' | 'male' | 'other';

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 2. Doctor Entity
```typescript
@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed with bcrypt

  @Column({ type: 'enum', enum: [
    'General Practice',
    'Gynecology',
    'Physiotherapy',
    'Pediatrics',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Psychiatry',
    'Radiology',
    'Surgery'
  ]})
  specialty: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  qualifications: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => DoctorAvailability, availability => availability.doctor, { cascade: true })
  availabilitySchedule: DoctorAvailability;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 3. Doctor Availability Entity
```typescript
@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Doctor, doctor => doctor.availabilitySchedule)
  @JoinColumn()
  doctor: Doctor;

  @Column('simple-array') // Store as comma-separated: monday,tuesday,wednesday
  days: string[];

  @Column()
  useUniformTime: boolean;

  @Column({ type: 'time', nullable: true })
  uniformTimeStart: string; // Format: HH:mm

  @Column({ type: 'time', nullable: true })
  uniformTimeEnd: string; // Format: HH:mm

  @Column({ type: 'jsonb', nullable: true })
  customTimes: Record<string, { start: string; end: string }>; // { monday: { start: '09:00', end: '17:00' } }

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 4. Appointment Entity
```typescript
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  patientEmail: string;

  @Column({ nullable: true })
  patientPhone: string;

  @Column()
  doctorName: string;

  @ManyToOne(() => Doctor, { nullable: true })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column({ type: 'enum', enum: [
    'pending',
    'scheduled',
    'confirmed',
    'rescheduled',
    'rejected',
    'completed',
    'no-show'
  ]})
  status: string;

  @Column()
  location: string;

  @Column()
  specialty: string;

  @Column({ type: 'enum', enum: ['Physical', 'Telemedicine'], nullable: true })
  visitType: string;

  @Column({ type: 'text', nullable: true })
  reasonForVisit: string;

  @Column({ type: 'text', nullable: true })
  additionalComment: string;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ type: 'text', nullable: true })
  rescheduleReason: string;

  // LOCKING FIELDS - CRITICAL FOR APPOINTMENT OFFICER WORKFLOW
  @Column({ nullable: true })
  lockedBy: string; // Email of the officer who locked it

  @Column({ type: 'timestamp', nullable: true })
  lockedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 5. Audit Log Entity
```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentId: string;

  @Column()
  patientName: string;

  @Column({ type: 'enum', enum: ['accepted', 'rejected', 'rescheduled', 'completed'] })
  action: string;

  @Column()
  performedBy: string; // Email of the officer

  @Column()
  performedByName: string; // Name of the officer

  @Column({ type: 'timestamp' })
  performedAt: Date;

  @Column({ type: 'text', nullable: true })
  details: string; // Additional info like reschedule reason

  @CreateDateColumn()
  createdAt: Date;
}
```

#### 6. Service Entity
```typescript
@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: [
    'Emergency Services',
    'Specialized Care',
    'Dental Care',
    'Primary Care',
    'Surgical Services',
    'Diagnostic Services',
    "Women's Health",
    'Pediatric Care',
    'Mental Health',
    'Rehabilitation'
  ]})
  category: string;

  @Column()
  location: string;

  @Column()
  shortDescription: string;

  @Column({ type: 'text' })
  fullDescription: string;

  @Column({ nullable: true })
  bannerImageUrl: string;

  @Column({ nullable: true })
  iconImageUrl: string;

  @OneToMany(() => KeyService, keyService => keyService.service, { cascade: true })
  keyServices: KeyService[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 7. Key Service Entity
```typescript
@Entity('key_services')
export class KeyService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Service, service => service.keyServices, { onDelete: 'CASCADE' })
  service: Service;
}
```

#### 8. Partner Entity
```typescript
@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 9. Board Member Entity
```typescript
@Entity('board_members')
export class BoardMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column()
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 10. Contact Info Entity
```typescript
@Entity('contact_info')
export class ContactInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phone: string;

  @Column()
  emailPrimary: string;

  @Column({ nullable: true })
  emailSecondary: string;

  @Column()
  addressLine1: string;

  @Column()
  addressLine2: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  officeHours: string;

  @Column()
  emergencyHours: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 11. Statistic Entity
```typescript
@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  value: string;

  @Column()
  label: string;

  @Column()
  sublabel: string;

  @Column({ type: 'enum', enum: ['clock', 'building', 'users', 'award', 'heart', 'star'] })
  icon: string;

  @Column()
  order: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Database Indexes
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location);

-- Doctor indexes
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_location ON doctors(location);

-- Appointment indexes
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_location ON appointments(location);
CREATE INDEX idx_appointments_locked_by ON appointments(locked_by);
CREATE INDEX idx_appointments_locked_at ON appointments(locked_at);

-- Audit log indexes
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_performed_at ON audit_logs(performed_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

## Authentication & Authorization

### JWT Authentication

#### JWT Payload Structure
```typescript
interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: 'admin' | 'appointment_officer';
  location: string;
  iat: number;
  exp: number;
}
```

#### Token Configuration
- **Access Token Expiry**: 24 hours
- **Reset Token Expiry**: 1 hour
- **Secret**: Environment variable `JWT_SECRET`

### Authorization Rules

#### Role-Based Access Control (RBAC)

**Admin Role** (`admin`):
- Full access to all endpoints
- Can create/manage other admins (super admin capability)
- Can override appointment locks
- Can manage doctors, services, partners, board members
- Can view/manage all appointments
- Can access audit logs and statistics

**Appointment Officer Role** (`appointment_officer`):
- Can view appointments
- Can lock/unlock appointments (with restrictions)
- Cannot lock appointments held by other officers (unless admin overrides)
- Cannot access admin management endpoints
- Cannot manage doctors, services, partners, board members
- Can view audit logs (filtered to their own actions)

### Guards Implementation

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Usage in controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post('admin/doctors')
createDoctor() { ... }
```

---

## API Endpoints

### Base URL
```
http://localhost:4000/api
```

### 1. Authentication Endpoints

#### POST `/auth/sign-in`
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "admin@nmsl.app",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Emeka Nwosu",
    "email": "admin@nmsl.app",
    "role": "admin",
    "location": "Abuja",
    "state": "FCT",
    "address": "NMSL Headquarters, Central Business District, Abuja",
    "phone": "+234 801 234 5678",
    "dateOfBirth": "1975-06-15",
    "gender": "male"
  }
}
```

**Errors**:
- 401: Invalid credentials
- 400: Validation error

---

#### POST `/auth/sign-up`
**Description**: Register new user (patient)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "location": "Lagos",
  "state": "Lagos",
  "address": "45 Marina Street"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful"
}
```

---

#### POST `/auth/forgot-password`
**Description**: Request password reset token

**Request Body**:
```json
{
  "email": "admin@nmsl.app"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

**Business Logic**:
- Generate unique reset token
- Set expiry to 1 hour
- Send email with reset link (implement email service)
- Store token in user record

---

#### POST `/auth/reset-password`
**Description**: Reset password using token

**Request Body**:
```json
{
  "token": "reset-token-uuid",
  "password": "newSecurePassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Errors**:
- 400: Invalid or expired token

---

### 2. User Management Endpoints

#### GET `/users`
**Auth**: Required (JWT)
**Roles**: Admin

**Query Parameters**:
- `role` (optional): Filter by role
- `location` (optional): Filter by location

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "Emeka Nwosu",
    "email": "admin@nmsl.app",
    "role": "admin",
    "location": "Abuja",
    "state": "FCT",
    "phone": "+234 801 234 5678",
    "isActive": true
  }
]
```

---

#### GET `/users/:id`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer (own profile only)

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Emeka Nwosu",
  "email": "admin@nmsl.app",
  "role": "admin",
  "location": "Abuja",
  "state": "FCT",
  "address": "NMSL Headquarters",
  "phone": "+234 801 234 5678",
  "dateOfBirth": "1975-06-15",
  "gender": "male"
}
```

---

#### PATCH `/users/:id/toggle-status`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true,
  "isActive": false,
  "message": "User deactivated successfully"
}
```

---

#### PATCH `/users/:id/reset-password`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true,
  "message": "Password reset link sent to user@email.com"
}
```

---

#### PATCH `/users/:id/email`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "email": "newemail@nmsl.app"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Email updated successfully"
}
```

---

### 3. Admin Management Endpoints

#### GET `/admin/admins`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "admins": [
    {
      "id": "uuid",
      "name": "Emeka Nwosu",
      "email": "admin@nmsl.app",
      "role": "admin",
      "location": "Abuja",
      "state": "FCT",
      "phone": "+234 801 234 5678",
      "isActive": true
    }
  ],
  "total": 3
}
```

---

#### POST `/admin/admins`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "name": "New Admin",
  "email": "newadmin@nmsl.app",
  "password": "securePassword123",
  "phone": "+234 801 234 5678",
  "location": "Lagos",
  "state": "Lagos",
  "address": "Admin Office Address"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "New Admin",
  "email": "newadmin@nmsl.app",
  "role": "admin",
  "location": "Lagos",
  "state": "Lagos",
  "phone": "+234 801 234 5678"
}
```

---

#### PATCH `/admin/admins/:id/toggle-status`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true,
  "isActive": true,
  "message": "Admin activated successfully"
}
```

---

#### PATCH `/admin/admins/:id/password`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "newPassword": "newSecurePassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### DELETE `/admin/admins/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true,
  "message": "Admin removed successfully"
}
```

**Business Logic**: Prevent self-deletion

---

### 4. Doctor Management Endpoints

#### GET `/admin/doctors`
**Auth**: Required (JWT)
**Roles**: Admin

**Query Parameters**:
- `location` (optional): Filter by location
- `specialty` (optional): Filter by specialty

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "Dr. Ken Wu",
    "email": "ken.wu@nmsl.app",
    "specialty": "General Practice",
    "qualifications": "MBBS, FMCGP",
    "location": "Lagos",
    "state": "Lagos",
    "phone": "+234 805 111 2233",
    "isActive": true,
    "availabilitySchedule": {
      "doctorId": "uuid",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "useUniformTime": true,
      "uniformTime": { "start": "09:00", "end": "17:00" }
    }
  }
]
```

---

#### POST `/admin/doctors`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "name": "Dr. New Doctor",
  "email": "doctor@nmsl.app",
  "password": "securePassword123",
  "location": "Abuja",
  "state": "FCT",
  "address": "Doctor's Address",
  "phone": "+234 801 234 5678",
  "qualifications": "MBBS, FWACP",
  "specialty": "Cardiology"
}
```

**Response** (201):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Dr. New Doctor",
    "email": "doctor@nmsl.app",
    "specialty": "Cardiology",
    "location": "Abuja",
    "isActive": true
  }
}
```

---

#### PATCH `/admin/doctors/:doctorId/availability`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body (Uniform Time)**:
```json
{
  "doctorId": "uuid",
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "useUniformTime": true,
  "uniformTime": {
    "start": "09:00",
    "end": "17:00"
  }
}
```

**Request Body (Custom Times)**:
```json
{
  "doctorId": "uuid",
  "days": ["monday", "wednesday", "friday"],
  "useUniformTime": false,
  "customTimes": {
    "monday": { "start": "08:00", "end": "14:00" },
    "wednesday": { "start": "09:00", "end": "15:00" },
    "friday": { "start": "10:00", "end": "16:00" }
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "doctor": {
    "id": "uuid",
    "name": "Dr. Ken Wu",
    "availabilitySchedule": { ... }
  }
}
```

---

### 5. Appointment Management Endpoints

#### GET `/admin/appointments`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer

**Response** (200):
```json
[
  {
    "id": "uuid",
    "patientName": "John Doe",
    "patientEmail": "john@email.com",
    "patientPhone": "+234 801 111 2233",
    "doctorName": "Dr. Sarah Chen",
    "date": "2026-03-30",
    "time": "09:00",
    "status": "pending",
    "location": "Abuja",
    "specialty": "General Practice",
    "visitType": "Physical",
    "reasonForVisit": "Recurring headache",
    "additionalComment": "Morning preferred",
    "isUrgent": false,
    "lockedBy": null,
    "lockedAt": null
  }
]
```

---

#### PATCH `/admin/appointments/:id/status`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "status": "confirmed",
  "patientName": "John Doe",
  ...
}
```

**Business Logic**:
- Create audit log entry when status changes to confirmed/rejected
- Auto-unlock appointment after status change

---

#### PATCH `/admin/appointments/:id/reschedule`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer

**Request Body**:
```json
{
  "date": "2026-04-15",
  "time": "14:00",
  "doctorId": "doctor-uuid",
  "rescheduleReason": "Doctor unavailable"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "status": "rescheduled",
  "date": "2026-04-15",
  "time": "14:00",
  "rescheduleReason": "Doctor unavailable",
  ...
}
```

**Business Logic**:
- Update appointment with new date/time/doctor
- Set status to "rescheduled"
- Create audit log entry
- Auto-unlock appointment

---

#### PATCH `/admin/appointments/:id/assign-doctor`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "doctorId": "doctor-uuid",
  "timeSlot": "10:30"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "status": "confirmed",
  "time": "10:30",
  "doctorName": "Dr. Updated Doctor",
  ...
}
```

---

### 6. Appointment Locking Endpoints (CRITICAL FEATURE)

#### POST `/admin/appointments/:id/lock`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer

**Request Body**:
```json
{
  "officerEmail": "officer@nmsl.app",
  "isAdmin": false
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "lockedBy": "officer@nmsl.app",
  "lockedAt": "2026-04-08T10:30:00Z",
  ...
}
```

**Business Logic**:
1. Check if appointment is already locked
2. If locked, check if lock is stale (>30 minutes old)
   - If stale, auto-clear the lock
3. If locked by another officer AND requester is not admin:
   - Return 409 Conflict error with message: "Appointment is already being processed by {officer email}"
4. If requester is admin (isAdmin: true):
   - Allow override of any lock
   - Log the admin override action
5. Set lockedBy and lockedAt fields
6. Return updated appointment

**Errors**:
- 409: Lock conflict (already locked by another officer)
- 404: Appointment not found

**Redis Implementation**:
```typescript
// Store lock in Redis with 30-minute TTL
const lockKey = `appointment:lock:${appointmentId}`;
await redis.setex(lockKey, 1800, officerEmail); // 1800 seconds = 30 minutes
```

---

#### POST `/admin/appointments/:id/unlock`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer

**Request Body**:
```json
{
  "officerEmail": "officer@nmsl.app"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "lockedBy": null,
  "lockedAt": null,
  ...
}
```

**Business Logic**:
1. Verify officer is unlocking their own appointment (or is admin)
2. Clear lockedBy and lockedAt fields
3. Delete Redis lock key

---

### 7. Audit & Statistics Endpoints

#### GET `/admin/audit/logs`
**Auth**: Required (JWT)
**Roles**: Admin, Appointment Officer

**Query Parameters**:
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `officer` (optional): Filter by officer email

**Response** (200):
```json
{
  "logs": [
    {
      "id": "uuid",
      "appointmentId": "apt-uuid",
      "patientName": "John Doe",
      "action": "accepted",
      "performedBy": "officer@nmsl.app",
      "performedByName": "Sarah Johnson",
      "performedAt": "2026-04-08T10:30:00Z",
      "details": null
    },
    {
      "id": "uuid",
      "appointmentId": "apt-uuid-2",
      "patientName": "Jane Smith",
      "action": "rescheduled",
      "performedBy": "officer@nmsl.app",
      "performedByName": "Sarah Johnson",
      "performedAt": "2026-04-08T11:15:00Z",
      "details": "Doctor was moved to emergency case"
    }
  ],
  "total": 45
}
```

**Authorization**:
- Admins: See all logs
- Appointment Officers: See only their own logs (filter by their email automatically)

---

#### GET `/admin/audit/statistics`
**Auth**: Required (JWT)
**Roles**: Admin

**Query Parameters**:
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response** (200):
```json
{
  "statistics": [
    {
      "officerEmail": "officer1@nmsl.app",
      "officerName": "Sarah Johnson",
      "totalProcessed": 25,
      "accepted": 15,
      "rejected": 4,
      "rescheduled": 4,
      "completed": 2,
      "lastActive": "2026-04-08T14:30:00Z"
    },
    {
      "officerEmail": "officer2@nmsl.app",
      "officerName": "Michael Chen",
      "totalProcessed": 30,
      "accepted": 18,
      "rejected": 5,
      "rescheduled": 5,
      "completed": 2,
      "lastActive": "2026-04-08T13:45:00Z"
    }
  ],
  "total": 3
}
```

**Calculation Logic**:
- Query audit_logs table
- Group by performedBy (officer email)
- Count actions by type
- Get MAX(performedAt) as lastActive

---

#### GET `/admin/kpis`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "totalUsers": 2480,
  "appointmentsToday": 132,
  "utilization": "86%",
  "pendingApprovals": 19
}
```

**Calculation**:
- `totalUsers`: COUNT(users) where isActive = true
- `appointmentsToday`: COUNT(appointments) where date = TODAY()
- `utilization`: (confirmed appointments / total appointments today) * 100
- `pendingApprovals`: COUNT(appointments) where status = 'pending'

---

### 8. Service Management Endpoints

#### GET `/admin/services`
**Auth**: Optional (public endpoint)

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "Accident & Emergency",
    "category": "Emergency Services",
    "location": "Abuja",
    "shortDescription": "24/7 emergency care",
    "fullDescription": "Our Accident & Emergency department...",
    "bannerImageUrl": "/images/services/ae-banner.jpg",
    "iconImageUrl": "/images/services/ae-icon.svg",
    "keyServices": [
      {
        "id": "ks-uuid-1",
        "title": "24/7 Emergency Response",
        "description": "Immediate care for urgent cases"
      },
      {
        "id": "ks-uuid-2",
        "title": "Trauma Unit",
        "description": "Advanced trauma care facilities"
      }
    ],
    "createdAt": "2026-01-15T00:00:00Z",
    "updatedAt": "2026-02-10T00:00:00Z"
  }
]
```

---

#### POST `/admin/services`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "name": "New Service",
  "category": "Primary Care",
  "location": "Lagos",
  "shortDescription": "Brief description",
  "fullDescription": "Detailed description of the service...",
  "bannerImageUrl": "/images/banner.jpg",
  "iconImageUrl": "/images/icon.svg",
  "keyServices": [
    {
      "title": "Key Service 1",
      "description": "Description of service 1"
    },
    {
      "title": "Key Service 2",
      "description": "Description of service 2"
    }
  ]
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "New Service",
  "category": "Primary Care",
  ...
}
```

---

#### PATCH `/admin/services/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**: (Partial update)
```json
{
  "shortDescription": "Updated short description",
  "fullDescription": "Updated full description"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Service Name",
  "shortDescription": "Updated short description",
  ...
}
```

---

#### DELETE `/admin/services/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true
}
```

**Business Logic**: Cascade delete key services

---

### 9. Partner Management Endpoints

#### GET `/partners`
**Auth**: Optional (public endpoint)

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "African Medical Centre of Excellence Abuja",
    "logoUrl": "/partners/amce.png",
    "description": "Leading medical excellence center",
    "order": 1,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
]
```

**Business Logic**: Return only active partners, sorted by order ASC

---

#### GET `/admin/partners`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200): Returns all partners (including inactive), sorted by order

---

#### POST `/admin/partners`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "name": "New Partner",
  "logoUrl": "/partners/new-partner.png",
  "description": "Partner description",
  "order": 12,
  "isActive": true
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "New Partner",
  ...
}
```

---

#### PATCH `/admin/partners/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**: (Partial update)
```json
{
  "name": "Updated Partner Name",
  "order": 5
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Updated Partner Name",
  ...
}
```

---

#### PATCH `/admin/partners/:id/toggle`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "id": "uuid",
  "isActive": false,
  ...
}
```

---

#### DELETE `/admin/partners/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true
}
```

---

### 10. Board Member Management Endpoints

#### GET `/board-members`
**Auth**: Optional (public endpoint)

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "Mr. Adedapo A. Segun",
    "title": "Chairman",
    "photoUrl": "/board/adedapo-segun.jpg",
    "bio": "Leadership committed to excellence",
    "order": 1,
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
]
```

**Business Logic**: Return only active members, sorted by order ASC

---

#### GET `/admin/board-members`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200): Returns all board members (including inactive), sorted by order

---

#### POST `/admin/board-members`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**:
```json
{
  "name": "New Board Member",
  "title": "Executive Director",
  "photoUrl": "/board/new-member.jpg",
  "bio": "Biography of the board member",
  "order": 8,
  "isActive": true
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "New Board Member",
  ...
}
```

---

#### PATCH `/admin/board-members/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**: (Partial update)
```json
{
  "title": "Updated Title",
  "bio": "Updated biography"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Board Member Name",
  ...
}
```

---

#### PATCH `/admin/board-members/:id/toggle`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "id": "uuid",
  "isActive": false,
  ...
}
```

---

#### DELETE `/admin/board-members/:id`
**Auth**: Required (JWT)
**Roles**: Admin

**Response** (200):
```json
{
  "success": true
}
```

---

### 11. Contact Information Endpoints

#### GET `/contact`
**Auth**: Optional (public endpoint)

**Response** (200):
```json
{
  "id": "uuid",
  "phone": "+234 903 193 0032",
  "emailPrimary": "nmshutako@nnpcgroup.com",
  "emailSecondary": "nmshutako@gmail.com",
  "addressLine1": "PLOT 201 NGOZI OKONJO-IWEALA WAY",
  "addressLine2": "UTAKO, ABUJA, NIGERIA",
  "city": "Abuja",
  "country": "Nigeria",
  "officeHours": "Monday - Sunday: 24 Hours",
  "emergencyHours": "Available 24/7",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

#### PATCH `/admin/contact`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**: (Partial update)
```json
{
  "phone": "+234 900 000 0000",
  "emailPrimary": "newemail@nmsl.com"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "phone": "+234 900 000 0000",
  ...
}
```

**Business Logic**: Only one contact info record exists (singleton pattern)

---

### 12. Statistics Management Endpoints

#### GET `/admin/statistics`
**Auth**: Optional (public endpoint)

**Response** (200):
```json
[
  {
    "id": "uuid",
    "value": "15+",
    "label": "Years",
    "sublabel": "Healthcare Excellence",
    "icon": "award",
    "order": 1
  },
  {
    "id": "uuid",
    "value": "250K+",
    "label": "Patients",
    "sublabel": "Treated Annually",
    "icon": "users",
    "order": 2
  }
]
```

---

#### PUT `/admin/statistics`
**Auth**: Required (JWT)
**Roles**: Admin

**Request Body**: (Replace all statistics)
```json
[
  {
    "id": "uuid-1",
    "value": "20+",
    "label": "Years",
    "sublabel": "Healthcare Excellence",
    "icon": "award",
    "order": 1
  },
  {
    "id": "uuid-2",
    "value": "300K+",
    "label": "Patients",
    "sublabel": "Treated Annually",
    "icon": "users",
    "order": 2
  }
]
```

**Response** (200):
```json
[
  {
    "id": "uuid-1",
    "value": "20+",
    ...
  }
]
```

**Business Logic**: Update existing statistics by ID, create new ones if ID not found

---

## Business Logic & Rules

### 1. Appointment Locking System (CRITICAL)

**Purpose**: Prevent multiple appointment officers from working on the same appointment simultaneously.

**Rules**:
1. **Lock Acquisition**:
   - Officer clicks to lock appointment
   - System checks if appointment is already locked
   - If locked by another officer AND requester is not admin → reject with error
   - If locked by admin OR requester is admin → allow override
   - If unlocked OR lock is stale (>30 minutes) → grant lock

2. **Stale Lock Detection**:
   - Lock expires after 30 minutes automatically
   - Background job checks locks every 60 seconds
   - If `lockedAt` timestamp is >30 minutes old → auto-clear lock

3. **Admin Override**:
   - Admins can take over any locked appointment
   - System logs admin override actions
   - Original officer's lock is replaced

4. **Auto-Unlock Triggers**:
   - Appointment status changed to: confirmed, rejected, rescheduled, completed, no-show
   - Officer explicitly unlocks
   - 30-minute timeout expires
   - Officer session ends (optional - implement via WebSocket disconnection)

5. **Real-Time Sync**:
   - Frontend polls every 15 seconds for appointment updates
   - Returns current lock status with each request
   - Lock conflicts displayed immediately on frontend

**Implementation with Redis**:
```typescript
// Lock Service
@Injectable()
export class AppointmentLockService {
  constructor(@Inject('REDIS') private redis: Redis) {}

  async acquireLock(appointmentId: string, officerEmail: string, isAdmin: boolean): Promise<boolean> {
    const lockKey = `appointment:lock:${appointmentId}`;
    const existingLock = await this.redis.get(lockKey);
    
    // Check if already locked by someone else
    if (existingLock && existingLock !== officerEmail && !isAdmin) {
      throw new ConflictException(`Appointment is already being processed by ${existingLock}`);
    }
    
    // Admin override logging
    if (isAdmin && existingLock && existingLock !== officerEmail) {
      console.log(`Admin override: ${officerEmail} taking over from ${existingLock}`);
    }
    
    // Set lock with 30-minute expiry
    await this.redis.setex(lockKey, 1800, officerEmail);
    return true;
  }

  async releaseLock(appointmentId: string): Promise<void> {
    const lockKey = `appointment:lock:${appointmentId}`;
    await this.redis.del(lockKey);
  }

  async isLocked(appointmentId: string): Promise<string | null> {
    const lockKey = `appointment:lock:${appointmentId}`;
    return await this.redis.get(lockKey);
  }
}
```

---

### 2. Audit Log Creation

**Trigger Events**:
- Appointment status changed to: confirmed (action: "accepted")
- Appointment status changed to: rejected (action: "rejected")
- Appointment rescheduled (action: "rescheduled")
- Appointment marked as completed (action: "completed")

**Audit Log Fields**:
```typescript
{
  appointmentId: string;
  patientName: string;
  action: 'accepted' | 'rejected' | 'rescheduled' | 'completed';
  performedBy: string; // Officer email
  performedByName: string; // Officer name (join with users table)
  performedAt: Date; // Current timestamp
  details?: string; // Reschedule reason or rejection reason
}
```

**Implementation**:
```typescript
async createAuditLog(appointmentId: string, action: AuditAction, userId: string, details?: string) {
  const user = await this.usersService.findById(userId);
  const appointment = await this.appointmentsService.findById(appointmentId);
  
  const auditLog = this.auditRepository.create({
    appointmentId,
    patientName: appointment.patientName,
    action,
    performedBy: user.email,
    performedByName: user.name,
    performedAt: new Date(),
    details
  });
  
  await this.auditRepository.save(auditLog);
}
```

---

### 3. Officer Statistics Calculation

**Query Logic**:
```sql
SELECT 
  performed_by as "officerEmail",
  performed_by_name as "officerName",
  COUNT(*) as "totalProcessed",
  SUM(CASE WHEN action = 'accepted' THEN 1 ELSE 0 END) as "accepted",
  SUM(CASE WHEN action = 'rejected' THEN 1 ELSE 0 END) as "rejected",
  SUM(CASE WHEN action = 'rescheduled' THEN 1 ELSE 0 END) as "rescheduled",
  SUM(CASE WHEN action = 'completed' THEN 1 ELSE 0 END) as "completed",
  MAX(performed_at) as "lastActive"
FROM audit_logs
WHERE performed_at BETWEEN $1 AND $2
GROUP BY performed_by, performed_by_name
ORDER BY total_processed DESC
```

---

### 4. Doctor Booking Availability Logic

**Purpose**: Manage doctor availability for patient appointments through a simple toggle system.

**Availability Status Determination**:
- **Available**: Doctor has at least one day in their schedule (`days.length > 0`)
- **Unavailable**: Doctor has no days in their schedule (`days.length === 0` or `days: []`)

**Business Rules**:
1. **Availability Toggle**:
   - When marking doctor as UNAVAILABLE → Set `days` to empty array `[]`
   - When marking doctor as AVAILABLE → Must select at least one day and set working hours
   - The `days` array is the single source of truth for availability status

2. **Default State**:
   - New doctors have no availability schedule (unavailable by default)
   - Admins or doctors must explicitly set availability schedule

3. **Frontend Display Logic**:
   ```typescript
   // Determine if doctor is available for bookings
   const isAvailable = doctor.availabilitySchedule?.days?.length > 0;
   
   // Display badge
   <Badge variant={isAvailable ? "success" : "warning"}>
     {isAvailable ? "Available" : "Unavailable"}
   </Badge>
   ```

4. **Update Behavior**:
   - Updating availability immediately affects appointment booking eligibility
   - Frontend should invalidate doctor cache after availability update
   - Backend returns the updated doctor object with new availability schedule

**API Contract**:
```typescript
// To mark doctor as UNAVAILABLE (no bookings)
PATCH /admin/doctors/:doctorId/availability
{
  "doctorId": "uuid",
  "days": [],  // Empty array = unavailable
  "useUniformTime": true,
  "uniformTime": null
}

// To mark doctor as AVAILABLE with schedule
PATCH /admin/doctors/:doctorId/availability
{
  "doctorId": "uuid",
  "days": ["monday", "tuesday", "wednesday"],  // Non-empty = available
  "useUniformTime": true,
  "uniformTime": {
    "start": "09:00",
    "end": "17:00"
  }
}
```

**Validation Requirements**:
- If `days` array is not empty, time configuration is required:
  - Either `uniformTime` must be provided (when `useUniformTime: true`)
  - Or `customTimes` must be provided for each day (when `useUniformTime: false`)
- `days` array can only contain valid day names: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
- Time format must be HH:mm (24-hour format)
- End time must be after start time

**Database Implications**:
- Empty `days` array is stored as empty string in PostgreSQL (when using `simple-array` column type)
- `uniformTimeStart` and `uniformTimeEnd` can be NULL when doctor is unavailable
- `customTimes` JSONB column can be NULL when doctor is unavailable

---

### 5. Password Security

**Hashing**:
- Use bcrypt with salt rounds = 10
- Hash password before storing in database
- Never return password in API responses

**Implementation**:
```typescript
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

---

### 6. Email Notifications (Future Implementation)

**Events Requiring Emails**:
- Password reset requested
- Appointment confirmed
- Appointment rejected
- Appointment rescheduled
- New admin created

**Email Service Integration**:
- Use SendGrid, AWS SES, or NodeMailer
- Create email templates for each event
- Implement queue system (Bull/BullMQ) for async email sending

---

### 7. File Upload Handling

**Image Uploads** (for avatars, logos, photos):
- Use multer middleware
- Store in cloud storage (AWS S3, Cloudinary, or Azure Blob)
- Return public URL
- Validate file types (jpg, jpeg, png, webp)
- Limit file size (max 5MB)

**Implementation**:
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // Upload to S3 or Cloudinary
  const url = await this.storageService.upload(file);
  return { url };
}
```

---

### 8. Validation Rules

**Email Validation**:
- Must be valid email format
- Must be unique in users/doctors tables

**Password Validation**:
- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one number

**Phone Validation**:
- Nigerian phone format: +234 XXX XXX XXXX

**Date Validation**:
- Appointment dates must be in the future
- Date format: YYYY-MM-DD

**Time Validation**:
- Time format: HH:mm (24-hour format)

---

## Key Features

### 1. Real-Time Appointment Locking
- **Redis-based distributed locking** with 30-minute TTL
- **Admin override capability** - Admins can take over any locked appointment
- **Conflict detection and prevention** - Lock validation on both frontend and backend
- **Frontend polling** every 15 seconds for real-time sync
- **Visual countdown timer** - Shows MM:SS format (30:00 → 00:00)
  - Display format: `29:45` (29 minutes 45 seconds remaining)
  - Updates every second on frontend
  - Changes to red with pulsing icon when <5 minutes remain
  - Hover tooltip: "This appointment will expire in XX minutes"
  - Only visible when appointment is actively selected (radio button checked)
- **Automatic unlock triggers**:
  - 30-minute timeout expires
  - Appointment status changed (confirmed, rejected, rescheduled, completed)
  - Officer explicitly unlocks
  - Stale lock detection (>30 minutes old locks auto-cleared)

### 2. Comprehensive Audit Trail
- Automatic logging of all appointment actions
- Officer performance tracking
- Date range filtering
- Action-based filtering
- Detailed statistics dashboard

### 3. Doctor Availability Management
- **Booking availability toggle**: Enable/disable doctor bookings via simple toggle
- **Availability status**: Determined by presence of scheduled days (days.length > 0)
- **Flexible scheduling**: Support for uniform time across all days OR custom times per day
- **Day-specific time slots**: Configure different working hours for each day of the week
- **Real-time updates**: Availability changes immediately affect booking eligibility
- **Admin control**: Admins and doctors can update schedules via admin panel

### 4. Role-Based Access Control
- Admin vs Appointment Officer permissions
- Route-level guards
- Resource-level authorization

### 5. Multi-Location Support
- Locations: Abuja, Lagos, Benin, Kaduna, Port Harcourt, Warri
- Location-based filtering for doctors and services

---

## Environment Configuration

### .env File Structure
```env
# Application
NODE_ENV=development
PORT=4000
API_PREFIX=/api

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=nmsl_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=nmsl_portal

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (Future)
SENDGRID_API_KEY=
EMAIL_FROM=noreply@nmsl.com

# File Upload (Future)
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

---

## Testing Requirements

### Unit Tests
- Test all service methods
- Test guards and decorators
- Test validation DTOs
- Test business logic functions

### Integration Tests
- Test API endpoints
- Test authentication flow
- Test appointment locking mechanism
- Test audit log creation

### E2E Tests
- Test complete user workflows
- Test admin workflows
- Test appointment officer workflows
- Test conflict scenarios

### Test Coverage Target
- Minimum 80% code coverage
- 100% coverage for critical features (locking, audit)

---

## Deployment Considerations

### Production Checklist
1. **Security**:
   - Use strong JWT secret
   - Enable HTTPS only
   - Set secure cookie flags
   - Implement rate limiting
   - Enable CORS with specific origins
   - Sanitize all inputs

2. **Database**:
   - Run migrations
   - Seed initial data
   - Enable connection pooling
   - Set up automated backups
   - Index optimization

3. **Redis**:
   - Enable password authentication
   - Set up persistence (AOF or RDB)
   - Configure maxmemory policy

4. **Logging**:
   - Use structured logging (Winston/Pino)
   - Log to external service (CloudWatch, Datadog)
   - Set appropriate log levels

5. **Monitoring**:
   - Health check endpoint
   - Performance metrics
   - Error tracking (Sentry)
   - APM (Application Performance Monitoring)

6. **Scalability**:
   - Horizontal scaling with load balancer
   - Redis cluster for high availability
   - Database read replicas
   - CDN for static assets

### Docker Configuration
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main"]
```

### Docker Compose (Development)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nmsl_portal
      POSTGRES_USER: nmsl_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

---

## API Documentation (Swagger)

### Swagger Configuration
```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('NMSL Portal API')
  .setDescription('Comprehensive healthcare management system API')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management')
  .addTag('doctors', 'Doctor management')
  .addTag('appointments', 'Appointment management')
  .addTag('audit', 'Audit logs and statistics')
  .addTag('services', 'Medical services')
  .addTag('partners', 'Trusted partners')
  .addTag('board-members', 'Board of directors')
  .addTag('contact', 'Contact information')
  .addTag('statistics', 'Homepage statistics')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Access Swagger UI**: `http://localhost:4000/api/docs`

---

## Additional Implementation Notes

### 1. Pagination
Implement pagination for list endpoints:
```typescript
@Get()
async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
  const skip = (page - 1) * limit;
  const [data, total] = await this.repository.findAndCount({ skip, take: limit });
  
  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}
```

### 2. Error Handling
Use exception filters:
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: exceptionResponse
    });
  }
}
```

### 3. Request Logging
Log all API requests:
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    
    console.log(`[${method}] ${url}`, body);
    
    return next.handle();
  }
}
```

### 4. Rate Limiting
Protect against DDoS:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 10,
})
```

---

## Data Seeding

### Initial Seed Data

**Must Include**:
1. Default admin user (email: admin@nmsl.app)
2. Sample doctors (at least 5 across different specialties)
3. Sample appointments (mix of statuses)
4. Board members (7 members as per mock data)
5. Partners (11 partners as per mock data)
6. Contact information (singleton record)
7. Statistics (6 stats as per mock data)
8. Sample services (3 services)

**Seed Script Example**:
```typescript
// database/seeds/initial-seed.ts
async function seed() {
  // Create admin user
  await usersRepository.save({
    name: 'Emeka Nwosu',
    email: 'admin@nmsl.app',
    password: await bcrypt.hash('Admin@123', 10),
    role: 'admin',
    location: 'Abuja',
    state: 'FCT',
    phone: '+234 801 234 5678'
  });
  
  // Create doctors...
  // Create partners...
  // etc.
}
```

---

## Summary

This specification provides a **complete blueprint** for building the NMSL Portal backend with NestJS. All critical features are documented:

✅ **Complete database schema** with TypeORM entities  
✅ **All API endpoints** with request/response formats  
✅ **Authentication & authorization** with JWT and RBAC  
✅ **Appointment locking system** with Redis implementation  
✅ **Audit trail and statistics** with query logic  
✅ **Business rules and validation**  
✅ **Environment configuration**  
✅ **Testing guidelines**  
✅ **Deployment considerations**  
✅ **Swagger documentation setup**  

### Priority Implementation Order
1. ✅ Database setup and entities
2. ✅ Authentication module (JWT)
3. ✅ User management
4. ✅ Doctor management
5. ✅ Appointment CRUD
6. ✅ **Appointment locking system (CRITICAL)**
7. ✅ Audit logging
8. ✅ Statistics and KPIs
9. ✅ Services, Partners, Board Members
10. ✅ Contact and Statistics management

All information needed to build a production-ready NestJS backend is included in this document. No details have been omitted.
