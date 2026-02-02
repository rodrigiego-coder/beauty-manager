import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';
/**
 * Interceptor global que registra todas as ações de criação, atualização e exclusão
 * nas entidades principais do sistema para garantir rastreabilidade total.
 */
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditService;
    constructor(auditService: AuditService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    /**
     * Extrai o nome da entidade da URL
     */
    private extractEntityFromUrl;
    /**
     * Extrai o ID da entidade da URL (se existir)
     */
    private extractEntityIdFromUrl;
    /**
     * Obtém o IP do cliente considerando proxies
     */
    private getClientIp;
}
//# sourceMappingURL=audit.interceptor.d.ts.map