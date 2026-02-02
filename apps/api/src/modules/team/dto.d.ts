export declare class CreateTeamMemberDto {
    name: string;
    email: string;
    phone?: string;
    role: 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';
    defaultCommission?: number;
}
export declare class UpdateTeamMemberDto {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';
    defaultCommission?: number;
    specialties?: string;
}
//# sourceMappingURL=dto.d.ts.map