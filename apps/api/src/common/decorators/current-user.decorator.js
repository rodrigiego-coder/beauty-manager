"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
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
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
        return undefined;
    }
    return data ? user[data] : user;
});
//# sourceMappingURL=current-user.decorator.js.map