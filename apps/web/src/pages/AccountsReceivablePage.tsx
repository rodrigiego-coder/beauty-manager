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
  RotateCcw,
  User,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface PendingCommand {
  id: string;
  cardNumber: string;
  code: string;
  status: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  totalGross: string;
  totalDiscounts: string;
  totalNet: string;
  totalPaid: string;
  remainingBalance: string;
  openedAt: string;
  serviceClosedAt?: string;
  cashierClosedAt?: string;
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
  const [commands, setCommands] = useState<PendingCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reopening, setReopening] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPendingCommands();
  }, []);

  const loadPendingCommands = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/commands/pending-balance');
      setCommands(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar pendencias');
      setCommands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReopenCommand = async (commandId: string) => {
    if (!confirm('Deseja reabrir esta comanda para permitir novos pagamentos?')) {
      return;
    }

    setReopening(commandId);
    try {
      await api.post(`/commands/${commandId}/reopen`, {
        reason: 'Reaberta a partir de Contas a Receber para registro de pagamento pendente',
      });
      setSuccessMessage('Comanda reaberta com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      // Reload and navigate to command
      loadPendingCommands();
      navigate(`/comandas/${commandId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao reabrir comanda');
    } finally {
      setReopening(null);
    }
  };

  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      !search ||
      cmd.cardNumber?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.code?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const totalPending = commands.reduce(
    (sum, cmd) => sum + parseFloat(cmd.remainingBalance || '0'),
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
            <p className="text-gray-500 mt-1">Comandas encerradas com saldo pendente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPendingCommands}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
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
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Total Pendente</h3>
          <DollarSign className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(totalPending)}</p>
        <p className="text-orange-100 mt-2">{commands.length} comanda(s) com saldo devedor</p>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cartao, cliente ou codigo..."
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
      {!loading && filteredCommands.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Nenhuma pendencia!</p>
          <p className="text-gray-400 text-sm mt-1">Todas as comandas foram quitadas.</p>
        </div>
      )}

      {/* List */}
      {!loading && filteredCommands.length > 0 && (
        <div className="space-y-4">
          {filteredCommands.map((cmd) => (
            <div
              key={cmd.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side - Command info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-lg text-gray-900">
                        #{cmd.cardNumber || cmd.code}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      Encerrada
                    </span>
                  </div>

                  {cmd.clientName && (
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{cmd.clientName}</span>
                      </div>
                      {cmd.clientPhone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Phone className="w-4 h-4" />
                          {formatPhone(cmd.clientPhone)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    Encerrada em{' '}
                    {cmd.cashierClosedAt
                      ? format(new Date(cmd.cashierClosedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : format(new Date(cmd.openedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>

                {/* Middle - Balance info */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(cmd.totalNet)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pago</p>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(cmd.totalPaid)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pendente</p>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(cmd.remainingBalance)}</p>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/comandas/${cmd.id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleReopenCommand(cmd.id)}
                    disabled={reopening === cmd.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {reopening === cmd.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Reabrir Comanda
                  </button>
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
