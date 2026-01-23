import api from './api';

// ==================== TIPOS - PLANOS SaaS ====================

export interface SaaSPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceMonthly: string;
  priceYearly: string | null;
  maxUsers: number;
  maxClients: number;
  features: string[];
  hasFiscal: boolean;
  hasAutomation: boolean;
  hasReports: boolean;
  hasAI: boolean;
}

export interface CurrentSubscription {
  id: string;
  salonId: string;
  planId: string;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';
  billingPeriod: 'MONTHLY' | 'YEARLY';
  startsAt: string;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

export interface SubscriptionLimits {
  users: number;
  clients: number;
}

export interface SubscriptionUsage {
  usersCount: number;
  clientsCount: number;
}

export interface SubscriptionStatus {
  valid: boolean;
  status: string;
  daysRemaining: number;
  message: string;
  canAccess: boolean;
}

export interface CurrentSubscriptionResponse {
  subscription: CurrentSubscription | null;
  plan: SaaSPlan | null;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  status: SubscriptionStatus;
}

// ==================== TIPOS - ADD-ONS ====================

export interface AddonCatalogItem {
  code: string;
  family: string;
  tier: string;
  quotaType: string;
  quotaAmount: number;
  priceCents: number;
  priceFormatted: string;
}

export interface CreditPackage {
  code: string;
  quotaType: string;
  qty: number;
  priceCents: number;
  priceFormatted: string;
}

export interface AddonsCatalogResponse {
  addons: AddonCatalogItem[];
  creditPackages: CreditPackage[];
}

export interface ActiveAddon {
  id: string;
  addonCode: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
  family: string;
  tier: string;
  quotaAmount: number;
  priceCents: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface WhatsAppQuota {
  included: number;
  used: number;
  includedRemaining: number;
  extraPurchased: number;
  extraUsed: number;
  extraRemaining: number;
  totalRemaining: number;
}

export interface AddonsStatusResponse {
  periodYyyymm: number;
  addons: ActiveAddon[];
  quotas: {
    whatsapp: WhatsAppQuota;
  };
}

// ==================== TIPOS - REQUESTS ====================

export interface ChangePlanRequest {
  newPlanId: string;
  billingPeriod?: 'MONTHLY' | 'YEARLY';
}

export interface ActivateAddonRequest {
  addonCode: string;
}

export interface GrantCreditsRequest {
  packageCode: string;
  qtyPackages: number;
}

// ==================== LEGACY TYPES (compatibilidade) ====================

/** @deprecated Use SaaSPlan instead */
export interface SubscriptionPlan {
  id: number;
  name: string;
  code: 'BASIC' | 'PRO' | 'PREMIUM';
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: {
    maxUsers: number;
    maxClients: number;
    hasReports: boolean;
    hasAI: boolean;
    hasApi: boolean;
  };
  trialDays: number;
}

/** @deprecated Use CurrentSubscription instead */
export interface Subscription {
  id: number;
  salonId: string;
  planId: number;
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  plan?: SubscriptionPlan;
}

// ==================== SERVICE ====================

export const subscriptionService = {
  // -------- PLANOS SaaS --------

  /**
   * GET /subscriptions/plans
   * Lista todos os planos SaaS disponíveis
   */
  getPlans: async (): Promise<SaaSPlan[]> => {
    const { data } = await api.get('/subscriptions/plans');
    return data;
  },

  /**
   * GET /subscriptions/current
   * Retorna a assinatura atual do salão com plano, limites, uso e status
   */
  getCurrentSubscription: async (): Promise<CurrentSubscriptionResponse> => {
    const { data } = await api.get('/subscriptions/current');
    return data;
  },

  /**
   * GET /subscriptions/status
   * Retorna apenas o status da assinatura
   */
  getStatus: async (): Promise<SubscriptionStatus> => {
    const { data } = await api.get('/subscriptions/status');
    return data;
  },

  /**
   * POST /subscriptions/change-plan
   * Troca o plano do salão (requer OWNER)
   */
  changePlan: async (request: ChangePlanRequest): Promise<CurrentSubscription> => {
    const { data } = await api.post('/subscriptions/change-plan', request);
    return data;
  },

  /**
   * POST /subscriptions/cancel
   * Cancela a assinatura (requer OWNER)
   */
  cancel: async (cancelAtPeriodEnd = true): Promise<void> => {
    await api.post('/subscriptions/cancel', { cancelAtPeriodEnd });
  },

  /**
   * POST /subscriptions/reactivate
   * Reativa a assinatura (requer OWNER)
   */
  reactivate: async (): Promise<void> => {
    await api.post('/subscriptions/reactivate', {});
  },

  // -------- ADD-ONS --------

  /**
   * GET /subscriptions/addons/catalog
   * Lista o catálogo de add-ons disponíveis (WhatsApp, Alexis, etc)
   */
  getAddonsCatalog: async (): Promise<AddonsCatalogResponse> => {
    const { data } = await api.get('/subscriptions/addons/catalog');
    return data;
  },

  /**
   * GET /subscriptions/addons/status
   * Retorna os add-ons ativos do salão e quotas do mês atual
   */
  getAddonsStatus: async (): Promise<AddonsStatusResponse> => {
    const { data } = await api.get('/subscriptions/addons/status');
    return data;
  },

  /**
   * POST /subscriptions/addons/activate
   * Ativa um add-on para o salão (requer OWNER ou MANAGER)
   */
  activateAddon: async (addonCode: string): Promise<ActiveAddon> => {
    const { data } = await api.post('/subscriptions/addons/activate', { addonCode });
    return data;
  },

  /**
   * POST /subscriptions/credits/grant
   * Compra créditos extras (requer OWNER ou MANAGER)
   * NOTA: Este endpoint é para concessão de créditos.
   * Em produção, deve passar por fluxo de pagamento.
   */
  grantCredits: async (packageCode: string, qtyPackages: number): Promise<void> => {
    await api.post('/subscriptions/credits/grant', { packageCode, qtyPackages });
  },
};

export default subscriptionService;
