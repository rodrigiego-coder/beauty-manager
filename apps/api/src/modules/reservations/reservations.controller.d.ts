import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto, UpdateReservationStatusDto } from './dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    getReservations(req: any, page?: string, limit?: string, status?: string, clientId?: string, deliveryType?: string, startDate?: string, endDate?: string): Promise<{
        data: import("./dto").ReservationResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(req: any, startDate?: string, endDate?: string): Promise<import("./dto").ReservationStatsResponse>;
    getReservation(req: any, id: string): Promise<import("./dto").ReservationResponse>;
    createReservation(req: any, dto: CreateReservationDto): Promise<import("./dto").ReservationResponse>;
    updateReservation(req: any, id: string, dto: UpdateReservationDto): Promise<import("./dto").ReservationResponse>;
    updateStatus(req: any, id: string, dto: UpdateReservationStatusDto): Promise<import("./dto").ReservationResponse>;
    deleteReservation(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=reservations.controller.d.ts.map