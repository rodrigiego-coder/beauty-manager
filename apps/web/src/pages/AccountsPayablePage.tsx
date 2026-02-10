import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Search,
  Loader2,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface AccountPayable {
  id: number;
  salonId: string;
  supplierName: string;
  amount: string;
  dueDate: string;
  status: string;
  category: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  OVERDUE: { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertTriangle },
  PAID: { label: 'Paga', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
};

export function AccountsPayablePage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supplierName: '',
    amount: '',
    dueDate: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      // First trigger overdue check, then load all
      await api.get('/accounts-payable/overdue').catch(() => {});
      const { data } = await api.get('/accounts-payable');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar contas a pagar');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierName.trim()) {
      alert('Informe o nome do fornecedor');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('Informe um valor valido');
      return;
    }
    if (!form.dueDate) {
      alert('Informe a data de vencimento');
      return;
    }

    setSaving(true);
    try {
      await api.post('/accounts-payable', {
        supplierName: form.supplierName.trim(),
        amount: form.amount,
        dueDate: form.dueDate,
        category: form.category.trim() || null,
        description: form.description.trim() || null,
      });
      setShowForm(false);
      setForm({ supplierName: '', amount: '', dueDate: '', category: '', description: '' });
      setSuccessMessage('Conta criada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAccounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!confirm('Confirma que esta conta foi paga?')) return;
    try {
      await api.patch(`/accounts-payable/${id}/pay`);
      setSuccessMessage('Conta marcada como paga!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAccounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao marcar como paga');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover esta conta? Esta acao nao pode ser desfeita.')) return;
    try {
      await api.delete(`/accounts-payable/${id}`);
      setSuccessMessage('Conta removida!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAccounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover conta');
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      !search ||
      acc.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      acc.category?.toLowerCase().includes(search.toLowerCase()) ||
      acc.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || acc.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalPending = accounts
    .filter((a) => a.status === 'PENDING' || a.status === 'OVERDUE')
    .reduce((sum, a) => sum + parseFloat(a.amount || '0'), 0);

  const countByStatus = {
    PENDING: accounts.filter((a) => a.status === 'PENDING').length,
    OVERDUE: accounts.filter((a) => a.status === 'OVERDUE').length,
    PAID: accounts.filter((a) => a.status === 'PAID').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/financeiro')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
            <p className="text-gray-500 mt-1">Gerencie suas despesas e pagamentos pendentes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAccounts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Total Pendente</h3>
          <CreditCard className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalPending)}</p>
        <div className="flex gap-4 mt-3 text-red-100 text-sm">
          <span>{countByStatus.PENDING} pendente(s)</span>
          {countByStatus.OVERDUE > 0 && (
            <span className="text-yellow-200 font-medium">{countByStatus.OVERDUE} vencida(s)</span>
          )}
          <span>{countByStatus.PAID} paga(s)</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por fornecedor, categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'OVERDUE', 'PAID'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filterStatus === s
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'Todas' : s === 'PENDING' ? 'Pendentes' : s === 'OVERDUE' ? 'Vencidas' : 'Pagas'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAccounts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {filterStatus !== 'ALL' ? 'Nenhuma conta com esse filtro' : 'Nenhuma conta a pagar!'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {filterStatus !== 'ALL' ? 'Tente outro filtro.' : 'Voce esta em dia com suas obrigacoes.'}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="space-y-3">
          {filteredAccounts.map((acc) => {
            const cfg = statusConfig[acc.status] || statusConfig.PENDING;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={acc.id}
                className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all ${
                  acc.status === 'OVERDUE' ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left - Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-lg text-gray-900">{acc.supplierName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    {acc.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{acc.category}</span>
                    )}
                    {acc.description && (
                      <p className="text-sm text-gray-500 mt-1">{acc.description}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <Clock className="w-3.5 h-3.5" />
                      Vencimento: {format(new Date(acc.dueDate + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>

                  {/* Middle - Amount */}
                  <div className="text-center md:text-right">
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className={`text-xl font-bold ${acc.status === 'PAID' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {formatCurrency(acc.amount)}
                    </p>
                  </div>

                  {/* Right - Actions */}
                  {acc.status !== 'PAID' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAsPaid(acc.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar Paga
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nova Conta a Pagar</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor *</label>
                <input
                  type="text"
                  value={form.supplierName}
                  onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                  placeholder="Nome do fornecedor"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento *</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Ex: Aluguel, Produtos, Material..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Observacoes sobre esta conta..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsPayablePage;
