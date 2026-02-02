"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
/**
 * Chave para metadados de rotas públicas
 */
exports.IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorator para marcar um endpoint como público (sem autenticação)
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { ... }
 */
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
//# sourceMappingURL=public.decorator.js.map