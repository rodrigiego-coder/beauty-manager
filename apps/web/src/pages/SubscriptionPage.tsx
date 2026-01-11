import { useState, useEffect } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import {
  Crown,
  Check,
  X,
  Zap,
  Users,
  Calendar,
  AlertTriangle,
  CreditCard,
  FileText,
  RefreshCw,
  QrCode,
  Copy,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Plan {
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

interface SubscriptionData {
  subscription: {
    id: string;
    salonId: string;
    planId: string;
    status: string;
    billingPeriod: string;
    startsAt: string;
    trialEndsAt: string | null;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
  } | null;
  plan: Plan | null;
  limits: { users: number; clients: number };
  status: {
    valid: boolean;
    status: string;
    daysRemaining: number;
    message: string;
    canAccess: boolean;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  referencePeriodStart: string;
  referencePeriodEnd: string;
  dueDate: string;
  totalAmount: string;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  pixExpiresAt: string | null;
}

export function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices'>('plans');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX');
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; expiresAt: string } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [plansRes, subRes, invoicesRes] = await Promise.all([
        fetch('/api/subscriptions/plans', { headers }),
        fetch('/api/subscriptions/current', { headers }),
        fetch('/api/subscriptions/invoices', { headers }),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscriptionData(subData);
        if (subData.subscription?.billingPeriod) {
          setBillingCycle(subData.subscription.billingPeriod);
        }
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados da assinatura' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    setLoadingPayment(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/subscriptions/change-plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPlanId: selectedPlan.id,
          billingPeriod: billingCycle,
        }),
      });

      if (!response.ok) throw new Error('Erro ao trocar plano');

      setMessage({ type: 'success', text: 'Plano alterado com sucesso!' });
      setShowChangePlanModal(false);
      setSelectedPlan(null);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar plano' });
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleCancelSubscription = async (cancelAtEnd: boolean) => {
    setLoadingPayment(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelAtPeriodEnd: cancelAtEnd }),
      });

      if (!response.ok) throw new Error('Erro ao cancelar');

      setMessage({ type: 'success', text: cancelAtEnd ? 'Assinatura sera cancelada ao final do periodo' : 'Assinatura cancelada' });
      setShowCancelModal(false);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao cancelar assinatura' });
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleReactivate = async () => {
    setLoadingPayment(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/subscriptions/reactivate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error('Erro ao reativar');

      setMessage({ type: 'success', text: 'Assinatura reativada!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao reativar assinatura' });
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
    setPixData(null);
  };

  const handleGeneratePix = async () => {
    if (!selectedInvoice) return;
    setLoadingPayment(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/mercado-pago/create-pix', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: selectedInvoice.id }),
      });

      if (!response.ok) throw new Error('Erro ao gerar PIX');

      const data = await response.json();
      setPixData({
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        expiresAt: data.expiresAt,
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao gerar QR Code PIX' });
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleCopyPix = async () => {
    if (pixData?.qrCode) {
      await copyToClipboard(pixData.qrCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'R$ 0,00';
    return parseFloat(price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ativo' },
      TRIALING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Periodo de Teste' },
      PAST_DUE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pagamento Pendente' },
      CANCELED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado' },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspenso' },
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' },
      PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pago' },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vencida' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Falhou' },
    };
    const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'FREE': return <Sparkles className="w-6 h-6" />;
      case 'BASIC': return <Zap className="w-6 h-6" />;
      case 'PRO': return <Crown className="w-6 h-6" />;
      case 'PREMIUM': return <Crown className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (code: string) => {
    switch (code) {
      case 'FREE': return 'from-gray-400 to-gray-500';
      case 'BASIC': return 'from-blue-500 to-blue-600';
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

  const currentSub = subscriptionData?.subscription;
  const currentPlan = subscriptionData?.plan;
  const status = subscriptionData?.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>
          <p className="text-gray-500 mt-1">Gerencie seu plano e faturamento</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Plan Card */}
      {currentSub && currentPlan && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getPlanColor(currentPlan.code)} text-white`}>
                {getPlanIcon(currentPlan.code)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Plano {currentPlan.name}</h2>
                  {getStatusBadge(currentSub.status)}
                  {currentSub.cancelAtPeriodEnd && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                      Cancelamento agendado
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1">{status?.message}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(currentSub.billingPeriod === 'YEARLY' ? currentPlan.priceYearly : currentPlan.priceMonthly)}
              </p>
              <p className="text-gray-500">/{currentSub.billingPeriod === 'YEARLY' ? 'ano' : 'mes'}</p>
            </div>
          </div>

          {/* Limits */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Users className="w-4 h-4" />
                Usuarios
              </div>
              <p className="text-lg font-semibold mt-1">
                0 / {subscriptionData?.limits.users === 999 ? 'ilimitado' : subscriptionData?.limits.users}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                Clientes
              </div>
              <p className="text-lg font-semibold mt-1">
                0 / {subscriptionData?.limits.clients === 99999 ? 'ilimitado' : subscriptionData?.limits.clients}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-4">
            {!currentSub.cancelAtPeriodEnd && currentSub.status !== 'CANCELED' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cancelar Assinatura
              </button>
            )}
            {(currentSub.cancelAtPeriodEnd || currentSub.status === 'CANCELED') && (
              <button
                onClick={handleReactivate}
                disabled={loadingPayment}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Reativar Assinatura
              </button>
            )}
          </div>

          {/* Warning for suspended/past_due */}
          {(currentSub.status === 'SUSPENDED' || currentSub.status === 'PAST_DUE') && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Atencao!</p>
                <p className="text-sm text-red-700">
                  {currentSub.status === 'SUSPENDED'
                    ? 'Sua assinatura esta suspensa. Pague uma fatura pendente para reativar.'
                    : 'Voce tem faturas pendentes. Regularize para evitar a suspensao.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'plans'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Planos Disponiveis
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'invoices'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Faturas
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <>
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'MONTHLY' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'YEARLY' ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                billingCycle === 'YEARLY' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'YEARLY' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              2 meses gratis
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan?.id === plan.id;
              const price = billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
                    isCurrentPlan ? 'border-primary-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
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

                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{plan.description}</p>

                  <div className="mt-4">
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(price)}</span>
                    <span className="text-gray-500">/{billingCycle === 'MONTHLY' ? 'mes' : 'ano'}</span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{plan.maxUsers === 999 ? 'Ilimitado' : `${plan.maxUsers}`} usuarios</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{plan.maxClients === 99999 ? 'Ilimitado' : `${plan.maxClients}`} clientes</span>
                    </li>
                    {plan.hasReports && (
                      <li className="flex items-center gap-2 text-sm text-emerald-600">
                        <Check className="w-4 h-4" />
                        <span>Relatorios</span>
                      </li>
                    )}
                    {plan.hasFiscal && (
                      <li className="flex items-center gap-2 text-sm text-emerald-600">
                        <Check className="w-4 h-4" />
                        <span>Modulo Fiscal</span>
                      </li>
                    )}
                    {plan.hasAutomation && (
                      <li className="flex items-center gap-2 text-sm text-emerald-600">
                        <Check className="w-4 h-4" />
                        <span>Automacao WhatsApp</span>
                      </li>
                    )}
                    {plan.hasAI && (
                      <li className="flex items-center gap-2 text-sm text-emerald-600">
                        <Check className="w-4 h-4" />
                        <span>Assistente IA</span>
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => {
                      if (!isCurrentPlan && plan.code !== 'FREE') {
                        setSelectedPlan(plan);
                        setShowChangePlanModal(true);
                      }
                    }}
                    disabled={isCurrentPlan || plan.code === 'FREE'}
                    className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
                      isCurrentPlan || plan.code === 'FREE'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.code === 'FREE' ? 'Gratis' : 'Selecionar'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Nenhuma fatura encontrada</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.referencePeriodStart)} - {formatDate(invoice.referencePeriodEnd)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4">
                      {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                        <button
                          onClick={() => handlePayInvoice(invoice)}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pagar
                        </button>
                      )}
                      {invoice.status === 'PAID' && (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Pago em {formatDate(invoice.paidAt!)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Pagar Fatura</h3>
              <p className="text-gray-500 text-sm">{selectedInvoice.invoiceNumber}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-500">Valor a pagar</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(selectedInvoice.totalAmount)}</p>
              </div>

              {/* Payment Method */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('PIX')}
                  className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'PIX' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  PIX
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === 'CARD' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Cartao
                </button>
              </div>

              {paymentMethod === 'PIX' && !pixData && (
                <button
                  onClick={handleGeneratePix}
                  disabled={loadingPayment}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {loadingPayment ? 'Gerando...' : 'Gerar QR Code PIX'}
                </button>
              )}

              {paymentMethod === 'PIX' && pixData && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white border rounded-lg">
                      <img src={pixData.qrCodeBase64} alt="QR Code PIX" className="w-48 h-48" />
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Codigo Pix Copia e Cola</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pixData.qrCode}
                        readOnly
                        className="flex-1 text-xs bg-white border rounded p-2"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="p-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <Clock className="w-4 h-4" />
                    Expira em: {formatDate(pixData.expiresAt)}
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="text-center text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Em breve: Pagamento com cartao</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  setPixData(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Cancelar Assinatura</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Tem certeza?</p>
                  <p className="text-sm text-amber-700">
                    Voce perdera acesso a todos os recursos do seu plano atual.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCancelSubscription(true)}
                disabled={loadingPayment}
                className="w-full py-3 border border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50 disabled:opacity-50"
              >
                Cancelar ao final do periodo
              </button>
              <button
                onClick={() => handleCancelSubscription(false)}
                disabled={loadingPayment}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Cancelar imediatamente
              </button>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-900"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Confirmar Troca de Plano</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${getPlanColor(selectedPlan.code)} text-white`}>
                  {getPlanIcon(selectedPlan.code)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedPlan.name}</h4>
                  <p className="text-gray-500 text-sm">{selectedPlan.description}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Novo valor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly)}
                  <span className="text-sm text-gray-500 font-normal">
                    /{billingCycle === 'YEARLY' ? 'ano' : 'mes'}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowChangePlanModal(false);
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePlan}
                disabled={loadingPayment}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loadingPayment ? 'Processando...' : 'Confirmar Troca'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
