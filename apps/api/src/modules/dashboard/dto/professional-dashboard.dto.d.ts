export declare class ProfessionalAppointmentDto {
    id: string;
    clientName: string;
    serviceName: string;
    date: string;
    time: string;
    status: string;
    price: number;
}
export declare class ProfessionalPerformanceDto {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    completionRate: number;
}
export declare class ProfessionalDashboardDto {
    todayAppointments: number;
    weekAppointments: number;
    monthRevenue: number;
    pendingCommission: number;
    commissionRate: number;
    upcomingAppointments: ProfessionalAppointmentDto[];
    performance: ProfessionalPerformanceDto;
    professionalName: string;
}
//# sourceMappingURL=professional-dashboard.dto.d.ts.map