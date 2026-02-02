export declare enum ServiceCategory {
    HAIR = "HAIR",
    BARBER = "BARBER",
    NAILS = "NAILS",
    SKIN = "SKIN",
    MAKEUP = "MAKEUP",
    OTHER = "OTHER"
}
export declare class CreateServiceDto {
    name: string;
    description?: string;
    category?: ServiceCategory;
    durationMinutes?: number;
    basePrice: number;
    commissionPercentage?: number;
}
export declare class UpdateServiceDto {
    name?: string;
    description?: string;
    category?: ServiceCategory;
    durationMinutes?: number;
    basePrice?: number;
    commissionPercentage?: number;
}
//# sourceMappingURL=dto.d.ts.map