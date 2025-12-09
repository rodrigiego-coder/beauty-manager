import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Loader2,
  Search,
  CreditCard,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface DashboardStats {
  appointmentsToday: number;
  activeClients: number;
  monthlyRevenue: number;
  lowStockProducts: number;
  pendingPayables: number;
  pendingReceivables: number;
  revenueChart: { name: string; receitas: number; despesas: number }[];
  topServices: { name: string; value: number }[];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [commandSearch, setCommandSearch] = useState('');
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [commandSuccess, setCommandSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

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
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
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

      const response = await api.get(`/commands/quick-access/${code}`);
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
      setCommandError(err.response?.data?.message || 'Erro ao buscar comanda');
    } finally {
      setCommandLoading(false);
    }
  }, [commandSearch, navigate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
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
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.appointmentsToday.toString(),
      change: 'Hoje',
      changeType: 'neutral' as const,
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Clientes Cadastrados',
      value: stats.activeClients.toString(),
      change: 'Total',
      changeType: 'neutral' as const,
      icon: Users,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Receita do Mes',
      value: formatCurrency(stats.monthlyRevenue),
      change: format(new Date(), 'MMMM', { locale: ptBR }),
      changeType: 'positive' as const,
      icon: DollarSign,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Estoque Baixo',
      value: stats.lowStockProducts.toString(),
      change: stats.lowStockProducts > 0 ? 'Atencao' : 'OK',
      changeType: stats.lowStockProducts > 0 ? 'negative' as const : 'positive' as const,
      icon: Package,
      iconBg: stats.lowStockProducts > 0 ? 'bg-amber-100' : 'bg-emerald-100',
      iconColor: stats.lowStockProducts > 0 ? 'text-amber-600' : 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bem-vindo ao painel de controle do seu salao - {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-primary-600">Acesso Rápido - Comanda</h2>
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
              placeholder="Digite o número da comanda..."
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
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {commandError}
          </div>
        )}
        {commandSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {commandSuccess}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-3">
          Digite o número e pressione Enter. Se a comanda não existir, será criada automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'positive'
                    ? 'text-emerald-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {stat.changeType === 'positive' && <ArrowUpRight className="w-4 h-4" />}
                {stat.changeType === 'negative' && <AlertTriangle className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contas a Pagar</h3>
            <span className="text-red-600 font-bold">{formatCurrency(stats.pendingPayables)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span>Pendentes de pagamento</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contas a Receber</h3>
            <span className="text-emerald-600 font-bold">{formatCurrency(stats.pendingReceivables)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Pendentes de recebimento</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Receitas vs Despesas</h3>
          <div className="h-80">
            {stats.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="#10b981"
                    fill="#d1fae5"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    fill="#fee2e2"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nenhum dado financeiro encontrado
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Servicos Mais Realizados</h3>
          <div className="h-80">
            {stats.topServices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nenhum servico realizado ainda
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acoes Rapidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/agenda/novo" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Calendar className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Novo Agendamento</span>
          </Link>

          <Link to="/clientes/novo" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Users className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Novo Cliente</span>
          </Link>

          <Link to="/financeiro/receita" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <DollarSign className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Lancar Receita</span>
          </Link>

          <Link to="/estoque/entrada" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Package className="w-8 h-8 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Entrada Estoque</span>
          </Link>
        </div>
      </div>
    </div>
  );
}