// Tipos flexíveis (não hardcoded) - valores vêm do backend
export type PaymentMethodType = string;
export type PaymentDestinationType = string;
export type FeeType = 'DISCOUNT' | 'FEE';
export type FeeMode = 'PERCENT' | 'FIXED';

// Interface para forma de pagamento (alinhada com backend)
export interface PaymentMethod {
  id: string;
  salonId: string;
  name: string;
  type: string; // Flexível: CASH, PIX, CARD_CREDIT, etc.
  feeType?: FeeType | null;
  feeMode?: FeeMode | null;
  feeValue?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para destino de pagamento (alinhada com backend)
export interface PaymentDestination {
  id: string;
  salonId: string;
  name: string;
  type: string; // Flexível: BANK, CARD_MACHINE, CASH_DRAWER, etc.
  bankName?: string | null;
  lastDigits?: string | null;
  description?: string | null;
  feeType?: FeeType | null;
  feeMode?: FeeMode | null;
  feeValue?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para pagamento na comanda (alinhada com backend)
export interface CommandPayment {
  id: string;
  commandId: string;
  method?: string | null; // Legado
  paymentMethodId?: string | null;
  paymentDestinationId?: string | null;
  amount: string;
  grossAmount?: string | null;
  feeAmount?: string | null;
  netAmount?: string | null;
  receivedById: string;
  paidAt: string;
  notes?: string | null;
  createdAt: string;
  // Populated relations (optional)
  paymentMethod?: PaymentMethod | null;
  paymentDestination?: PaymentDestination | null;
}

// DTOs para criar/atualizar métodos
export interface CreatePaymentMethodData {
  name: string;
  type: string;
  feeType?: FeeType;
  feeMode?: FeeMode;
  feeValue?: number;
  sortOrder?: number;
}

export interface UpdatePaymentMethodData {
  name?: string;
  type?: string;
  feeType?: FeeType | null;
  feeMode?: FeeMode | null;
  feeValue?: number;
  sortOrder?: number;
  active?: boolean;
}

// DTOs para criar/atualizar destinos
export interface CreatePaymentDestinationData {
  name: string;
  type: string;
  bankName?: string;
  lastDigits?: string;
  description?: string;
  feeType?: FeeType;
  feeMode?: FeeMode;
  feeValue?: number;
  sortOrder?: number;
}

export interface UpdatePaymentDestinationData {
  name?: string;
  type?: string;
  bankName?: string | null;
  lastDigits?: string | null;
  description?: string | null;
  feeType?: FeeType | null;
  feeMode?: FeeMode | null;
  feeValue?: number;
  sortOrder?: number;
  active?: boolean;
}

// DTO para adicionar pagamento na comanda
export interface AddPaymentData {
  paymentMethodId: string;
  paymentDestinationId?: string; // Opcional
  amount: number;
  notes?: string;
}

// Resposta do addPayment com auto-close
export interface AddPaymentResponse {
  payment: CommandPayment;
  command: {
    id: string;
    status: string;
    totalNet: string;
    [key: string]: unknown;
  };
  autoClosed: boolean;
  message: string;
  loyaltyPointsEarned?: number;
  tierUpgraded?: boolean;
  newTierName?: string;
}

// Labels para exibição - carregados do contexto, mas mantemos defaults comuns
export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  DISCOUNT: 'Desconto',
  FEE: 'Taxa',
};

export const FEE_MODE_LABELS: Record<FeeMode, string> = {
  PERCENT: 'Percentual (%)',
  FIXED: 'Valor Fixo (R$)',
};

// Labels auxiliares (podem ser usados para fallback na UI)
export const COMMON_METHOD_TYPE_LABELS: Record<string, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CARD_CREDIT: 'Cartão de Crédito',
  CARD_DEBIT: 'Cartão de Débito',
  TRANSFER: 'Transferência',
  VOUCHER: 'Vale/Voucher',
  OTHER: 'Outros',
};

export const COMMON_DESTINATION_TYPE_LABELS: Record<string, string> = {
  BANK: 'Banco',
  CARD_MACHINE: 'Maquininha',
  CASH_DRAWER: 'Caixa/Gaveta',
  OTHER: 'Outros',
};

// Helper para formatar label de tipo (com fallback)
export function getMethodTypeLabel(type: string): string {
  return COMMON_METHOD_TYPE_LABELS[type] || type;
}

export function getDestinationTypeLabel(type: string): string {
  return COMMON_DESTINATION_TYPE_LABELS[type] || type;
}
