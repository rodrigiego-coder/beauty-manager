/**
 * Chave para metadados de rotas públicas
 */
export declare const IS_PUBLIC_KEY = "isPublic";
/**
 * Decorator para marcar um endpoint como público (sem autenticação)
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { ... }
 */
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=public.decorator.d.ts.map