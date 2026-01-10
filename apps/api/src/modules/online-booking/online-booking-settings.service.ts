import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import {
  UpdateOnlineBookingSettingsDto,
  OnlineBookingSettingsResponse,
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

    if (!settings) {
      // Criar configurações padrão
      return this.createDefaultSettings(salonId);
    }

    return this.mapToResponse(settings);
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
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
        holdDurationMinutes: 10,
        cancellationHours: 24,
        allowRescheduling: true,
        maxReschedules: 2,
        requirePhoneVerification: true,
        requireDeposit: false,
        depositType: 'FIXED',
        depositValue: '0',
        depositMinServices: '100',
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
    if (dto.minAdvanceHours !== undefined) updateData.minAdvanceHours = dto.minAdvanceHours;
    if (dto.maxAdvanceDays !== undefined) updateData.maxAdvanceDays = dto.maxAdvanceDays;
    if (dto.holdDurationMinutes !== undefined) updateData.holdDurationMinutes = dto.holdDurationMinutes;
    if (dto.cancellationHours !== undefined) updateData.cancellationHours = dto.cancellationHours;
    if (dto.allowRescheduling !== undefined) updateData.allowRescheduling = dto.allowRescheduling;
    if (dto.maxReschedules !== undefined) updateData.maxReschedules = dto.maxReschedules;
    if (dto.requirePhoneVerification !== undefined) updateData.requirePhoneVerification = dto.requirePhoneVerification;
    if (dto.requireDeposit !== undefined) updateData.requireDeposit = dto.requireDeposit;
    if (dto.depositType !== undefined) updateData.depositType = dto.depositType;
    if (dto.depositValue !== undefined) updateData.depositValue = String(dto.depositValue);
    if (dto.depositMinServices !== undefined) updateData.depositMinServices = String(dto.depositMinServices);
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

    const [updated] = await this.db
      .update(schema.onlineBookingSettings)
      .set(updateData)
      .where(eq(schema.onlineBookingSettings.salonId, salonId))
      .returning();

    this.logger.log(`Configurações atualizadas para salão ${salonId}`);
    return this.mapToResponse(updated);
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
   * Mapeia entidade para response
   */
  private mapToResponse(settings: schema.OnlineBookingSettings): OnlineBookingSettingsResponse {
    return {
      id: settings.id,
      salonId: settings.salonId,
      enabled: settings.enabled,
      minAdvanceHours: settings.minAdvanceHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      holdDurationMinutes: settings.holdDurationMinutes,
      cancellationHours: settings.cancellationHours,
      allowRescheduling: settings.allowRescheduling,
      maxReschedules: settings.maxReschedules,
      requirePhoneVerification: settings.requirePhoneVerification,
      requireDeposit: settings.requireDeposit,
      depositType: settings.depositType,
      depositValue: settings.depositValue,
      depositMinServices: settings.depositMinServices,
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
