import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Package,
  Calendar,
  Check,
  Loader2,
  AlertTriangle,
  Star,
  Truck,
  Clock,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Play,
  Pause,
  X,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  MapPin,
  CalendarDays,
  Shield,
  Zap,
  Gift,
  Info,
  AlertCircle,
} from 'lucide-react';
import { format, addMonths, setDate, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

// ==================== INTERFACES ====================

interface PlanItem {
  id: string;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: string;
    imageUrl: string | null;
  };
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  price: string;
  discount: number;
  isActive: boolean;
  items?: PlanItem[];
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  nextDeliveryDate: string | null;
  deliveryType: string;
  deliveryAddress: string | null;
  plan?: Plan;
}

// ==================== CONSTANTS ====================

const frequencyLabels: Record<string, string> = {
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
};

const frequencyDays: Record<string, number> = {
  MONTHLY: 30,
  BIMONTHLY: 60,
  QUARTERLY: 90,
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Ativa', color: 'text-green-700', bgColor: 'bg-green-100' },
  PAUSED: { label: 'Pausada', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  CANCELLED: { label: 'Cancelada', color: 'text-red-700', bgColor: 'bg-red-100' },
  EXPIRED: { label: 'Expirada', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

// ==================== HELPER FUNCTIONS ====================

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0);
}

function calculateOriginalPrice(plan: Plan): number {
  if (!plan.items) return 0;
  return plan.items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || '0');
    return sum + price * item.quantity;
  }, 0);
}

function calculateFirstDeliveryDate(preferredDay: number): Date {
  const today = new Date();
  let deliveryDate = setDate(today, preferredDay);

  // If the preferred day has already passed this month, schedule for next month
  if (isBefore(deliveryDate, today) || deliveryDate.getDate() !== preferredDay) {
    deliveryDate = setDate(addMonths(today, 1), preferredDay);
  }

  return deliveryDate;
}

// ==================== COMPONENTS ====================

function HowItWorksStep({
  number,
  icon: Icon,
  title,
  description
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600">
      <Icon className="w-4 h-4 text-primary-600" />
      <span>{text}</span>
    </div>
  );
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === currentStep
                ? 'bg-primary-600 text-white'
                : step < currentStep
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-8 h-0.5 ${
                step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ==================== SUBSCRIBE WIZARD MODAL ====================

interface SubscribeWizardProps {
  plan: Plan;
  onClose: () => void;
  onConfirm: (data: { deliveryType: string; deliveryAddress: string; preferredDay: number }) => Promise<void>;
  isSubmitting: boolean;
}

function SubscribeWizard({ plan, onClose, onConfirm, isSubmitting }: SubscribeWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    deliveryType: '',
    deliveryAddress: '',
    preferredDay: 15,
  });
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const firstDeliveryDate = useMemo(
    () => calculateFirstDeliveryDate(form.preferredDay),
    [form.preferredDay]
  );

  const canProceedStep1 = form.deliveryType !== '';
  const canProceedStep2 = form.preferredDay >= 1 && form.preferredDay <= 28;
  const canProceedStep3 = form.deliveryType === 'PICKUP' || form.deliveryAddress.trim().length > 0;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm(form);
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar assinatura. Tente novamente.');
    }
  };

  const frequencyLabel = frequencyLabels[plan.frequency] || 'Mensal';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 id="wizard-title" className="text-xl font-bold text-gray-900">
              Assinar Plano
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <StepIndicator currentStep={step} totalSteps={3} />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Delivery Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como deseja receber?
                </h3>
                <p className="text-sm text-gray-500">
                  Escolha entre retirar no salao ou receber no seu endereco
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, deliveryType: 'PICKUP', deliveryAddress: '' }))}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    form.deliveryType === 'PICKUP'
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Package className={`w-10 h-10 mx-auto mb-3 ${
                    form.deliveryType === 'PICKUP' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className="block text-base font-semibold text-gray-900">Retirada no Salao</span>
                  <p className="text-sm text-gray-500 mt-1">Retire quando quiser</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, deliveryType: 'DELIVERY' }))}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    form.deliveryType === 'DELIVERY'
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Truck className={`w-10 h-10 mx-auto mb-3 ${
                    form.deliveryType === 'DELIVERY' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className="block text-base font-semibold text-gray-900">Entrega no Endereco</span>
                  <p className="text-sm text-gray-500 mt-1">Receba em casa</p>
                </button>
              </div>

              {form.deliveryType === 'DELIVERY' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Endereco de entrega
                  </label>
                  <textarea
                    value={form.deliveryAddress}
                    onChange={e => setForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    rows={3}
                    placeholder="Rua, numero, complemento, bairro, cidade..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    aria-label="Endereco de entrega"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: When to receive */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quando prefere receber?
                </h3>
                <p className="text-sm text-gray-500">
                  Escolha o dia do mes para sua entrega recorrente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDays className="w-4 h-4 inline mr-1" />
                  Dia do mes
                </label>
                <select
                  value={form.preferredDay}
                  onChange={e => setForm(prev => ({ ...prev, preferredDay: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  aria-label="Dia preferido do mes"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      Dia {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-primary-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary-900">
                      Primeira entrega prevista para:
                    </p>
                    <p className="text-2xl font-bold text-primary-700 mt-1">
                      {format(firstDeliveryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <RefreshCw className="w-4 h-4 text-gray-400" />
                <span>
                  Frequencia: <strong>{frequencyLabel}</strong> (a cada {frequencyDays[plan.frequency] || 30} dias)
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Resumo da assinatura
                </h3>
                <p className="text-sm text-gray-500">
                  Confira os detalhes antes de confirmar
                </p>
              </div>

              {/* Plan Summary Card */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-white">
                <h4 className="font-bold text-lg">{plan.name}</h4>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-primary-200">/{frequencyLabel.toLowerCase()}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Forma de recebimento
                  </span>
                  <span className="font-medium text-gray-900">
                    {form.deliveryType === 'PICKUP' ? 'Retirada no salao' : 'Entrega'}
                  </span>
                </div>

                {form.deliveryType === 'DELIVERY' && form.deliveryAddress && (
                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereco
                    </span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">
                      {form.deliveryAddress}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Dia do mes
                  </span>
                  <span className="font-medium text-gray-900">Dia {form.preferredDay}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Proxima entrega
                  </span>
                  <span className="font-medium text-gray-900">
                    {format(firstDeliveryDate, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Proxima cobranca
                  </span>
                  <span className="font-medium text-gray-900">
                    {format(firstDeliveryDate, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Control Block */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Voce tem controle total
                </h4>
                <ul className="space-y-2 text-sm text-emerald-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Pausar ou cancelar a qualquer momento
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Alterar dia ou forma de recebimento depois
                  </li>
                </ul>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              Continuar
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !canProceedStep3}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar Assinatura
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PAGE ====================

export function AvailableSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Subscribe modal state
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [plansRes, subsRes] = await Promise.all([
        api.get('/product-subscriptions/plans?active=true'),
        api.get('/product-subscriptions/subscriptions/my'),
      ]);

      setPlans(plansRes.data);
      setMySubscriptions(subsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenSubscribeModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowSubscribeModal(true);
  };

  const handleSubscribe = async (data: { deliveryType: string; deliveryAddress: string; preferredDay: number }) => {
    if (!selectedPlan) return;

    setSubscribingPlanId(selectedPlan.id);
    try {
      await api.post('/product-subscriptions/subscriptions', {
        planId: selectedPlan.id,
        deliveryType: data.deliveryType,
        deliveryAddress: data.deliveryType === 'DELIVERY' ? data.deliveryAddress : null,
        preferredDay: data.preferredDay,
      });
      setShowSubscribeModal(false);
      setSelectedPlan(null);
      loadData();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao assinar plano');
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    if (!confirm('Deseja pausar esta assinatura?')) return;
    try {
      setActionLoading(subscriptionId);
      await api.post(`/product-subscriptions/subscriptions/${subscriptionId}/pause`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao pausar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      await api.post(`/product-subscriptions/subscriptions/${subscriptionId}/resume`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao retomar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Deseja cancelar esta assinatura? Esta acao nao pode ser desfeita.')) return;
    try {
      setActionLoading(subscriptionId);
      await api.post(`/product-subscriptions/subscriptions/${subscriptionId}/cancel`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const isAlreadySubscribed = (planId: string) => {
    return mySubscriptions.some(
      sub => sub.planId === planId && (sub.status === 'ACTIVE' || sub.status === 'PAUSED')
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* ==================== HERO ==================== */}
      <section className="text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Assinatura de Produtos</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Receba seus favoritos no
          <span className="text-primary-600"> piloto automático</span>
        </h1>

        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Economize tempo e garanta reposição mensal — sem ficar sem produto.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <TrustBadge icon={Shield} text="Sem fidelidade" />
          <TrustBadge icon={Pause} text="Pausar quando quiser" />
          <TrustBadge icon={RefreshCw} text="Troca de dia em 1 clique" />
        </div>

        {/* CTA Button - scroll to plans */}
        <button
          onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-6 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
        >
          Ver planos
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HowItWorksStep
            number={1}
            icon={ShoppingBag}
            title="Escolha o plano"
            description="Selecione o plano que combina com seu consumo"
          />
          <HowItWorksStep
            number={2}
            icon={Truck}
            title="Defina entrega ou retirada"
            description="Escolha como e quando quer receber"
          />
          <HowItWorksStep
            number={3}
            icon={Zap}
            title="Pronto!"
            description="Cobranca e envio automaticos todo mes"
          />
        </div>
      </section>

      {/* ==================== MY SUBSCRIPTIONS ==================== */}
      {mySubscriptions.length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            Minhas Assinaturas
          </h2>
          <div className="space-y-4">
            {mySubscriptions.map(subscription => (
              <div
                key={subscription.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{subscription.plan?.name}</h3>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        statusConfig[subscription.status]?.bgColor || 'bg-gray-100'
                      } ${statusConfig[subscription.status]?.color || 'text-gray-700'}`}
                    >
                      {statusConfig[subscription.status]?.label || subscription.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Proxima: {subscription.nextDeliveryDate
                        ? format(new Date(subscription.nextDeliveryDate + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                        : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {subscription.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {subscription.status === 'ACTIVE' && (
                    <button
                      onClick={() => handlePauseSubscription(subscription.id)}
                      disabled={actionLoading === subscription.id}
                      className="px-3 py-1.5 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      {actionLoading === subscription.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      Pausar
                    </button>
                  )}
                  {subscription.status === 'PAUSED' && (
                    <button
                      onClick={() => handleResumeSubscription(subscription.id)}
                      disabled={actionLoading === subscription.id}
                      className="px-3 py-1.5 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      {actionLoading === subscription.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Retomar
                    </button>
                  )}
                  {(subscription.status === 'ACTIVE' || subscription.status === 'PAUSED') && (
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      disabled={actionLoading === subscription.id}
                      className="px-3 py-1.5 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== AVAILABLE PLANS ==================== */}
      <section id="plans" className="max-w-6xl mx-auto px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Planos Disponiveis</h2>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum plano disponivel</h3>
            <p className="text-gray-500">Em breve teremos planos de assinatura disponiveis</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {plans.map(plan => {
              const originalPrice = calculateOriginalPrice(plan);
              const finalPrice = parseFloat(plan.price);
              const savings = originalPrice - finalPrice;
              const alreadySubscribed = isAlreadySubscribed(plan.id);
              const frequencyLabel = frequencyLabels[plan.frequency] || 'Mensal';
              const hasItems = plan.items && plan.items.length > 0;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Plan Header */}
                  <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                        {frequencyLabel}
                      </span>
                      {plan.discount > 0 && (
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                          -{plan.discount}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-primary-100 text-sm mt-1">{plan.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-gray-500">/ mes</span>
                    </div>
                    {savings > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(originalPrice)}
                        </span>
                        <span className="text-sm text-emerald-600 font-semibold">
                          Economia de {formatCurrency(savings)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="p-6 flex-1">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Beneficios:</h4>
                    <ul className="space-y-2.5 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600">Reposicao automatica</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600">Prioridade no atendimento</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-600">Controle pelo painel</span>
                      </li>
                    </ul>

                    {/* Products Included */}
                    {hasItems ? (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          Produtos inclusos:
                        </h4>
                        <ul className="space-y-2">
                          {plan.items?.map(item => (
                            <li key={item.id} className="flex items-center gap-2 text-sm">
                              <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-600">{item.product?.name || 'Produto'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 italic flex items-start gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          Inclui reposicao dos itens selecionados no seu carrinho
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features Row */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        A cada {frequencyDays[plan.frequency] || 30} dias
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Cobranca automatica
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-6 pt-2">
                    {alreadySubscribed ? (
                      <button
                        disabled
                        className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <Check className="w-5 h-5" />
                        Ja assinado
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenSubscribeModal(plan)}
                          className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
                        >
                          <Star className="w-5 h-5" />
                          Assinar agora
                        </button>
                        {/* Friction reduction */}
                        <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                          <Shield className="w-3 h-3" />
                          Sem fidelidade · Pause ou cancele quando quiser
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================== ANTI-CONFUSION NOTE ==================== */}
      <section className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta pagina e para assinatura de produtos (entregas recorrentes).
            A assinatura do sistema (SaaS/faturamento) fica em <strong>Meu Plano</strong>.
          </p>
        </div>
      </section>

      {/* ==================== SUBSCRIBE WIZARD MODAL ==================== */}
      {showSubscribeModal && selectedPlan && (
        <SubscribeWizard
          plan={selectedPlan}
          onClose={() => {
            setShowSubscribeModal(false);
            setSelectedPlan(null);
          }}
          onConfirm={handleSubscribe}
          isSubmitting={subscribingPlanId === selectedPlan.id}
        />
      )}
    </div>
  );
}

export default AvailableSubscriptionsPage;
