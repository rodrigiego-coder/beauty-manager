import { SalonsService } from './salons.service';
import { NewSalon } from '../../database';
interface AuthUser {
    id: string;
    email: string;
    role: string;
    salonId: string;
}
export declare class SalonsController {
    private readonly salonsService;
    constructor(salonsService: SalonsService);
    /**
     * GET /salons/my
     * Retorna o salao do usuario logado
     */
    getMySalon(user: AuthUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        slug: string | null;
        address: string | null;
        locationUrl: string | null;
        wazeUrl: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
    }>;
    /**
     * PATCH /salons/my
     * Atualiza o salao do usuario logado
     */
    updateMySalon(user: AuthUser, data: Partial<NewSalon>): Promise<{
        message: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        slug: string | null;
        address: string | null;
        locationUrl: string | null;
        wazeUrl: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
    }>;
    /**
     * GET /salons
     * Lista todos os saloes ativos
     */
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        slug: string | null;
        address: string | null;
        locationUrl: string | null;
        wazeUrl: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
    }[]>;
    /**
     * GET /salons/:id
     * Busca salao por ID
     */
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        slug: string | null;
        address: string | null;
        locationUrl: string | null;
        wazeUrl: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
    }>;
    /**
     * POST /salons
     * Cria um novo salao
     */
    create(data: NewSalon): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        slug: string | null;
        address: string | null;
        locationUrl: string | null;
        wazeUrl: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
    }>;
    /**
     * PATCH /salons/:id
     * Atualiza um salao
     */
    update(id: string, data: Partial<NewSalon>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        slug: string | null;
        address: string | null;
        locationUrl: string | null;
        wazeUrl: string | null;
        taxId: string | null;
        phone: string | null;
        email: string | null;
    }>;
    /**
     * DELETE /salons/:id
     * Desativa um salao (soft delete)
     */
    deactivate(id: string): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=salons.controller.d.ts.map