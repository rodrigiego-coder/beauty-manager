/**
 * Interface para usuário autenticado no request
 */
export interface AuthenticatedUser {
    id: string;
    salonId: string;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';
    /** ID do salão quando SUPER_ADMIN está em modo suporte delegado */
    actingAsSalonId?: string | null;
    /** ID da sessão de suporte ativa */
    supportSessionId?: string | null;
}
/**
 * Decorator para extrair o usuário autenticado do request
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return user;
 * }
 *
 * @example
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return userId;
 * }
 */
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
//# sourceMappingURL=current-user.decorator.d.ts.map