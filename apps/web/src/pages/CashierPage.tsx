import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Loader2,
  Clock,
  Scissors,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { CashRegister } from '../types/cash-register';

interface Command {
  id: string;
  cardNumber: string;
  code: string;
  status: 'OPEN' | 'IN_SERVICE' | 'WAITING_PAYMENT';
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  totalGross: string;
  totalDiscounts: string;
  totalNet: string;
  openedAt: string;
  itemCount?: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Aberta', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_SERVICE: { label: 'Em Atendimento', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  WAITING_PAYMENT: { label: 'Aguardando Pagamento', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export function CashierPage() {
  const navigate = useNavigate();
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Estado do caixa
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [cashLoading, setCashLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modais
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Forms
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  useEffect(() => {
    loadCashRegister();
    loadCommands();
  }, []);

  const loadCashRegister = async () => {
    try {
      setCashLoading(true);
      const response = await api.get('/cash-registers/current');
      setCashRegister(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar caixa:', err);
      setCashRegister(null);
    } finally {
      setCashLoading(false);
    }
  };

  const loadCommands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/commands', {
        params: {
          status: 'OPEN,IN_SERVICE,WAITING_PAYMENT',
        },
      });
      setCommands(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar comandas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar comandas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openingBalance.replace(',', '.'));
    if (isNaN(amount) || amount < 0) {
      alert('Digite um valor valido');
      return;
    }

    try {
      setActionLoading(true);
      await api.post('/cash-registers/open', { openingBalance: amount });
      setShowOpenModal(false);
      setOpeningBalance('');
      await loadCashRegister();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao abrir caixa');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(closingBalance.replace(',', '.'));
    if (isNaN(amount) || amount < 0) {
      alert('Digite um valor valido');
      return;
    }

    try {
      setActionLoading(true);
      await api.post('/cash-registers/close', {
        closingBalance: amount,
        notes: closeNotes || undefined,
      });
      setShowCloseModal(false);
      setClosingBalance('');
      setCloseNotes('');
      await loadCashRegister();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao fechar caixa');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashRegister) return;

    const amount = parseFloat(movementAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Digite um valor valido');
      return;
    }

    if (!movementReason.trim()) {
      alert('Digite o motivo da sangria');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/cash-registers/${cashRegister.id}/withdrawal`, {
        amount,
        reason: movementReason,
      });
      setShowWithdrawalModal(false);
      setMovementAmount('');
      setMovementReason('');
      await loadCashRegister();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar sangria');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashRegister) return;

    const amount = parseFloat(movementAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Digite um valor valido');
      return;
    }

    if (!movementReason.trim()) {
      alert('Digite o motivo do suprimento');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/cash-registers/${cashRegister.id}/deposit`, {
        amount,
        reason: movementReason,
      });
      setShowDepositModal(false);
      setMovementAmount('');
      setMovementReason('');
      await loadCashRegister();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar suprimento');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm", { locale: ptBR });
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM 'as' HH:mm", { locale: ptBR });
  };

  // Calcular saldo atual do caixa
  const getCurrentBalance = () => {
    if (!cashRegister) return 0;
    const opening = parseFloat(cashRegister.openingBalance || '0');
    const cash = parseFloat(cashRegister.totalCash || '0');
    const deposits = parseFloat(cashRegister.totalDeposits || '0');
    const withdrawals = parseFloat(cashRegister.totalWithdrawals || '0');
    return opening + cash + deposits - withdrawals;
  };

  // Calcular saldo esperado para fechamento
  const getExpectedBalance = () => {
    if (!cashRegister) return 0;
    const opening = parseFloat(cashRegister.openingBalance || '0');
    const cash = parseFloat(cashRegister.totalCash || '0');
    const deposits = parseFloat(cashRegister.totalDeposits || '0');
    const withdrawals = parseFloat(cashRegister.totalWithdrawals || '0');
    return opening + cash + deposits - withdrawals;
  };

  // Diferenca no fechamento
  const getClosingDifference = () => {
    const closing = parseFloat(closingBalance.replace(',', '.')) || 0;
    const expected = getExpectedBalance();
    return closing - expected;
  };

  // Filtrar comandas
  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      cmd.cardNumber.toLowerCase().includes(search.toLowerCase()) ||
      cmd.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cmd.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Agrupar por status
  const openCommands = filteredCommands.filter((c) => c.status === 'OPEN');
  const inServiceCommands = filteredCommands.filter((c) => c.status === 'IN_SERVICE');
  const waitingPaymentCommands = filteredCommands.filter((c) => c.status === 'WAITING_PAYMENT');

  // Totais
  const totalOpen = openCommands.length;
  const totalInService = inServiceCommands.length;
  const totalWaitingPayment = waitingPaymentCommands.length;
  const totalValue = filteredCommands.reduce((sum, c) => sum + parseFloat(c.totalNet || '0'), 0);

  const renderCommandCard = (command: Command) => {
    const status = statusConfig[command.status];
    const totalNet = parseFloat(command.totalNet || '0');

    return (
      <div
        key={command.id}
        onClick={() => navigate(`/comandas/${command.id}`)}
        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">#{command.cardNumber}</h3>
              {command.clientName ? (
                <p className="text-sm text-gray-700 font-medium">{command.clientName}</p>
              ) : (
                <p className="text-xs text-gray-400 italic">Sem cliente vinculado</p>
              )}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate(command.openedAt)}</span>
          </div>
          <p className={`font-bold text-lg ${totalNet > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>
    );
  };

  if (loading || cashLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
          <p className="text-gray-500">Gerencie o caixa e as comandas abertas</p>
        </div>
        <button
          onClick={() => { loadCashRegister(); loadCommands(); }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Card de Status do Caixa */}
      {!cashRegister ? (
        // Caixa Fechado
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">Caixa Fechado</h2>
                <p className="text-red-600">Abra o caixa para iniciar as operacoes do dia</p>
              </div>
            </div>
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Abrir Caixa
            </button>
          </div>
        </div>
      ) : (
        // Caixa Aberto
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <Unlock className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">Caixa Aberto</h2>
                <p className="text-green-600">Desde {formatTime(cashRegister.openedAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setMovementAmount(''); setMovementReason(''); setShowWithdrawalModal(true); }}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Sangria
              </button>
              <button
                onClick={() => { setMovementAmount(''); setMovementReason(''); setShowDepositModal(true); }}
                className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
              >
                <ArrowDownCircle className="w-4 h-4" />
                Suprimento
              </button>
              <button
                onClick={() => { setClosingBalance(''); setCloseNotes(''); setShowCloseModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                <Lock className="w-4 h-4" />
                Fechar Caixa
              </button>
            </div>
          </div>

          {/* Resumo do Caixa */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">Abertura</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(cashRegister.openingBalance)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Vendas</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(cashRegister.totalSales)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Dinheiro</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(cashRegister.totalCash)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Sangrias</p>
              <p className="text-lg font-bold text-red-600">-{formatCurrency(cashRegister.totalWithdrawals)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Suprimentos</p>
              <p className="text-lg font-bold text-blue-600">+{formatCurrency(cashRegister.totalDeposits)}</p>
            </div>
            <div className="text-center bg-white rounded-lg p-2">
              <p className="text-sm text-gray-500">Saldo Atual</p>
              <p className="text-lg font-bold text-primary-600">{formatCurrency(getCurrentBalance())}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Resumo de Comandas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <p className="text-sm font-medium">Abertas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOpen}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Scissors className="w-4 h-4" />
            <p className="text-sm font-medium">Em Atendimento</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalInService}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Clock className="w-4 h-4" />
            <p className="text-sm font-medium">Aguardando Pagamento</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalWaitingPayment}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <p className="text-sm font-medium">Total em Aberto</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por numero do cartao ou codigo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos os Status</option>
            <option value="OPEN">Abertas</option>
            <option value="IN_SERVICE">Em Atendimento</option>
            <option value="WAITING_PAYMENT">Aguardando Pagamento</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Lista de Comandas */}
      {filteredCommands.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Nenhuma comanda encontrada</p>
          {search && (
            <p className="text-sm text-gray-400 mt-1">
              Tente buscar por outro termo
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Aguardando Pagamento */}
          {waitingPaymentCommands.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Aguardando Pagamento ({waitingPaymentCommands.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waitingPaymentCommands.map(renderCommandCard)}
              </div>
            </div>
          )}

          {/* Em Atendimento */}
          {inServiceCommands.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Em Atendimento ({inServiceCommands.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inServiceCommands.map(renderCommandCard)}
              </div>
            </div>
          )}

          {/* Abertas */}
          {openCommands.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Abertas ({openCommands.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openCommands.map(renderCommandCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Abrir Caixa */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Unlock className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Abrir Caixa</h2>
              </div>
              <button onClick={() => setShowOpenModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleOpenCash} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor inicial (troco)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Informe o valor em dinheiro no caixa</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Abrindo...' : 'Abrir Caixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fechar Caixa */}
      {showCloseModal && cashRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Fechar Caixa</h2>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Resumo do Dia */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <h3 className="font-medium text-gray-900 mb-3">Resumo do Dia</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Saldo Inicial:</span>
                <span className="font-medium">{formatCurrency(cashRegister.openingBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">(+) Vendas Dinheiro:</span>
                <span className="font-medium text-green-600">{formatCurrency(cashRegister.totalCash)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">(+) Vendas Cartao:</span>
                <span className="font-medium text-green-600">{formatCurrency(cashRegister.totalCard)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">(+) Vendas Pix:</span>
                <span className="font-medium text-green-600">{formatCurrency(cashRegister.totalPix)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">(+) Suprimentos:</span>
                <span className="font-medium text-blue-600">{formatCurrency(cashRegister.totalDeposits)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">(-) Sangrias:</span>
                <span className="font-medium text-red-600">-{formatCurrency(cashRegister.totalWithdrawals)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">(=) Saldo Esperado (Dinheiro):</span>
                <span className="font-bold text-primary-600">{formatCurrency(getExpectedBalance())}</span>
              </div>
            </div>

            <form onSubmit={handleCloseCash} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor contado no caixa
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Diferenca */}
              {closingBalance && (
                <div className={`rounded-lg p-3 ${getClosingDifference() >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Diferenca:</span>
                    <span className={`font-bold ${getClosingDifference() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getClosingDifference() >= 0 ? '+' : ''}{formatCurrency(getClosingDifference())}
                    </span>
                  </div>
                  {getClosingDifference() !== 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getClosingDifference() > 0 ? 'Sobra no caixa' : 'Falta no caixa'}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observacoes (opcional)
                </label>
                <textarea
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Ex: Troco conferido por Maria"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Fechando...' : 'Confirmar Fechamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <ArrowUpCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Sangria</h2>
              </div>
              <button onClick={() => setShowWithdrawalModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Registre a retirada de dinheiro do caixa
            </p>

            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ex: Pagamento de fornecedor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Registrando...' : 'Confirmar Sangria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suprimento */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <ArrowDownCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Suprimento</h2>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Registre a entrada de dinheiro no caixa
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={movementAmount}
                    onChange={(e) => setMovementAmount(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ex: Troco adicional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Registrando...' : 'Confirmar Suprimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
