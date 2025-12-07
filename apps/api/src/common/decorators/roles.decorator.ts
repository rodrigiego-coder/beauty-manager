import { SetMetadata } from '@nestjs/common';

/**
 * Roles disponíveis no sistema
 */
export type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';

/**
 * Chave para metadados de roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator para definir quais roles podem acessar um endpoint
 *
 * @example
 * @Roles('OWNER', 'MANAGER')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
