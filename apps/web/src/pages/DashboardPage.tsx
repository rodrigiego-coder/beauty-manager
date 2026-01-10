import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Loader2,
  Search,
  CreditCard,
  FileText,
  AlertCircle,
  Clock,
  Banknote,
  Smartphone,
  Wallet,
  RefreshCw,
  Crown,
  Gift,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import AIAssistantWidget from '../components/AIAssistantWidget';

type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

interface RevenueByPaymentMethod {
  cash: number;
  creditCard: number;
  debitCard: number;
  pix: number;
  other: number;
}

interface CommandsByStatus {
  open: number;
  inService: number;
  waitingPayment: number;
  closed: number;
  canceled: number;
}

interface TopService {
  name: string;
  quantity: number;
  revenue: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
}

interface CashRegisterStatus {
  isOpen: boolean;
  id?: string;
  openedAt?: string;
  openingBalance?: number;
  totalSales?: number;
  totalCash?: number;
  totalCard?: number;
  totalPix?: number;
  expectedBalance?: number;
}

interface DashboardStats {
  totalRevenue: number;
  previousRevenue: number;
  revenueGrowth: number;
  revenueByPaymentMethod: RevenueByPaymentMethod;
  todaySales: number;
  totalCommands: number;
  openCommands: number;
  averageTicket: number;
  commandsByStatus: CommandsByStatus;
  totalClients: number;
  newClients: number;
  returningClients: number;
  topServices: TopService[];
  lowStockProducts: LowStockProduct[];
  cashRegister: CashRegisterStatus;
  period: DashboardPeriod;
  periodStart: string;
  periodEnd: string;
}

interface LoyaltyStats {
  totalEnrolledClients: number;
  pointsInCirculation: number;
  redemptionsThisMonth: number;
}

const periodLabels: Record<DashboardPeriod, string> = {
  today: 'Hoje',
  week: 'Esta Semana',
  month: 'Este Mes',
  year: 'Este Ano',
};

const previousPeriodLabels: Record<DashboardPeriod, string> = {
  today: 'vs ontem',
  week: 'vs semana passada',
  month: 'vs mes passado',
  year: 'vs ano passado',
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'];

export function DashboardPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>('today');

  const [commandSearch, setCommandSearch] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [commandSuccess, setCommandSuccess] = useState<string | null>(null);
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [period]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/dashboard/stats?period=${period}`);
      setStats(response.data);

      // Load loyalty stats (optional, don't fail if not available)
      try {
        const loyaltyResponse = await api.get('/loyalty/stats');
        setLoyaltyStats(loyaltyResponse.data);
      } catch {
        // Loyalty not configured, ignore
        setLoyaltyStats(null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCommandSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const code = commandSearch.trim();
    if (!code) return;

    try {
      setCommandLoading(true);
      setCommandError(null);
      setCommandSuccess(null);

      const response = await api.get(`/commands/quick-access/${code}`, {
        timeout: 15000, // 15 segundos de timeout
      });
      const data = response.data;

      if (data.action === 'OPEN_EXISTING') {
        setCommandSuccess(`Comanda ${code} encontrada!`);
      } else {
        setCommandSuccess(data.message || `Comanda ${code} criada!`);
      }

      setCommandSearch('');

      setTimeout(() => {
        navigate(`/comandas/${data.commandId}`);
      }, 500);

    } catch (err: any) {
      console.error('Erro ao buscar comanda:', err);

      // Tratamento específico para diferentes tipos de erro
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setCommandError('Tempo limite excedido. Tente novamente.');
      } else if (err.response?.status === 403) {
        // Erro de assinatura
        const subError = err.response?.data;
        if (subError?.error === 'SUBSCRIPTION_INVALID') {
          setCommandError(subError.message || 'Assinatura inválida. Verifique seu plano.');
        } else {
          setCommandError('Acesso negado. Verifique suas permissões.');
        }
      } else if (err.response?.status === 400) {
        // BadRequest - caixa fechado, número inválido, etc.
        setCommandError(err.response?.data?.message || 'Dados inválidos');
      } else if (!err.response) {
        // Erro de rede
        setCommandError('Erro de conexão. Verifique sua internet.');
      } else {
        setCommandError(err.response?.data?.message || 'Erro ao buscar comanda');
      }
    } finally {
      setCommandLoading(false);
    }
  }, [commandSearch, navigate]);

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ptBR });
  };

  // Preparar dados para o grafico de pizza
  const getPaymentChartData = () => {
    if (!stats) return [];

    const { revenueByPaymentMethod } = stats;
    const data = [];

    if (revenueByPaymentMethod.cash > 0) {
      data.push({ name: 'Dinheiro', value: revenueByPaymentMethod.cash });
    }
    if (revenueByPaymentMethod.creditCard > 0) {
      data.push({ name: 'Credito', value: revenueByPaymentMethod.creditCard });
    }
    if (revenueByPaymentMethod.debitCard > 0) {
      data.push({ name: 'Debito', value: revenueByPaymentMethod.debitCard });
    }
    if (revenueByPaymentMethod.pix > 0) {
      data.push({ name: 'PIX', value: revenueByPaymentMethod.pix });
    }
    if (revenueByPaymentMethod.other > 0) {
      data.push({ name: 'Outros', value: revenueByPaymentMethod.other });
    }

    return data;
  };

  // Skeleton Loading
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>

        <div className="h-32 bg-gray-200 rounded-xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-xl"></div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const paymentChartData = getPaymentChartData();
  const maxServiceQuantity = stats.topServices.length > 0
    ? Math.max(...stats.topServices.map(s => s.quantity))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header com Filtro de Periodo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as DashboardPeriod)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="year">Este Ano</option>
          </select>

          <button
            onClick={loadStats}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Acesso Rapido - Comanda */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-primary-600">Acesso Rapido - Comanda</h2>
          <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded font-medium">Ctrl+K</span>
        </div>

        <form onSubmit={handleCommandSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              placeholder="Digite o numero da comanda..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={commandLoading}
            />
          </div>
          <button
            type="submit"
            disabled={commandLoading || !commandSearch.trim()}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {commandLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar
              </>
            )}
          </button>
        </form>

        {commandError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-600">{commandError}</span>
            {commandError.includes('caixa') && (
              <button
                onClick={() => navigate('/caixa')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                Ir para Caixa
              </button>
            )}
          </div>
        )}
        {commandSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {commandSuccess}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-3">
          Digite o numero e pressione Enter. Se a comanda nao existir, sera criada automaticamente.
        </p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Faturamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-100">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {stats.revenueGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(stats.revenueGrowth).toFixed(1)}% {previousPeriodLabels[period]}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-500 mt-1">Faturamento {periodLabels[period]}</p>
          </div>
        </div>

        {/* Card Comandas Abertas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-blue-100">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <Link
              to="/caixa"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver todas
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{stats.openCommands}</p>
            <p className="text-sm text-gray-500 mt-1">Comandas Abertas</p>
          </div>
        </div>

        {/* Card Ticket Medio */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-primary-100">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm text-gray-500">{periodLabels[period]}</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageTicket)}</p>
            <p className="text-sm text-gray-500 mt-1">Ticket Medio</p>
          </div>
        </div>

        {/* Card Clientes Novos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-violet-100">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <Link
              to="/clientes"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver clientes
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">{stats.newClients}</p>
            <p className="text-sm text-gray-500 mt-1">Clientes Novos ({periodLabels[period]})</p>
          </div>
        </div>
      </div>

      {/* Graficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico de Pizza - Faturamento por Forma de Pagamento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Faturamento por Forma de Pagamento</h3>

          {paymentChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <DollarSign className="w-12 h-12 text-gray-300 mb-3" />
              <p>Nenhum pagamento no periodo</p>
            </div>
          )}

          {/* Legenda com valores */}
          {paymentChartData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span className="text-gray-600">Dinheiro:</span>
                <span className="font-medium">{formatCurrency(stats.revenueByPaymentMethod.cash)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Cartao:</span>
                <span className="font-medium">{formatCurrency(stats.revenueByPaymentMethod.creditCard + stats.revenueByPaymentMethod.debitCard)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4 text-violet-500" />
                <span className="text-gray-600">PIX:</span>
                <span className="font-medium">{formatCurrency(stats.revenueByPaymentMethod.pix)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Servicos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Servicos</h3>

          {stats.topServices.length > 0 ? (
            <div className="space-y-4">
              {stats.topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 truncate max-w-[150px]" title={service.name}>
                        {service.name}
                      </span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{service.quantity}x</span>
                        <span className="font-medium text-emerald-600">{formatCurrency(service.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${(service.quantity / maxServiceQuantity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
              <p>Nenhum servico realizado no periodo</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertas e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>

          <div className="space-y-3">
            {/* Produtos com estoque baixo */}
            {stats.lowStockProducts.length > 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">
                        {stats.lowStockProducts.length} produto(s) com estoque baixo
                      </p>
                      <p className="text-sm text-amber-600">
                        {stats.lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                        {stats.lowStockProducts.length > 3 && '...'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/produtos"
                    className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700"
                  >
                    Ver produtos
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <p className="text-emerald-800">Todos os produtos com estoque OK</p>
                </div>
              </div>
            )}

            {/* Comandas aguardando pagamento */}
            {stats.commandsByStatus.waitingPayment > 0 ? (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">
                        {stats.commandsByStatus.waitingPayment} comanda(s) aguardando pagamento
                      </p>
                      <p className="text-sm text-orange-600">Clientes prontos para pagar</p>
                    </div>
                  </div>
                  <Link
                    to="/caixa"
                    className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                  >
                    Ir para caixa
                  </Link>
                </div>
              </div>
            ) : null}

            {/* Sem alertas */}
            {stats.lowStockProducts.length === 0 && stats.commandsByStatus.waitingPayment === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-gray-500">Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Status do Caixa */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Caixa</h3>

          {stats.cashRegister.isOpen ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-medium">Caixa Aberto</span>
                {stats.cashRegister.openedAt && (
                  <span className="text-sm text-gray-500">
                    desde {formatTime(stats.cashRegister.openedAt)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Abertura</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(stats.cashRegister.openingBalance || 0)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Vendas Hoje</p>
                  <p className="font-semibold text-emerald-600">
                    {formatCurrency(stats.todaySales)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Dinheiro</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(stats.cashRegister.totalCash || 0)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-600">Saldo Esperado</p>
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(stats.cashRegister.expectedBalance || 0)}
                  </p>
                </div>
              </div>

              <Link
                to="/caixa"
                className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Gerenciar Caixa
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Caixa Fechado</h4>
              <p className="text-gray-500 mb-4">
                Abra o caixa para registrar vendas e pagamentos
              </p>
              <Link
                to="/caixa"
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Wallet className="w-5 h-5" />
                Abrir Caixa
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Resumo de Comandas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Comandas ({periodLabels[period]})</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.commandsByStatus.open}</p>
            <p className="text-sm text-blue-700">Abertas</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.commandsByStatus.inService}</p>
            <p className="text-sm text-purple-700">Em Atendimento</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats.commandsByStatus.waitingPayment}</p>
            <p className="text-sm text-orange-700">Aguard. Pagamento</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">{stats.commandsByStatus.closed}</p>
            <p className="text-sm text-emerald-700">Fechadas</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.commandsByStatus.canceled}</p>
            <p className="text-sm text-red-700">Canceladas</p>
          </div>
        </div>
      </div>

      {/* Widget Programa de Fidelidade */}
      {loyaltyStats && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Programa de Fidelidade</h3>
                <p className="text-white/80 text-sm">Engaje seus clientes</p>
              </div>
            </div>
            <Link
              to="/configuracoes/fidelidade"
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm font-medium"
            >
              Configurar
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-white/80" />
              </div>
              <p className="text-2xl font-bold">{loyaltyStats.totalEnrolledClients}</p>
              <p className="text-xs text-white/80">Clientes Inscritos</p>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-white/80" />
              </div>
              <p className="text-2xl font-bold">{loyaltyStats.pointsInCirculation.toLocaleString()}</p>
              <p className="text-xs text-white/80">Pontos em Circulacao</p>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-white/80" />
              </div>
              <p className="text-2xl font-bold">{loyaltyStats.redemptionsThisMonth}</p>
              <p className="text-xs text-white/80">Resgates (Mes)</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/relatorios/fidelidade"
              className="text-sm text-white/90 hover:text-white underline"
            >
              Ver relatorio completo →
            </Link>
          </div>
        </div>
      )}

      {/* Belle - Assistente IA */}
      <AIAssistantWidget />
    </div>
  );
}
