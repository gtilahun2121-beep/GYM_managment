export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    GYM_MANAGER = "gym_manager",
    RECEPTIONIST = "receptionist",
    TRAINER = "trainer",
    MEMBER = "member"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    DELETED = "deleted"
}
export interface User {
    id: string;
    gymId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    mfaEnabled: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}
export interface Member {
    id: string;
    userId: string;
    gymId: string;
    dateOfBirth?: Date;
    gender?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    healthNotes?: string;
    fitnessGoals: string[];
    qrCodeHash: string;
    referralCode: string;
    referredBy?: string;
    membershipStartDate: Date;
    membershipEndDate?: Date;
    totalCheckIns: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum BillingFrequency {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    ANNUAL = "annual",
    ONE_TIME = "one_time"
}
export interface MembershipPlan {
    id: string;
    gymId: string;
    name: string;
    description?: string;
    billingFrequency: BillingFrequency;
    price: number;
    currency: string;
    features: Record<string, any>;
    maxBookingsPerWeek: number;
    cancellationPolicy?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    FROZEN = "frozen",
    PENDING_PAYMENT = "pending_payment"
}
export interface MembershipSubscription {
    id: string;
    memberId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    cancelledAt?: Date;
    frozenUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum IntensityLevel {
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    EXTREME = "extreme"
}
export interface ClassType {
    id: string;
    gymId: string;
    name: string;
    description?: string;
    durationMinutes: number;
    intensityLevel: IntensityLevel;
    maxCapacity: number;
    colorCode: string;
    equipmentNeeded: string[];
    imageUrl?: string;
    isActive: boolean;
    createdAt: Date;
}
export interface Room {
    id: string;
    gymId: string;
    name: string;
    capacity: number;
    type?: string;
    amenities: string[];
    isActive: boolean;
    createdAt: Date;
}
export declare enum ClassSessionStatus {
    SCHEDULED = "scheduled",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
    IN_PROGRESS = "in_progress"
}
export interface ClassSession {
    id: string;
    gymId: string;
    classTypeId: string;
    trainerId: string;
    roomId: string;
    startTime: Date;
    endTime: Date;
    maxCapacity: number;
    currentBookings: number;
    waitlistCount: number;
    status: ClassSessionStatus;
    isRecurring: boolean;
    recurrenceRule?: string;
    parentSessionId?: string;
    createdAt: Date;
}
export declare enum BookingStatus {
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show",
    ATTENDED = "attended",
    WAITLIST = "waitlist"
}
export interface Booking {
    id: string;
    sessionId: string;
    memberId: string;
    status: BookingStatus;
    bookedAt: Date;
    checkedInAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    waitlistPosition?: number;
    isWaitlistPromoted: boolean;
    createdAt: Date;
}
export declare enum PaymentStatus {
    PENDING = "pending",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
    REFUNDED = "refunded",
    DISPUTED = "disputed"
}
export declare enum PaymentType {
    SUBSCRIPTION = "subscription",
    ONE_TIME = "one_time",
    REFUND = "refund",
    COMMISSION = "commission",
    MERCHANDISE = "merchandise"
}
export interface Payment {
    id: string;
    gymId: string;
    memberId: string;
    subscriptionId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    type: PaymentType;
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
    description?: string;
    refundedAmount: number;
    failureReason?: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
export declare enum CheckInMethod {
    QR_CODE = "qr_code",
    MANUAL = "manual",
    APP = "app",
    CARD = "card"
}
export interface CheckIn {
    id: string;
    memberId: string;
    gymId: string;
    method: CheckInMethod;
    checkInTime: Date;
    checkOutTime?: Date;
    bookingId?: string;
    deviceInfo?: string;
    staffId?: string;
    createdAt: Date;
}
export declare enum WorkoutDifficulty {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    equipment?: string;
    difficulty: WorkoutDifficulty;
    videoUrl?: string;
    imageUrls: string[];
    instructions?: string;
    tips?: string;
    isActive: boolean;
    createdAt: Date;
}
export interface WorkoutPlan {
    id: string;
    trainerId?: string;
    memberId?: string;
    gymId: string;
    name: string;
    description?: string;
    difficulty: WorkoutDifficulty;
    durationWeeks?: number;
    sessionsPerWeek?: number;
    isTemplate: boolean;
    isActive: boolean;
    createdAt: Date;
}
export interface PlanExercise {
    id: string;
    planId: string;
    exerciseId: string;
    dayNumber: number;
    orderIndex: number;
    sets?: number;
    reps?: string;
    restSeconds?: number;
    notes?: string;
}
export interface MemberProgress {
    id: string;
    memberId: string;
    recordedAt: Date;
    weightKg?: number;
    bodyFatPct?: number;
    muscleMassKg?: number;
    bmi?: number;
    measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        arms?: number;
        thighs?: number;
    };
    notes?: string;
    photoUrls?: {
        front?: string;
        side?: string;
        back?: string;
    };
}
export declare enum NotificationType {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
    BOUNCED = "bounced"
}
export interface Notification {
    id: string;
    recipientId: string;
    type: NotificationType;
    templateKey: string;
    subject?: string;
    content: string;
    status: NotificationStatus;
    sentAt?: Date;
    openedAt?: Date;
    errorMessage?: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
export interface Gym {
    id: string;
    name: string;
    slug: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
    timezone: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    settings: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any[];
        requestId?: string;
    };
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=index.d.ts.map