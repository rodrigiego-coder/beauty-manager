"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
/**
 * Chave para metadados de roles
 */
exports.ROLES_KEY = 'roles';
/**
 * Decorator para definir quais roles podem acessar um endpoint
 *
 * @example
 * @Roles('OWNER', 'MANAGER')
 * @Get('sensitive-data')
 * getSensitiveData() { ... }
 */
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map