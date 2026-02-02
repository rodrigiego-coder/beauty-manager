/**
 * Roles disponíveis no sistema
 */
export type UserRole = 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST' | 'SUPER_ADMIN';
/**
 * Chave para metadados de roles
 */
export declare const ROLES_KEY = "roles";
/**
 * Decorator para definir quais roles podem acessar um endpoint
 *
 * @example
 * @Roles('OWNER', 'MANAGER')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=roles.decorator.d.ts.map