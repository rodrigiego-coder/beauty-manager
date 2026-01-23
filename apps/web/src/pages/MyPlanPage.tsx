import { useState, useMemo } from 'react';
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
} from 'lucide-react';

// ==================== TIPOS ====================

interface SaaSPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxClients: number;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
  badge?: string;
}

interface WhatsAppAddon {
  tier: 'BASIC' | 'PRO';
  name: string;
  quotaOptions: number[];
  basePriceMonthly: number;
  pricePerUnit: number;
}

interface AlexisAddon {
  tier: 'LITE' | 'PRO';
  name: string;
  description: string;
  priceMonthly: number;
  features: string[];
}

// ==================== DADOS ESTATICOS (TODO: integrar via API) ====================

const SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'essencial',
    code: 'ESSENCIAL',
    name: 'Essencial',
    description: 'Para quem esta comecando e quer organizar a agenda',
    priceMonthly: 59.90,
    priceYearly: 599.00, // 10x (2 meses gratis)
    maxUsers: 2,
    maxClients: 500,
    features: [
      { name: 'Agenda inteligente', included: true },
      { name: 'Cadastro de clientes', included: true },
      { name: 'Comandas digitais', included: true },
      { name: 'Relatorios basicos', included: true },
      { name: 'Comissoes automaticas', included: false },
      { name: 'Financeiro completo', included: false },
      { name: 'WhatsApp automatico', included: false },
      { name: 'Assistente IA (Alexis)', included: false },
    ],
  },
  {
    id: 'profissional',
    code: 'PROFISSIONAL',
    name: 'Profissional',
    description: 'Gestao completa para saloes que querem crescer',
    priceMonthly: 99.90,
    priceYearly: 999.00,
    maxUsers: 5,
    maxClients: 2000,
    highlighted: true,
    badge: 'Mais Popular',
    features: [
      { name: 'Agenda inteligente', included: true },
      { name: 'Cadastro de clientes', included: true },
      { name: 'Comandas digitais', included: true },
      { name: 'Relatorios avancados', included: true },
      { name: 'Comissoes automaticas', included: true },
      { name: 'Financeiro completo', included: true },
      { name: 'WhatsApp automatico', included: false },
      { name: 'Assistente IA (Alexis)', included: false },
    ],
  },
  {
    id: 'master',
    code: 'MASTER',
    name: 'Master',
    description: 'Solucao premium com automacao total e IA',
    priceMonthly: 169.90,
    priceYearly: 1699.00,
    maxUsers: 15,
    maxClients: 10000,
    badge: 'Completo',
    features: [
      { name: 'Agenda inteligente', included: true },
      { name: 'Cadastro de clientes', included: true },
      { name: 'Comandas digitais', included: true },
      { name: 'Relatorios avancados', included: true },
      { name: 'Comissoes automaticas', included: true },
      { name: 'Financeiro completo', included: true },
      { name: 'WhatsApp automatico', included: true },
      { name: 'Assistente IA (Alexis)', included: true },
    ],
  },
];

const WHATSAPP_ADDONS: WhatsAppAddon[] = [
  {
    tier: 'BASIC',
    name: 'WhatsApp Basico',
    quotaOptions: [120, 160, 200, 240],
    basePriceMonthly: 29.90,
    pricePerUnit: 0.15,
  },
  {
    tier: 'PRO',
    name: 'WhatsApp Pro',
    quotaOptions: [120, 160, 200, 240],
    basePriceMonthly: 49.90,
    pricePerUnit: 0.12,
  },
];

const ALEXIS_ADDONS: AlexisAddon[] = [
  {
    tier: 'LITE',
    name: 'Alexis Lite',
    description: 'Assistente basico para atendimento',
    priceMonthly: 49.90,
    features: [
      'Respostas automaticas 24/7',
      'Agendamento via WhatsApp',
      'Confirmacao de horarios',
      'Até 500 interacoes/mes',
    ],
  },
  {
    tier: 'PRO',
    name: 'Alexis Pro',
    description: 'IA avancada com memoria e personalizacao',
    priceMonthly: 99.90,
    features: [
      'Tudo do Lite +',
      'Memoria de cliente',
      'Recomendacoes personalizadas',
      'Analise de sentimento',
      'Interacoes ilimitadas',
    ],
  },
];

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

// ==================== COMPONENTES ====================

function PlanCard({
  plan,
  billingCycle,
  onSelect,
}: {
  plan: SaaSPlan;
  billingCycle: 'MONTHLY' | 'YEARLY';
  onSelect: (plan: SaaSPlan) => void;
}) {
  const price = billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;
  const perMonth = billingCycle === 'YEARLY' ? (plan.priceYearly / 12).toFixed(2) : null;

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
        plan.highlighted
          ? 'border-primary-500 shadow-xl scale-105 z-10'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
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
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {plan.code === 'ESSENCIAL' && <Zap className="w-7 h-7" />}
        {plan.code === 'PROFISSIONAL' && <Crown className="w-7 h-7" />}
        {plan.code === 'MASTER' && <Sparkles className="w-7 h-7" />}
      </div>

      {/* Name & Description */}
      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="text-gray-500 text-sm mt-1 min-h-[40px]">{plan.description}</p>

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
        className={`w-full mt-6 py-3 rounded-xl font-semibold transition-colors ${
          plan.highlighted
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {plan.highlighted ? 'Comecar Agora' : 'Selecionar'}
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
  // State
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [whatsappTier, setWhatsappTier] = useState<'BASIC' | 'PRO'>('BASIC');
  const [whatsappQuota, setWhatsappQuota] = useState(120);
  const [alexisTier, setAlexisTier] = useState<'LITE' | 'PRO'>('LITE');

  // Calculadora de perdas
  const [calcFaltas, setCalcFaltas] = useState(10);
  const [calcTicket, setCalcTicket] = useState(80);

  const whatsappAddon = useMemo(
    () => WHATSAPP_ADDONS.find((a) => a.tier === whatsappTier)!,
    [whatsappTier]
  );

  const whatsappPrice = useMemo(() => {
    const quotaIndex = whatsappAddon.quotaOptions.indexOf(whatsappQuota);
    return whatsappAddon.basePriceMonthly + quotaIndex * 10;
  }, [whatsappAddon, whatsappQuota]);

  const alexisAddon = useMemo(
    () => ALEXIS_ADDONS.find((a) => a.tier === alexisTier)!,
    [alexisTier]
  );

  const lossPerMonth = useMemo(() => calcFaltas * calcTicket, [calcFaltas, calcTicket]);
  const robotCost = 29.90; // WhatsApp basico
  const potentialSavings = useMemo(() => Math.max(0, lossPerMonth * 0.7 - robotCost), [lossPerMonth]);

  const handleSelectPlan = (plan: SaaSPlan) => {
    // TODO: Integrar com API de checkout
    alert(`Plano selecionado: ${plan.name}\nValor: R$ ${(billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly).toFixed(2)}`);
  };

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
        {SAAS_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            onSelect={handleSelectPlan}
          />
        ))}
      </section>

      {/* ==================== WHATSAPP ADD-ON ==================== */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Turbine com WhatsApp</h2>
            <p className="text-gray-600">Confirmacao automatica de agendamentos</p>
          </div>
        </div>

        {/* Tier Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setWhatsappTier('BASIC')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              whatsappTier === 'BASIC'
                ? 'border-green-500 bg-white shadow-md'
                : 'border-gray-200 bg-white/50 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Basico</div>
            <div className="text-sm text-gray-500">Confirmacao simples</div>
          </button>
          <button
            onClick={() => setWhatsappTier('PRO')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              whatsappTier === 'PRO'
                ? 'border-green-500 bg-white shadow-md'
                : 'border-gray-200 bg-white/50 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Pro</div>
            <div className="text-sm text-gray-500">+ Lembretes + Reagendamento</div>
          </button>
        </div>

        {/* Quota Slider */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 font-medium">Agendamentos/mes</span>
            <span className="text-2xl font-bold text-green-600">{whatsappQuota}</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            value={whatsappAddon.quotaOptions.indexOf(whatsappQuota)}
            onChange={(e) => setWhatsappQuota(whatsappAddon.quotaOptions[parseInt(e.target.value)])}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {whatsappAddon.quotaOptions.map((q) => (
              <span key={q}>{q}</span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              R$ {whatsappPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-gray-500">/mes</span>
          </div>
          <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
            Adicionar ao Plano
          </button>
        </div>

        {/* Top-up */}
        <div className="mt-6 p-4 bg-green-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-medium text-green-900">Precisa de mais?</span>
              <span className="text-green-700 text-sm ml-2">+20 agendamentos por R$10</span>
            </div>
          </div>
          <span className="text-xs text-green-600">Validade: 60 dias</span>
        </div>
      </section>

      {/* ==================== ALEXIS ADD-ON ==================== */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Alexis - Assistente IA</h2>
            <p className="text-gray-600">Atendimento 24/7 que entende seu cliente</p>
          </div>
        </div>

        {/* Dependency Note */}
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg mb-6 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Requer WhatsApp ativo para funcionar</span>
        </div>

        {/* Alexis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALEXIS_ADDONS.map((addon) => (
            <button
              key={addon.tier}
              onClick={() => setAlexisTier(addon.tier)}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                alexisTier === addon.tier
                  ? 'border-purple-500 bg-white shadow-md'
                  : 'border-gray-200 bg-white/50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{addon.name}</h3>
                <span className="text-xl font-bold text-purple-600">
                  R$ {addon.priceMonthly.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{addon.description}</p>
              <ul className="space-y-2">
                {addon.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-purple-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
            Adicionar Alexis {alexisAddon.tier}
          </button>
        </div>
      </section>

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
            const proPlano = SAAS_PLANS.find((p) => p.highlighted);
            if (proPlano) handleSelectPlan(proPlano);
          }}
          className="px-8 py-4 bg-white text-primary-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Comecar Teste Gratuito de 14 Dias
        </button>
        <p className="text-primary-200 text-sm mt-4">Sem cartao de credito. Sem compromisso.</p>
      </section>
    </div>
  );
}

export default MyPlanPage;
