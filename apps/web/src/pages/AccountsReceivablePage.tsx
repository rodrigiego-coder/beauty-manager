import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  X,
  Pencil,
  Eye,
  Scissors,
  Package,
  CreditCard,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

interface AccountReceivable {
  id: string;
  salonId: string;
  clientId: string | null;
  commandId: string | null;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  status: 'OPEN' | 'OVERDUE' | 'SETTLED' | 'CANCELED';
  dueDate: string | null;
  settledAt: string | null;
  notes: string | null;
  createdAt: string;
  client?: {
    id: string;
    name: string | null;
    phone: string | null;
  } | null;
  command?: {
    id: string;
    code: string | null;
    cardNumber: string;
  } | null;
}

interface Summary {
  totalOpen: number;
  totalOverdue: number;
  totalSettledThisMonth: number;
  countOpen: number;
  countOverdue: number;
}

interface CommandItem {
  id: string;
  type: 'SERVICE' | 'PRODUCT';
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  totalPrice: string;
  performerName?: string;
  canceledAt?: string;
}

interface CommandPayment {
  id: string;
  amount: string;
  paidAt: string;
  paymentMethod?: { name: string } | null;
}

interface CommandDetails {
  id: string;
  cardNumber: string;
  code: string | null;
  status: string;
  totalGross: string;
  totalDiscounts: string;
  totalNet: string;
  openedAt: string;
  closedAt?: string;
  items: CommandItem[];
  payments: CommandPayment[];
}

const STATUS_CONFIG = {
  OPEN: { label: 'Em Aberto', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  OVERDUE: { label: 'Vencido', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  SETTLED: { label: 'Quitado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export function AccountsReceivablePage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
  const [commandDetails, setCommandDetails] = useState<CommandDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState('PIX');
  const [editNotes, setEditNotes] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const [accountsRes, summaryRes] = await Promise.all([
        api.get(`/accounts-receivable?${params.toString()}`),
        api.get('/accounts-receivable/summary'),
      ]);

      setAccounts(accountsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Erro ao carregar contas a receber:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      account.client?.name?.toLowerCase().includes(searchLower) ||
      account.client?.phone?.includes(searchTerm) ||
      account.command?.cardNumber?.includes(searchTerm)
    );
  });

  const handleOpenSettleModal = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setSettlePaymentMethod('PIX');
    setShowSettleModal(true);
  };

  const handleOpenEditModal = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setEditNotes(account.notes || '');
    setEditDueDate(account.dueDate ? account.dueDate.split('T')[0] : '');
    setShowEditModal(true);
  };

  const handleOpenDetailsModal = async (account: AccountReceivable) => {
    if (!account.command?.id) return;

    setSelectedAccount(account);
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      const response = await api.get(`/commands/${account.command.id}`);
      setCommandDetails(response.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes da comanda:', err);
      alert('Erro ao carregar detalhes da comanda');
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRowClick = (account: AccountReceivable, e: React.MouseEvent) => {
    // Ignora cliques nos botões de ação
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-action]')) {
      return;
    }

    if (account.command?.id) {
      handleOpenDetailsModal(account);
    }
  };

  const handleSettle = async () => {
    if (!selectedAccount) return;

    try {
      setSubmitting(true);
      await api.post(`/accounts-receivable/${selectedAccount.id}/settle`, {
        paymentMethod: settlePaymentMethod,
      });
      setShowSettleModal(false);
      setSelectedAccount(null);
      loadData();
    } catch (err) {
      console.error('Erro ao quitar conta:', err);
      alert('Erro ao quitar conta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAccount) return;

    try {
      setSubmitting(true);
      await api.patch(`/accounts-receivable/${selectedAccount.id}`, {
        notes: editNotes,
        dueDate: editDueDate || null,
      });
      setShowEditModal(false);
      setSelectedAccount(null);
      loadData();
    } catch (err) {
      console.error('Erro ao atualizar conta:', err);
      alert('Erro ao atualizar conta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (account: AccountReceivable) => {
    if (!confirm('Deseja realmente cancelar esta conta a receber?')) return;

    try {
      await api.delete(`/accounts-receivable/${account.id}/cancel`, {
        data: { reason: 'Cancelado pelo usuario' },
      });
      loadData();
    } catch (err) {
      console.error('Erro ao cancelar conta:', err);
      alert('Erro ao cancelar conta');
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
        <p className="text-gray-600">Gerencie pagamentos pendentes dos clientes</p>
      </div>

      {/* Cards de Resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">Em Aberto ({summary.countOpen})</p>
                <p className="text-xl font-bold text-yellow-800">
                  {formatCurrency(summary.totalOpen)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600">Vencido ({summary.countOverdue})</p>
                <p className="text-xl font-bold text-red-800">
                  {formatCurrency(summary.totalOverdue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Quitado (mes atual)</p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(summary.totalSettledThisMonth)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou comanda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="OPEN">Em Aberto</option>
            <option value="OVERDUE">Vencido</option>
            <option value="SETTLED">Quitado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conta encontrada
          </h3>
          <p className="text-gray-500">
            Nao ha contas a receber com os filtros selecionados
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Comanda
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Pago
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Restante
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Vencimento
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const statusConfig = STATUS_CONFIG[account.status];
                  const StatusIcon = statusConfig.icon;
                  const hasCommand = !!account.command?.id;
                  return (
                    <tr
                      key={account.id}
                      onClick={(e) => handleRowClick(account, e)}
                      className={`hover:bg-gray-50 transition-colors ${
                        hasCommand ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {account.client?.name || 'Cliente nao identificado'}
                          </span>
                        </div>
                        {account.client?.phone && (
                          <p className="text-sm text-gray-500 ml-6">{account.client.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasCommand ? (
                          <span className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium">
                            #{account.command?.cardNumber || '-'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-700">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(account.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatCurrency(account.paidAmount)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary-600">
                        {formatCurrency(account.remainingAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {formatDate(account.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" data-action="true">
                        <div className="flex items-center justify-end gap-2">
                          {hasCommand && (
                            <button
                              onClick={() => handleOpenDetailsModal(account)}
                              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Ver Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {(account.status === 'OPEN' || account.status === 'OVERDUE') && (
                            <>
                              <button
                                onClick={() => handleOpenSettleModal(account)}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Quitar
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(account)}
                                className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(account)}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cancelar"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Quitacao */}
      {showSettleModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quitar Conta</h2>
              <button
                onClick={() => setShowSettleModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">{selectedAccount.client?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="font-medium">{formatCurrency(selectedAccount.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ja Pago:</span>
                  <span className="font-medium">{formatCurrency(selectedAccount.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-900 font-medium">Restante:</span>
                  <span className="font-bold text-primary-600">
                    {formatCurrency(selectedAccount.remainingAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={settlePaymentMethod}
                  onChange={(e) => setSettlePaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="PIX">PIX</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="CARD_CREDIT">Cartao Credito</option>
                  <option value="CARD_DEBIT">Cartao Debito</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettleModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSettle}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Processando...' : 'Confirmar Quitacao'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edicao */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Editar Conta</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observacoes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Observacoes sobre a conta..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEdit}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Comanda */}
      {showDetailsModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Detalhes da Comanda #{commandDetails?.cardNumber || selectedAccount.command?.cardNumber}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Cliente: {selectedAccount.client?.name || 'Nao identificado'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setCommandDetails(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
              ) : commandDetails ? (
                <>
                  {/* Resumo de Valores */}
                  <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Bruto</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(commandDetails.totalGross)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Descontos</p>
                      <p className="text-lg font-semibold text-red-600">
                        -{formatCurrency(commandDetails.totalDiscounts)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Liquido</p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatCurrency(commandDetails.totalNet)}
                      </p>
                    </div>
                  </div>

                  {/* Itens da Comanda */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Scissors className="w-4 h-4" />
                      Itens da Comanda ({commandDetails.items.length})
                    </h3>
                    <div className="space-y-2">
                      {commandDetails.items.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Nenhum item na comanda</p>
                      ) : (
                        commandDetails.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              item.canceledAt
                                ? 'bg-red-50 border-red-200 opacity-60'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                item.type === 'SERVICE' ? 'bg-purple-100' : 'bg-blue-100'
                              }`}>
                                {item.type === 'SERVICE' ? (
                                  <Scissors className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <Package className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className={`font-medium ${item.canceledAt ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                  {item.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity}x {formatCurrency(item.unitPrice)}
                                  {item.performerName && ` • ${item.performerName}`}
                                  {item.canceledAt && ' • CANCELADO'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${item.canceledAt ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {formatCurrency(item.totalPrice)}
                              </p>
                              {parseFloat(item.discount) > 0 && (
                                <p className="text-xs text-red-500">
                                  -{formatCurrency(item.discount)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pagamentos */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Pagamentos Realizados ({commandDetails.payments.length})
                    </h3>
                    <div className="space-y-2">
                      {commandDetails.payments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Nenhum pagamento registrado</p>
                      ) : (
                        commandDetails.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CreditCard className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {payment.paymentMethod?.name || 'Forma nao especificada'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(payment.paidAt)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold text-green-700">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Informacoes da Divida */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Informacoes da Divida</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-yellow-700">Valor Total:</p>
                        <p className="font-semibold text-yellow-900">{formatCurrency(selectedAccount.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-yellow-700">Valor Pago:</p>
                        <p className="font-semibold text-yellow-900">{formatCurrency(selectedAccount.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-yellow-700">Valor Restante:</p>
                        <p className="font-bold text-red-600">{formatCurrency(selectedAccount.remainingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-yellow-700">Vencimento:</p>
                        <p className="font-semibold text-yellow-900">{formatDate(selectedAccount.dueDate)}</p>
                      </div>
                    </div>
                    {selectedAccount.notes && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <p className="text-yellow-700 text-sm">Observacoes:</p>
                        <p className="text-yellow-900">{selectedAccount.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">Erro ao carregar detalhes</p>
              )}
            </div>

            <div className="flex justify-between gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => navigate(`/comandas/${selectedAccount.command?.id}`)}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Abrir Comanda Completa
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setCommandDetails(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Fechar
                </button>
                {(selectedAccount.status === 'OPEN' || selectedAccount.status === 'OVERDUE') && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setCommandDetails(null);
                      handleOpenSettleModal(selectedAccount);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Quitar Divida
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
