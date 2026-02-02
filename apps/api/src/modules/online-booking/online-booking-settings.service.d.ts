import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { UpdateOnlineBookingSettingsDto, OnlineBookingSettingsResponse, GenerateAssistedLinkDto, AssistedLinkResponse } from './dto';
export declare class OnlineBookingSettingsService {
    private readonly db;
    private readonly logger;
    constructor(db: NodePgDatabase<typeof schema>);
    /**
     * Obtém as configurações de booking online do salão
     * Cria configurações padrão se não existirem
     */
    getSettings(salonId: string): Promise<OnlineBookingSettingsResponse>;
    /**
     * Cria configurações padrão para o salão
     */
    createDefaultSettings(salonId: string): Promise<OnlineBookingSettingsResponse>;
    /**
     * Atualiza as configurações de booking online
     */
    updateSettings(salonId: string, dto: UpdateOnlineBookingSettingsDto): Promise<OnlineBookingSettingsResponse>;
    /**
     * Habilita/desabilita o booking online
     */
    toggleEnabled(salonId: string, enabled: boolean): Promise<OnlineBookingSettingsResponse>;
    /**
     * Verifica se o booking online está habilitado para o salão
     */
    isEnabled(salonId: string): Promise<boolean>;
    /**
     * Gera link assistido para Alexis enviar ao cliente
     * O link leva direto para a página de agendamento com parâmetros pré-preenchidos
     */
    generateAssistedLink(dto: GenerateAssistedLinkDto): Promise<AssistedLinkResponse>;
    /**
     * Mapeia entidade para response
     */
    private mapToResponse;
}
//# sourceMappingURL=online-booking-settings.service.d.ts.map