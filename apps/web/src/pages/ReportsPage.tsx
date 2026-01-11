import { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Scissors,
  User,
  BarChart3,
  FileText,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

// Types
interface SalesReportItem {
  date: string;
  total: number;
  commandCount: number;
  averageTicket: number;
}

interface SalesReport {
  items: SalesReportItem[];
  totals: { total: number; commands: number; averageTicket: number };
}

interface ServiceReportItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  revenue: number;
  averageTicket: number;
  percentOfTotal: number;
}

interface ProductReportItem {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  currentStock: number;
}

interface ProfessionalReportItem {
  id: string;
  name: string;
  appointments: number;
  revenue: number;
  commission: number;
  averageTicket: number;
}

interface ClientsReport {
  newClients: number;
  returningClients: number;
  retentionRate: number;
  averageTicket: number;
  averageFrequency: number;
  topClients: Array<{
    id: string;
    name: string;
    visits: number;
    totalSpent: number;
  }>;
}

type TabType = 'sales' | 'services' | 'products' | 'professionals' | 'clients';

type SortField = 'name' | 'quantity' | 'revenue' | 'appointments' | 'visits' | 'totalSpent';
type SortDirection = 'asc' | 'desc';

const TABS = [
  { id: 'sales' as TabType, name: 'Vendas', icon: DollarSign },
  { id: 'services' as TabType, name: 'Servicos', icon: Scissors },
  { id: 'products' as TabType, name: 'Produtos', icon: Package },
  { id: 'professionals' as TabType, name: 'Profissionais', icon: User },
  { id: 'clients' as TabType, name: 'Clientes', icon: Users },
];

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Por Dia' },
  { value: 'week', label: 'Por Semana' },
  { value: 'month', label: 'Por Mes' },
];

// Date preset helpers
const getDatePresets = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);

  return [
    { label: 'Hoje', start: today, end: today },
    { label: 'Ultimos 7 dias', start: last7Days, end: today },
    { label: 'Esta Semana', start: startOfWeek, end: today },
    { label: 'Este Mes', start: startOfMonth, end: today },
    { label: 'Ultimos 30 dias', start: last30Days, end: today },
    { label: 'Este Ano', start: startOfYear, end: today },
  ];
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState({
    start: formatDateForInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: formatDateForInput(new Date()),
  });
  const [showPresets, setShowPresets] = useState(false);

  // Data states
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [previousSalesTotal, setPreviousSalesTotal] = useState<number | null>(null);
  const [servicesReport, setServicesReport] = useState<{ items: ServiceReportItem[]; total: number } | null>(null);
  const [productsReport, setProductsReport] = useState<{ items: ProductReportItem[]; total: number } | null>(null);
  const [professionalsReport, setProfessionalsReport] = useState<{
    items: ProfessionalReportItem[];
    totals: { revenue: number; commission: number };
  } | null>(null);
  const [clientsReport, setClientsReport] = useState<ClientsReport | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const params = `startDate=${dateRange.start}&endDate=${dateRange.end}`;

      switch (activeTab) {
        case 'sales': {
          const { data } = await api.get(`/reports/sales?${params}&groupBy=${groupBy}`);
          setSalesReport(data);

          // Load previous period for growth calculation
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const prevStart = new Date(startDate);
          prevStart.setDate(prevStart.getDate() - daysDiff - 1);
          const prevEnd = new Date(startDate);
          prevEnd.setDate(prevEnd.getDate() - 1);

          try {
            const prevParams = `startDate=${formatDateForInput(prevStart)}&endDate=${formatDateForInput(prevEnd)}`;
            const { data: prevData } = await api.get(`/reports/sales?${prevParams}&groupBy=${groupBy}`);
            setPreviousSalesTotal(prevData.totals.total);
          } catch {
            setPreviousSalesTotal(null);
          }
          break;
        }
        case 'services': {
          const { data } = await api.get(`/reports/services?${params}`);
          setServicesReport(data);
          break;
        }
        case 'products': {
          const { data } = await api.get(`/reports/products?${params}`);
          setProductsReport(data);
          break;
        }
        case 'professionals': {
          const { data } = await api.get(`/reports/professionals?${params}`);
          setProfessionalsReport(data);
          break;
        }
        case 'clients': {
          const { data } = await api.get(`/reports/clients?${params}`);
          setClientsReport(data);
          break;
        }
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar relatorio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do relatorio';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, dateRange, groupBy]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const params = `startDate=${dateRange.start}&endDate=${dateRange.end}`;
      const response = await api.get(`/reports/export/${activeTab}?${params}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `relatorio_${activeTab}_${dateRange.start}_${dateRange.end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessage({ type: 'success', text: 'Relatorio exportado com sucesso!' });
    } catch (err: unknown) {
      console.error('Erro ao exportar:', err);
      setMessage({ type: 'error', text: 'Erro ao exportar relatorio' });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePresetClick = (preset: { start: Date; end: Date }) => {
    setDateRange({
      start: formatDateForInput(preset.start),
      end: formatDateForInput(preset.end),
    });
    setShowPresets(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (value: number | string | null | undefined): string => {
    let num = 0;
    if (typeof value === 'number') {
      num = value;
    } else if (typeof value === 'string') {
      num = parseFloat(value) || 0;
    }
    if (isNaN(num)) num = 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateStr: string): string => {
    if (dateStr.length === 7) {
      const [year, month] = dateStr.split('-');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const calculateGrowth = (): { value: number; isPositive: boolean } | null => {
    if (!salesReport || previousSalesTotal === null || previousSalesTotal === 0) return null;
    const growth = ((salesReport.totals.total - previousSalesTotal) / previousSalesTotal) * 100;
    return { value: Math.abs(growth), isPositive: growth >= 0 };
  };

  const getStockStatus = (stock: number): { label: string; color: string } => {
    if (stock <= 0) return { label: 'Sem Estoque', color: 'bg-red-100 text-red-700' };
    if (stock <= 5) return { label: 'Critico', color: 'bg-red-100 text-red-700' };
    if (stock <= 10) return { label: 'Baixo', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Normal', color: 'bg-emerald-100 text-emerald-700' };
  };

  // Skeleton component
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
  );

  // Loading skeleton for each tab
  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );

  // Error state with retry
  const renderError = () => (
    <div className="text-center py-16">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <button
        onClick={loadReportData}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar Novamente
      </button>
    </div>
  );

  const growth = calculateGrowth();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatorios</h1>
          <p className="text-gray-500 mt-1">Analise o desempenho do seu negocio</p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Exportar CSV
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date preset dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Periodo
              <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
            </button>

            {showPresets && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {getDatePresets().map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">De:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <span className="text-gray-400">ate</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          {activeTab === 'sales' && (
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {GROUP_BY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadReportData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Click outside to close presets */}
      {showPresets && (
        <div className="fixed inset-0 z-0" onClick={() => setShowPresets(false)} />
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            renderSkeleton()
          ) : error ? (
            renderError()
          ) : (
            <>
              {/* SALES TAB */}
              {activeTab === 'sales' && salesReport && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-emerald-600 font-medium">Total do Periodo</span>
                      </div>
                      <p className="text-3xl font-bold text-emerald-700">
                        {formatCurrency(salesReport.totals.total)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Comandas</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-700">{salesReport.totals.commands}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-purple-600 font-medium">Ticket Medio</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-700">
                        {formatCurrency(salesReport.totals.averageTicket)}
                      </p>
                    </div>

                    <div className={`bg-gradient-to-br ${growth?.isPositive ? 'from-green-50 to-emerald-50 border-green-100' : 'from-red-50 to-rose-50 border-red-100'} rounded-xl p-6 border`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${growth?.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                          {growth?.isPositive ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${growth?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          Crescimento
                        </span>
                      </div>
                      <p className={`text-3xl font-bold ${growth?.isPositive ? 'text-green-700' : 'text-red-700'}`}>
                        {growth ? `${growth.isPositive ? '+' : '-'}${formatPercent(growth.value)}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">vs periodo anterior</p>
                    </div>
                  </div>

                  {/* Area chart */}
                  {salesReport.items.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Faturamento por Periodo</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesReport.items}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={formatDate}
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis
                              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <Tooltip
                              formatter={(value) => [formatCurrency(value as number), 'Faturamento']}
                              labelFormatter={formatDate}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="total"
                              name="Faturamento"
                              stroke="#10b981"
                              strokeWidth={2}
                              fill="url(#colorRevenue)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Sales table */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200">Detalhamento</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Data
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Comandas
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Faturamento
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Ticket Medio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {salesReport.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.commandCount}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                {formatCurrency(item.averageTicket)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {salesReport.items.length === 0 && (
                      <EmptyState icon={DollarSign} message="Nenhuma venda encontrada para o periodo" />
                    )}
                  </div>
                </div>
              )}

              {/* SERVICES TAB */}
              {activeTab === 'services' && servicesReport && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Scissors className="w-5 h-5 text-pink-600" />
                        </div>
                        <span className="text-sm text-pink-600 font-medium">Receita Total</span>
                      </div>
                      <p className="text-3xl font-bold text-pink-700">{formatCurrency(servicesReport.total)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm text-indigo-600 font-medium">Total de Servicos</span>
                      </div>
                      <p className="text-3xl font-bold text-indigo-700">{servicesReport.items.length}</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-sm text-amber-600 font-medium">Mais Vendido</span>
                      </div>
                      <p className="text-lg font-bold text-amber-700 truncate">
                        {servicesReport.items[0]?.serviceName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal bar chart - Top 10 */}
                  {servicesReport.items.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Top 10 Servicos por Receita</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={servicesReport.items.slice(0, 10)} layout="vertical" margin={{ left: 120 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              type="number"
                              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis
                              type="category"
                              dataKey="serviceName"
                              tick={{ fontSize: 11 }}
                              stroke="#9ca3af"
                              width={120}
                            />
                            <Tooltip
                              formatter={(value) => [formatCurrency(value as number), 'Receita']}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              }}
                            />
                            <Bar dataKey="revenue" fill="#ec4899" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Services table with sorting */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200">Todos os Servicos</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Servico
                            </th>
                            <th
                              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200"
                              onClick={() => handleSort('quantity')}
                            >
                              Qtd {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-200"
                              onClick={() => handleSort('revenue')}
                            >
                              Receita {sortField === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              % do Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {[...servicesReport.items]
                            .sort((a, b) => {
                              const aVal = sortField === 'quantity' ? a.quantity : a.revenue;
                              const bVal = sortField === 'quantity' ? b.quantity : b.revenue;
                              return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                            })
                            .map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.serviceName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                  {formatCurrency(item.revenue)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                                    {formatPercent(item.percentOfTotal)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {servicesReport.items.length === 0 && (
                      <EmptyState icon={Scissors} message="Nenhum servico encontrado para o periodo" />
                    )}
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && productsReport && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Package className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-sm text-amber-600 font-medium">Receita Total</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-700">{formatCurrency(productsReport.total)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Produtos Vendidos</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-700">
                        {productsReport.items.reduce((sum, p) => sum + p.quantitySold, 0)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-purple-600 font-medium">Ticket Medio</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-700">
                        {formatCurrency(
                          productsReport.items.length > 0
                            ? productsReport.total / productsReport.items.reduce((sum, p) => sum + p.quantitySold, 0)
                            : 0
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Bar chart - Top 10 */}
                  {productsReport.items.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Top 10 Produtos por Receita</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={productsReport.items.slice(0, 10)} layout="vertical" margin={{ left: 120 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              type="number"
                              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                              tick={{ fontSize: 12 }}
                              stroke="#9ca3af"
                            />
                            <YAxis
                              type="category"
                              dataKey="productName"
                              tick={{ fontSize: 11 }}
                              stroke="#9ca3af"
                              width={120}
                            />
                            <Tooltip
                              formatter={(value) => [formatCurrency(value as number), 'Receita']}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              }}
                            />
                            <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Products table */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200">Todos os Produtos</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Produto
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Qtd Vendida
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Receita
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Estoque Atual
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {productsReport.items.map((item, idx) => {
                            const stockStatus = getStockStatus(item.currentStock);
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.productName}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantitySold}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                  {formatCurrency(item.revenue)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.currentStock}</td>
                                <td className="px-4 py-3 text-sm text-right">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                    {stockStatus.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {productsReport.items.length === 0 && (
                      <EmptyState icon={Package} message="Nenhum produto vendido no periodo" />
                    )}
                  </div>
                </div>
              )}

              {/* PROFESSIONALS TAB */}
              {activeTab === 'professionals' && professionalsReport && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm text-indigo-600 font-medium">Receita Total Gerada</span>
                      </div>
                      <p className="text-3xl font-bold text-indigo-700">
                        {formatCurrency(professionalsReport.totals.revenue)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-sm text-cyan-600 font-medium">Total em Comissoes</span>
                      </div>
                      <p className="text-3xl font-bold text-cyan-700">
                        {formatCurrency(professionalsReport.totals.commission)}
                      </p>
                    </div>
                  </div>

                  {/* Professional cards with ranking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {professionalsReport.items.map((prof, idx) => (
                      <div
                        key={prof.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        {idx < 3 && (
                          <div
                            className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white ${
                              idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {prof.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{prof.name}</p>
                            <p className="text-sm text-gray-500">{prof.appointments} atendimentos</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Receita</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(prof.revenue)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Comissao</p>
                            <p className="font-semibold text-emerald-600">{formatCurrency(prof.commission)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Ticket Medio</p>
                            <p className="font-semibold text-gray-900">{formatCurrency(prof.averageTicket)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {professionalsReport.items.length === 0 && (
                    <EmptyState icon={User} message="Nenhum profissional com atendimentos no periodo" />
                  )}

                  {/* Professionals comparison table */}
                  {professionalsReport.items.length > 0 && (
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                      <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200">
                        Comparativo de Desempenho
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                #
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Profissional
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Atendimentos
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Receita
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Comissao
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Ticket Medio
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {professionalsReport.items.map((prof, idx) => (
                              <tr key={prof.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      idx === 0
                                        ? 'bg-amber-100 text-amber-700'
                                        : idx === 1
                                        ? 'bg-gray-200 text-gray-700'
                                        : idx === 2
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{prof.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{prof.appointments}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                  {formatCurrency(prof.revenue)}
                                </td>
                                <td className="px-4 py-3 text-sm text-emerald-600 text-right font-medium">
                                  {formatCurrency(prof.commission)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                  {formatCurrency(prof.averageTicket)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CLIENTS TAB */}
              {activeTab === 'clients' && clientsReport && (
                <div className="space-y-6">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium mb-1">Novos Clientes</p>
                      <p className="text-2xl font-bold text-blue-700">{clientsReport.newClients}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                      <p className="text-sm text-emerald-600 font-medium mb-1">Recorrentes</p>
                      <p className="text-2xl font-bold text-emerald-700">{clientsReport.returningClients}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                      <p className="text-sm text-purple-600 font-medium mb-1">Taxa Retencao</p>
                      <p className="text-2xl font-bold text-purple-700">{formatPercent(clientsReport.retentionRate)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                      <p className="text-sm text-amber-600 font-medium mb-1">Ticket Medio</p>
                      <p className="text-2xl font-bold text-amber-700">{formatCurrency(clientsReport.averageTicket)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-5 border border-cyan-100">
                      <p className="text-sm text-cyan-600 font-medium mb-1">Freq. Media</p>
                      <p className="text-2xl font-bold text-cyan-700">{clientsReport.averageFrequency.toFixed(1)}x</p>
                    </div>
                  </div>

                  {/* Pie chart - New vs Returning */}
                  {(clientsReport.newClients > 0 || clientsReport.returningClients > 0) && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Novos vs Recorrentes</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Novos', value: clientsReport.newClients, color: '#3b82f6' },
                                { name: 'Recorrentes', value: clientsReport.returningClients, color: '#10b981' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            >
                              <Cell fill="#3b82f6" />
                              <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip
                              formatter={(value) => [value, 'Clientes']}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Top clients */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                      Top 10 Clientes por Valor Gasto
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Cliente
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Visitas
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Total Gasto
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Ticket Medio
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {clientsReport.topClients.map((client, idx) => (
                            <tr key={client.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    idx === 0
                                      ? 'bg-amber-100 text-amber-700'
                                      : idx === 1
                                      ? 'bg-gray-200 text-gray-700'
                                      : idx === 2
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{client.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">{client.visits}</td>
                              <td className="px-4 py-3 text-sm text-emerald-600 text-right font-semibold">
                                {formatCurrency(client.totalSpent)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                {formatCurrency(client.visits > 0 ? client.totalSpent / client.visits : 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {clientsReport.topClients.length === 0 && (
                      <EmptyState icon={Users} message="Nenhum cliente com compras no periodo" />
                    )}
                  </div>
                </div>
              )}

              {/* Empty states when no data loaded */}
              {activeTab === 'sales' && !salesReport && !isLoading && !error && (
                <EmptyState icon={DollarSign} message="Selecione um periodo para ver os dados de vendas" />
              )}
              {activeTab === 'services' && !servicesReport && !isLoading && !error && (
                <EmptyState icon={Scissors} message="Selecione um periodo para ver os dados de servicos" />
              )}
              {activeTab === 'products' && !productsReport && !isLoading && !error && (
                <EmptyState icon={Package} message="Selecione um periodo para ver os dados de produtos" />
              )}
              {activeTab === 'professionals' && !professionalsReport && !isLoading && !error && (
                <EmptyState icon={User} message="Selecione um periodo para ver os dados de profissionais" />
              )}
              {activeTab === 'clients' && !clientsReport && !isLoading && !error && (
                <EmptyState icon={Users} message="Selecione um periodo para ver os dados de clientes" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
