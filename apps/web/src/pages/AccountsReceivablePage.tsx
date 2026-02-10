import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Search,
  Loader2,
  Clock,
  RefreshCw,
  CreditCard,
  User,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface PendingAccount {
  id: string;
  salonId: string;
  clientId?: string;
  commandId?: string;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  status: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  clientName: string;
  clientPhone?: string | null;
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
};

const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

export function AccountsReceivablePage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPendingAccounts();
  }, []);

  const loadPendingAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/accounts-receivable/pending');
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar pendencias');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      acc.clientName?.toLowerCase().includes(s) ||
      acc.notes?.toLowerCase().includes(s)
    );
  });

  const totalPending = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.remainingAmount || '0'),
    0
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
            <p className="text-gray-500 mt-1">Clientes com saldo pendente (fiado)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPendingAccounts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Total Pendente</h3>
          <DollarSign className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalPending)}</p>
        <p className="text-orange-100 mt-2">{accounts.length} conta(s) pendente(s)</p>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou observacao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
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
          <p className="text-gray-500 text-lg font-medium">Nenhuma pendencia!</p>
          <p className="text-gray-400 text-sm mt-1">Todas as contas foram quitadas.</p>
        </div>
      )}

      {/* List */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="space-y-4">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side - Client info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-lg text-gray-900">
                        {acc.clientName}
                      </span>
                    </div>
                  </div>

                  {acc.clientPhone && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                      <Phone className="w-4 h-4" />
                      {formatPhone(acc.clientPhone)}
                    </div>
                  )}

                  {acc.notes && (
                    <p className="text-sm text-gray-500 mb-1">{acc.notes}</p>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    Criado em{' '}
                    {format(new Date(acc.createdAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    {acc.dueDate && (
                      <span className="ml-2">
                        | Vencimento: {format(new Date(acc.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle - Balance info */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(acc.totalAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pago</p>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(acc.paidAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pendente</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(acc.remainingAmount)}</p>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2">
                  {acc.commandId && (
                    <button
                      onClick={() => navigate(`/comandas/${acc.commandId}`)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Ver Comanda
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountsReceivablePage;
