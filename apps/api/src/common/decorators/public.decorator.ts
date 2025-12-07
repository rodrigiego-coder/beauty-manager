import { SetMetadata } from '@nestjs/common';

/**
 * Chave para metadados de rotas públicas
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator para marcar um endpoint como público (sem autenticação)
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
