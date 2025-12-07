import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Interface para usuário autenticado no request
 */
export interface AuthenticatedUser {
  id: string;
  salonId: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'RECEPTIONIST' | 'STYLIST';
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
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
