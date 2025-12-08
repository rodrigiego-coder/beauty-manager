import { useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

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

interface DashboardStats {
  appointmentsToday: number;
  activeClients: number;
  monthlyRevenue: number;
  lowStockProducts: number;
  pendingPayables: number;
  pendingReceivables: number;
}

interface ChartData {
  name: string;
  receitas: number;
  despesas: number;
}

const mockChartData: ChartData[] = [
  { name: 'Jan', receitas: 4000, despesas: 2400 },
  { name: 'Fev', receitas: 3000, despesas: 1398 },
  { name: 'Mar', receitas: 5000, despesas: 2800 },
  { name: 'Abr', receitas: 4780, despesas: 3908 },
  { name: 'Mai', receitas: 5890, despesas: 4800 },
  { name: 'Jun', receitas: 6390, despesas: 3800 },
];

const mockServiceData = [
  { name: 'Corte', value: 45 },
  { name: 'Coloracao', value: 30 },
  { name: 'Manicure', value: 20 },
  { name: 'Hidratacao', value: 15 },
  { name: 'Outros', value: 10 },
];

export function DashboardPage() {
  const [stats] = useState<DashboardStats>({
    appointmentsToday: 12,
    activeClients: 248,
    monthlyRevenue: 15890,
    lowStockProducts: 3,
    pendingPayables: 2500,
    pendingReceivables: 1800,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statCards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.appointmentsToday.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Clientes Ativos',
      value: stats.activeClients.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Receita do Mes',
      value: formatCurrency(stats.monthlyRevenue),
      change: '+18%',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Estoque Baixo',
      value: stats.lowStockProducts.toString(),
      change: 'Atencao',
      changeType: 'negative' as const,
      icon: Package,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bem-vindo ao painel de controle do seu salao - {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats cards */}
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

      {/* Financial summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contas a Pagar</h3>
            <span className="text-red-600 font-bold">{formatCurrency(stats.pendingPayables)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span>3 contas vencem esta semana</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contas a Receber</h3>
            <span className="text-emerald-600 font-bold">{formatCurrency(stats.pendingReceivables)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>5 clientes com pagamento pendente</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Receitas vs Despesas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
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
          </div>
        </div>

        {/* Services chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Servicos Mais Realizados</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockServiceData} layout="vertical">
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
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* NOVO AGENDAMENTO */}
              <Link to="/agenda/novo" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <Calendar className="w-8 h-8 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Novo Agendamento</span>
              </Link>

              {/* NOVO CLIENTE */}
              <Link to="/clientes/novo" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <Users className="w-8 h-8 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Novo Cliente</span>
              </Link>

              {/* LANÇAR RECEITA */}
              <Link to="/financeiro/receita" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <DollarSign className="w-8 h-8 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Lançar Receita</span>
              </Link>

              {/* ENTRADA ESTOQUE */}
              <Link to="/estoque/entrada" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
                  <Package className="w-8 h-8 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">Entrada Estoque</span>
              </Link>
              
          </div>
      </div>
    </div>
  );
}
