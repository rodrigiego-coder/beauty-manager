import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';
interface CurrentUserPayload {
    id: string;
    salonId: string;
    role: string;
}
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    /**
     * GET /services
     * Lista todos os serviços do salão
     */
    findAll(user: CurrentUserPayload, search?: string, category?: string, includeInactive?: string): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
        commissionPercentage: string;
        bufferBefore: number;
        bufferAfter: number;
        allowEncaixe: boolean;
        requiresRoom: boolean;
        allowHomeService: boolean;
        homeServiceFee: string;
        maxAdvanceBookingDays: number;
        minAdvanceBookingHours: number;
        allowOnlineBooking: boolean;
    }[]>;
    /**
     * PATCH /services/bulk-status
     * Ativa/desativa múltiplos serviços de uma vez
     */
    bulkUpdateStatus(user: CurrentUserPayload, body: {
        ids: number[];
        active: boolean;
    }): Promise<{
        updated: number;
    }>;
    /**
     * GET /services/:id
     * Busca serviço por ID
     */
    findById(id: number, user: CurrentUserPayload): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
        commissionPercentage: string;
        bufferBefore: number;
        bufferAfter: number;
        allowEncaixe: boolean;
        requiresRoom: boolean;
        allowHomeService: boolean;
        homeServiceFee: string;
        maxAdvanceBookingDays: number;
        minAdvanceBookingHours: number;
        allowOnlineBooking: boolean;
    } | null>;
    /**
     * POST /services
     * Cria novo serviço
     */
    create(user: CurrentUserPayload, data: CreateServiceDto): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
        commissionPercentage: string;
        bufferBefore: number;
        bufferAfter: number;
        allowEncaixe: boolean;
        requiresRoom: boolean;
        allowHomeService: boolean;
        homeServiceFee: string;
        maxAdvanceBookingDays: number;
        minAdvanceBookingHours: number;
        allowOnlineBooking: boolean;
    }>;
    /**
     * PATCH /services/:id
     * Atualiza serviço existente
     */
    update(id: number, user: CurrentUserPayload, data: UpdateServiceDto): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
        commissionPercentage: string;
        bufferBefore: number;
        bufferAfter: number;
        allowEncaixe: boolean;
        requiresRoom: boolean;
        allowHomeService: boolean;
        homeServiceFee: string;
        maxAdvanceBookingDays: number;
        minAdvanceBookingHours: number;
        allowOnlineBooking: boolean;
    }>;
    /**
     * DELETE /services/:id
     * Desativa serviço (soft delete)
     */
    delete(id: number, user: CurrentUserPayload): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
        commissionPercentage: string;
        bufferBefore: number;
        bufferAfter: number;
        allowEncaixe: boolean;
        requiresRoom: boolean;
        allowHomeService: boolean;
        homeServiceFee: string;
        maxAdvanceBookingDays: number;
        minAdvanceBookingHours: number;
        allowOnlineBooking: boolean;
    }>;
    /**
     * PATCH /services/:id/reactivate
     * Reativa serviço desativado
     */
    reactivate(id: number, user: CurrentUserPayload): Promise<{
        id: number;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        salonId: string;
        category: "HAIR" | "BARBER" | "NAILS" | "SKIN" | "MAKEUP" | "OTHER";
        durationMinutes: number;
        basePrice: string;
        commissionPercentage: string;
        bufferBefore: number;
        bufferAfter: number;
        allowEncaixe: boolean;
        requiresRoom: boolean;
        allowHomeService: boolean;
        homeServiceFee: string;
        maxAdvanceBookingDays: number;
        minAdvanceBookingHours: number;
        allowOnlineBooking: boolean;
    }>;
}
export {};
//# sourceMappingURL=services.controller.d.ts.map