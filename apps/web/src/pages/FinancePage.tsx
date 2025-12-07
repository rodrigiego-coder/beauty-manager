import { useState } from 'react';
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
import { format } from 'date-fns';

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  paymentMethod: string;
}

const mockTransactions: Transaction[] = [
  { id: 1, date: '2024-01-15', description: 'Corte + Escova - Maria Silva', category: 'Servicos', amount: 120, type: 'INCOME', paymentMethod: 'PIX' },
  { id: 2, date: '2024-01-15', description: 'Compra de Produtos - Fornecedor X', category: 'Estoque', amount: 450, type: 'EXPENSE', paymentMethod: 'Boleto' },
  { id: 3, date: '2024-01-14', description: 'Coloracao Completa - Ana Costa', category: 'Servicos', amount: 280, type: 'INCOME', paymentMethod: 'Cartao Credito' },
  { id: 4, date: '2024-01-14', description: 'Conta de Luz', category: 'Despesas Fixas', amount: 350, type: 'EXPENSE', paymentMethod: 'Debito Automatico' },
  { id: 5, date: '2024-01-13', description: 'Manicure + Pedicure - Julia Santos', category: 'Servicos', amount: 80, type: 'INCOME', paymentMethod: 'Dinheiro' },
  { id: 6, date: '2024-01-13', description: 'Aluguel do Espaco', category: 'Despesas Fixas', amount: 2500, type: 'EXPENSE', paymentMethod: 'Transferencia' },
  { id: 7, date: '2024-01-12', description: 'Hidratacao Premium - Carla Lima', category: 'Servicos', amount: 150, type: 'INCOME', paymentMethod: 'PIX' },
  { id: 8, date: '2024-01-12', description: 'Venda de Produto - Shampoo', category: 'Produtos', amount: 45, type: 'INCOME', paymentMethod: 'Cartao Debito' },
];

const chartData = [
  { name: 'Seg', receitas: 850, despesas: 200 },
  { name: 'Ter', receitas: 1200, despesas: 450 },
  { name: 'Qua', receitas: 980, despesas: 350 },
  { name: 'Qui', receitas: 1500, despesas: 2500 },
  { name: 'Sex', receitas: 1800, despesas: 300 },
  { name: 'Sab', receitas: 2200, despesas: 150 },
  { name: 'Dom', receitas: 400, despesas: 0 },
];

const categoryData = [
  { name: 'Servicos', value: 4500, color: '#10b981' },
  { name: 'Produtos', value: 800, color: '#3b82f6' },
  { name: 'Estoque', value: 1200, color: '#ef4444' },
  { name: 'Despesas Fixas', value: 2850, color: '#f59e0b' },
  { name: 'Outros', value: 350, color: '#8b5cf6' },
];

export function FinancePage() {
  const [filterType, setFilterType] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalIncome = mockTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = mockTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredTransactions = mockTransactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const openModal = (type: 'INCOME' | 'EXPENSE') => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-1">Controle de receitas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex gap-3">
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-600">+12% vs mes anterior</span>
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
            <span className="text-sm font-medium text-red-600">-5% vs mes anterior</span>
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
          <p className="text-3xl font-bold">R$ 2.500,00</p>
          <p className="text-red-100 mt-2">3 contas pendentes</p>
          <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
            Ver detalhes
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Contas a Receber</h3>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-3xl font-bold">R$ 1.800,00</p>
          <p className="text-emerald-100 mt-2">5 clientes pendentes</p>
          <button className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
            Ver detalhes
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Fluxo de Caixa Semanal</h3>
          <div className="h-72">
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
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Por Categoria</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
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
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
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
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
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
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(transaction.date), 'dd/MM/yyyy')}
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

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Ex: Corte de cabelo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                    {modalType === 'INCOME' ? (
                      <>
                        <option value="Servicos">Servicos</option>
                        <option value="Produtos">Venda de Produtos</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Estoque">Compra de Estoque</option>
                        <option value="Despesas Fixas">Despesas Fixas</option>
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
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
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
                    className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${
                      modalType === 'INCOME'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
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
