import { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  X,
  Zap,
  Users,
  BarChart3,
  Bot,
  Code,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import subscriptionService, {
  SubscriptionPlan,
  Subscription,
} from '../services/subscriptionService';

export function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(),
      ]);
      setPlans(plansData);
      setCurrentSubscription(subData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!currentSubscription) return 0;
    const end = new Date(currentSubscription.currentPeriodEnd);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = () => {
    if (!currentSubscription) return null;
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ativo' },
      TRIAL: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Periodo de Teste' },
      PAST_DUE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pagamento Pendente' },
      CANCELED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado' },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspenso' },
    };
    const config = statusConfig[currentSubscription.status] || statusConfig.ACTIVE;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'BASIC': return <Zap className="w-8 h-8" />;
      case 'PRO': return <Crown className="w-8 h-8" />;
      case 'PREMIUM': return <Crown className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  const getPlanColor = (code: string) => {
    switch (code) {
      case 'BASIC': return 'from-gray-500 to-gray-600';
      case 'PRO': return 'from-primary-500 to-primary-600';
      case 'PREMIUM': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-gray-500 mt-1">Gerencie seu plano e faturamento</p>
      </div>

      {/* Status atual */}
      {currentSubscription && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getPlanColor(currentSubscription.plan?.code || 'BASIC')} text-white`}>
                {getPlanIcon(currentSubscription.plan?.code || 'BASIC')}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    Plano {currentSubscription.plan?.name}
                  </h2>
                  {getStatusBadge()}
                </div>
                <p className="text-gray-500 mt-1">
                  {currentSubscription.status === 'TRIAL' 
                    ? `Seu periodo de teste termina em ${getDaysRemaining()} dias`
                    : `Proxima cobranca em ${getDaysRemaining()} dias`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(currentSubscription.plan?.monthlyPrice || '0')}
              </p>
              <p className="text-gray-500">/mes</p>
            </div>
          </div>

          {currentSubscription.status === 'TRIAL' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Periodo de teste</p>
                <p className="text-sm text-blue-700">
                  Aproveite todos os recursos do plano {currentSubscription.plan?.name} gratuitamente. 
                  Apos o periodo de teste, sua assinatura sera ativada automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle mensal/anual */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Mensal
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-primary-600' : 'bg-gray-300'
          }`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
          }`} />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Anual
        </span>
        <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          2 meses gratis
        </span>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id;
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
                isCurrentPlan 
                  ? 'border-primary-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                  Plano Atual
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(plan.code)} text-white flex items-center justify-center mb-4`}>
                {getPlanIcon(plan.code)}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(price)}
                </span>
                <span className="text-gray-500">
                  /{billingCycle === 'monthly' ? 'mes' : 'ano'}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{plan.features.maxUsers === 999 ? 'Usuarios ilimitados' : `Ate ${plan.features.maxUsers} usuarios`}</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{plan.features.maxClients === 9999 ? 'Clientes ilimitados' : `Ate ${plan.features.maxClients} clientes`}</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {plan.features.hasReports ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={!plan.features.hasReports ? 'text-gray-400' : ''}>
                    Relatorios avancados
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {plan.features.hasAI ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={!plan.features.hasAI ? 'text-gray-400' : ''}>
                    <Bot className="w-4 h-4 inline mr-1" />
                    Assistente IA
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {plan.features.hasApi ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={!plan.features.hasApi ? 'text-gray-400' : ''}>
                    <Code className="w-4 h-4 inline mr-1" />
                    Acesso a API
                  </span>
                </li>
              </ul>

              <button
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900">Posso cancelar a qualquer momento?</p>
            <p className="text-sm text-gray-500 mt-1">
              Sim, voce pode cancelar sua assinatura a qualquer momento. O acesso continua ate o fim do periodo pago.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Como funciona o periodo de teste?</p>
            <p className="text-sm text-gray-500 mt-1">
              Voce tem acesso completo ao plano escolhido durante o periodo de teste. Nao cobramos nada ate o fim do teste.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Posso mudar de plano depois?</p>
            <p className="text-sm text-gray-500 mt-1">
              Sim, voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor sera ajustado proporcionalmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}