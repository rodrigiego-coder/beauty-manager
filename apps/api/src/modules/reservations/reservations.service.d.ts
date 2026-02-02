import { CreateReservationDto, UpdateReservationDto, UpdateReservationStatusDto, ReservationResponse, ReservationStatsResponse } from './dto';
export declare class ReservationsService {
    getReservations(salonId: string, options?: {
        page?: number;
        limit?: number;
        status?: string;
        clientId?: string;
        deliveryType?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: ReservationResponse[];
        total: number;
        page: number;
        limit: number;
    }>;
    getReservationById(salonId: string, id: string): Promise<ReservationResponse>;
    createReservation(salonId: string, dto: CreateReservationDto): Promise<ReservationResponse>;
    updateReservation(salonId: string, id: string, dto: UpdateReservationDto): Promise<ReservationResponse>;
    updateStatus(salonId: string, id: string, dto: UpdateReservationStatusDto, userId?: string): Promise<ReservationResponse>;
    deleteReservation(salonId: string, id: string): Promise<void>;
    getStats(salonId: string, startDate?: string, endDate?: string): Promise<ReservationStatsResponse>;
    private formatReservationResponse;
}
//# sourceMappingURL=reservations.service.d.ts.map