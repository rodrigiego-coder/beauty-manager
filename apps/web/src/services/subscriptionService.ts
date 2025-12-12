import api from './api';

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

export const subscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const { data } = await api.get('/subscriptions/plans');
    return data;
  },

  getCurrentSubscription: async (): Promise<Subscription | null> => {
    const { data } = await api.get('/subscriptions/current');
    return data;
  },

  getStatus: async (): Promise<SubscriptionStatus> => {
    const { data } = await api.get('/subscriptions/status');
    return data;
  },

  changePlan: async (planId: number): Promise<void> => {
    await api.post('/subscriptions/change-plan', { planId });
  },

  cancel: async (): Promise<void> => {
    await api.patch('/subscriptions/cancel');
  },
};

export default subscriptionService;
