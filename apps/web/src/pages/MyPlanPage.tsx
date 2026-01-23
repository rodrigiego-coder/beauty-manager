import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bot,
  Calculator,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Clock,
  Gift,
  Star,
  AlertTriangle,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import subscriptionService, {
  SaaSPlan,
  CurrentSubscriptionResponse,
  AddonsCatalogResponse,
  AddonsStatusResponse,
} from '../services/subscriptionService';

// ==================== TIPOS LOCAIS ====================

interface PlanFeature {
  name: string;
  included: boolean;
}

interface DisplayPlan extends Omit<SaaSPlan, 'features'> {
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

// ==================== CONSTANTES ====================

const FAQ_ITEMS = [
  {
    question: 'Preciso de cartao de credito para comecar?',
    answer: 'Nao! Voce pode comecar com o periodo de teste gratuito de 14 dias sem cadastrar cartao. Apos o teste, oferecemos PIX, boleto e cartao.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, sem multa e sem burocracia. Voce pode cancelar diretamente pelo sistema e continua usando até o fim do periodo pago.',
  },
  {
    question: 'E se eu precisar de mais usuarios?',
    answer: 'Voce pode fazer upgrade do plano a qualquer momento. O valor é calculado proporcional ao tempo restante.',
  },
  {
    question: 'Meus dados ficam seguros?',
    answer: 'Sim! Usamos criptografia de ponta e backups automaticos. Seus dados sao 100% seus e voce pode exportar quando quiser.',
  },
  {
    question: 'O WhatsApp automatico funciona com meu numero?',
    answer: 'Sim! Integramos com seu numero existente via Z-API. Nao precisa trocar de numero nem perder conversas.',
  },
];

// Feature list for plans display (using backend codes: ESSENTIAL, PROFESSIONAL, MASTER)
const ALL_FEATURES = [
  { key: 'agenda', label: 'Agenda inteligente', requiredPlan: 'ESSENTIAL' },
  { key: 'clients', label: 'Cadastro de clientes', requiredPlan: 'ESSENTIAL' },
  { key: 'commands', label: 'Comandas digitais', requiredPlan: 'ESSENTIAL' },
  { key: 'reports', label: 'Relatorios', checkFn: (plan: SaaSPlan) => plan.hasReports },
  { key: 'commissions', label: 'Comissoes automaticas', requiredPlan: 'PROFESSIONAL' },
  { key: 'finance', label: 'Financeiro completo', requiredPlan: 'PROFESSIONAL' },
  { key: 'whatsapp', label: 'WhatsApp automatico', checkFn: (plan: SaaSPlan) => plan.hasAutomation },
  { key: 'ai', label: 'Assistente IA (Alexis)', checkFn: (plan: SaaSPlan) => plan.hasAI },
];

// Helper to build features list for a plan
function buildPlanFeatures(plan: SaaSPlan): PlanFeature[] {
  const planOrder = ['ESSENTIAL', 'PROFESSIONAL', 'MASTER'];
  const planIndex = planOrder.indexOf(plan.code);

  return ALL_FEATURES.map((feat) => {
    if (feat.checkFn) {
      return { name: feat.label, included: feat.checkFn(plan) };
    }
    const requiredIndex = planOrder.indexOf(feat.requiredPlan || 'ESSENTIAL');
    return { name: feat.label, included: planIndex >= requiredIndex };
  });
}

// ==================== COMPONENTES ====================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
      <p className="text-gray-500">Carregando planos...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-700 font-medium mb-2">Erro ao carregar dados</p>
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function CurrentPlanBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700' },
    TRIALING: { label: 'Periodo de Teste', color: 'bg-blue-100 text-blue-700' },
    PAST_DUE: { label: 'Pagamento Pendente', color: 'bg-amber-100 text-amber-700' },
    CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
    SUSPENDED: { label: 'Suspenso', color: 'bg-gray-100 text-gray-700' },
  };

  const config = statusConfig[status] || statusConfig.ACTIVE;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function PlanCard({
  plan,
  billingCycle,
  isCurrentPlan,
  subscriptionStatus,
  onSelect,
  isLoading,
}: {
  plan: DisplayPlan;
  billingCycle: 'MONTHLY' | 'YEARLY';
  isCurrentPlan: boolean;
  subscriptionStatus?: string;
  onSelect: (plan: DisplayPlan) => void;
  isLoading: boolean;
}) {
  const priceMonthly = parseFloat(plan.priceMonthly);
  const priceYearly = plan.priceYearly ? parseFloat(plan.priceYearly) : priceMonthly * 10;
  const price = billingCycle === 'MONTHLY' ? priceMonthly : priceYearly;
  const perMonth = billingCycle === 'YEARLY' ? (priceYearly / 12).toFixed(2) : null;

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
        plan.highlighted
          ? 'border-primary-500 shadow-xl scale-105 z-10'
          : isCurrentPlan
            ? 'border-emerald-500 shadow-lg'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
          <CheckCircle2 className="w-3 h-3" />
          Seu Plano
        </div>
      )}

      {/* Badge */}
      {plan.badge && !isCurrentPlan && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
            plan.highlighted
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          {plan.badge}
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          plan.highlighted
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
            : isCurrentPlan
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600'
        }`}
      >
        {plan.code === 'ESSENTIAL' && <Zap className="w-7 h-7" />}
        {plan.code === 'PROFESSIONAL' && <Crown className="w-7 h-7" />}
        {plan.code === 'MASTER' && <Sparkles className="w-7 h-7" />}
      </div>

      {/* Name & Description */}
      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="text-gray-500 text-sm mt-1 min-h-[40px]">{plan.description || ''}</p>

      {/* Status for current plan */}
      {isCurrentPlan && subscriptionStatus && (
        <div className="mt-2">
          <CurrentPlanBadge status={subscriptionStatus} />
        </div>
      )}

      {/* Price */}
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-gray-500">/{billingCycle === 'MONTHLY' ? 'mes' : 'ano'}</span>
        </div>
        {perMonth && (
          <p className="text-sm text-primary-600 font-medium mt-1">
            Equivale a R$ {perMonth.replace('.', ',')}/mes
          </p>
        )}
      </div>

      {/* Limits */}
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Users className="w-4 h-4" />
          <span>{plan.maxUsers} usuarios</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{plan.maxClients >= 10000 ? 'Ilimitado' : plan.maxClients} clientes</span>
        </div>
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            {feature.included ? (
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrentPlan || isLoading}
        className={`w-full mt-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
            : plan.highlighted
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isCurrentPlan ? (
          'Plano Atual'
        ) : plan.highlighted ? (
          'Comecar Agora'
        ) : (
          'Selecionar'
        )}
      </button>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {open && <p className="pb-4 text-gray-600 text-sm">{answer}</p>}
    </div>
  );
}

// ==================== PAGINA PRINCIPAL ====================

export function MyPlanPage() {
  // API Data state
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscriptionResponse | null>(null);
  const [addonsCatalog, setAddonsCatalog] = useState<AddonsCatalogResponse | null>(null);
  const [addonsStatus, setAddonsStatus] = useState<AddonsStatusResponse | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [activatingAddon, setActivatingAddon] = useState<string | null>(null);

  // Local state
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedWhatsappCode, setSelectedWhatsappCode] = useState<string | null>(null);
  const [selectedAlexisCode, setSelectedAlexisCode] = useState<string | null>(null);

  // Calculadora de perdas
  const [calcFaltas, setCalcFaltas] = useState(10);
  const [calcTicket, setCalcTicket] = useState(80);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansData, currentData, catalogData, statusData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getAddonsCatalog(),
        subscriptionService.getAddonsStatus(),
      ]);

      setPlans(plansData);
      setCurrentSub(currentData);
      setAddonsCatalog(catalogData);
      setAddonsStatus(statusData);

      // Set billing cycle from current subscription
      if (currentData.subscription?.billingPeriod) {
        setBillingCycle(currentData.subscription.billingPeriod);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Transform plans for display
  const displayPlans: DisplayPlan[] = useMemo(() => {
    return plans.map((plan) => ({
      ...plan,
      features: buildPlanFeatures(plan),
      highlighted: plan.code === 'PROFESSIONAL',
      badge: plan.code === 'PROFESSIONAL' ? 'Mais Popular' : plan.code === 'MASTER' ? 'Completo' : undefined,
    }));
  }, [plans]);

  // Get WhatsApp addons from catalog
  const whatsappAddons = useMemo(() => {
    if (!addonsCatalog) return [];
    return addonsCatalog.addons.filter((a) => a.family === 'WHATSAPP');
  }, [addonsCatalog]);

  // Get Alexis addons from catalog
  const alexisAddons = useMemo(() => {
    if (!addonsCatalog) return [];
    return addonsCatalog.addons.filter((a) => a.family === 'ALEXIS');
  }, [addonsCatalog]);

  // Get active WhatsApp addon
  const activeWhatsappAddon = useMemo(() => {
    if (!addonsStatus) return null;
    return addonsStatus.addons.find((a) => a.family === 'WHATSAPP' && a.status === 'ACTIVE');
  }, [addonsStatus]);

  // Get active Alexis addon
  const activeAlexisAddon = useMemo(() => {
    if (!addonsStatus) return null;
    return addonsStatus.addons.find((a) => a.family === 'ALEXIS' && a.status === 'ACTIVE');
  }, [addonsStatus]);

  // Calculator values
  const lossPerMonth = useMemo(() => calcFaltas * calcTicket, [calcFaltas, calcTicket]);
  const robotCost = whatsappAddons.length > 0 ? whatsappAddons[0].priceCents / 100 : 29.90;
  const potentialSavings = useMemo(() => Math.max(0, lossPerMonth * 0.7 - robotCost), [lossPerMonth, robotCost]);

  // Handlers
  const handleSelectPlan = async (plan: DisplayPlan) => {
    if (changingPlan) return;

    const confirmed = window.confirm(
      `Deseja mudar para o plano ${plan.name}?\n` +
      `Valor: R$ ${(billingCycle === 'MONTHLY' ? parseFloat(plan.priceMonthly) : parseFloat(plan.priceYearly || plan.priceMonthly)).toFixed(2)}/${billingCycle === 'MONTHLY' ? 'mes' : 'ano'}`
    );

    if (!confirmed) return;

    setChangingPlan(true);
    try {
      await subscriptionService.changePlan({
        newPlanId: plan.id,
        billingPeriod: billingCycle,
      });
      // Reload data after change
      await loadData();
      alert('Plano alterado com sucesso!');
    } catch (err) {
      console.error('Failed to change plan:', err);
      alert(err instanceof Error ? err.message : 'Erro ao trocar de plano');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleActivateAddon = async (addonCode: string) => {
    if (activatingAddon) return;

    const addon = addonsCatalog?.addons.find((a) => a.code === addonCode);
    if (!addon) return;

    const confirmed = window.confirm(
      `Deseja ativar ${addon.code}?\n` +
      `Valor: ${addon.priceFormatted}/mes`
    );

    if (!confirmed) return;

    setActivatingAddon(addonCode);
    try {
      await subscriptionService.activateAddon(addonCode);
      // Reload data after activation
      await loadData();
      alert('Add-on ativado com sucesso!');
    } catch (err) {
      console.error('Failed to activate addon:', err);
      alert(err instanceof Error ? err.message : 'Erro ao ativar add-on');
    } finally {
      setActivatingAddon(null);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const currentPlanId = currentSub?.subscription?.planId;
  const subscriptionStatus = currentSub?.subscription?.status;

  return (
    <div className="space-y-16 pb-16">
      {/* ==================== HERO ==================== */}
      <section className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Invista no seu salao</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Nao perca mais horarios.
          <br />
          <span className="text-primary-600">Automatize seu salao.</span>
        </h1>
        <p className="text-xl text-gray-600 mt-4">
          Agenda, comissoes, financeiro e WhatsApp automatico em um so lugar.
          <br />
          Comece gratis por 14 dias.
        </p>

        {/* Current subscription info */}
        {currentSub?.subscription && currentSub?.plan && (
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              Voce esta no plano <strong>{currentSub.plan.name}</strong>
            </span>
            <CurrentPlanBadge status={currentSub.subscription.status} />
          </div>
        )}

        {/* Trial info */}
        {currentSub?.subscription?.status === 'TRIALING' && currentSub?.status?.daysRemaining !== undefined && (
          <p className="mt-2 text-amber-600 text-sm">
            {currentSub.status.daysRemaining > 0
              ? `${currentSub.status.daysRemaining} dias restantes no periodo de teste`
              : 'Seu periodo de teste termina hoje!'}
          </p>
        )}

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-8 mt-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">+500 saloes</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-sm text-gray-600 ml-1">4.9/5</span>
          </div>
        </div>
      </section>

      {/* ==================== BILLING TOGGLE ==================== */}
      <section className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-full">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'YEARLY'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Anual
          </button>
        </div>
        {billingCycle === 'YEARLY' && (
          <div className="flex items-center gap-2 text-emerald-600">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">2 meses gratis + Setup VIP incluso</span>
          </div>
        )}
      </section>

      {/* ==================== PLANS GRID ==================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4 max-w-5xl mx-auto px-4">
        {displayPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={plan.id === currentPlanId}
            subscriptionStatus={subscriptionStatus}
            onSelect={handleSelectPlan}
            isLoading={changingPlan}
          />
        ))}
      </section>

      {/* ==================== USAGE STATS ==================== */}
      {currentSub?.usage && currentSub?.limits && (
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Uso do seu plano</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Usuarios</span>
                  <span className="font-medium">{currentSub.usage.usersCount} / {currentSub.limits.users}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (currentSub.usage.usersCount / currentSub.limits.users) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Clientes</span>
                  <span className="font-medium">{currentSub.usage.clientsCount} / {currentSub.limits.clients >= 10000 ? '∞' : currentSub.limits.clients}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${currentSub.limits.clients >= 10000 ? 10 : Math.min(100, (currentSub.usage.clientsCount / currentSub.limits.clients) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== WHATSAPP ADD-ON ==================== */}
      {whatsappAddons.length > 0 && (
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Turbine com WhatsApp</h2>
              <p className="text-gray-600">Confirmacao automatica de agendamentos</p>
            </div>
            {activeWhatsappAddon && (
              <span className="ml-auto px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                Ativo: {activeWhatsappAddon.tier}
              </span>
            )}
          </div>

          {/* WhatsApp Quota Info */}
          {addonsStatus?.quotas?.whatsapp && (
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Agendamentos usados este mes</span>
                <span className="font-medium">
                  {addonsStatus.quotas.whatsapp.used} / {addonsStatus.quotas.whatsapp.included + addonsStatus.quotas.whatsapp.extraPurchased}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (addonsStatus.quotas.whatsapp.used / (addonsStatus.quotas.whatsapp.included + addonsStatus.quotas.whatsapp.extraPurchased || 1)) * 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Restantes: {addonsStatus.quotas.whatsapp.totalRemaining}
              </p>
            </div>
          )}

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {whatsappAddons.map((addon) => {
              const isActive = activeWhatsappAddon?.addonCode === addon.code;
              const isSelected = selectedWhatsappCode === addon.code;

              return (
                <button
                  key={addon.code}
                  onClick={() => !isActive && setSelectedWhatsappCode(addon.code)}
                  disabled={isActive}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-green-500 bg-green-50 cursor-default'
                      : isSelected
                        ? 'border-green-500 bg-white shadow-md'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{addon.tier}</div>
                      <div className="text-sm text-gray-500">{addon.quotaAmount} agendamentos/mes</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{addon.priceFormatted}</div>
                      {isActive && (
                        <span className="text-xs text-green-600 font-medium">Ativo</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CTA */}
          {!activeWhatsappAddon && selectedWhatsappCode && (
            <div className="flex justify-end">
              <button
                onClick={() => handleActivateAddon(selectedWhatsappCode)}
                disabled={activatingAddon === selectedWhatsappCode}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                {activatingAddon === selectedWhatsappCode ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Ativar WhatsApp'
                )}
              </button>
            </div>
          )}

          {/* Credit packages */}
          {addonsCatalog?.creditPackages && addonsCatalog.creditPackages.length > 0 && (
            <div className="mt-6 p-4 bg-green-100 rounded-xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium text-green-900">Precisa de mais?</span>
                  <span className="text-green-700 text-sm ml-2">
                    +{addonsCatalog.creditPackages[0]?.qty || 20} agendamentos por {addonsCatalog.creditPackages[0]?.priceFormatted || 'R$ 10,00'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== ALEXIS ADD-ON ==================== */}
      {alexisAddons.length > 0 && (
        <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Alexis - Assistente IA</h2>
              <p className="text-gray-600">Atendimento 24/7 que entende seu cliente</p>
            </div>
            {activeAlexisAddon && (
              <span className="ml-auto px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                Ativo: {activeAlexisAddon.tier}
              </span>
            )}
          </div>

          {/* Dependency Note */}
          {!activeWhatsappAddon && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg mb-6 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Requer WhatsApp ativo para funcionar</span>
            </div>
          )}

          {/* Alexis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alexisAddons.map((addon) => {
              const isActive = activeAlexisAddon?.addonCode === addon.code;
              const isSelected = selectedAlexisCode === addon.code;

              return (
                <button
                  key={addon.code}
                  onClick={() => !isActive && setSelectedAlexisCode(addon.code)}
                  disabled={isActive || !activeWhatsappAddon}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 cursor-default'
                      : isSelected
                        ? 'border-purple-500 bg-white shadow-md'
                        : !activeWhatsappAddon
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{addon.tier}</h3>
                    <span className="text-xl font-bold text-purple-600">
                      {addon.priceFormatted}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{addon.quotaAmount} interacoes/mes</p>
                  {isActive && (
                    <span className="text-xs text-purple-600 font-medium">Ativo</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          {!activeAlexisAddon && selectedAlexisCode && activeWhatsappAddon && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleActivateAddon(selectedAlexisCode)}
                disabled={activatingAddon === selectedAlexisCode}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                {activatingAddon === selectedAlexisCode ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Ativar Alexis'
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ==================== LOSS CALCULATOR ==================== */}
      <section className="bg-gray-900 text-white rounded-3xl p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Calculadora de Perdas</h2>
            <p className="text-gray-400">Descubra quanto voce perde com faltas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Faltas por mes (media)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={calcFaltas}
                onChange={(e) => setCalcFaltas(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Ticket medio (R$)
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={calcTicket}
                onChange={(e) => setCalcTicket(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Perda mensal estimada</span>
              <span className="text-2xl font-bold text-red-400">
                R$ {lossPerMonth.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Custo do robo (WhatsApp)</span>
              <span className="text-lg text-gray-300">
                R$ {robotCost.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
              <span className="text-gray-300 font-medium">Economia potencial (70% reducao)</span>
              <span className="text-3xl font-bold text-emerald-400">
                R$ {potentialSavings.toFixed(2).replace('.', ',')}
              </span>
            </div>
            {potentialSavings > 0 && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>ROI de {((potentialSavings / robotCost) * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== TRUST BADGES ==================== */}
      <section className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="text-sm">Dados criptografados</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="text-sm">Suporte em até 2h</span>
        </div>
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5" />
          <span className="text-sm">Garantia de 30 dias</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          <span className="text-sm">Cancele quando quiser</span>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h2>
          <p className="text-gray-500 mt-2">Tire suas duvidas antes de comecar</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {FAQ_ITEMS.map((item, idx) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="text-center bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 max-w-4xl mx-auto text-white">
        <h2 className="text-3xl font-bold mb-4">Pronto para transformar seu salao?</h2>
        <p className="text-primary-100 mb-8 text-lg">
          Junte-se a +500 saloes que ja automatizaram sua gestao
        </p>
        <button
          onClick={() => {
            const proPlano = displayPlans.find((p) => p.highlighted);
            if (proPlano && proPlano.id !== currentPlanId) {
              handleSelectPlan(proPlano);
            }
          }}
          disabled={displayPlans.find((p) => p.highlighted)?.id === currentPlanId}
          className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-colors ${
            displayPlans.find((p) => p.highlighted)?.id === currentPlanId
              ? 'bg-white/50 text-primary-300 cursor-not-allowed'
              : 'bg-white text-primary-700 hover:bg-gray-100'
          }`}
        >
          {displayPlans.find((p) => p.highlighted)?.id === currentPlanId
            ? 'Voce ja esta no melhor plano!'
            : 'Comecar Teste Gratuito de 14 Dias'}
        </button>
        <p className="text-primary-200 text-sm mt-4">Sem cartao de credito. Sem compromisso.</p>
      </section>
    </div>
  );
}

export default MyPlanPage;
