import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Loader2,
  Clock,
  RefreshCw,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  totalPaid?: string;
  remainingBalance?: string;
  openedAt: string;
  serviceClosedAt?: string;
  itemCount?: number;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Aberta', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_SERVICE: { label: 'Em Atendimento', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  WAITING_PAYMENT: { label: 'Aguardando Pagamento', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  PENDING_PAYMENT: { label: 'Aguardando Pagamento', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
};

type TabType = 'active' | 'waiting';

export function CommandsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStylist = user?.role === 'STYLIST';
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [activeCommands, setActiveCommands] = useState<Command[]>([]);
  const [waitingCommands, setWaitingCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCommands();
  }, []);

  const loadCommands = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeRes, waitingRes] = await Promise.all([
        api.get('/commands/open'),
        api.get('/commands/waiting-payment'),
      ]);
      setActiveCommands(Array.isArray(activeRes.data) ? activeRes.data : []);
      setWaitingCommands(Array.isArray(waitingRes.data) ? waitingRes.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar comandas');
      setActiveCommands([]);
      setWaitingCommands([]);
    } finally {
      setLoading(false);
    }
  };

  const currentCommands = activeTab === 'active' ? activeCommands : waitingCommands;

  const filteredCommands = currentCommands.filter((cmd) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      cmd.cardNumber?.toLowerCase().includes(s) ||
      cmd.clientName?.toLowerCase().includes(s) ||
      cmd.clientPhone?.toLowerCase().includes(s) ||
      cmd.code?.toLowerCase().includes(s);

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comandas</h1>
          <p className="text-gray-500 mt-1">Gerencie as comandas do salão</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCommands}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Ativas
          {activeCommands.length > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'active' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {activeCommands.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('waiting')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'waiting'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Aguardando Pagamento
          {waitingCommands.length > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === 'waiting' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {waitingCommands.length}
            </span>
          )}
        </button>
      </div>

      {/* Filtros */}
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

      {/* Lista de comandas */}
      {!loading && filteredCommands.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {activeTab === 'active'
              ? 'Nenhuma comanda ativa'
              : 'Nenhuma comanda aguardando pagamento'}
          </p>
        </div>
      )}

      {!loading && filteredCommands.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommands.map((cmd) => {
            const status = statusConfig[cmd.status] || statusConfig.OPEN;
            const hasRemainingBalance = cmd.remainingBalance && parseFloat(cmd.remainingBalance) > 0;

            return (
              <div
                key={cmd.id}
                onClick={() => navigate(`/comandas/${cmd.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary-600" />
                      <span className="font-bold text-lg text-gray-900">
                        #{cmd.cardNumber || cmd.code}
                      </span>
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  {!isStylist && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(cmd.totalNet)}</p>
                      {cmd.itemCount !== undefined && (
                        <p className="text-xs text-gray-500">{cmd.itemCount} {cmd.itemCount === 1 ? 'item' : 'itens'}</p>
                      )}
                    </div>
                  )}
                </div>

                {cmd.clientName && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Cliente:</span> {cmd.clientName}
                  </p>
                )}

                {/* Mostrar saldo pendente para comandas aguardando pagamento — oculto para STYLIST */}
                {!isStylist && activeTab === 'waiting' && hasRemainingBalance && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-orange-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-xs text-orange-600">Saldo Pendente</p>
                      <p className="text-sm font-bold text-orange-700">{formatCurrency(cmd.remainingBalance!)}</p>
                    </div>
                    {cmd.totalPaid && parseFloat(cmd.totalPaid) > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Pago</p>
                        <p className="text-xs text-green-600">{formatCurrency(cmd.totalPaid)}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {activeTab === 'active'
                    ? `Aberta ${format(new Date(cmd.openedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`
                    : cmd.serviceClosedAt
                      ? `Serviço encerrado ${format(new Date(cmd.serviceClosedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`
                      : `Aberta ${format(new Date(cmd.openedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CommandsListPage;
