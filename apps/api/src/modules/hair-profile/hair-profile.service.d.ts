import { CreateHairProfileDto, UpdateHairProfileDto, HairProfileResponse } from './dto';
/**
 * HairProfileService
 * Gerencia perfis capilares dos clientes
 */
export declare class HairProfileService {
    /**
     * Obtém o perfil capilar de um cliente
     */
    getByClientId(salonId: string, clientId: string): Promise<HairProfileResponse | null>;
    /**
     * Cria ou atualiza o perfil capilar de um cliente
     */
    upsert(salonId: string, dto: CreateHairProfileDto, assessedById: string): Promise<HairProfileResponse>;
    /**
     * Atualiza parcialmente o perfil capilar
     */
    update(salonId: string, clientId: string, dto: UpdateHairProfileDto, assessedById: string): Promise<HairProfileResponse>;
    /**
     * Remove o perfil capilar
     */
    delete(salonId: string, clientId: string): Promise<void>;
    /**
     * Lista clientes com perfil capilar
     */
    listClientsWithProfile(salonId: string): Promise<{
        clientId: string;
        clientName: string;
        hasProfile: boolean;
    }[]>;
    /**
     * Obtém estatísticas de perfis capilares
     */
    getStats(salonId: string): Promise<{
        totalClients: number;
        profilesCreated: number;
        coveragePercentage: number;
        hairTypeDistribution: Record<string, number>;
        topConcerns: {
            concern: string;
            count: number;
        }[];
    }>;
    private mapToResponse;
}
//# sourceMappingURL=hair-profile.service.d.ts.map