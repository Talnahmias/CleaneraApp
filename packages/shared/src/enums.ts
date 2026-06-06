export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CLEANER = 'CLEANER',
  ADMIN = 'ADMIN',
}

export enum CleanerVerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum JobStatus {
  REQUESTED = 'REQUESTED',
  MATCHING = 'MATCHING',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum JobOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum RecurringFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
}

export enum NotificationEvent {
  JOB_MATCHED = 'JOB_MATCHED',
  CLEANER_EN_ROUTE = 'CLEANER_EN_ROUTE',
  JOB_COMPLETED = 'JOB_COMPLETED',
  JOB_OFFER = 'JOB_OFFER',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
}

export enum PhotoType {
  COMPLETION = 'COMPLETION',
  ISSUE = 'ISSUE',
}
