import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

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
  const [subscribeForm, setSubscribeForm] = useState({
    deliveryType: 'PICKUP',
    deliveryAddress: '',
    preferredDay: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const handleOpenSubscribeModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setSubscribeForm({
      deliveryType: 'PICKUP',
      deliveryAddress: '',
      preferredDay: 1,
    });
    setShowSubscribeModal(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      setSubscribingPlanId(selectedPlan.id);
      await api.post('/product-subscriptions/subscriptions', {
        planId: selectedPlan.id,
        deliveryType: subscribeForm.deliveryType,
        deliveryAddress: subscribeForm.deliveryType === 'DELIVERY' ? subscribeForm.deliveryAddress : null,
        preferredDay: subscribeForm.preferredDay,
      });
      setShowSubscribeModal(false);
      loadData();
      alert('Assinatura realizada com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao assinar plano');
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
    if (!confirm('Deseja cancelar esta assinatura? Esta ação não pode ser desfeita.')) return;
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

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const calculateOriginalPrice = (plan: Plan) => {
    if (!plan.items) return 0;
    return plan.items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || '0');
      return sum + price * item.quantity;
    }, 0);
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
        <p className="text-red-600">{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Economize com nossas assinaturas</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Planos de Assinatura de Produtos</h1>
        <p className="text-gray-500 mt-2">
          Receba seus produtos favoritos periodicamente com descontos exclusivos
        </p>
      </div>

      {/* My Subscriptions */}
      {mySubscriptions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            Minhas Assinaturas
          </h2>
          <div className="space-y-4">
            {mySubscriptions.map(subscription => (
              <div
                key={subscription.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{subscription.plan?.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[subscription.status]?.bgColor} ${statusConfig[subscription.status]?.color}`}
                    >
                      {statusConfig[subscription.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Próxima: {subscription.nextDeliveryDate
                        ? format(new Date(subscription.nextDeliveryDate + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                        : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {subscription.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {subscription.status === 'ACTIVE' && (
                    <button
                      onClick={() => handlePauseSubscription(subscription.id)}
                      disabled={actionLoading === subscription.id}
                      className="px-3 py-1.5 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-sm flex items-center gap-1"
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
                      className="px-3 py-1.5 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg text-sm flex items-center gap-1"
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
                      className="px-3 py-1.5 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Planos Disponíveis</h2>
        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano disponível</h3>
            <p className="text-gray-500">Em breve teremos planos de assinatura disponíveis</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => {
              const originalPrice = calculateOriginalPrice(plan);
              const finalPrice = parseFloat(plan.price);
              const savings = originalPrice - finalPrice;
              const alreadySubscribed = isAlreadySubscribed(plan.id);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Plan Header */}
                  <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                        {frequencyLabels[plan.frequency] || 'Mensal'}
                      </span>
                      {plan.discount > 0 && (
                        <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-bold">
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
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                      <span className="text-gray-500 mb-1">/{(frequencyLabels[plan.frequency] || 'mensal').toLowerCase()}</span>
                    </div>
                    {savings > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
                        <span className="text-sm text-green-600 font-medium">
                          Economia de {formatCurrency(savings)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Produtos inclusos:</h4>
                    <ul className="space-y-2">
                      {plan.items?.map(item => (
                        <li key={item.id} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600">
                            {item.quantity}x {item.product?.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        A cada {frequencyDays[plan.frequency] || 30} dias
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Cobrança automática
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="p-6 pt-0">
                    {alreadySubscribed ? (
                      <button
                        disabled
                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Já assinado
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSubscribeModal(plan)}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Star className="w-5 h-5" />
                        Assinar Agora
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Assinar Plano</h2>
              <p className="text-gray-500 text-sm mt-1">Configure sua assinatura</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan Summary */}
              <div className="p-4 bg-primary-50 rounded-lg">
                <h3 className="font-medium text-primary-900">{selectedPlan.name}</h3>
                <p className="text-2xl font-bold text-primary-700 mt-1">
                  {formatCurrency(selectedPlan.price)}
                  <span className="text-sm font-normal text-primary-600">
                    /{(frequencyLabels[selectedPlan.frequency] || 'mensal').toLowerCase()}
                  </span>
                </p>
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como deseja receber?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSubscribeForm(prev => ({ ...prev, deliveryType: 'PICKUP' }))}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      subscribeForm.deliveryType === 'PICKUP'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Package className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Retirada</span>
                    <p className="text-xs text-gray-500 mt-1">No salão</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubscribeForm(prev => ({ ...prev, deliveryType: 'DELIVERY' }))}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      subscribeForm.deliveryType === 'DELIVERY'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Entrega</span>
                    <p className="text-xs text-gray-500 mt-1">No endereço</p>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              {subscribeForm.deliveryType === 'DELIVERY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Entrega
                  </label>
                  <textarea
                    value={subscribeForm.deliveryAddress}
                    onChange={e => setSubscribeForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    rows={3}
                    placeholder="Rua, número, bairro, cidade..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Preferred Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia preferido do mês para entrega
                </label>
                <select
                  value={subscribeForm.preferredDay}
                  onChange={e => setSubscribeForm(prev => ({ ...prev, preferredDay: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      Dia {day}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Sua primeira entrega será agendada para o próximo dia {subscribeForm.preferredDay}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubscribe}
                disabled={subscribingPlanId === selectedPlan.id || (subscribeForm.deliveryType === 'DELIVERY' && !subscribeForm.deliveryAddress)}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {subscribingPlanId === selectedPlan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Assinando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmar Assinatura
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailableSubscriptionsPage;
