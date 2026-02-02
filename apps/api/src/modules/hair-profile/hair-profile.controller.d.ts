import { HairProfileService } from './hair-profile.service';
import { CreateHairProfileDto, UpdateHairProfileDto } from './dto';
interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
        salonId: string;
        role: string;
    };
}
/**
 * HairProfileController
 * Endpoints para gerenciamento de perfis capilares
 */
export declare class HairProfileController {
    private readonly hairProfileService;
    constructor(hairProfileService: HairProfileService);
    /**
     * GET /hair-profiles/options
     * Retorna as opções disponíveis para os campos
     */
    getOptions(): {
        hairTypes: {
            value: string;
            label: string;
        }[];
        hairThickness: {
            value: string;
            label: string;
        }[];
        hairLength: {
            value: string;
            label: string;
        }[];
        hairPorosity: {
            value: string;
            label: string;
        }[];
        scalpTypes: {
            value: string;
            label: string;
        }[];
        chemicalHistory: {
            value: "ALISAMENTO" | "COLORACAO" | "DESCOLORACAO" | "RELAXAMENTO" | "PERMANENTE" | "PROGRESSIVA" | "BOTOX" | "KERATINA" | "NENHUM";
            label: string;
        }[];
        concerns: {
            value: "QUEDA" | "OLEOSIDADE" | "RESSECAMENTO" | "FRIZZ" | "PONTAS_DUPLAS" | "CASPA" | "COCEIRA" | "QUEBRA" | "SEM_BRILHO" | "VOLUME_EXCESSIVO" | "POCO_VOLUME" | "CRESCIMENTO_LENTO" | "SENSIBILIDADE" | "DANIFICADO" | "CALVICE" | "AFINAMENTO";
            label: string;
        }[];
    };
    /**
     * GET /hair-profiles/stats
     * Retorna estatísticas dos perfis capilares
     */
    getStats(req: AuthenticatedRequest): Promise<{
        totalClients: number;
        profilesCreated: number;
        coveragePercentage: number;
        hairTypeDistribution: Record<string, number>;
        topConcerns: {
            concern: string;
            count: number;
        }[];
    }>;
    /**
     * GET /hair-profiles/clients
     * Lista clientes com indicação se têm perfil
     */
    listClientsWithProfile(req: AuthenticatedRequest): Promise<{
        clientId: string;
        clientName: string;
        hasProfile: boolean;
    }[]>;
    /**
     * GET /hair-profiles/client/:clientId
     * Obtém o perfil capilar de um cliente
     */
    getByClientId(clientId: string, req: AuthenticatedRequest): Promise<import("./dto").HairProfileResponse | null>;
    /**
     * POST /hair-profiles
     * Cria ou atualiza o perfil capilar
     */
    upsert(dto: CreateHairProfileDto, req: AuthenticatedRequest): Promise<import("./dto").HairProfileResponse>;
    /**
     * PUT /hair-profiles/client/:clientId
     * Atualiza parcialmente o perfil capilar
     */
    update(clientId: string, dto: UpdateHairProfileDto, req: AuthenticatedRequest): Promise<import("./dto").HairProfileResponse>;
    /**
     * DELETE /hair-profiles/client/:clientId
     * Remove o perfil capilar
     */
    delete(clientId: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=hair-profile.controller.d.ts.map