import { useState, useEffect } from 'react';
import api from '../services/api';

// Types
interface DashboardMetrics {
  totalSalons: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  suspendedSubscriptions: number;
  canceledSubscriptions: number;
  mrr: number;
  arr: number;
  churnRate: number;
  revenueByPlan: { planName: string; revenue: number; count: number }[];
  recentEvents: SubscriptionEvent[];
}

interface Salon {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  subscription: {
    id: string;
    status: string;
    planName: string;
    currentPeriodEnd: string;
  } | null;
}

interface Subscription {
  id: string;
  salonId: string;
  salonName: string;
  planName: string;
  status: string;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  salonId: string;
  salonName: string;
  subscriptionId: string;
  totalAmount: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  referencePeriodStart: string;
  referencePeriodEnd: string;
}

interface Plan {
  id: string;
  code: string;
  name: string;
  priceMonthly: string;
  priceYearly: string | null;
  maxAppointments: number | null;
  maxTeamMembers: number | null;
  maxProducts: number | null;
  isActive: boolean;
}

interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  salonName?: string;
  type: string;
  previousValue: string | null;
  newValue: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

type TabType = 'dashboard' | 'salons' | 'subscriptions' | 'invoices' | 'plans' | 'events';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // List data
  const [salons, setSalons] = useState<Salon[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);

  // Filters
  const [salonSearch, setSalonSearch] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('');

  // Modals
  const [showSalonModal, setShowSalonModal] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Load dashboard metrics
  const loadMetrics = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setMetrics(response.data);
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  // Load salons
  const loadSalons = async () => {
    try {
      const params = new URLSearchParams();
      if (salonSearch) params.append('search', salonSearch);
      const response = await api.get(`/admin/salons?${params.toString()}`);
      setSalons(response.data);
    } catch (err) {
      console.error('Error loading salons:', err);
    }
  };

  // Load subscriptions
  const loadSubscriptions = async () => {
    try {
      const params = new URLSearchParams();
      if (subscriptionStatus) params.append('status', subscriptionStatus);
      const response = await api.get(`/admin/subscriptions?${params.toString()}`);
      setSubscriptions(response.data);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    }
  };

  // Load invoices
  const loadInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (invoiceStatus) params.append('status', invoiceStatus);
      const response = await api.get(`/admin/invoices?${params.toString()}`);
      setInvoices(response.data);
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  };

  // Load plans
  const loadPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  // Load events
  const loadEvents = async () => {
    try {
      const response = await api.get('/admin/events?limit=100');
      setEvents(response.data);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await loadMetrics();
      } catch (err) {
        setError('Erro ao carregar dados. Verifique suas permissões.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load tab-specific data
  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        loadMetrics();
        break;
      case 'salons':
        loadSalons();
        break;
      case 'subscriptions':
        loadSubscriptions();
        break;
      case 'invoices':
        loadInvoices();
        break;
      case 'plans':
        loadPlans();
        break;
      case 'events':
        loadEvents();
        break;
    }
  }, [activeTab, salonSearch, subscriptionStatus, invoiceStatus]);

  // Suspend salon
  const handleSuspendSalon = async (salonId: string, reason: string) => {
    try {
      await api.post(`/admin/salons/${salonId}/suspend`, { reason });
      loadSalons();
      loadMetrics();
      setShowSalonModal(false);
      setSelectedSalon(null);
    } catch (err) {
      console.error('Error suspending salon:', err);
      alert('Erro ao suspender salão');
    }
  };

  // Activate salon
  const handleActivateSalon = async (salonId: string) => {
    try {
      await api.post(`/admin/salons/${salonId}/activate`);
      loadSalons();
      loadMetrics();
      setShowSalonModal(false);
      setSelectedSalon(null);
    } catch (err) {
      console.error('Error activating salon:', err);
      alert('Erro ao ativar salão');
    }
  };

  // Mark invoice as paid
  const handleMarkInvoicePaid = async (invoiceId: string, paymentMethod: string, transactionId?: string) => {
    try {
      await api.post(`/admin/invoices/${invoiceId}/mark-paid`, { paymentMethod, transactionId });
      loadInvoices();
      loadMetrics();
      setShowInvoiceModal(false);
      setSelectedInvoice(null);
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      alert('Erro ao marcar fatura como paga');
    }
  };

  // Seed plans
  const handleSeedPlans = async () => {
    if (!confirm('Isso irá criar/atualizar os planos padrão. Continuar?')) return;
    try {
      await api.post('/plans/seed');
      loadPlans();
      alert('Planos criados com sucesso!');
    } catch (err) {
      console.error('Error seeding plans:', err);
      alert('Erro ao criar planos');
    }
  };

  // Impersonate salon (Support Mode)
  const handleImpersonateSalon = async (salonId: string, salonName: string) => {
    const reason = prompt('Motivo do acesso (obrigatório para compliance):');
    if (!reason || reason.length < 10) {
      alert('O motivo deve ter pelo menos 10 caracteres.');
      return;
    }

    try {
      // 1. Criar sessão de suporte
      const { data: session } = await api.post('/support/impersonate', { salonId, reason });

      // 2. Consumir token imediatamente
      const { data: auth } = await api.post('/support/consume-token', { token: session.token });

      // 3. Salvar token atual como backup e usar o novo
      const currentToken = localStorage.getItem('accessToken');
      localStorage.setItem('accessToken_backup', currentToken || '');
      localStorage.setItem('accessToken', auth.accessToken);

      // 4. Marcar modo suporte
      localStorage.setItem('supportMode', JSON.stringify({
        active: true,
        salonId,
        salonName,
        expiresAt: new Date(Date.now() + auth.expiresIn * 1000).toISOString(),
      }));

      // 5. Fechar modal e redirecionar
      setShowSalonModal(false);
      setSelectedSalon(null);
      alert(`Entrando como "${salonName}". Você será redirecionado.`);
      window.location.href = '/';
    } catch (err) {
      console.error('Error impersonating salon:', err);
      alert('Erro ao acessar salão. Verifique suas permissões.');
    }
  };

  // Format currency
  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Format datetime
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIALING: 'bg-blue-100 text-blue-800',
      PAST_DUE: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
      CANCELED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      VOIDED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      TRIALING: 'Trial',
      PAST_DUE: 'Em Atraso',
      SUSPENDED: 'Suspenso',
      CANCELED: 'Cancelado',
      PENDING: 'Pendente',
      PAID: 'Pago',
      OVERDUE: 'Vencido',
      VOIDED: 'Anulado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Gerenciamento de salões, assinaturas e faturamento</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'salons', label: 'Salões' },
            { id: 'subscriptions', label: 'Assinaturas' },
            { id: 'invoices', label: 'Faturas' },
            { id: 'plans', label: 'Planos' },
            { id: 'events', label: 'Eventos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && metrics && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Total de Salões</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalSalons}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Assinaturas Ativas</p>
              <p className="text-3xl font-bold text-green-600">{metrics.activeSubscriptions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">MRR (Receita Mensal)</p>
              <p className="text-3xl font-bold text-pink-600">{formatCurrency(metrics.mrr)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Taxa de Churn</p>
              <p className="text-3xl font-bold text-orange-600">{metrics.churnRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Em Trial</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.trialingSubscriptions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Suspensos</p>
              <p className="text-2xl font-bold text-red-600">{metrics.suspendedSubscriptions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">ARR (Receita Anual)</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.arr)}</p>
            </div>
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Receita por Plano</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Plano</th>
                    <th className="text-right py-2 px-4">Assinantes</th>
                    <th className="text-right py-2 px-4">Receita Mensal</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.revenueByPlan.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-4">{item.planName}</td>
                      <td className="text-right py-2 px-4">{item.count}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Eventos Recentes</h3>
            <div className="space-y-3">
              {metrics.recentEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{event.type}</span>
                    {event.previousValue && event.newValue && (
                      <span className="text-gray-500 ml-2">
                        {event.previousValue} → {event.newValue}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDateTime(event.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Salons Tab */}
      {activeTab === 'salons' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={salonSearch}
              onChange={(e) => setSalonSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{salon.name}</div>
                      <div className="text-sm text-gray-500">{salon.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{salon.email}</div>
                      <div className="text-sm text-gray-500">{salon.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{salon.subscription?.planName || 'Sem plano'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {salon.subscription ? getStatusBadge(salon.subscription.status) : getStatusBadge('NONE')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(salon.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSalon(salon);
                          setShowSalonModal(true);
                        }}
                        className="text-pink-600 hover:text-pink-900 text-sm font-medium"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-4">
            <select
              value={subscriptionStatus}
              onChange={(e) => setSubscriptionStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="TRIALING">Trial</option>
              <option value="PAST_DUE">Em Atraso</option>
              <option value="SUSPENDED">Suspenso</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancelar ao Fim</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sub.salonName}</div>
                      <div className="text-sm text-gray-500">{sub.salonId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{sub.planName}</td>
                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sub.billingPeriod === 'MONTHLY' ? 'Mensal' : 'Anual'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sub.status === 'TRIALING' && sub.trialEndsAt
                        ? `Trial: ${formatDate(sub.trialEndsAt)}`
                        : formatDate(sub.currentPeriodEnd)}
                    </td>
                    <td className="px-6 py-4">
                      {sub.cancelAtPeriodEnd ? (
                        <span className="text-red-600 text-sm">Sim</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Não</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-4">
            <select
              value={invoiceStatus}
              onChange={(e) => setInvoiceStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="OVERDUE">Vencido</option>
              <option value="VOIDED">Anulado</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{invoice.salonName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(invoice.referencePeriodStart)} - {formatDate(invoice.referencePeriodEnd)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status !== 'PAID' && invoice.status !== 'VOIDED' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceModal(true);
                          }}
                          className="text-pink-600 hover:text-pink-900 text-sm font-medium"
                        >
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={handleSeedPlans}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Criar/Atualizar Planos Padrão
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow p-6 ${!plan.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {plan.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Ativo</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inativo</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">Código: {plan.code}</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Mensal:</span>{' '}
                    <span className="font-medium">{formatCurrency(plan.priceMonthly)}</span>
                  </p>
                  {plan.priceYearly && (
                    <p>
                      <span className="text-gray-500">Anual:</span>{' '}
                      <span className="font-medium">{formatCurrency(plan.priceYearly)}</span>
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t space-y-1 text-sm text-gray-600">
                  <p>Agendamentos: {plan.maxAppointments ?? 'Ilimitado'}</p>
                  <p>Equipe: {plan.maxTeamMembers ?? 'Ilimitado'}</p>
                  <p>Produtos: {plan.maxProducts ?? 'Ilimitado'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assinatura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mudança</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalhes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(event.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{event.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-900">{event.salonName || '-'}</div>
                    <div className="text-gray-500 text-xs">{event.subscriptionId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {event.previousValue && event.newValue ? (
                      <span>
                        <span className="text-gray-500">{event.previousValue}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{event.newValue}</span>
                      </span>
                    ) : event.newValue ? (
                      <span className="font-medium">{event.newValue}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.metadata ? JSON.stringify(event.metadata) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Salon Management Modal */}
      {showSalonModal && selectedSalon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciar Salão</h2>
            <div className="mb-4">
              <p className="font-medium">{selectedSalon.name}</p>
              <p className="text-sm text-gray-500">{selectedSalon.email}</p>
              {selectedSalon.subscription && (
                <div className="mt-2">
                  <p className="text-sm">
                    Plano: <span className="font-medium">{selectedSalon.subscription.planName}</span>
                  </p>
                  <p className="text-sm">
                    Status: {getStatusBadge(selectedSalon.subscription.status)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {selectedSalon.subscription?.status === 'SUSPENDED' ? (
                <button
                  onClick={() => handleActivateSalon(selectedSalon.id)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Reativar Salão
                </button>
              ) : selectedSalon.subscription?.status === 'ACTIVE' ||
                selectedSalon.subscription?.status === 'TRIALING' ? (
                <button
                  onClick={() => {
                    const reason = prompt('Motivo da suspensão:');
                    if (reason) handleSuspendSalon(selectedSalon.id, reason);
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Suspender Salão
                </button>
              ) : null}
              <button
                onClick={() => handleImpersonateSalon(selectedSalon.id, selectedSalon.name)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Entrar como Este Salão
              </button>
              <button
                onClick={() => {
                  setShowSalonModal(false);
                  setSelectedSalon(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Invoice Paid Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Marcar Fatura como Paga</h2>
            <div className="mb-4">
              <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
              <p className="text-sm text-gray-500">{selectedInvoice.salonName}</p>
              <p className="text-lg font-bold mt-2">{formatCurrency(selectedInvoice.totalAmount)}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleMarkInvoicePaid(
                  selectedInvoice.id,
                  formData.get('paymentMethod') as string,
                  formData.get('transactionId') as string || undefined
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
                <select
                  name="paymentMethod"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="PIX">PIX</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="TRANSFER">Transferência</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID da Transação (opcional)</label>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="Ex: PIX123456"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Confirmar Pagamento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
