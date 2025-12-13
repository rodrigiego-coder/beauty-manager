import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

interface Transaction {
  id: number;
  salonId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string;
  description: string;
  category: string;
  paymentMethod: string;
  reference?: string;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

interface AccountSummary {
  total: number;
  count: number;
}

interface ChartDataPoint {
  name: string;
  receitas: number;
  despesas: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Servicos': '#10b981',
  'Produtos': '#3b82f6',
  'Estoque': '#ef4444',
  'Despesas Fixas': '#f59e0b',
  'Funcionarios': '#8b5cf6',
  'Outros': '#6b7280',
  'Venda de Produtos': '#06b6d4',
  'Compra de Estoque': '#f43f5e',
};

export function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [accountsPayable, setAccountsPayable] = useState<AccountSummary>({ total: 0, count: 0 });
  const [accountsReceivable, setAccountsReceivable] = useState<AccountSummary>({ total: 0, count: 0 });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('month');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    paymentMethod: 'PIX',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [filterPeriod]);

  useEffect(() => {
    loadTransactions();
  }, [filterType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Calculate period dates
      const now = new Date();
      let startDate: string;
      let endDate = now.toISOString().split('T')[0];

      if (filterPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
      } else if (filterPeriod === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
      } else {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        startDate = yearStart.toISOString().split('T')[0];
      }

      const [summaryRes, payableRes, receivableRes, transactionsRes] = await Promise.all([
        api.get(`/transactions/summary?startDate=${startDate}&endDate=${endDate}`),
        api.get('/accounts-payable/total-pending'),
        api.get('/accounts-receivable/total-pending'),
        api.get('/transactions'),
      ]);

      setSummary(summaryRes.data);
      setAccountsPayable({
        total: parseFloat(payableRes.data?.total || '0') || 0,
        count: payableRes.data?.count || 0,
      });
      setAccountsReceivable({
        total: parseFloat(receivableRes.data?.total || '0') || 0,
        count: receivableRes.data?.count || 0,
      });
      setTransactions(transactionsRes.data || []);

      // Process chart data
      processChartData(transactionsRes.data);
      processCategoryData(transactionsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados financeiros' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      let url = '/transactions';
      if (filterType !== 'all') {
        url = `/transactions/type/${filterType}`;
      }
      const { data } = await api.get(url);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transacoes:', error);
    }
  };

  const processChartData = (transactions: Transaction[]) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const weekData: Record<string, { receitas: number; despesas: number }> = {};

    // Initialize week data
    days.forEach(day => {
      weekData[day] = { receitas: 0, despesas: 0 };
    });

    // Get last 7 days of transactions
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    transactions.forEach(t => {
      const date = new Date(t.createdAt);
      if (date >= weekAgo) {
        const dayName = days[date.getDay()];
        const amount = parseFloat(t.amount);
        if (t.type === 'INCOME') {
          weekData[dayName].receitas += amount;
        } else {
          weekData[dayName].despesas += amount;
        }
      }
    });

    // Convert to chart format starting from current day
    const todayIndex = now.getDay();
    const orderedDays = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (todayIndex - 6 + i + 7) % 7;
      orderedDays.push(days[dayIndex]);
    }

    const data = orderedDays.map(day => ({
      name: day,
      receitas: Math.round(weekData[day].receitas * 100) / 100,
      despesas: Math.round(weekData[day].despesas * 100) / 100,
    }));

    setChartData(data);
  };

  const processCategoryData = (transactions: Transaction[]) => {
    const categories: Record<string, number> = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      const category = t.category || 'Outros';
      categories[category] = (categories[category] || 0) + amount;
    });

    const data = Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: CATEGORY_COLORS[name] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setCategoryData(data);
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    let num = 0;
    if (value !== null && value !== undefined) {
      num = typeof value === 'string' ? parseFloat(value) : value;
    }
    if (isNaN(num)) num = 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const openModal = (type: 'INCOME' | 'EXPENSE') => {
    setModalType(type);
    setFormData({
      description: '',
      amount: '',
      category: type === 'INCOME' ? 'Servicos' : 'Despesas Fixas',
      paymentMethod: 'PIX',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = {
        type: modalType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
      };

      await api.post('/transactions', payload);

      setMessage({
        type: 'success',
        text: `${modalType === 'INCOME' ? 'Receita' : 'Despesa'} registrada com sucesso!`
      });
      setShowModal(false);
      loadData();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erro ao registrar transacao'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export/transactions', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar transacoes' });
    }
  };

  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const balance = summary?.balance || 0;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-1">Controle de receitas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="year">Este Ano</option>
          </select>
          <button
            onClick={() => openModal('EXPENSE')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowDownRight className="w-5 h-5 text-red-500" />
            Lancar Despesa
          </button>
          <button
            onClick={() => openModal('INCOME')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <ArrowUpRight className="w-5 h-5" />
            Lancar Receita
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-600">
              {summary?.incomeCount || 0} transacoes
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Total de Receitas</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">
              {summary?.expenseCount || 0} transacoes
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <Wallet className={`w-6 h-6 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <span className={`text-sm font-medium ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Saldo do Periodo</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Pending accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Contas a Pagar</h3>
            <CreditCard className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(accountsPayable.total)}</p>
          <p className="text-red-100 mt-2">{accountsPayable.count} contas pendentes</p>
          <button
            onClick={() => window.location.href = '/financeiro/contas-pagar'}
            className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Ver detalhes
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Contas a Receber</h3>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(accountsReceivable.total)}</p>
          <p className="text-emerald-100 mt-2">{accountsReceivable.count} clientes pendentes</p>
          <button
            onClick={() => window.location.href = '/financeiro/contas-receber'}
            className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Ver detalhes
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Fluxo de Caixa Semanal</h3>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    fill="#fee2e2"
                    strokeWidth={2}
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por Categoria</h3>
          <div className="h-48">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sem dados
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Ultimas Transacoes</h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('INCOME')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterType === 'INCOME' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setFilterType('EXPENSE')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filterType === 'EXPENSE' ? 'bg-white shadow text-red-600' : 'text-gray-500'
                }`}
              >
                Despesas
              </button>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Descricao
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.slice(0, 20).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === 'INCOME' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{transaction.paymentMethod}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-bold ${
                        transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma transacao encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSaveTransaction}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: Corte de cabelo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {modalType === 'INCOME' ? (
                      <>
                        <option value="Servicos">Servicos</option>
                        <option value="Venda de Produtos">Venda de Produtos</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Despesas Fixas">Despesas Fixas</option>
                        <option value="Compra de Estoque">Compra de Estoque</option>
                        <option value="Funcionarios">Funcionarios</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartao Credito">Cartao de Credito</option>
                    <option value="Cartao Debito">Cartao de Debito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                      modalType === 'INCOME'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {modalType === 'INCOME' ? 'Lancar Receita' : 'Lancar Despesa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
