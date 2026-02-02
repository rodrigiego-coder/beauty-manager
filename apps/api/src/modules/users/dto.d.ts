export declare enum UserRole {
    OWNER = "OWNER",
    MANAGER = "MANAGER",
    RECEPTIONIST = "RECEPTIONIST",
    STYLIST = "STYLIST"
}
export declare class CreateUserDto {
    name: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: UserRole;
    salonId: string;
    commissionRate?: number;
    specialties?: string;
    workSchedule?: Record<string, string>;
    sendPasswordLink?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    commissionRate?: number;
    specialties?: string;
    active?: boolean;
}
export declare class UpdateWorkScheduleDto {
    seg?: string;
    ter?: string;
    qua?: string;
    qui?: string;
    sex?: string;
    sab?: string;
    dom?: string;
}
export declare class UpdateProfileDto {
    name?: string;
    email?: string;
    phone?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
//# sourceMappingURL=dto.d.ts.map