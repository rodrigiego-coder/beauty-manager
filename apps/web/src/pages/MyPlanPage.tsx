import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Crown,
  Zap,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Shield,
  Clock,
  Gift,
  Star,
  Rocket,
  BadgeCheck,
  ArrowRight,
  Phone,
  Brain,
  Target,
} from 'lucide-react';
import subscriptionService, {
  SaaSPlan,
  CurrentSubscriptionResponse,
  AddonsCatalogResponse,
  AddonsStatusResponse,
} from '../services/subscriptionService';

// ==================== TIPOS ====================

interface DisplayPlan extends SaaSPlan {
  icon: React.ReactNode;
  gradient: string;
  popular?: boolean;
}

// ==================== CONSTANTES ====================

const FAQ_ITEMS = [
  {
    q: 'Preciso de cartao para comecar?',
    a: 'Nao! Teste gratis por 14 dias sem cadastrar cartao. Depois aceita PIX, boleto ou cartao.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem multa. Cancele pelo sistema e use ate o fim do periodo pago.',
  },
  {
    q: 'O WhatsApp funciona com meu numero?',
    a: 'Sim! Conectamos seu numero existente. Nao precisa trocar.',
  },
  {
    q: 'Como funciona a Alexis?',
    a: 'Ela responde automaticamente pelo WhatsApp 24/7, agenda clientes e tira duvidas.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim! Criptografia em transito, exportacao de dados e conformidade com LGPD.',
  },
];

// ==================== COMPONENTES ====================

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
      <p className="text-gray-500">Carregando seu plano...</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: 'Ativo', class: 'bg-emerald-100 text-emerald-700' },
    TRIALING: { label: 'Teste Gratis', class: 'bg-blue-100 text-blue-700' },
    PAST_DUE: { label: 'Pagamento Pendente', class: 'bg-amber-100 text-amber-700' },
    CANCELED: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
    SUSPENDED: { label: 'Suspenso', class: 'bg-gray-100 text-gray-700' },
  };
  const c = config[status] || config.ACTIVE;
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.class}`}>{c.label}</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="font-medium text-gray-800">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && <p className="pb-4 text-gray-600 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

function FeatureCheck({ included }: { included: boolean }) {
  return included ? (
    <Check className="w-5 h-5 text-emerald-500" />
  ) : (
    <X className="w-5 h-5 text-gray-300" />
  );
}

// ==================== PAGINA PRINCIPAL ====================

export function MyPlanPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscriptionResponse | null>(null);
  const [addonsCatalog, setAddonsCatalog] = useState<AddonsCatalogResponse | null>(null);
  const [addonsStatus, setAddonsStatus] = useState<AddonsStatusResponse | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [changingPlan, setChangingPlan] = useState(false);
  const [activatingAddon, setActivatingAddon] = useState<string | null>(null);

  // Calculadora ROI
  const [faltasMes, setFaltasMes] = useState(8);
  const [ticketMedio, setTicketMedio] = useState(80);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, subData, catalogData, statusData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getAddonsCatalog(),
        subscriptionService.getAddonsStatus(),
      ]);
      setPlans(plansData);
      setCurrentSub(subData);
      setAddonsCatalog(catalogData);
      setAddonsStatus(statusData);
      if (subData.subscription?.billingPeriod) {
        setBillingCycle(subData.subscription.billingPeriod);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Display plans with icons
  const displayPlans: DisplayPlan[] = useMemo(() => {
    return plans.map((p) => ({
      ...p,
      icon: p.code === 'ESSENTIAL' ? <Zap className="w-6 h-6" /> : p.code === 'PROFESSIONAL' ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />,
      gradient: p.code === 'ESSENTIAL' ? 'from-gray-500 to-gray-600' : p.code === 'PROFESSIONAL' ? 'from-primary-500 to-primary-600' : 'from-amber-500 to-orange-500',
      popular: p.code === 'PROFESSIONAL',
    }));
  }, [plans]);

  // WhatsApp addons
  const whatsappAddons = useMemo(() => addonsCatalog?.addons.filter((a) => a.family === 'WHATSAPP') || [], [addonsCatalog]);
  const activeWhatsapp = useMemo(() => addonsStatus?.addons.find((a) => a.family === 'WHATSAPP' && a.status === 'ACTIVE'), [addonsStatus]);

  // Alexis addons
  const alexisAddons = useMemo(() => addonsCatalog?.addons.filter((a) => a.family === 'ALEXIS') || [], [addonsCatalog]);
  const activeAlexis = useMemo(() => addonsStatus?.addons.find((a) => a.family === 'ALEXIS' && a.status === 'ACTIVE'), [addonsStatus]);

  // ROI calc
  const perdaMensal = faltasMes * ticketMedio;
  const custoRobo = 29.9;
  const economiaPotencial = Math.max(0, perdaMensal * 0.7 - custoRobo);
  const retornoPorReal = custoRobo > 0 ? (economiaPotencial / custoRobo).toFixed(2) : '0';

  // Plan order for upgrade/downgrade logic
  const planOrder = ['ESSENTIAL', 'PROFESSIONAL', 'MASTER'];
  const currentPlanIndex = currentSub?.plan?.code ? planOrder.indexOf(currentSub.plan.code) : -1;

  // Handlers
  const handleChangePlan = async (plan: DisplayPlan) => {
    if (changingPlan || plan.id === currentSub?.subscription?.planId) return;
    const price = billingCycle === 'MONTHLY' ? parseFloat(plan.priceMonthly) : parseFloat(plan.priceYearly || plan.priceMonthly);
    if (!confirm(`Mudar para ${plan.name} por R$ ${price.toFixed(2).replace('.', ',')}/${billingCycle === 'MONTHLY' ? 'mes' : 'ano'}?`)) return;
    setChangingPlan(true);
    try {
      await subscriptionService.changePlan({ newPlanId: plan.id, billingPeriod: billingCycle });
      await loadData();
      alert('Plano alterado com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao trocar plano');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleActivateAddon = async (code: string) => {
    if (activatingAddon) return;
    const addon = addonsCatalog?.addons.find((a) => a.code === code);
    if (!addon) return;
    if (!confirm(`Ativar ${addon.code} por ${addon.priceFormatted}/mes?`)) return;
    setActivatingAddon(code);
    try {
      await subscriptionService.activateAddon(code);
      await loadData();
      alert('Add-on ativado!');
    } catch (err: any) {
      alert(err.message || 'Erro ao ativar add-on');
    } finally {
      setActivatingAddon(null);
    }
  };

  if (loading) return <LoadingScreen />;

  const currentPlan = currentSub?.plan;
  const subscription = currentSub?.subscription;
  const usage = currentSub?.usage;
  const limits = currentSub?.limits;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* ========== BLOCO 1: CABECALHO ========== */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Meu Plano</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPlan?.code === 'ESSENTIAL' ? 'from-gray-500 to-gray-600' : currentPlan?.code === 'PROFESSIONAL' ? 'from-primary-500 to-primary-600' : 'from-amber-500 to-orange-500'} flex items-center justify-center`}>
                  {currentPlan?.code === 'ESSENTIAL' && <Zap className="w-6 h-6" />}
                  {currentPlan?.code === 'PROFESSIONAL' && <Crown className="w-6 h-6" />}
                  {currentPlan?.code === 'MASTER' && <Sparkles className="w-6 h-6" />}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{currentPlan?.name || 'Sem plano'}</h1>
                  {subscription && <StatusBadge status={subscription.status} />}
                </div>
              </div>

              {subscription?.status === 'TRIALING' && currentSub?.status?.daysRemaining !== undefined && (
                <p className="text-amber-400 text-sm mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {currentSub.status.daysRemaining} dias restantes no teste gratuito
                </p>
              )}
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{usage?.usersCount || 0}<span className="text-lg text-gray-400">/{limits?.users || 1}</span></div>
                <div className="text-gray-400 text-sm flex items-center justify-center gap-1"><Users className="w-4 h-4" /> Usuarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{usage?.clientsCount || 0}<span className="text-lg text-gray-400">/{limits?.clients || 200}</span></div>
                <div className="text-gray-400 text-sm flex items-center justify-center gap-1"><Calendar className="w-4 h-4" /> Clientes</div>
              </div>
            </div>
          </div>

          {/* Quotas WhatsApp */}
          {addonsStatus?.quotas?.whatsapp && activeWhatsapp && (
            <div className="mt-6 bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Confirmacoes WhatsApp (este mes)
                </span>
                <span className="font-semibold">
                  {addonsStatus.quotas.whatsapp.used} / {addonsStatus.quotas.whatsapp.included + addonsStatus.quotas.whatsapp.extraPurchased}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (addonsStatus.quotas.whatsapp.used / (addonsStatus.quotas.whatsapp.included + addonsStatus.quotas.whatsapp.extraPurchased || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Restantes: {addonsStatus.quotas.whatsapp.totalRemaining}</p>
            </div>
          )}
        </div>
      </section>

      {/* ========== BLOCO 2: MICRO-TABELA DE PLANOS ========== */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Compare e Escolha</h2>
          <p className="text-gray-500 mt-1">Invista no crescimento do seu salao</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-full inline-flex">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'MONTHLY' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'YEARLY' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
            >
              Anual <span className="text-emerald-600 ml-1">-17%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayPlans.map((plan) => {
            const isCurrent = plan.id === subscription?.planId;
            const price = billingCycle === 'MONTHLY' ? parseFloat(plan.priceMonthly) : parseFloat(plan.priceYearly || plan.priceMonthly);
            const perMonth = billingCycle === 'YEARLY' ? (price / 12).toFixed(2) : null;
            const thisPlanIndex = planOrder.indexOf(plan.code);
            const isUpgrade = thisPlanIndex > currentPlanIndex;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
                  plan.popular ? 'border-primary-500 shadow-xl scale-[1.02]' : isCurrent ? 'border-emerald-500 shadow-lg' : 'border-gray-200 hover:shadow-lg'
                }`}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> SEU PLANO
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} text-white flex items-center justify-center mb-4`}>
                  {plan.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm mt-1 h-10">{plan.description}</p>

                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">R$ {price.toFixed(0)}</span>
                    <span className="text-gray-500">/{billingCycle === 'MONTHLY' ? 'mes' : 'ano'}</span>
                  </div>
                  {perMonth && <p className="text-sm text-primary-600">= R$ {perMonth}/mes</p>}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{plan.maxUsers} {plan.maxUsers === 1 ? 'usuario' : 'usuarios'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{plan.maxClients >= 5000 ? '5.000+' : plan.maxClients} clientes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FeatureCheck included={true} />
                    <span className="text-gray-700">Agenda + Comandas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FeatureCheck included={plan.hasReports} />
                    <span className={plan.hasReports ? 'text-gray-700' : 'text-gray-400'}>Relatorios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FeatureCheck included={plan.hasAutomation} />
                    <span className={plan.hasAutomation ? 'text-gray-700' : 'text-gray-400'}>WhatsApp Auto</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FeatureCheck included={plan.hasAI} />
                    <span className={plan.hasAI ? 'text-gray-700' : 'text-gray-400'}>Alexis IA</span>
                  </div>
                </div>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-semibold bg-slate-100 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Seu plano atual
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleChangePlan(plan)}
                    disabled={changingPlan}
                    className="w-full py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2"
                  >
                    {changingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Subir para {plan.name} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                ) : (
                  <button
                    onClick={() => handleChangePlan(plan)}
                    disabled={changingPlan}
                    className="w-full py-3 rounded-xl font-semibold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    {changingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : `Mudar para ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== BLOCO 3: ROI / CALCULADORA ========== */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Calculadora de Perdas</h2>
            <p className="text-emerald-200">Descubra quanto voce perde com faltas</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-emerald-200 text-sm mb-2">Quantas faltas por mes?</label>
              <input
                type="number"
                min={0}
                max={50}
                value={faltasMes}
                onChange={(e) => setFaltasMes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-white/10 border border-emerald-600 rounded-xl text-white text-lg focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-emerald-200 text-sm mb-2">Ticket medio (R$)</label>
              <input
                type="number"
                min={0}
                max={500}
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 bg-white/10 border border-emerald-600 rounded-xl text-white text-lg focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-200">Perda mensal</span>
              <span className="text-2xl font-bold text-red-400">- R$ {perdaMensal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-200">Custo do robo</span>
              <span className="text-lg">R$ {custoRobo.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="border-t border-emerald-600 pt-4 flex justify-between items-center">
              <span className="font-medium">Economia potencial (70%)</span>
              <span className="text-3xl font-bold text-emerald-300">+ R$ {economiaPotencial.toFixed(0)}</span>
            </div>
            {parseFloat(retornoPorReal) > 0 && (
              <div className="flex items-center gap-2 text-emerald-300">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Para cada R$1 investido, voce recupera R$ {retornoPorReal}</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-emerald-200 text-sm text-center">
          * Estimativa baseada em medias de mercado. Resultados podem variar.
        </p>
      </section>

      {/* ========== BLOCO 4: WHATSAPP ADD-ON ========== */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Confirmacao WhatsApp</h2>
            <p className="text-gray-600">Reduza faltas com confirmacao automatica</p>
          </div>
          {activeWhatsapp && (
            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              ATIVO
            </span>
          )}
        </div>

        {!currentPlan?.hasAutomation && (
          <div className="flex items-center gap-2 text-fuchsia-600 bg-fuchsia-50 px-4 py-3 rounded-xl mb-6 mt-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">+ WhatsApp Automatico (14 dias gratis) - Faca upgrade!</span>
          </div>
        )}

        {currentPlan?.hasAutomation && (
          <>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {whatsappAddons.slice(0, 4).map((addon) => {
                const isActive = activeWhatsapp?.addonCode === addon.code;
                return (
                  <button
                    key={addon.code}
                    onClick={() => !isActive && handleActivateAddon(addon.code)}
                    disabled={isActive || !!activatingAddon}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900">{addon.quotaAmount} confirmacoes/mes</div>
                        <div className="text-sm text-gray-500">{addon.tier}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{addon.priceFormatted}</div>
                        {isActive && <span className="text-xs text-green-600">Ativo</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {addonsCatalog?.creditPackages && addonsCatalog.creditPackages.length > 0 && (
              <div className="mt-6 bg-green-100 rounded-xl p-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-green-900">
                  <strong>Precisa de mais?</strong> +{addonsCatalog.creditPackages[0].qty} confirmacoes por {addonsCatalog.creditPackages[0].priceFormatted}
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {/* ========== BLOCO 5: ALEXIS ADD-ON ========== */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Alexis - Assistente IA</h2>
              <p className="text-purple-200">Atendimento 24/7 que converte</p>
            </div>
            {activeAlexis && (
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                ATIVO
              </span>
            )}
          </div>

          {!currentPlan?.hasAI && (
            <div className="flex items-center gap-2 bg-fuchsia-500/20 px-4 py-3 rounded-xl mb-6 mt-4">
              <Sparkles className="w-5 h-5 text-fuchsia-300" />
              <span className="text-fuchsia-100 font-medium">+ Alexis IA (300 atendimentos gratis por 14 dias) - Faca upgrade!</span>
            </div>
          )}

          {!activeWhatsapp && currentPlan?.hasAI && (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl mb-6 mt-4">
              <Phone className="w-5 h-5 text-green-300" />
              <span className="text-purple-100">Ative o WhatsApp primeiro para liberar a Alexis</span>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <Bot className="w-8 h-8 text-purple-300 mb-2" />
              <h4 className="font-semibold mb-1">Responde 24/7</h4>
              <p className="text-purple-200 text-sm">Nunca perca um cliente por demora</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Calendar className="w-8 h-8 text-purple-300 mb-2" />
              <h4 className="font-semibold mb-1">Agenda Sozinha</h4>
              <p className="text-purple-200 text-sm">Marca horarios automaticamente</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Sparkles className="w-8 h-8 text-purple-300 mb-2" />
              <h4 className="font-semibold mb-1">Inteligente</h4>
              <p className="text-purple-200 text-sm">Entende o contexto do seu salao</p>
            </div>
          </div>

          {alexisAddons.length > 0 && currentPlan?.hasAI && activeWhatsapp && !activeAlexis && (
            <>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {alexisAddons.map((addon) => (
                  <div
                    key={addon.code}
                    className="p-4 rounded-xl border-2 border-white/20 bg-white/5"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{addon.tier}</div>
                        <div className="text-sm text-purple-200">{addon.quotaAmount} interacoes/mes</div>
                      </div>
                      <div className="text-xl font-bold">{addon.priceFormatted}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => alexisAddons[0] && handleActivateAddon(alexisAddons[0].code)}
                disabled={!!activatingAddon}
                className="w-full mt-8 bg-white text-purple-700 py-4 rounded-2xl font-black text-lg hover:bg-purple-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {activatingAddon ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Ativar Alexis (300 atendimentos gratis)</>}
              </button>
              <p className="text-xs text-center text-purple-200 mt-2">Teste expira em 30 dias. Depois voce decide.</p>
            </>
          )}

          {alexisAddons.length > 0 && currentPlan?.hasAI && activeWhatsapp && activeAlexis && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {alexisAddons.map((addon) => {
                const isActive = activeAlexis?.addonCode === addon.code;
                return (
                  <div
                    key={addon.code}
                    className={`p-4 rounded-xl border-2 ${isActive ? 'border-white/50 bg-white/20' : 'border-white/20 bg-white/5'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{addon.tier}</div>
                        <div className="text-sm text-purple-200">{addon.quotaAmount} interacoes/mes</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{addon.priceFormatted}</div>
                        {isActive && <span className="text-xs text-green-300">Ativo</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!currentPlan?.hasAI && (
            <button
              onClick={() => {
                const proPlan = displayPlans.find((p) => p.code === 'PROFESSIONAL');
                if (proPlan) handleChangePlan(proPlan);
              }}
              className="mt-8 w-full bg-white text-purple-700 py-4 rounded-2xl font-black text-lg hover:bg-purple-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Fazer Upgrade para ter Alexis
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* ========== BLOCO 6: FAQ + TRUST ========== */}
      <section className="grid md:grid-cols-2 gap-8">
        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Duvidas Frequentes</h3>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        {/* Trust */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Por que nos confiam</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">Dados criptografados e LGPD</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">Suporte por WhatsApp</span>
              </div>
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">14 dias gratis, sem cartao</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">Cancele quando quiser</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold">Feito para saloes</div>
                <div className="text-gray-400 text-sm">que querem crescer</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Agenda, financeiro e automacao em um so lugar</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MyPlanPage;
