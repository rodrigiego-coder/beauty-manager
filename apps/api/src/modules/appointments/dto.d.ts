export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum LocationType {
    SALON = "SALON",
    HOME = "HOME",
    ONLINE = "ONLINE"
}
export declare enum Priority {
    NORMAL = "NORMAL",
    VIP = "VIP",
    URGENT = "URGENT"
}
export declare enum AppointmentSource {
    MANUAL = "MANUAL",
    ONLINE = "ONLINE",
    WHATSAPP = "WHATSAPP",
    APP = "APP"
}
export declare enum BlockType {
    DAY_OFF = "DAY_OFF",
    VACATION = "VACATION",
    SICK_LEAVE = "SICK_LEAVE",
    PERSONAL = "PERSONAL",
    LUNCH = "LUNCH",
    TRAINING = "TRAINING",
    MAINTENANCE = "MAINTENANCE",
    OTHER = "OTHER"
}
export declare enum BlockStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum RecurringPattern {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY"
}
export declare class CreateAppointmentDto {
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    professionalId: string;
    serviceId?: number;
    service: string;
    date: string;
    time: string;
    duration: number;
    bufferBefore?: number;
    bufferAfter?: number;
    locationType?: LocationType;
    address?: string;
    priority?: Priority;
    color?: string;
    price?: string;
    notes?: string;
    internalNotes?: string;
    source?: AppointmentSource;
}
export declare class UpdateAppointmentDto {
    clientId?: string;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    professionalId?: string;
    serviceId?: number;
    service?: string;
    date?: string;
    time?: string;
    duration?: number;
    bufferBefore?: number;
    bufferAfter?: number;
    locationType?: LocationType;
    address?: string;
    priority?: Priority;
    color?: string;
    price?: string;
    notes?: string;
    internalNotes?: string;
}
export declare class RescheduleAppointmentDto {
    date: string;
    time: string;
    professionalId?: string;
}
export declare class CancelAppointmentDto {
    reason?: string;
}
export declare class CheckAvailabilityDto {
    professionalId: string;
    date: string;
    startTime: string;
    duration: number;
}
export declare class CreateBlockDto {
    professionalId: string;
    type: BlockType;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    recurring?: boolean;
    recurringPattern?: RecurringPattern;
    recurringDays?: number[];
    recurringEndDate?: string;
    requiresApproval?: boolean;
}
export declare class UpdateBlockDto {
    type?: BlockType;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    recurring?: boolean;
    recurringPattern?: RecurringPattern;
    recurringDays?: number[];
    recurringEndDate?: string;
}
export declare class RejectBlockDto {
    reason?: string;
}
export declare class WorkingHourDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    isActive: boolean;
}
export declare class SetWorkingHoursDto {
    professionalId: string;
    hours: WorkingHourDto[];
}
export declare class UpdateWorkingHourDto {
    startTime?: string;
    endTime?: string;
    breakStartTime?: string;
    breakEndTime?: string;
    isActive?: boolean;
}
export declare class AppointmentFiltersDto {
    date?: string;
    professionalId?: string;
    status?: AppointmentStatus;
    clientId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class BlockFiltersDto {
    professionalId?: string;
    status?: BlockStatus;
    startDate?: string;
    endDate?: string;
}
//# sourceMappingURL=dto.d.ts.map