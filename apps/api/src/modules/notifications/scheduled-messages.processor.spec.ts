import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { WhatsAppService } from '../automation/whatsapp.service';
import { AuditService } from '../audit/audit.service';
import { AddonsService } from '../subscriptions/addons.service';

describe('ScheduledMessagesProcessor', () => {
  let processor: ScheduledMessagesProcessor;
  let scheduledMessagesService: jest.Mocked<ScheduledMessagesService>;
  let whatsappService: jest.Mocked<WhatsAppService>;
  let auditService: jest.Mocked<AuditService>;
  let addonsService: jest.Mocked<AddonsService>;

  // IDs de teste
  const SALON_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const APPOINTMENT_ID = 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const NOTIFICATION_ID = 'ccccccc1-cccc-cccc-cccc-cccccccccccc';

  // Mock de mensagem de confirmação
  const mockConfirmationMessage = {
    id: NOTIFICATION_ID,
    salon_id: SALON_ID,
    appointment_id: APPOINTMENT_ID,
    recipient_phone: '5511999999999',
    recipient_name: 'Cliente Teste',
    notification_type: 'APPOINTMENT_CONFIRMATION',
    template_key: 'appointment_confirmation',
    template_variables: {
      nome: 'Cliente Teste',
      data: 'segunda-feira, 20 de janeiro',
      horario: '14:30',
      servico: 'Corte de Cabelo',
      profissional: 'Profissional Demo',
    },
    attempts: 0,
    status: 'PENDING',
  };

  // Silence Nest Logger to avoid noise in test output
  let logErrorSpy: jest.SpyInstance;
  let logWarnSpy: jest.SpyInstance;
  let logLogSpy: jest.SpyInstance;
  let logDebugSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Silence Logger — prevents "[ScheduledMessagesProcessor] [Quota] ..." noise
    logErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    logWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    logLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    logDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

    // Reset all mocks
    jest.clearAllMocks();

    // Mocks dos serviços
    const mockScheduledMessagesService = {
      getPendingMessagesWithLock: jest.fn(),
      updateMessageStatus: jest.fn(),
      scheduleRetry: jest.fn(),
    };

    const mockWhatsappService = {
      sendMessage: jest.fn(),
      sendDirectMessage: jest.fn(),
    };

    const mockAuditService = {
      logWhatsAppSent: jest.fn(),
    };

    const mockAddonsService = {
      consumeWhatsAppQuota: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledMessagesProcessor,
        { provide: ScheduledMessagesService, useValue: mockScheduledMessagesService },
        { provide: WhatsAppService, useValue: mockWhatsappService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: AddonsService, useValue: mockAddonsService },
      ],
    }).compile();

    processor = module.get<ScheduledMessagesProcessor>(ScheduledMessagesProcessor);
    scheduledMessagesService = module.get(ScheduledMessagesService);
    whatsappService = module.get(WhatsAppService);
    auditService = module.get(AuditService);
    addonsService = module.get(AddonsService);
  });

  afterEach(() => {
    logErrorSpy.mockRestore();
    logWarnSpy.mockRestore();
    logLogSpy.mockRestore();
    logDebugSpy.mockRestore();
  });

  describe('processScheduledMessages', () => {
    // ========================================
    // TESTE 1: Quota=0 -> NÃO chama envio, marca FAILED
    // ========================================
    it('quando quota=0, NÃO deve chamar envio e marcar como FAILED com QUOTA_EXCEEDED', async () => {
      // Arrange: 1 mensagem pendente
      scheduledMessagesService.getPendingMessagesWithLock.mockResolvedValue([mockConfirmationMessage]);

      // Quota excedida (402)
      addonsService.consumeWhatsAppQuota.mockRejectedValue(
        new HttpException(
          {
            code: 'QUOTA_EXCEEDED',
            message: 'Quota de WhatsApp excedida',
            needed: 1,
            remaining: 0,
            suggestedAction: 'buy_credit_or_upgrade',
            packageCode: 'WHATSAPP_EXTRA_20',
          },
          HttpStatus.PAYMENT_REQUIRED,
        ),
      );

      // Act
      await processor.processScheduledMessages();

      // Assert
      // 1. Verificou quota
      expect(addonsService.consumeWhatsAppQuota).toHaveBeenCalledWith(
        SALON_ID,
        APPOINTMENT_ID,
        'APPOINTMENT_CONFIRMATION',
      );

      // 2. NÃO chamou envio
      expect(whatsappService.sendMessage).not.toHaveBeenCalled();
      expect(whatsappService.sendDirectMessage).not.toHaveBeenCalled();

      // 3. Marcou como FAILED com QUOTA_EXCEEDED
      expect(scheduledMessagesService.updateMessageStatus).toHaveBeenCalledWith(
        NOTIFICATION_ID,
        'FAILED',
        undefined,
        expect.stringContaining('QUOTA_EXCEEDED'),
      );

      // 4. Registrou audit log de bloqueio
      expect(auditService.logWhatsAppSent).toHaveBeenCalledWith(
        expect.objectContaining({
          salonId: SALON_ID,
          appointmentId: APPOINTMENT_ID,
          success: false,
          error: expect.stringContaining('QUOTA_EXCEEDED'),
        }),
      );
    });

    // ========================================
    // TESTE 2: Quota>0 -> segue fluxo normal e envia
    // ========================================
    it('quando quota>0, deve consumir quota, enviar mensagem e marcar como SENT', async () => {
      // Arrange: 1 mensagem pendente
      scheduledMessagesService.getPendingMessagesWithLock.mockResolvedValue([mockConfirmationMessage]);

      // Quota disponível
      addonsService.consumeWhatsAppQuota.mockResolvedValue({
        success: true,
        source: 'INCLUDED',
        periodYyyymm: 202601,
        ledgerId: 'ledger-123',
        remaining: { included: 159, extra: 0, total: 159 },
      });

      // Envio com sucesso
      whatsappService.sendMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      // Act
      await processor.processScheduledMessages();

      // Assert
      // 1. Consumiu quota
      expect(addonsService.consumeWhatsAppQuota).toHaveBeenCalledWith(
        SALON_ID,
        APPOINTMENT_ID,
        'APPOINTMENT_CONFIRMATION',
      );

      // 2. Chamou envio
      expect(whatsappService.sendMessage).toHaveBeenCalledWith(
        SALON_ID,
        mockConfirmationMessage.recipient_phone,
        expect.any(String),
      );

      // 3. Marcou como SENT
      expect(scheduledMessagesService.updateMessageStatus).toHaveBeenCalledWith(
        NOTIFICATION_ID,
        'SENT',
        'msg-123',
      );

      // 4. Registrou audit log de sucesso
      expect(auditService.logWhatsAppSent).toHaveBeenCalledWith(
        expect.objectContaining({
          salonId: SALON_ID,
          appointmentId: APPOINTMENT_ID,
          success: true,
        }),
      );
    });

    // ========================================
    // TESTE 3: Idempotência - mesma chamada não consome duas vezes
    // ========================================
    it('idempotência: quando já consumido, deve retornar sucesso sem consumir novamente', async () => {
      // Arrange: 1 mensagem pendente
      scheduledMessagesService.getPendingMessagesWithLock.mockResolvedValue([mockConfirmationMessage]);

      // Quota já consumida (retorna sucesso idempotente)
      addonsService.consumeWhatsAppQuota.mockResolvedValue({
        success: true,
        source: 'INCLUDED',
        periodYyyymm: 202601,
        ledgerId: 'ledger-existente',
        remaining: { included: 158, extra: 0, total: 158 },
      });

      // Envio com sucesso
      whatsappService.sendMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      // Act - Primeira chamada
      await processor.processScheduledMessages();

      // Assert
      expect(addonsService.consumeWhatsAppQuota).toHaveBeenCalledTimes(1);
      expect(whatsappService.sendMessage).toHaveBeenCalledTimes(1);
      expect(scheduledMessagesService.updateMessageStatus).toHaveBeenCalledWith(
        NOTIFICATION_ID,
        'SENT',
        'msg-456',
      );
    });

    // ========================================
    // TESTE 4: Mensagens de outros tipos NÃO verificam quota
    // ========================================
    it('mensagens de lembrete (não confirmação) NÃO devem verificar quota', async () => {
      // Arrange: mensagem de lembrete
      const reminderMessage = {
        ...mockConfirmationMessage,
        notification_type: 'APPOINTMENT_REMINDER_24H',
      };
      scheduledMessagesService.getPendingMessagesWithLock.mockResolvedValue([reminderMessage]);

      // Envio com sucesso
      whatsappService.sendMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-reminder',
      });

      // Act
      await processor.processScheduledMessages();

      // Assert
      // NÃO verificou quota para lembrete
      expect(addonsService.consumeWhatsAppQuota).not.toHaveBeenCalled();

      // Mas enviou normalmente
      expect(whatsappService.sendMessage).toHaveBeenCalled();
      expect(scheduledMessagesService.updateMessageStatus).toHaveBeenCalledWith(
        NOTIFICATION_ID,
        'SENT',
        'msg-reminder',
      );
    });

    // ========================================
    // TESTE 5: Erro técnico na quota -> permite envio (degradação graciosa)
    // ========================================
    it('erro técnico na verificação de quota deve permitir envio (degradação graciosa)', async () => {
      // Arrange
      scheduledMessagesService.getPendingMessagesWithLock.mockResolvedValue([mockConfirmationMessage]);

      // Erro técnico (não é 402)
      addonsService.consumeWhatsAppQuota.mockRejectedValue(new Error('Database connection failed'));

      // Envio com sucesso
      whatsappService.sendMessage.mockResolvedValue({
        success: true,
        messageId: 'msg-789',
      });

      // Act
      await processor.processScheduledMessages();

      // Assert - deve continuar e enviar mesmo com erro de quota
      expect(whatsappService.sendMessage).toHaveBeenCalled();
      expect(scheduledMessagesService.updateMessageStatus).toHaveBeenCalledWith(
        NOTIFICATION_ID,
        'SENT',
        'msg-789',
      );

      // Assert - logger.error foi chamado (prova de degradação graciosa logada)
      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao verificar quota'),
      );
    });
  });
});
