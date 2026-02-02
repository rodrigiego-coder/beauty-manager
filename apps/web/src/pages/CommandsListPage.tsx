import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  Loader2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

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

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
};

export function CommandsListPage() {
  const navigate = useNavigate();
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadCommands();
  }, []);

  const loadCommands = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/commands/open');
      setCommands(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar comandas');
      setCommands([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      !search ||
      cmd.cardNumber?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.code?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || cmd.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comandas</h1>
          <p className="text-gray-500 mt-1">Gerencie as comandas abertas</p>
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">Todos os status</option>
          <option value="OPEN">Aberta</option>
          <option value="IN_SERVICE">Em Atendimento</option>
          <option value="WAITING_PAYMENT">Aguardando Pagamento</option>
        </select>
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
          <p className="text-gray-500">Nenhuma comanda encontrada</p>
        </div>
      )}

      {!loading && filteredCommands.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommands.map((cmd) => {
            const status = statusConfig[cmd.status] || statusConfig.OPEN;
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
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(cmd.totalNet)}</p>
                    {cmd.itemCount !== undefined && (
                      <p className="text-xs text-gray-500">{cmd.itemCount} {cmd.itemCount === 1 ? 'item' : 'itens'}</p>
                    )}
                  </div>
                </div>

                {cmd.clientName && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Cliente:</span> {cmd.clientName}
                  </p>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Aberta {format(new Date(cmd.openedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
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
