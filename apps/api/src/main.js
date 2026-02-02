"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    // Registrar suporte a cookies
    await app.register(cookie_1.default, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
    });
    // Configurar ValidationPipe global
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, // Remove propriedades não declaradas no DTO
        forbidNonWhitelisted: true, // Retorna erro se enviar propriedades extras
        transform: true, // Transforma tipos automaticamente
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Configurar CORS - permitir múltiplos domínios
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        // Domínios de produção (HTTP e HTTPS)
        'http://app.agendasalaopro.com.br',
        'https://app.agendasalaopro.com.br',
        'http://agendasalaopro.com.br',
        'https://agendasalaopro.com.br',
        'http://www.agendasalaopro.com.br',
        'https://www.agendasalaopro.com.br',
        // IP direto (fallback)
        'http://72.61.131.18',
        // Domínios antigos
        'http://beautymanager.com.br',
        'https://beautymanager.com.br',
        'http://www.beautymanager.com.br',
        'https://www.beautymanager.com.br',
    ];
    app.enableCors({
        origin: (origin, callback) => {
            // Permitir requests sem origin (ex: curl, mobile apps)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Log para debug de origens não permitidas
            console.warn(`[CORS] Origem não permitida: ${origin}`);
            return callback(null, false);
        },
        credentials: true,
    });
    // Swagger - habilitado apenas quando ENABLE_SWAGGER=true e credenciais definidas
    const swaggerEnabled = process.env.ENABLE_SWAGGER === 'true';
    const swaggerUser = process.env.SWAGGER_USER;
    const swaggerPass = process.env.SWAGGER_PASS;
    if (swaggerEnabled) {
        if (!swaggerUser || !swaggerPass) {
            console.warn('⚠️  [Swagger] ENABLE_SWAGGER=true mas SWAGGER_USER ou SWAGGER_PASS não definidos. Swagger NÃO será montado.');
        }
        else {
            const fastifyInstance = app.getHttpAdapter().getInstance();
            // Basic Auth middleware para proteger /docs e /docs-json
            fastifyInstance.addHook('onRequest', async (request, reply) => {
                const url = request.url;
                if (!url.startsWith('/docs')) {
                    return;
                }
                const authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Basic ')) {
                    reply
                        .code(401)
                        .header('WWW-Authenticate', 'Basic realm="Swagger Docs"')
                        .send({ statusCode: 401, message: 'Unauthorized' });
                    return;
                }
                const base64Credentials = authHeader.slice(6);
                const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
                const [user, pass] = credentials.split(':');
                if (user !== swaggerUser || pass !== swaggerPass) {
                    reply
                        .code(401)
                        .header('WWW-Authenticate', 'Basic realm="Swagger Docs"')
                        .send({ statusCode: 401, message: 'Unauthorized' });
                    return;
                }
            });
            // Swagger com documentFactory lazy - documento criado sob demanda
            swagger_1.SwaggerModule.setup('docs', app, () => {
                const config = new swagger_1.DocumentBuilder()
                    .setTitle('Beauty Manager API')
                    .setDescription('API do sistema de gestão de salões de beleza')
                    .setVersion('1.0')
                    .addBearerAuth({
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'Authorization',
                    in: 'header',
                }, 'access-token')
                    .build();
                return swagger_1.SwaggerModule.createDocument(app, config);
            }, {
                swaggerOptions: {
                    persistAuthorization: true,
                },
            });
            console.log('📚 Swagger docs available at /docs (protected by Basic Auth)');
        }
    }
    const port = process.env.API_PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 API running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map