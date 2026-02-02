"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../../database/connection");
const schema = __importStar(require("../../database/schema"));
const dto_1 = require("./dto");
/**
 * GoogleCalendarService
 * Handles OAuth flow and Google Calendar API interactions
 */
let GoogleCalendarService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GoogleCalendarService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GoogleCalendarService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        clientId;
        clientSecret;
        redirectUri;
        scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];
        constructor() {
            this.clientId = process.env.GOOGLE_CLIENT_ID || '';
            this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
            this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/calendar/google/callback';
        }
        /**
         * Verifica se a integração está configurada
         */
        isConfigured() {
            return !!(this.clientId && this.clientSecret);
        }
        /**
         * Gera URL de autenticação OAuth
         */
        getAuthUrl(state) {
            if (!this.isConfigured()) {
                throw new common_1.BadRequestException('Google Calendar não configurado. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.');
            }
            const params = new URLSearchParams({
                client_id: this.clientId,
                redirect_uri: this.redirectUri,
                response_type: 'code',
                scope: this.scopes.join(' '),
                access_type: 'offline',
                prompt: 'consent',
                state,
            });
            return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        }
        /**
         * Troca código de autorização por tokens
         */
        async exchangeCodeForTokens(code) {
            if (!this.isConfigured()) {
                throw new common_1.BadRequestException('Google Calendar não configurado.');
            }
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    redirect_uri: this.redirectUri,
                    grant_type: 'authorization_code',
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                console.error('Google OAuth error:', error);
                throw new common_1.BadRequestException('Falha ao autenticar com Google. Tente novamente.');
            }
            return (await response.json());
        }
        /**
         * Renova access token usando refresh token
         */
        async refreshAccessToken(refreshToken) {
            if (!this.isConfigured()) {
                throw new common_1.BadRequestException('Google Calendar não configurado.');
            }
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    refresh_token: refreshToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'refresh_token',
                }),
            });
            if (!response.ok) {
                throw new common_1.UnauthorizedException('Sessão expirada. Reconecte sua conta Google.');
            }
            return (await response.json());
        }
        /**
         * Obtém informações do usuário Google
         */
        async getUserInfo(accessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) {
                throw new common_1.UnauthorizedException('Falha ao obter informações do usuário Google.');
            }
            return (await response.json());
        }
        /**
         * Lista eventos do calendário
         */
        async listEvents(accessToken, calendarId = 'primary', timeMin, timeMax, pageToken) {
            const params = new URLSearchParams({
                singleEvents: 'true',
                orderBy: 'startTime',
                maxResults: '250',
            });
            if (timeMin)
                params.append('timeMin', timeMin.toISOString());
            if (timeMax)
                params.append('timeMax', timeMax.toISOString());
            if (pageToken)
                params.append('pageToken', pageToken);
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, { headers: { Authorization: `Bearer ${accessToken}` } });
            if (!response.ok) {
                const error = await response.text();
                console.error('Google Calendar API error:', error);
                throw new common_1.BadRequestException('Falha ao listar eventos do Google Calendar.');
            }
            const data = (await response.json());
            return {
                events: data.items || [],
                nextPageToken: data.nextPageToken,
            };
        }
        /**
         * Obtém um evento específico
         */
        async getEvent(accessToken, calendarId, eventId) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
            if (response.status === 404)
                return null;
            if (!response.ok) {
                throw new common_1.BadRequestException('Falha ao obter evento do Google Calendar.');
            }
            return (await response.json());
        }
        /**
         * Cria um evento no calendário
         */
        async createEvent(accessToken, calendarId, event) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });
            if (!response.ok) {
                const error = await response.text();
                console.error('Google Calendar create error:', error);
                throw new common_1.BadRequestException('Falha ao criar evento no Google Calendar.');
            }
            return (await response.json());
        }
        /**
         * Atualiza um evento no calendário
         */
        async updateEvent(accessToken, calendarId, eventId, event) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });
            if (!response.ok) {
                throw new common_1.BadRequestException('Falha ao atualizar evento no Google Calendar.');
            }
            return (await response.json());
        }
        /**
         * Remove um evento do calendário
         */
        async deleteEvent(accessToken, calendarId, eventId) {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok && response.status !== 404) {
                throw new common_1.BadRequestException('Falha ao remover evento do Google Calendar.');
            }
        }
        /**
         * Lista calendários disponíveis
         */
        async listCalendars(accessToken) {
            const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) {
                throw new common_1.BadRequestException('Falha ao listar calendários.');
            }
            const data = (await response.json());
            return data.items || [];
        }
        // ==================== INTEGRAÇÃO DATABASE ====================
        /**
         * Salva ou atualiza integração no banco
         */
        async saveIntegration(salonId, professionalId, googleEmail, tokens, calendarId = 'primary', syncDirection = dto_1.SyncDirection.GOOGLE_TO_APP) {
            const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
            // Verifica se já existe integração
            const existing = await connection_1.db.query.googleIntegrations.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleIntegrations.salonId, salonId), (0, drizzle_orm_1.eq)(schema.googleIntegrations.professionalId, professionalId)),
            });
            if (existing) {
                // Atualiza integração existente
                const [updated] = await connection_1.db
                    .update(schema.googleIntegrations)
                    .set({
                    googleAccountEmail: googleEmail,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || existing.refreshToken,
                    tokenExpiresAt,
                    calendarId,
                    syncDirection,
                    status: 'ACTIVE',
                    errorMessage: null,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, existing.id))
                    .returning();
                return updated;
            }
            // Cria nova integração
            const [integration] = await connection_1.db
                .insert(schema.googleIntegrations)
                .values({
                salonId,
                professionalId,
                googleAccountEmail: googleEmail,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || '',
                tokenExpiresAt,
                calendarId,
                syncDirection,
            })
                .returning();
            return integration;
        }
        /**
         * Obtém integração ativa para profissional
         */
        async getIntegration(salonId, professionalId) {
            const integration = await connection_1.db.query.googleIntegrations.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleIntegrations.salonId, salonId), (0, drizzle_orm_1.eq)(schema.googleIntegrations.professionalId, professionalId)),
            });
            return integration || null;
        }
        /**
         * Obtém access token válido, renovando se necessário
         */
        async getValidAccessToken(integration) {
            // Verifica se token ainda é válido (com margem de 5 minutos)
            const now = new Date();
            const expiresAt = new Date(integration.tokenExpiresAt);
            expiresAt.setMinutes(expiresAt.getMinutes() - 5);
            if (now < expiresAt) {
                return integration.accessToken;
            }
            // Token expirado, renova
            try {
                const tokens = await this.refreshAccessToken(integration.refreshToken);
                const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
                await connection_1.db
                    .update(schema.googleIntegrations)
                    .set({
                    accessToken: tokens.access_token,
                    tokenExpiresAt: newExpiresAt,
                    status: 'ACTIVE',
                    errorMessage: null,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
                return tokens.access_token;
            }
            catch (error) {
                // Marca integração com erro
                await connection_1.db
                    .update(schema.googleIntegrations)
                    .set({
                    status: 'TOKEN_EXPIRED',
                    errorMessage: 'Token expirado. Reconecte sua conta Google.',
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
                throw new common_1.UnauthorizedException('Sessão Google expirada. Reconecte sua conta.');
            }
        }
        /**
         * Desconecta integração
         */
        async disconnectIntegration(salonId, professionalId) {
            // Revoga token no Google
            const integration = await this.getIntegration(salonId, professionalId);
            if (integration) {
                try {
                    await fetch(`https://oauth2.googleapis.com/revoke?token=${integration.accessToken}`, {
                        method: 'POST',
                    });
                }
                catch {
                    // Ignora erros de revogação
                }
                // Atualiza status no banco
                await connection_1.db
                    .update(schema.googleIntegrations)
                    .set({
                    status: 'DISCONNECTED',
                    syncEnabled: false,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integration.id));
            }
        }
        /**
         * Atualiza configurações da integração
         */
        async updateSettings(integrationId, settings) {
            const [updated] = await connection_1.db
                .update(schema.googleIntegrations)
                .set({
                ...settings,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integrationId))
                .returning();
            return updated;
        }
        /**
         * Marca erro na integração
         */
        async markError(integrationId, errorMessage) {
            await connection_1.db
                .update(schema.googleIntegrations)
                .set({
                status: 'ERROR',
                errorMessage,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integrationId));
        }
        /**
         * Atualiza timestamp de última sincronização
         */
        async updateLastSync(integrationId, status) {
            await connection_1.db
                .update(schema.googleIntegrations)
                .set({
                lastSyncAt: new Date(),
                lastSyncStatus: status,
                status: status === dto_1.IntegrationStatus.ERROR ? 'ERROR' : 'ACTIVE',
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.googleIntegrations.id, integrationId));
        }
        /**
         * Lista todas as integrações ativas para sincronização
         */
        async getActiveIntegrations() {
            return connection_1.db.query.googleIntegrations.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.googleIntegrations.syncEnabled, true), (0, drizzle_orm_1.eq)(schema.googleIntegrations.status, 'ACTIVE')),
            });
        }
    };
    return GoogleCalendarService = _classThis;
})();
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=google-calendar.service.js.map