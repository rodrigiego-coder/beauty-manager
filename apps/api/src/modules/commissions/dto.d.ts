export declare class PayCommissionsDto {
    commissionIds: string[];
}
export declare class PayProfessionalCommissionsDto {
    professionalId: string;
    startDate?: string;
    endDate?: string;
}
export declare class ListCommissionsQueryDto {
    professionalId?: string;
    status?: 'PENDING' | 'PAID' | 'CANCELLED';
    startDate?: string;
    endDate?: string;
}
//# sourceMappingURL=dto.d.ts.map