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

export interface SubscriptionStatus {
  valid: boolean;
  status: string;
  daysRemaining: number;
  message: string;
}

const mockPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Basico',
    code: 'BASIC',
    description: 'Ideal para saloes pequenos',
    monthlyPrice: '79.90',
    yearlyPrice: '799.00',
    features: { maxUsers: 3, maxClients: 100, hasReports: false, hasAI: false, hasApi: false },
    trialDays: 30,
  },
  {
    id: 2,
    name: 'Profissional',
    code: 'PRO',
    description: 'Para saloes em crescimento',
    monthlyPrice: '149.90',
    yearlyPrice: '1499.00',
    features: { maxUsers: 10, maxClients: 500, hasReports: true, hasAI: true, hasApi: false },
    trialDays: 30,
  },
  {
    id: 3,
    name: 'Premium',
    code: 'PREMIUM',
    description: 'Solucao completa para grandes saloes',
    monthlyPrice: '299.90',
    yearlyPrice: '2999.00',
    features: { maxUsers: 999, maxClients: 9999, hasReports: true, hasAI: true, hasApi: true },
    trialDays: 30,
  },
];

const mockSubscription: Subscription = {
  id: 1,
  salonId: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  planId: 2,
  status: 'TRIAL',
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const subscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    return mockPlans;
  },

  getCurrentSubscription: async (): Promise<Subscription | null> => {
    return { ...mockSubscription, plan: mockPlans[1] };
  },

  getStatus: async (): Promise<SubscriptionStatus> => {
    return {
      valid: true,
      status: 'TRIAL',
      daysRemaining: 30,
      message: 'Periodo de teste: 30 dias restantes',
    };
  },

  changePlan: async (planId: number): Promise<void> => {
    console.log('Trocar para plano:', planId);
  },

  cancel: async (): Promise<void> => {
    console.log('Cancelar assinatura');
  },
};

export default subscriptionService;