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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const database_module_1 = require("./database/database.module");
const google_calendar_1 = require("./modules/google-calendar");
const ai_receptionist_1 = require("./modules/ai-receptionist");
const products_1 = require("./modules/products");
const transactions_1 = require("./modules/transactions");
const accounts_payable_1 = require("./modules/accounts-payable");
const accounts_receivable_1 = require("./modules/accounts-receivable");
const users_1 = require("./modules/users");
const salons_1 = require("./modules/salons");
const appointments_1 = require("./modules/appointments");
const notifications_1 = require("./modules/notifications");
const consumed_products_1 = require("./modules/consumed-products");
const automations_1 = require("./modules/automations");
const audit_1 = require("./modules/audit");
const reports_1 = require("./modules/reports");
const interceptors_1 = require("./common/interceptors");
const guards_1 = require("./common/guards");
const auth_1 = require("./modules/auth");
const subscriptions_1 = require("./modules/subscriptions");
const subscription_guard_1 = require("./modules/subscriptions/subscription.guard");
const dashboard_1 = require("./modules/dashboard");
const commands_1 = require("./modules/commands");
const services_1 = require("./modules/services");
const service_consumptions_1 = require("./modules/service-consumptions");
const recipes_1 = require("./modules/recipes");
const cash_registers_1 = require("./modules/cash-registers");
const commissions_1 = require("./modules/commissions");
const team_1 = require("./modules/team");
const plans_1 = require("./modules/plans");
const mercado_pago_1 = require("./modules/mercado-pago");
const admin_1 = require("./modules/admin");
const support_1 = require("./modules/support");
const jobs_1 = require("./jobs");
const calendar_1 = require("./modules/calendar");
const automation_module_1 = require("./modules/automation/automation.module");
const hair_profile_module_1 = require("./modules/hair-profile/hair-profile.module");
const recommendations_module_1 = require("./modules/recommendations/recommendations.module");
const loyalty_module_1 = require("./modules/loyalty/loyalty.module");
const product_subscriptions_module_1 = require("./modules/product-subscriptions/product-subscriptions.module");
const upsell_module_1 = require("./modules/upsell/upsell.module");
const cart_links_module_1 = require("./modules/cart-links/cart-links.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const ab_tests_module_1 = require("./modules/ab-tests/ab-tests.module");
const ai_assistant_module_1 = require("./modules/ai-assistant/ai-assistant.module");
const alexis_module_1 = require("./modules/alexis/alexis.module");
const packages_module_1 = require("./modules/packages/packages.module");
const client_packages_module_1 = require("./modules/client-packages/client-packages.module");
const payment_methods_module_1 = require("./modules/payment-methods/payment-methods.module");
const payment_destinations_module_1 = require("./modules/payment-destinations/payment-destinations.module");
const asaas_1 = require("./modules/asaas");
const billing_1 = require("./modules/billing");
const triage_module_1 = require("./modules/triage/triage.module");
const schedules_module_1 = require("./modules/schedules/schedules.module");
const online_booking_module_1 = require("./modules/online-booking/online-booking.module");
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env.local', '.env'],
                }),
                schedule_1.ScheduleModule.forRoot(),
                jwt_1.JwtModule.register({
                    global: true,
                    secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
                    signOptions: { expiresIn: '30m' },
                }),
                // Rate limiting global: 100 requests por minuto por IP
                throttler_1.ThrottlerModule.forRoot({
                    throttlers: [
                        {
                            ttl: 60000, // 1 minuto
                            limit: 100, // max 100 requests por minuto
                        }
                    ],
                }),
                database_module_1.DatabaseModule,
                // Modulos de seguranca e compliance
                audit_1.AuditModule,
                reports_1.ReportsModule,
                // Modulo de autenticacao
                auth_1.AuthModule,
                // Modulo de assinaturas
                subscriptions_1.SubscriptionsModule,
                // Modulos de negocio
                google_calendar_1.GoogleCalendarModule,
                users_1.UsersModule,
                salons_1.SalonsModule,
                appointments_1.AppointmentsModule,
                triage_module_1.TriageModule, // Módulo de Pré-Avaliação Digital (triagem)
                ai_receptionist_1.AiReceptionistModule,
                products_1.ProductsModule,
                transactions_1.TransactionsModule,
                accounts_payable_1.AccountsPayableModule,
                accounts_receivable_1.AccountsReceivableModule,
                notifications_1.NotificationsModule,
                consumed_products_1.ConsumedProductsModule,
                automations_1.AutomationsModule,
                // Modulo de dashboard
                dashboard_1.DashboardModule,
                // Modulo de comandas
                commands_1.CommandsModule,
                services_1.ServicesModule, // Modulo de servicos
                service_consumptions_1.ServiceConsumptionsModule, // Modulo de consumo de produtos por servico (BOM - legado)
                recipes_1.RecipesModule, // Modulo de receitas versionadas com variantes
                // Modulo de caixa
                cash_registers_1.CashRegistersModule,
                // Modulo de formas de pagamento
                payment_methods_module_1.PaymentMethodsModule,
                payment_destinations_module_1.PaymentDestinationsModule,
                // Modulo de comissoes
                commissions_1.CommissionsModule,
                // Modulo de equipe
                team_1.TeamModule,
                // Modulo de planos (assinaturas)
                plans_1.PlansModule,
                // Modulo MercadoPago
                mercado_pago_1.MercadoPagoModule,
                // Modulo Asaas + Billing
                asaas_1.AsaasModule,
                billing_1.BillingModule,
                // Modulo Admin (SUPER_ADMIN)
                admin_1.AdminModule,
                // Modulo de Suporte Delegado (SUPER_ADMIN)
                support_1.SupportModule,
                // Jobs agendados
                jobs_1.JobsModule,
                // Integração Google Calendar (completa)
                calendar_1.CalendarModule,
                // Módulo de Horários e Disponibilidade
                schedules_module_1.SchedulesModule,
                // Módulo de Automação WhatsApp/SMS
                automation_module_1.AutomationModule,
                // Módulo WhatsApp (Evolution API)
                whatsapp_module_1.WhatsAppModule,
                // Módulo de Inteligência de Produto
                hair_profile_module_1.HairProfileModule,
                recommendations_module_1.RecommendationsModule,
                // Módulo de Fidelidade & Gamificação
                loyalty_module_1.LoyaltyModule,
                // Módulo de Assinaturas de Produtos
                product_subscriptions_module_1.ProductSubscriptionsModule,
                // Módulo de Upsell & Vendas (FASE D)
                upsell_module_1.UpsellModule,
                cart_links_module_1.CartLinksModule,
                reservations_module_1.ReservationsModule,
                ab_tests_module_1.ABTestsModule,
                // Módulo de IA Assistente (FASE E)
                ai_assistant_module_1.AIAssistantModule,
                // Módulo ALEXIS - IA para WhatsApp & Dashboard (ANVISA/LGPD)
                alexis_module_1.AlexisModule,
                // Módulos de Pacotes de Serviços
                packages_module_1.PackagesModule,
                client_packages_module_1.ClientPackagesModule,
                // Módulo de Agendamento Online
                online_booking_module_1.OnlineBookingModule
            ],
            controllers: [app_controller_1.AppController],
            providers: [
                // Interceptor global de auditoria
                {
                    provide: core_1.APP_INTERCEPTOR,
                    useClass: interceptors_1.AuditInterceptor,
                },
                // Rate limiting global
                {
                    provide: core_1.APP_GUARD,
                    useClass: throttler_1.ThrottlerGuard,
                },
                // Guard global de autenticacao
                {
                    provide: core_1.APP_GUARD,
                    useClass: guards_1.AuthGuard,
                },
                // Guard global de permissoes por role
                {
                    provide: core_1.APP_GUARD,
                    useClass: guards_1.RolesGuard,
                },
                // Guard global de acesso ao salao (multi-tenancy)
                {
                    provide: core_1.APP_GUARD,
                    useClass: guards_1.SalonAccessGuard,
                },
                // Guard global de verificacao de assinatura
                {
                    provide: core_1.APP_GUARD,
                    useClass: subscription_guard_1.SubscriptionGuard,
                }
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AppModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map