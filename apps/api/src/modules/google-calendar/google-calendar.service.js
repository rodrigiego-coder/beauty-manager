"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const connection_1 = require("../../database/connection");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
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
        configService;
        logger = new common_1.Logger(GoogleCalendarService.name);
        oauth2Client;
        SCOPES = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email',
        ];
        constructor(configService) {
            this.configService = configService;
            this.oauth2Client = new googleapis_1.google.auth.OAuth2(this.configService.get('GOOGLE_CLIENT_ID'), this.configService.get('GOOGLE_CLIENT_SECRET'), this.configService.get('GOOGLE_REDIRECT_URI'));
        }
        /**
         * Codifica string para Base64 URL-safe
         * Substitui + por -, / por _, remove =
         */
        encodeBase64UrlSafe(data) {
            return Buffer.from(data)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }
        /**
         * Decodifica Base64 URL-safe para string
         * Restaura + e / e adiciona padding se necessário
         */
        decodeBase64UrlSafe(data) {
            // Restaura caracteres Base64 padrão
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            // Adiciona padding se necessário
            while (base64.length % 4) {
                base64 += '=';
            }
            return Buffer.from(base64, 'base64').toString();
        }
        /**
         * Gera a URL de autorização OAuth2 do Google
         * Inclui state para preservar userId/salonId
         */
        getAuthUrl(userId, salonId) {
            const state = this.encodeBase64UrlSafe(JSON.stringify({ userId, salonId }));
            this.logger.log(`Gerando auth URL para userId=${userId}, salonId=${salonId}`);
            this.logger.debug(`State gerado: ${state}`);
            return this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
                prompt: 'consent',
                state,
            });
        }
        /**
         * Processa o callback do OAuth2 e salva os tokens no banco
         */
        async handleCallback(code, state) {
            try {
                // Log detalhado para diagnóstico
                this.logger.log(`[OAuth Callback] Iniciando processamento`);
                this.logger.log(`[OAuth Callback] Code length: ${code?.length || 0}`);
                this.logger.log(`[OAuth Callback] Code preview: ${code?.substring(0, 20)}...`);
                this.logger.log(`[OAuth Callback] State: ${state}`);
                // Decodifica state para obter userId e salonId (suporta ambos formatos)
                let decodedState;
                try {
                    decodedState = this.decodeBase64UrlSafe(state);
                }
                catch {
                    // Fallback para Base64 padrão (compatibilidade)
                    decodedState = Buffer.from(state, 'base64').toString();
                }
                this.logger.debug(`State decodificado: ${decodedState}`);
                const { userId, salonId } = JSON.parse(decodedState);
                if (!userId || !salonId) {
                    this.logger.error(`State inválido - userId: ${userId}, salonId: ${salonId}`);
                    throw new common_1.BadRequestException('Estado inválido na autenticação');
                }
                this.logger.log(`[OAuth Callback] Processando para userId=${userId}, salonId=${salonId}`);
                // Troca o código por tokens
                this.logger.log(`[OAuth Callback] Iniciando troca de código por tokens...`);
                this.logger.log(`[OAuth Callback] Redirect URI configurado: ${this.configService.get('GOOGLE_REDIRECT_URI')}`);
                let tokens;
                try {
                    const response = await this.oauth2Client.getToken(code);
                    tokens = response.tokens;
                    this.logger.log(`[OAuth Callback] Tokens obtidos com sucesso`);
                }
                catch (tokenError) {
                    this.logger.error(`[OAuth Callback] Falha ao obter tokens: ${tokenError?.message}`);
                    this.logger.error(`[OAuth Callback] Detalhes: ${JSON.stringify({
                        error: tokenError?.response?.data?.error,
                        error_description: tokenError?.response?.data?.error_description,
                    })}`);
                    throw tokenError;
                }
                this.oauth2Client.setCredentials(tokens);
                // Obtém email do usuário Google
                const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: this.oauth2Client });
                const userInfo = await oauth2.userinfo.get();
                const email = userInfo.data.email;
                // Salva ou atualiza tokens no banco
                const existingToken = await connection_1.db
                    .select()
                    .from(schema_1.googleCalendarTokens)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.salonId, salonId)))
                    .limit(1);
                const tokenData = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    tokenExpiry: new Date(tokens.expiry_date),
                    calendarId: email || 'primary',
                    syncEnabled: true,
                    updatedAt: new Date(),
                };
                if (existingToken.length > 0) {
                    await connection_1.db
                        .update(schema_1.googleCalendarTokens)
                        .set(tokenData)
                        .where((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.id, existingToken[0].id));
                }
                else {
                    await connection_1.db.insert(schema_1.googleCalendarTokens).values({
                        userId,
                        salonId,
                        ...tokenData,
                    });
                }
                this.logger.log(`Google Calendar conectado para usuário ${userId}`);
                return { success: true, email: email || undefined };
            }
            catch (error) {
                // Log detalhado para diagnosticar o erro
                this.logger.error('Erro ao processar callback do Google:', {
                    message: error?.message,
                    code: error?.code,
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
                    data: error?.response?.data,
                    stack: error?.stack?.substring(0, 500),
                });
                // Extrai mensagem de erro mais específica
                const errorMessage = error?.response?.data?.error_description ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Erro desconhecido';
                throw new common_1.BadRequestException(`Falha na autenticação com Google: ${errorMessage}`);
            }
        }
        /**
         * Obtém tokens válidos para um usuário, atualizando se necessário
         */
        async getValidTokens(userId, salonId) {
            const [token] = await connection_1.db
                .select()
                .from(schema_1.googleCalendarTokens)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.salonId, salonId)))
                .limit(1);
            if (!token) {
                return null;
            }
            // Verifica se o token expirou (com 5 min de margem)
            const now = new Date();
            const expiryWithMargin = new Date(token.tokenExpiry.getTime() - 5 * 60 * 1000);
            if (now >= expiryWithMargin) {
                // Renova o token
                const newTokens = await this.refreshTokenIfNeeded(token.refreshToken);
                if (newTokens) {
                    await connection_1.db
                        .update(schema_1.googleCalendarTokens)
                        .set({
                        accessToken: newTokens.accessToken,
                        tokenExpiry: newTokens.expiry,
                        updatedAt: new Date(),
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.id, token.id));
                    return { accessToken: newTokens.accessToken, refreshToken: token.refreshToken };
                }
                return null;
            }
            return { accessToken: token.accessToken, refreshToken: token.refreshToken };
        }
        /**
         * Renova o access token usando o refresh token
         */
        async refreshTokenIfNeeded(refreshToken) {
            try {
                this.oauth2Client.setCredentials({ refresh_token: refreshToken });
                const { credentials } = await this.oauth2Client.refreshAccessToken();
                return {
                    accessToken: credentials.access_token,
                    expiry: new Date(credentials.expiry_date),
                };
            }
            catch (error) {
                this.logger.error('Erro ao renovar token:', error?.message);
                return null;
            }
        }
        /**
         * Sincroniza um agendamento do sistema para o Google Calendar
         */
        async syncAppointmentToGoogle(userId, salonId, appointmentId) {
            try {
                const tokens = await this.getValidTokens(userId, salonId);
                if (!tokens) {
                    return { success: false, error: 'Google Calendar não conectado' };
                }
                // Busca o agendamento com dados relacionados
                const [appointment] = await connection_1.db
                    .select({
                    id: schema_1.appointments.id,
                    date: schema_1.appointments.date,
                    time: schema_1.appointments.time,
                    startTime: schema_1.appointments.startTime,
                    endTime: schema_1.appointments.endTime,
                    duration: schema_1.appointments.duration,
                    service: schema_1.appointments.service,
                    status: schema_1.appointments.status,
                    clientId: schema_1.appointments.clientId,
                    googleEventId: schema_1.appointments.googleEventId,
                })
                    .from(schema_1.appointments)
                    .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, appointmentId))
                    .limit(1);
                if (!appointment) {
                    return { success: false, error: 'Agendamento não encontrado' };
                }
                // Busca dados do cliente
                let clientName = 'Cliente';
                if (appointment.clientId) {
                    const [client] = await connection_1.db
                        .select({ name: schema_1.clients.name })
                        .from(schema_1.clients)
                        .where((0, drizzle_orm_1.eq)(schema_1.clients.id, appointment.clientId))
                        .limit(1);
                    if (client?.name) {
                        clientName = client.name;
                    }
                }
                // Configura o cliente OAuth
                this.oauth2Client.setCredentials({
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                });
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
                // Monta o horário do evento
                const dateStr = appointment.date;
                const startTime = appointment.startTime || appointment.time;
                const endTime = appointment.endTime || this.calculateEndTime(startTime, appointment.duration);
                const event = {
                    summary: `${appointment.service} - ${clientName}`,
                    description: `Agendamento via Beauty Manager\nServiço: ${appointment.service}\nCliente: ${clientName}`,
                    start: {
                        dateTime: `${dateStr}T${startTime}:00`,
                        timeZone: 'America/Sao_Paulo',
                    },
                    end: {
                        dateTime: `${dateStr}T${endTime}:00`,
                        timeZone: 'America/Sao_Paulo',
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 30 },
                            { method: 'popup', minutes: 60 },
                        ],
                    },
                };
                let eventId;
                if (appointment.googleEventId) {
                    // Atualiza evento existente
                    const response = await calendar.events.update({
                        calendarId: 'primary',
                        eventId: appointment.googleEventId,
                        requestBody: event,
                    });
                    eventId = response.data.id;
                }
                else {
                    // Cria novo evento
                    const response = await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: event,
                    });
                    eventId = response.data.id;
                    // Salva o eventId no agendamento
                    await connection_1.db
                        .update(schema_1.appointments)
                        .set({ googleEventId: eventId })
                        .where((0, drizzle_orm_1.eq)(schema_1.appointments.id, appointmentId));
                }
                this.logger.log(`Agendamento ${appointmentId} sincronizado com Google Calendar: ${eventId}`);
                return { success: true, eventId };
            }
            catch (error) {
                this.logger.error('Erro ao sincronizar com Google:', error?.message);
                return { success: false, error: error?.message || 'Erro desconhecido' };
            }
        }
        /**
         * Remove um evento do Google Calendar
         */
        async deleteEventFromGoogle(userId, salonId, googleEventId) {
            try {
                const tokens = await this.getValidTokens(userId, salonId);
                if (!tokens) {
                    return { success: false, error: 'Google Calendar não conectado' };
                }
                this.oauth2Client.setCredentials({
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                });
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: googleEventId,
                });
                this.logger.log(`Evento ${googleEventId} removido do Google Calendar`);
                return { success: true };
            }
            catch (error) {
                // 404 não é erro - evento já foi removido
                if (error?.code === 404) {
                    return { success: true };
                }
                this.logger.error('Erro ao remover evento do Google:', error?.message);
                return { success: false, error: error?.message || 'Erro desconhecido' };
            }
        }
        /**
         * Importa eventos do Google Calendar para o sistema como bloqueios
         * (eventos pessoais do profissional que bloqueiam sua agenda)
         */
        async syncGoogleToSystem(userId, salonId, startDate, endDate) {
            try {
                const tokens = await this.getValidTokens(userId, salonId);
                if (!tokens) {
                    throw new common_1.BadRequestException('Google Calendar não conectado');
                }
                this.oauth2Client.setCredentials({
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                });
                const calendar = googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
                const response = await calendar.events.list({
                    calendarId: 'primary',
                    timeMin: startDate.toISOString(),
                    timeMax: endDate.toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime',
                    maxResults: 100,
                });
                const events = response.data.items || [];
                // Filtra eventos que não são do Beauty Manager (sem nossa descrição)
                const externalEvents = events.filter((e) => !e.description?.includes('Beauty Manager'));
                // Atualiza lastSyncAt
                await connection_1.db
                    .update(schema_1.googleCalendarTokens)
                    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.salonId, salonId)));
                return { events: externalEvents, count: externalEvents.length };
            }
            catch (error) {
                this.logger.error('Erro ao buscar eventos do Google:', error?.message);
                throw new common_1.BadRequestException('Erro ao sincronizar com Google Calendar');
            }
        }
        /**
         * Desconecta o Google Calendar do usuário
         */
        async disconnectGoogle(userId, salonId) {
            const deleted = await connection_1.db
                .delete(schema_1.googleCalendarTokens)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.salonId, salonId)))
                .returning();
            if (deleted.length === 0) {
                throw new common_1.NotFoundException('Conexão Google Calendar não encontrada');
            }
            this.logger.log(`Google Calendar desconectado para usuário ${userId}`);
        }
        /**
         * Obtém status da conexão Google Calendar
         */
        async getConnectionStatus(userId, salonId) {
            const [token] = await connection_1.db
                .select()
                .from(schema_1.googleCalendarTokens)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.salonId, salonId)))
                .limit(1);
            if (!token) {
                return { connected: false };
            }
            return {
                connected: true,
                email: token.calendarId || undefined,
                calendarId: token.calendarId || 'primary',
                lastSyncAt: token.lastSyncAt || undefined,
                syncEnabled: token.syncEnabled ?? true,
            };
        }
        /**
         * Alterna sincronização automática
         */
        async toggleSync(userId, salonId, enabled) {
            const result = await connection_1.db
                .update(schema_1.googleCalendarTokens)
                .set({ syncEnabled: enabled, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.userId, userId), (0, drizzle_orm_1.eq)(schema_1.googleCalendarTokens.salonId, salonId)))
                .returning();
            if (result.length === 0) {
                throw new common_1.NotFoundException('Conexão Google Calendar não encontrada');
            }
        }
        /**
         * Calcula horário de término baseado no início e duração
         */
        calculateEndTime(startTime, duration) {
            const [hours, minutes] = startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + duration;
            const endHours = Math.floor(totalMinutes / 60);
            const endMinutes = totalMinutes % 60;
            return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        }
    };
    return GoogleCalendarService = _classThis;
})();
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=google-calendar.service.js.map