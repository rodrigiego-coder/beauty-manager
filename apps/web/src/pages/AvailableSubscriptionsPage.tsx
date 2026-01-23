import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronDown,
  MapPin,
  CalendarDays,
  Shield,
  Gift,
  Info,
  AlertCircle,
  TrendingUp,
  Heart,
  ClipboardList,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { format, addMonths, setDate, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { COPY } from './product-subscriptions/copy';

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

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Pause,
  Truck,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Heart,
  ClipboardList,
  Clock,
  Gift,
  RefreshCw,
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
  if (isBefore(deliveryDate, today) || deliveryDate.getDate() !== preferredDay) {
    deliveryDate = setDate(addMonths(today, 1), preferredDay);
  }
  return deliveryDate;
}

// ==================== REUSABLE COMPONENTS ====================

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  const Icon = iconMap[icon] || Shield;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-600 shadow-sm">
      <Icon className="w-4 h-4 text-primary-600" />
      <span>{text}</span>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const Icon = iconMap[icon] || Gift;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function HowItWorksStep({ number, icon, title, description }: { number: number; icon: string; title: string; description: string }) {
  const Icon = iconMap[icon] || Package;
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
        {number}
      </div>
      <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4 mt-2">
        <Icon className="w-7 h-7 text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary-600" />
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 bg-gray-50">
          <p className="text-sm text-gray-600 pl-6">{answer}</p>
        </div>
      )}
    </div>
  );
}

function ExampleCard({ name, description, frequency, priceRange }: { name: string; description: string; frequency: string; priceRange: string }) {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">{frequency}</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <p className="text-sm font-semibold text-primary-600">{priceRange}</p>
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
            <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ==================== HERO ILLUSTRATION ====================

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-xs mx-auto h-48 flex items-center justify-center">
      {/* Background shapes */}
      <div className="absolute w-32 h-32 bg-primary-100 rounded-full -top-2 -left-4 opacity-60" />
      <div className="absolute w-24 h-24 bg-yellow-100 rounded-full top-8 right-0 opacity-60" />
      <div className="absolute w-16 h-16 bg-emerald-100 rounded-full bottom-4 left-8 opacity-60" />
      {/* Icons */}
      <div className="relative z-10 flex items-end gap-4">
        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <Package className="w-8 h-8 text-primary-600" />
        </div>
        <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center -mb-2">
          <ShoppingBag className="w-10 h-10 text-primary-600" />
        </div>
        <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
          <CalendarDays className="w-7 h-7 text-primary-600" />
        </div>
      </div>
      {/* Arrow */}
      <div className="absolute bottom-2 right-4">
        <RefreshCw className="w-6 h-6 text-primary-400 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : COPY.wizard.errors.generic;
      setError(message);
    }
  };

  const frequencyLabel = frequencyLabels[plan.frequency] || 'Mensal';
  const W = COPY.wizard;

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
              {W.title}
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
                  {W.steps.delivery.title}
                </h3>
                <p className="text-sm text-gray-500">{W.steps.delivery.subtitle}</p>
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
                  <Package className={`w-10 h-10 mx-auto mb-3 ${form.deliveryType === 'PICKUP' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="block text-base font-semibold text-gray-900">{W.steps.delivery.options.pickup.title}</span>
                  <p className="text-sm text-gray-500 mt-1">{W.steps.delivery.options.pickup.description}</p>
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
                  <Truck className={`w-10 h-10 mx-auto mb-3 ${form.deliveryType === 'DELIVERY' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="block text-base font-semibold text-gray-900">{W.steps.delivery.options.delivery.title}</span>
                  <p className="text-sm text-gray-500 mt-1">{W.steps.delivery.options.delivery.description}</p>
                </button>
              </div>

              {form.deliveryType === 'DELIVERY' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {W.steps.delivery.addressLabel}
                  </label>
                  <textarea
                    value={form.deliveryAddress}
                    onChange={e => setForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    rows={3}
                    placeholder={W.steps.delivery.addressPlaceholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    aria-label={W.steps.delivery.addressLabel}
                  />
                  {form.deliveryType === 'DELIVERY' && form.deliveryAddress.trim().length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {W.steps.delivery.addressRequired}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: When to receive */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {W.steps.schedule.title}
                </h3>
                <p className="text-sm text-gray-500">{W.steps.schedule.subtitle}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarDays className="w-4 h-4 inline mr-1" />
                  {W.steps.schedule.dayLabel}
                </label>
                <select
                  value={form.preferredDay}
                  onChange={e => setForm(prev => ({ ...prev, preferredDay: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                  aria-label={W.steps.schedule.dayLabel}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>Dia {day}</option>
                  ))}
                </select>
              </div>

              <div className="bg-primary-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary-900">{W.steps.schedule.firstDeliveryLabel}</p>
                    <p className="text-2xl font-bold text-primary-700 mt-1">
                      {format(firstDeliveryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <RefreshCw className="w-4 h-4 text-gray-400" />
                <span>
                  {W.steps.schedule.frequencyNote} <strong>{frequencyLabel}</strong> ({W.steps.schedule.frequencyDays.replace('{days}', String(frequencyDays[plan.frequency] || 30))})
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {W.steps.summary.title}
                </h3>
                <p className="text-sm text-gray-500">{W.steps.summary.subtitle}</p>
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
                    {W.steps.summary.deliveryTypeLabel}
                  </span>
                  <span className="font-medium text-gray-900">
                    {form.deliveryType === 'PICKUP' ? W.steps.summary.deliveryTypePickup : W.steps.summary.deliveryTypeDelivery}
                  </span>
                </div>

                {form.deliveryType === 'DELIVERY' && form.deliveryAddress && (
                  <div className="flex items-start justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {W.steps.summary.addressLabel}
                    </span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">
                      {form.deliveryAddress}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {W.steps.summary.dayLabel}
                  </span>
                  <span className="font-medium text-gray-900">Dia {form.preferredDay}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {W.steps.summary.nextDeliveryLabel}
                  </span>
                  <span className="font-medium text-gray-900">
                    {format(firstDeliveryDate, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {W.steps.summary.nextChargeLabel}
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
                  {W.steps.summary.controlBlock.title}
                </h4>
                <ul className="space-y-2 text-sm text-emerald-700">
                  {W.steps.summary.controlBlock.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

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
              {W.buttons.back}
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {W.buttons.cancel}
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {W.buttons.next}
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
                  {W.buttons.confirming}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {W.buttons.confirm}
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao assinar plano';
      throw new Error(message);
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    if (!confirm(COPY.mySubscriptions.confirmPause)) return;
    try {
      setActionLoading(subscriptionId);
      await api.post(`/product-subscriptions/subscriptions/${subscriptionId}/pause`);
      loadData();
    } catch {
      alert('Erro ao pausar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      await api.post(`/product-subscriptions/subscriptions/${subscriptionId}/resume`);
      loadData();
    } catch {
      alert('Erro ao retomar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm(COPY.mySubscriptions.confirmCancel)) return;
    try {
      setActionLoading(subscriptionId);
      await api.post(`/product-subscriptions/subscriptions/${subscriptionId}/cancel`);
      loadData();
    } catch {
      alert('Erro ao cancelar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const isAlreadySubscribed = (planId: string) => {
    return mySubscriptions.some(sub => sub.planId === planId && (sub.status === 'ACTIVE' || sub.status === 'PAUSED'));
  };

  const scrollToPlans = () => {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
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
        <button onClick={loadData} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Tentar novamente
        </button>
      </div>
    );
  }

  const C = COPY;

  return (
    <div className="space-y-12 pb-16">
      {/* ==================== A) HERO ==================== */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <HeroIllustration />
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">{C.hero.badge}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {C.hero.headline.replace(C.hero.headlineHighlight, '')}
          <span className="text-primary-600"> {C.hero.headlineHighlight}</span>
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">{C.hero.subheadline}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {C.badges.map((badge, idx) => (
            <TrustBadge key={idx} icon={badge.icon} text={badge.text} />
          ))}
        </div>
        <button
          onClick={scrollToPlans}
          className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
        >
          {C.hero.ctaButton}
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ==================== B) ANTI-CONFUSION NOTE ==================== */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>{C.antiConfusion.title}</strong> {C.antiConfusion.text}{' '}
            <Link to={C.antiConfusion.linkHref} className="underline font-semibold hover:text-blue-900">
              {C.antiConfusion.linkText}
            </Link>.
          </p>
        </div>
      </section>

      {/* ==================== C) BENEFITS ==================== */}
      <section className="max-w-5xl mx-auto px-4">
        <SectionTitle title={C.benefits.title} subtitle={C.benefits.subtitle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {C.benefits.items.map((item, idx) => (
            <BenefitCard key={idx} icon={item.icon} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      {/* ==================== D) HOW IT WORKS ==================== */}
      <section className="max-w-4xl mx-auto px-4">
        <SectionTitle title={C.howItWorks.title} subtitle={C.howItWorks.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {C.howItWorks.steps.map((step) => (
            <HowItWorksStep key={step.number} number={step.number} icon={step.icon} title={step.title} description={step.description} />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {C.howItWorks.note}
        </p>
      </section>

      {/* ==================== E) SECRETARY ROUTINE ==================== */}
      <section className="max-w-2xl mx-auto px-4">
        <SectionTitle title={C.routine.title} subtitle={C.routine.subtitle} />
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ul className="space-y-3">
            {C.routine.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-sm text-primary-700 bg-primary-50 rounded-lg p-3">
            <Sparkles className="w-4 h-4 mt-0.5" />
            <span>{C.routine.tip}</span>
          </div>
        </div>
      </section>

      {/* ==================== F) EXAMPLES ==================== */}
      <section className="max-w-4xl mx-auto px-4">
        <SectionTitle title={C.examples.title} subtitle={C.examples.subtitle} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {C.examples.items.map((item, idx) => (
            <ExampleCard key={idx} name={item.name} description={item.description} frequency={item.frequency} priceRange={item.priceRange} />
          ))}
        </div>
      </section>

      {/* ==================== MY SUBSCRIPTIONS ==================== */}
      {mySubscriptions.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              {C.mySubscriptions.title}
            </h2>
            <div className="space-y-4">
              {mySubscriptions.map(subscription => (
                <div key={subscription.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{subscription.plan?.name}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig[subscription.status]?.bgColor || 'bg-gray-100'} ${statusConfig[subscription.status]?.color || 'text-gray-700'}`}>
                        {statusConfig[subscription.status]?.label || subscription.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {C.mySubscriptions.nextDeliveryLabel} {subscription.nextDeliveryDate ? format(new Date(subscription.nextDeliveryDate + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {C.mySubscriptions.deliveryTypeLabel[subscription.deliveryType as keyof typeof C.mySubscriptions.deliveryTypeLabel] || subscription.deliveryType}
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
                        {actionLoading === subscription.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                        {C.mySubscriptions.actions.pause}
                      </button>
                    )}
                    {subscription.status === 'PAUSED' && (
                      <button
                        onClick={() => handleResumeSubscription(subscription.id)}
                        disabled={actionLoading === subscription.id}
                        className="px-3 py-1.5 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        {actionLoading === subscription.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {C.mySubscriptions.actions.resume}
                      </button>
                    )}
                    {(subscription.status === 'ACTIVE' || subscription.status === 'PAUSED') && (
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        disabled={actionLoading === subscription.id}
                        className="px-3 py-1.5 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        {C.mySubscriptions.actions.cancel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== G) AVAILABLE PLANS ==================== */}
      <section id="plans" className="max-w-6xl mx-auto px-4">
        <SectionTitle title={C.plans.title} subtitle={C.plans.subtitle} />
        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{C.plans.emptyState.title}</h3>
            <p className="text-gray-500">{C.plans.emptyState.description}</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {plans.map(plan => {
              const originalPrice = calculateOriginalPrice(plan);
              const finalPrice = parseFloat(plan.price);
              const savings = originalPrice - finalPrice;
              const alreadySubscribed = isAlreadySubscribed(plan.id);
              const frequencyLabel = C.plans.card.frequencyLabel[plan.frequency as keyof typeof C.plans.card.frequencyLabel] || 'Mensal';
              const hasItems = plan.items && plan.items.length > 0;

              return (
                <div key={plan.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">{frequencyLabel}</span>
                      {plan.discount > 0 && (
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">-{plan.discount}%</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {plan.description && <p className="text-primary-100 text-sm mt-1">{plan.description}</p>}
                  </div>

                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                      <span className="text-gray-500">{C.plans.card.perMonth}</span>
                    </div>
                    {savings > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
                        <span className="text-sm text-emerald-600 font-semibold">{C.plans.card.savingsLabel} {formatCurrency(savings)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">{C.plans.card.benefitsTitle}</h4>
                    <ul className="space-y-2.5 mb-4">
                      {C.plans.card.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {hasItems ? (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          {C.plans.card.productsTitle}
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
                          {C.plans.card.productsFallback}
                        </p>
                      </div>
                    )}
                  </div>

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

                  <div className="p-6 pt-2">
                    {alreadySubscribed ? (
                      <button disabled className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                        <Check className="w-5 h-5" />
                        {C.plans.card.ctaAlreadySubscribed}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenSubscribeModal(plan)}
                          className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
                        >
                          <Star className="w-5 h-5" />
                          {C.plans.card.ctaSubscribe}
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                          <Shield className="w-3 h-3" />
                          {C.plans.card.frictionLine}
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

      {/* ==================== H) FAQ ==================== */}
      <section className="max-w-3xl mx-auto px-4">
        <SectionTitle title={C.faq.title} subtitle={C.faq.subtitle} />
        <div className="space-y-3">
          {C.faq.items.map((item, idx) => (
            <FAQItem
              key={idx}
              question={item.question}
              answer={item.answer}
              isOpen={openFaqIndex === idx}
              onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
            />
          ))}
        </div>
      </section>

      {/* ==================== I) FINAL CTA ==================== */}
      <section className="max-w-2xl mx-auto px-4">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">{C.finalCta.title}</h2>
          <p className="text-primary-100 mb-6">{C.finalCta.subtitle}</p>
          <button
            onClick={scrollToPlans}
            className="px-8 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2"
          >
            {C.finalCta.button}
            <ArrowRight className="w-5 h-5" />
          </button>
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
