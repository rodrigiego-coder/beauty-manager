/**
 * Módulo de Suporte Delegado
 *
 * Permite que SUPER_ADMIN acesse temporariamente um salão específico
 * para suporte técnico, com auditoria completa.
 *
 * Funcionalidades:
 * - Criar sessão de suporte (gera token único)
 * - Consumir token (retorna JWT com actingAsSalonId)
 * - Listar sessões (auditoria)
 * - Revogar sessões pendentes
 *
 * Segurança:
 * - Token de uso único (64 caracteres hex)
 * - TTL de 15 minutos
 * - Motivo obrigatório (compliance/LGPD)
 * - Todas ações registradas em audit_logs
 */
export declare class SupportModule {
}
//# sourceMappingURL=support.module.d.ts.map