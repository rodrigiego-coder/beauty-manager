import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
export type AvailabilityReason = 'SALON_CLOSED' | 'PROFESSIONAL_NOT_WORKING' | 'PROFESSIONAL_BLOCKED' | 'EXCEEDS_CLOSING_TIME' | 'EXCEEDS_WORK_HOURS' | 'SLOT_OCCUPIED';
export interface AvailabilityResult {
    available: boolean;
    reason?: AvailabilityReason;
    message?: string;
    suggestedSlots?: string[];
    details?: {
        requestedTime?: string;
        serviceDuration?: number;
        serviceEndTime?: string;
        salonCloseTime?: string;
        professionalEndTime?: string;
    };
}
export interface SalonScheduleDto {
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}
export interface ProfessionalScheduleDto {
    dayOfWeek: number;
    isWorking: boolean;
    startTime?: string;
    endTime?: string;
}
export interface CreateBlockDto {
    blockDate: string;
    startTime: string;
    endTime: string;
    reason?: string;
    blockType?: 'SINGLE' | 'VACATION';
}
export declare class SchedulesService {
    private readonly db;
    constructor(db: NodePgDatabase<typeof schema>);
    getSalonSchedule(salonId: string): Promise<schema.SalonSchedule[]>;
    initializeSalonSchedule(salonId: string): Promise<void>;
    updateSalonSchedule(salonId: string, dayOfWeek: number, data: Partial<SalonScheduleDto>): Promise<schema.SalonSchedule>;
    getProfessionalSchedule(professionalId: string): Promise<schema.ProfessionalSchedule[]>;
    initializeProfessionalSchedule(professionalId: string, salonId: string): Promise<void>;
    updateProfessionalSchedule(professionalId: string, dayOfWeek: number, data: Partial<ProfessionalScheduleDto>): Promise<schema.ProfessionalSchedule>;
    getProfessionalBlocks(professionalId: string, startDate?: string, endDate?: string): Promise<schema.ProfessionalBlock[]>;
    createProfessionalBlock(professionalId: string, salonId: string, createdById: string, data: CreateBlockDto): Promise<schema.ProfessionalBlock>;
    deleteProfessionalBlock(blockId: string): Promise<void>;
    checkAvailability(salonId: string, professionalId: string, date: string, startTime: string, durationMinutes: number): Promise<AvailabilityResult>;
    private timeOverlaps;
    private calculateSuggestedSlots;
    private getOpenDays;
    private getProfessionalWorkDays;
    private findAvailableSlots;
}
//# sourceMappingURL=schedules.service.d.ts.map