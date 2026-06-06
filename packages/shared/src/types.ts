import {
  CleanerVerificationStatus,
  JobStatus,
  RecurringFrequency,
  UserRole,
} from './enums';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ServiceTypeSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePriceCents: number;
  durationMinutes: number;
}

export interface AddressSummary {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  accessNotes?: string;
  location: GeoPoint;
}

export interface JobSummary {
  id: string;
  status: JobStatus;
  scheduledAt: string;
  isOnDemand: boolean;
  priceCents: number;
  serviceType: ServiceTypeSummary;
  address: AddressSummary;
  cleanerId?: string;
  cleanerName?: string;
  etaMinutes?: number;
}

export interface CleanerPublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  ratingAverage: number;
  ratingCount: number;
  verificationStatus: CleanerVerificationStatus;
  isOnline: boolean;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
}

export interface RecurringBookingSummary {
  id: string;
  frequency: RecurringFrequency;
  nextRunAt: string;
  isActive: boolean;
  preferredCleanerId?: string;
  serviceType: ServiceTypeSummary;
  address: AddressSummary;
}

export interface ChatMessageSummary {
  id: string;
  jobId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ChecklistItemSummary {
  id: string;
  label: string;
  isCompleted: boolean;
  completedAt?: string;
}
