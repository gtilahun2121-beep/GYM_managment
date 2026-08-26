"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationType = exports.WorkoutDifficulty = exports.CheckInMethod = exports.PaymentType = exports.PaymentStatus = exports.BookingStatus = exports.ClassSessionStatus = exports.IntensityLevel = exports.SubscriptionStatus = exports.BillingFrequency = exports.UserStatus = exports.UserRole = void 0;
// Auth Types
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["GYM_MANAGER"] = "gym_manager";
    UserRole["RECEPTIONIST"] = "receptionist";
    UserRole["TRAINER"] = "trainer";
    UserRole["MEMBER"] = "member";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["DELETED"] = "deleted";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Membership Plan Types
var BillingFrequency;
(function (BillingFrequency) {
    BillingFrequency["MONTHLY"] = "monthly";
    BillingFrequency["QUARTERLY"] = "quarterly";
    BillingFrequency["ANNUAL"] = "annual";
    BillingFrequency["ONE_TIME"] = "one_time";
})(BillingFrequency || (exports.BillingFrequency = BillingFrequency = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["FROZEN"] = "frozen";
    SubscriptionStatus["PENDING_PAYMENT"] = "pending_payment";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
// Class Types
var IntensityLevel;
(function (IntensityLevel) {
    IntensityLevel["LOW"] = "low";
    IntensityLevel["MODERATE"] = "moderate";
    IntensityLevel["HIGH"] = "high";
    IntensityLevel["EXTREME"] = "extreme";
})(IntensityLevel || (exports.IntensityLevel = IntensityLevel = {}));
var ClassSessionStatus;
(function (ClassSessionStatus) {
    ClassSessionStatus["SCHEDULED"] = "scheduled";
    ClassSessionStatus["CANCELLED"] = "cancelled";
    ClassSessionStatus["COMPLETED"] = "completed";
    ClassSessionStatus["IN_PROGRESS"] = "in_progress";
})(ClassSessionStatus || (exports.ClassSessionStatus = ClassSessionStatus = {}));
// Booking Types
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["NO_SHOW"] = "no_show";
    BookingStatus["ATTENDED"] = "attended";
    BookingStatus["WAITLIST"] = "waitlist";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
// Payment Types
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCEEDED"] = "succeeded";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["DISPUTED"] = "disputed";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["SUBSCRIPTION"] = "subscription";
    PaymentType["ONE_TIME"] = "one_time";
    PaymentType["REFUND"] = "refund";
    PaymentType["COMMISSION"] = "commission";
    PaymentType["MERCHANDISE"] = "merchandise";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
// Check-in Types
var CheckInMethod;
(function (CheckInMethod) {
    CheckInMethod["QR_CODE"] = "qr_code";
    CheckInMethod["MANUAL"] = "manual";
    CheckInMethod["APP"] = "app";
    CheckInMethod["CARD"] = "card";
})(CheckInMethod || (exports.CheckInMethod = CheckInMethod = {}));
// Workout Types
var WorkoutDifficulty;
(function (WorkoutDifficulty) {
    WorkoutDifficulty["BEGINNER"] = "beginner";
    WorkoutDifficulty["INTERMEDIATE"] = "intermediate";
    WorkoutDifficulty["ADVANCED"] = "advanced";
})(WorkoutDifficulty || (exports.WorkoutDifficulty = WorkoutDifficulty = {}));
// Notification Types
var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "email";
    NotificationType["SMS"] = "sms";
    NotificationType["PUSH"] = "push";
    NotificationType["IN_APP"] = "in_app";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["BOUNCED"] = "bounced";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
//# sourceMappingURL=index.js.map