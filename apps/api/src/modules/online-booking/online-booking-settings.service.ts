import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import {
  UpdateOnlineBookingSettingsDto,
  OnlineBookingSettingsResponse,
  GenerateAssistedLinkDto,
  AssistedLinkResponse,
} from './dto';

@Injectable()
export class OnlineBookingSettingsService {
  private readonly logger = new Logger(OnlineBookingSettingsService.name);

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Obtém as configurações de booking online do salão
   * Cria configurações padrão se não existirem
   */
  async getSettings(salonId: string): Promise<OnlineBookingSettingsResponse> {
    const [settings] = await this.db
      .select()
      .from(schema.onlineBookingSettings)
      .where(eq(schema.onlineBookingSettings.salonId, salonId))
      .limit(1);

    // Busca slug do salão
    const [salon] = await this.db
      .select({ slug: schema.salons.slug })
      .from(schema.salons)
      .where(eq(schema.salons.id, salonId))
      .limit(1);

    if (!settings) {
      // Criar configurações padrão
      const defaultSettings = await this.createDefaultSettings(salonId);
      return { ...defaultSettings, slug: salon?.slug || null };
    }

    return this.mapToResponse(settings, salon?.slug || null);
  }

  /**
   * Cria configurações padrão para o salão
   */
  async createDefaultSettings(salonId: string): Promise<OnlineBookingSettingsResponse> {
    const [newSettings] = await this.db
      .insert(schema.onlineBookingSettings)
      .values({
        salonId,
        enabled: false,
        operationMode: 'SECRETARY_ONLY',
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
        slotIntervalMinutes: 30,
        allowSameDayBooking: true,
        holdDurationMinutes: 10,
        cancellationHours: 24,
        allowRescheduling: true,
        maxReschedules: 2,
        requirePhoneVerification: true,
        requireDeposit: false,
        depositType: 'NONE',
        depositValue: '0',
        depositMinServices: '100',
        depositAppliesTo: 'ALL',
        allowNewClients: true,
        newClientRequiresApproval: false,
        newClientDepositRequired: false,
        maxWeeklyBookingsPerClient: 3,
        sendWhatsappConfirmation: true,
        sendWhatsappReminder: true,
        reminderHoursBefore: 24,
      })
      .returning();

    this.logger.log(`Configurações padrão criadas para salão ${salonId}`);
    return this.mapToResponse(newSettings);
  }

  /**
   * Atualiza as configurações de booking online
   */
  async updateSettings(
    salonId: string,
    dto: UpdateOnlineBookingSettingsDto,
  ): Promise<OnlineBookingSettingsResponse> {
    // Garante que existem configurações
    await this.getSettings(salonId);

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Mapeia campos do DTO
    if (dto.enabled !== undefined) updateData.enabled = dto.enabled;
    if (dto.operationMode !== undefined) updateData.operationMode = dto.operationMode;
    if (dto.minAdvanceHours !== undefined) updateData.minAdvanceHours = dto.minAdvanceHours;
    if (dto.maxAdvanceDays !== undefined) updateData.maxAdvanceDays = dto.maxAdvanceDays;
    if (dto.slotIntervalMinutes !== undefined) updateData.slotIntervalMinutes = dto.slotIntervalMinutes;
    if (dto.allowSameDayBooking !== undefined) updateData.allowSameDayBooking = dto.allowSameDayBooking;
    if (dto.holdDurationMinutes !== undefined) updateData.holdDurationMinutes = dto.holdDurationMinutes;
    if (dto.cancellationHours !== undefined) updateData.cancellationHours = dto.cancellationHours;
    if (dto.cancellationPolicy !== undefined) updateData.cancellationPolicy = dto.cancellationPolicy;
    if (dto.allowRescheduling !== undefined) updateData.allowRescheduling = dto.allowRescheduling;
    if (dto.maxReschedules !== undefined) updateData.maxReschedules = dto.maxReschedules;
    if (dto.requirePhoneVerification !== undefined) updateData.requirePhoneVerification = dto.requirePhoneVerification;
    if (dto.requireDeposit !== undefined) updateData.requireDeposit = dto.requireDeposit;
    if (dto.depositType !== undefined) {
      updateData.depositType = dto.depositType;
      // Quando NONE, zera o valor e desabilita exigência de depósito
      if (dto.depositType === 'NONE') {
        updateData.depositValue = '0';
        updateData.requireDeposit = false;
      }
    }
    if (dto.depositValue !== undefined && dto.depositType !== 'NONE') {
      updateData.depositValue = String(dto.depositValue);
    }
    if (dto.depositMinServices !== undefined) updateData.depositMinServices = String(dto.depositMinServices);
    if (dto.depositAppliesTo !== undefined) updateData.depositAppliesTo = dto.depositAppliesTo;
    if (dto.allowNewClients !== undefined) updateData.allowNewClients = dto.allowNewClients;
    if (dto.newClientRequiresApproval !== undefined) updateData.newClientRequiresApproval = dto.newClientRequiresApproval;
    if (dto.newClientDepositRequired !== undefined) updateData.newClientDepositRequired = dto.newClientDepositRequired;
    if (dto.maxDailyBookings !== undefined) updateData.maxDailyBookings = dto.maxDailyBookings;
    if (dto.maxWeeklyBookingsPerClient !== undefined) updateData.maxWeeklyBookingsPerClient = dto.maxWeeklyBookingsPerClient;
    if (dto.welcomeMessage !== undefined) updateData.welcomeMessage = dto.welcomeMessage;
    if (dto.confirmationMessage !== undefined) updateData.confirmationMessage = dto.confirmationMessage;
    if (dto.cancellationMessage !== undefined) updateData.cancellationMessage = dto.cancellationMessage;
    if (dto.termsUrl !== undefined) updateData.termsUrl = dto.termsUrl;
    if (dto.requireTermsAcceptance !== undefined) updateData.requireTermsAcceptance = dto.requireTermsAcceptance;
    if (dto.sendWhatsappConfirmation !== undefined) updateData.sendWhatsappConfirmation = dto.sendWhatsappConfirmation;
    if (dto.sendWhatsappReminder !== undefined) updateData.sendWhatsappReminder = dto.sendWhatsappReminder;
    if (dto.reminderHoursBefore !== undefined) updateData.reminderHoursBefore = dto.reminderHoursBefore;

    // Atualiza o slug na tabela salons (se fornecido)
    let updatedSlug: string | null = null;
    if (dto.slug !== undefined && dto.slug !== '') {
      await this.db
        .update(schema.salons)
        .set({ slug: dto.slug, updatedAt: new Date() })
        .where(eq(schema.salons.id, salonId));
      updatedSlug = dto.slug;
      this.logger.log(`Slug atualizado para salão ${salonId}: ${dto.slug}`);
    } else {
      // Busca slug atual do salão
      const [salon] = await this.db
        .select({ slug: schema.salons.slug })
        .from(schema.salons)
        .where(eq(schema.salons.id, salonId))
        .limit(1);
      updatedSlug = salon?.slug || null;
    }

    const [updated] = await this.db
      .update(schema.onlineBookingSettings)
      .set(updateData)
      .where(eq(schema.onlineBookingSettings.salonId, salonId))
      .returning();

    this.logger.log(`Configurações atualizadas para salão ${salonId}`);
    return this.mapToResponse(updated, updatedSlug);
  }

  /**
   * Habilita/desabilita o booking online
   */
  async toggleEnabled(salonId: string, enabled: boolean): Promise<OnlineBookingSettingsResponse> {
    return this.updateSettings(salonId, { enabled });
  }

  /**
   * Verifica se o booking online está habilitado para o salão
   */
  async isEnabled(salonId: string): Promise<boolean> {
    const settings = await this.getSettings(salonId);
    return settings.enabled;
  }

  /**
   * Gera link assistido para Alexia enviar ao cliente
   * O link leva direto para a página de agendamento com parâmetros pré-preenchidos
   */
  async generateAssistedLink(dto: GenerateAssistedLinkDto): Promise<AssistedLinkResponse> {
    const [salon] = await this.db
      .select()
      .from(schema.salons)
      .where(eq(schema.salons.id, dto.salonId))
      .limit(1);

    if (!salon) {
      throw new NotFoundException('Salão não encontrado');
    }

    const params = new URLSearchParams();
    if (dto.serviceId) params.set('service', String(dto.serviceId));
    if (dto.professionalId) params.set('professional', dto.professionalId);
    if (dto.clientPhone) params.set('phone', dto.clientPhone);
    params.set('source', 'alexia');

    const baseUrl = process.env.FRONTEND_URL || 'https://app.beautymanager.com.br';
    const slug = salon.slug || salon.id;

    return {
      url: `${baseUrl}/agendar/${slug}?${params.toString()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    };
  }

  /**
   * Mapeia entidade para response
   */
  private mapToResponse(settings: schema.OnlineBookingSettings, slug: string | null = null): OnlineBookingSettingsResponse {
    return {
      id: settings.id,
      salonId: settings.salonId,
      slug,
      enabled: settings.enabled,
      operationMode: settings.operationMode ?? 'SECRETARY_ONLY',
      minAdvanceHours: settings.minAdvanceHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      slotIntervalMinutes: settings.slotIntervalMinutes ?? 30,
      allowSameDayBooking: settings.allowSameDayBooking ?? true,
      holdDurationMinutes: settings.holdDurationMinutes,
      cancellationHours: settings.cancellationHours,
      cancellationPolicy: settings.cancellationPolicy,
      allowRescheduling: settings.allowRescheduling,
      maxReschedules: settings.maxReschedules,
      requirePhoneVerification: settings.requirePhoneVerification,
      requireDeposit: settings.requireDeposit,
      depositType: settings.depositType,
      depositValue: settings.depositValue,
      depositMinServices: settings.depositMinServices,
      depositAppliesTo: settings.depositAppliesTo ?? 'ALL',
      allowNewClients: settings.allowNewClients,
      newClientRequiresApproval: settings.newClientRequiresApproval,
      newClientDepositRequired: settings.newClientDepositRequired,
      maxDailyBookings: settings.maxDailyBookings,
      maxWeeklyBookingsPerClient: settings.maxWeeklyBookingsPerClient,
      welcomeMessage: settings.welcomeMessage,
      confirmationMessage: settings.confirmationMessage,
      cancellationMessage: settings.cancellationMessage,
      termsUrl: settings.termsUrl,
      requireTermsAcceptance: settings.requireTermsAcceptance ?? false,
      sendWhatsappConfirmation: settings.sendWhatsappConfirmation ?? true,
      sendWhatsappReminder: settings.sendWhatsappReminder ?? true,
      reminderHoursBefore: settings.reminderHoursBefore ?? 24,
    };
  }
}
