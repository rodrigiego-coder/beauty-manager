import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService, AuditAction } from '../../modules/audit/audit.service';

/**
 * Entidades que devem ser auditadas automaticamente
 */
const AUDITED_ENTITIES = [
  'clients',
  'products',
  'transactions',
  'appointments',
  'accounts-payable',
  'accounts-receivable',
  'users',
  'packages',
  'client-packages',
];

/**
 * Mapeia métodos HTTP para ações de auditoria
 */
const METHOD_ACTION_MAP: Record<string, AuditAction> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Interceptor global que registra todas as ações de criação, atualização e exclusão
 * nas entidades principais do sistema para garantir rastreabilidade total.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // Verifica se é um método que deve ser auditado
    const action = METHOD_ACTION_MAP[method];
    if (!action) {
      return next.handle();
    }

    // Extrai a entidade da URL (ex: /clients/123 -> clients)
    const entity = this.extractEntityFromUrl(url);
    if (!entity || !AUDITED_ENTITIES.includes(entity)) {
      return next.handle();
    }

    // Captura dados antes da execução
    const entityId = this.extractEntityIdFromUrl(url);
    const oldValues = request.body?._oldValues; // Pode ser passado pelo controller
    const newValues = action !== 'DELETE' ? request.body : undefined;

    // Remove _oldValues do body se existir
    if (request.body?._oldValues) {
      delete request.body._oldValues;
    }

    // Extrai informações do usuário e request
    const userId = request.user?.id; // Do JWT quando implementado
    const salonId = request.body?.salonId || request.params?.salonId || request.query?.salonId;
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: async (response: Record<string, unknown> | undefined) => {
          // Captura o ID da entidade criada/atualizada
          const responseId = response?.id as string | number | undefined;
          const finalEntityId = entityId || responseId?.toString() || 'unknown';

          try {
            await this.auditService.log({
              salonId,
              userId,
              action,
              entity,
              entityId: finalEntityId,
              oldValues: action === 'CREATE' ? undefined : oldValues,
              newValues: action === 'DELETE' ? undefined : (response || newValues),
              ipAddress,
              userAgent,
            });
          } catch (error) {
            // Log de erro mas não falha a requisição principal
            console.error('[AuditInterceptor] Falha ao registrar auditoria:', error);
          }
        },
        error: () => {
          // Não registra auditoria em caso de erro na operação principal
        },
      }),
    );
  }

  /**
   * Extrai o nome da entidade da URL
   */
  private extractEntityFromUrl(url: string): string | null {
    // Remove query string
    const path = url.split('?')[0];
    // Extrai primeiro segmento após /
    const segments = path.split('/').filter(Boolean);
    return segments[0] || null;
  }

  /**
   * Extrai o ID da entidade da URL (se existir)
   */
  private extractEntityIdFromUrl(url: string): string | null {
    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);
    // Retorna o segundo segmento se existir (ex: /clients/123 -> 123)
    return segments.length > 1 ? segments[1] : null;
  }

  /**
   * Obtém o IP do cliente considerando proxies
   */
  private getClientIp(request: unknown): string | undefined {
    const req = request as {
      headers?: Record<string, string | string[]>;
      ip?: string;
      connection?: { remoteAddress?: string };
    };

    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ip?.trim();
    }
    return req.ip || req.connection?.remoteAddress;
  }
}
