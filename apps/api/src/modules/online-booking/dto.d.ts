export declare enum DepositType {
    NONE = "NONE",
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE"
}
export declare enum HoldStatus {
    ACTIVE = "ACTIVE",
    CONVERTED = "CONVERTED",
    EXPIRED = "EXPIRED",
    RELEASED = "RELEASED"
}
export declare enum OtpType {
    PHONE_VERIFICATION = "PHONE_VERIFICATION",
    BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION",
    CANCEL_BOOKING = "CANCEL_BOOKING"
}
export declare enum DepositStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    REFUNDED = "REFUNDED",
    FORFEITED = "FORFEITED"
}
export declare enum BookingRuleType {
    BLOCKED = "BLOCKED",
    VIP_ONLY = "VIP_ONLY",
    DEPOSIT_REQUIRED = "DEPOSIT_REQUIRED",
    RESTRICTED_SERVICES = "RESTRICTED_SERVICES"
}
export declare enum OperationMode {
    SECRETARY_ONLY = "SECRETARY_ONLY",
    SECRETARY_AND_ONLINE = "SECRETARY_AND_ONLINE",
    SECRETARY_WITH_LINK = "SECRETARY_WITH_LINK"
}
export declare enum DepositAppliesTo {
    ALL = "ALL",
    NEW_CLIENTS = "NEW_CLIENTS",
    SPECIFIC_SERVICES = "SPECIFIC_SERVICES",
    SELECTED_CLIENTS = "SELECTED_CLIENTS"
}
export declare class CreateOnlineBookingSettingsDto {
    enabled?: boolean;
    slug?: string;
    operationMode?: OperationMode;
    minAdvanceHours?: number;
    maxAdvanceDays?: number;
    holdDurationMinutes?: number;
    slotIntervalMinutes?: number;
    allowSameDayBooking?: boolean;
    cancellationHours?: number;
    cancellationPolicy?: string;
    allowRescheduling?: boolean;
    maxReschedules?: number;
    requirePhoneVerification?: boolean;
    requireDeposit?: boolean;
    depositType?: DepositType;
    depositValue?: number;
    depositMinServices?: number;
    depositAppliesTo?: DepositAppliesTo;
    allowNewClients?: boolean;
    newClientRequiresApproval?: boolean;
    newClientDepositRequired?: boolean;
    maxDailyBookings?: number;
    maxWeeklyBookingsPerClient?: number;
    welcomeMessage?: string;
    confirmationMessage?: string;
    cancellationMessage?: string;
    termsUrl?: string;
    requireTermsAcceptance?: boolean;
    sendWhatsappConfirmation?: boolean;
    sendWhatsappReminder?: boolean;
    reminderHoursBefore?: number;
}
export declare class UpdateOnlineBookingSettingsDto extends CreateOnlineBookingSettingsDto {
}
export declare class CreateHoldDto {
    professionalId: string;
    serviceId: number;
    date: string;
    startTime: string;
    endTime: string;
    clientPhone: string;
    clientName?: string;
    sessionId?: string;
}
export declare class ConvertHoldDto {
    holdId: string;
    clientName?: string;
    clientEmail?: string;
    notes?: string;
    acceptedTerms?: boolean;
}
export declare class SendOtpDto {
    phone: string;
    type: OtpType;
    holdId?: string;
    appointmentId?: string;
}
export declare class VerifyOtpDto {
    phone: string;
    code: string;
    type: OtpType;
}
export declare class CreateClientBookingRuleDto {
    clientPhone?: string;
    clientId?: string;
    ruleType: BookingRuleType;
    reason?: string;
    restrictedServiceIds?: number[];
    expiresAt?: string;
}
export declare class UpdateClientBookingRuleDto {
    ruleType?: BookingRuleType;
    reason?: string;
    restrictedServiceIds?: number[];
    expiresAt?: string;
    isActive?: boolean;
}
export declare class CreateDepositDto {
    appointmentId?: string;
    holdId?: string;
    clientId?: string;
    amount: number;
}
export declare class ProcessDepositPaymentDto {
    depositId: string;
    paymentMethod: string;
    paymentReference?: string;
    mercadoPagoPaymentId?: string;
}
export declare class CheckAvailabilityDto {
    professionalId: string;
    serviceId: number;
    date: string;
}
export declare class GetAvailableSlotsDto {
    professionalId?: string;
    serviceId?: number;
    startDate: string;
    endDate?: string;
}
export declare class CreateOnlineBookingDto {
    professionalId: string;
    serviceId: number;
    date: string;
    time: string;
    clientPhone: string;
    clientName: string;
    clientEmail?: string;
    notes?: string;
    acceptedTerms?: boolean;
    otpCode?: string;
}
export declare class CancelOnlineBookingDto {
    appointmentId: string;
    reason?: string;
    otpCode?: string;
    clientAccessToken?: string;
}
export declare class RescheduleOnlineBookingDto {
    appointmentId: string;
    newDate: string;
    newTime: string;
    newProfessionalId?: string;
    otpCode?: string;
    clientAccessToken?: string;
}
export interface OnlineBookingSettingsResponse {
    id: string;
    salonId: string;
    slug: string | null;
    enabled: boolean;
    operationMode: string;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    slotIntervalMinutes: number;
    allowSameDayBooking: boolean;
    holdDurationMinutes: number;
    cancellationHours: number;
    cancellationPolicy: string | null;
    allowRescheduling: boolean;
    maxReschedules: number;
    requirePhoneVerification: boolean;
    requireDeposit: boolean;
    depositType: string | null;
    depositValue: string | null;
    depositMinServices: string | null;
    depositAppliesTo: string;
    allowNewClients: boolean;
    newClientRequiresApproval: boolean;
    newClientDepositRequired: boolean;
    maxDailyBookings: number | null;
    maxWeeklyBookingsPerClient: number | null;
    welcomeMessage: string | null;
    confirmationMessage: string | null;
    cancellationMessage: string | null;
    termsUrl: string | null;
    requireTermsAcceptance: boolean;
    sendWhatsappConfirmation: boolean;
    sendWhatsappReminder: boolean;
    reminderHoursBefore: number;
}
export interface AvailableSlot {
    date: string;
    time: string;
    endTime: string;
    professionalId: string;
    professionalName: string;
    serviceId: number;
    serviceName: string;
    duration: number;
    price: string;
}
export interface HoldResponse {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    professionalName: string;
    serviceName: string;
    expiresAt: Date;
    expiresInSeconds: number;
}
export interface BookingConfirmation {
    appointmentId: string;
    date: string;
    time: string;
    professionalName: string;
    serviceName: string;
    clientAccessToken: string;
    depositRequired: boolean;
    depositAmount?: string;
    depositPixCode?: string;
}
export declare class GenerateAssistedLinkDto {
    salonId: string;
    serviceId?: number;
    professionalId?: string;
    clientPhone?: string;
}
export interface AssistedLinkResponse {
    url: string;
    expiresAt: Date;
}
//# sourceMappingURL=dto.d.ts.map