/**
 * =====================================================
 * INTENT CLASSIFIER SERVICE
 * Detecta a intenção do cliente na mensagem
 * =====================================================
 */
export type Intent = 'GREETING' | 'SCHEDULE' | 'RESCHEDULE' | 'CANCEL' | 'PRODUCT_INFO' | 'SERVICE_INFO' | 'LIST_SERVICES' | 'PRICE_INFO' | 'HOURS_INFO' | 'APPOINTMENT_CONFIRM' | 'APPOINTMENT_DECLINE' | 'GENERAL';
export declare class IntentClassifierService {
    /**
     * Classifica a intenção da mensagem do cliente
     */
    classify(message: string): Intent;
    /**
     * Verifica se a mensagem contém alguma das palavras-chave
     */
    private matchesAny;
    /**
     * Verifica se a mensagem é uma saudação "pura" (sem intenção real após a saudação).
     * Ex.: "Oi" => true, "Bom dia!" => true
     *      "Oi, quero saber sobre o Ultra Reconstrução" => false
     */
    private isPureGreeting;
    /**
     * Retorna uma descrição amigável da intenção
     */
    getIntentDescription(intent: Intent): string;
    /**
     * Verifica se a mensagem é um pedido de listagem de serviços
     * Ex: "quais serviços vocês fazem?", "o que vocês oferecem?"
     */
    private isListServicesIntent;
    /**
     * Verifica se a mensagem é uma confirmação de agendamento
     * Detecta: SIM, S, Sim, sim, Confirmo, Confirmado, Vou, Estarei aí
     */
    private isAppointmentConfirmation;
    /**
     * Verifica se a mensagem é uma recusa de agendamento
     * Detecta: NÃO, N, Não, não, Cancelar, Cancela, Não vou
     */
    private isAppointmentDecline;
}
//# sourceMappingURL=intent-classifier.service.d.ts.map