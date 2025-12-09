import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Loader2,
  AlertTriangle,
  Wallet,
  Gift,
  Receipt,
  CheckCircle,
  Clock,
  Scissors,
  Package,
  Edit,
  X,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface Command {
  id: string;
  cardNumber: string;
  code: string;
  status: 'OPEN' | 'IN_SERVICE' | 'WAITING_PAYMENT' | 'CLOSED' | 'CANCELED';
  clientId?: string;
  totalGross: string;
  totalDiscounts: string;
  totalNet: string;
  notes?: string;
  openedAt: string;
  openedById: string;
  items: CommandItem[];
  payments: CommandPayment[];
  events: CommandEvent[];
}

interface CommandItem {
  id: string;
  type: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  totalPrice: string;
  performerId?: string;
  addedAt: string;
  canceledAt?: string;
}

interface CommandPayment {
  id: string;
  method: string;
  amount: string;
  paidAt: string;
}

interface CommandEvent {
  id: string;
  eventType: string;
  actorId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Aberta', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  IN_SERVICE: { label: 'Em Atendimento', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  WAITING_PAYMENT: { label: 'Aguardando Pagamento', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  CLOSED: { label: 'Fechada', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELED: { label: 'Cancelada', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const eventLabels: Record<string, string> = {
  OPENED: 'abriu a comanda',
  ITEM_ADDED: 'adicionou item',
  ITEM_UPDATED: 'atualizou item',
  ITEM_REMOVED: 'removeu item',
  DISCOUNT_APPLIED: 'aplicou desconto',
  SERVICE_CLOSED: 'encerrou os serviços',
  PAYMENT_ADDED: 'registrou pagamento',
  CASHIER_CLOSED: 'fechou a comanda no caixa',
  STATUS_CHANGED: 'alterou status',
  NOTE_ADDED: 'adicionou observação',
};

const paymentMethods = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'TRANSFER', label: 'Transferência' },
];

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'PIX',
  TRANSFER: 'Transferência',
};

export function CommandPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [command, setCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modais
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Form de pagamento
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Form de cancelamento
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      loadCommand();
    }
  }, [id]);

  const loadCommand = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/commands/${id}`);
      setCommand(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar comanda:', err);
      setError(err.response?.data?.message || 'Erro ao carregar comanda');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "HH:mm", { locale: ptBR });
  };

  // Ação: Encerrar Serviços
  const handleCloseService = async () => {
    if (!command) return;
    
    if (!confirm('Deseja encerrar os serviços desta comanda?')) return;

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/close-service`);
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao encerrar serviços');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Registrar Pagamento
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;

    const amount = parseFloat(paymentAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Digite um valor válido');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/payments`, {
        method: paymentMethod,
        amount,
        notes: paymentNotes || undefined,
      });
      
      setShowPaymentModal(false);
      setPaymentMethod('PIX');
      setPaymentAmount('');
      setPaymentNotes('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Fechar Comanda no Caixa
  const handleCloseCashier = async () => {
    if (!command) return;

    if (!confirm('Deseja fechar esta comanda no caixa? Esta ação não pode ser desfeita.')) return;

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/close-cashier`);
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao fechar comanda');
    } finally {
      setActionLoading(false);
    }
  };

  // Ação: Cancelar Comanda
  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command) return;

    if (!cancelReason.trim()) {
      alert('Digite o motivo do cancelamento');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/commands/${command.id}/cancel`, {
        reason: cancelReason,
      });
      
      setShowCancelModal(false);
      setCancelReason('');
      await loadCommand();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar comanda');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando comanda...</span>
      </div>
    );
  }

  if (error || !command) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error || 'Comanda não encontrada'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const status = statusConfig[command.status] || { label: command.status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  const activeItems = command.items?.filter(item => !item.canceledAt) || [];
  const totalPaid = command.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalNet = parseFloat(command.totalNet) || 0;
  const remaining = totalNet - totalPaid;
  
  const serviceCount = activeItems.filter(i => i.type === 'SERVICE').length;
  const productCount = activeItems.filter(i => i.type === 'PRODUCT').length;

  const isEditable = command.status !== 'CLOSED' && command.status !== 'CANCELED';
  const canCloseService = command.status === 'OPEN' || command.status === 'IN_SERVICE';
  const canCloseCashier = command.status === 'WAITING_PAYMENT' && remaining <= 0;
  const canAddPayment = isEditable && remaining > 0;

  return (
    <div className="space-y-6">
      {/* Header Melhorado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Comanda #{command.cardNumber}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Receipt className="w-4 h-4" />
                  Código: {command.code}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Cartão: {command.cardNumber}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(command.openedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação no Header */}
          {isEditable && (
            <div className="flex gap-2">
              {canCloseService && activeItems.length > 0 && (
                <button 
                  onClick={handleCloseService}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
                >
                  Encerrar Serviços
                </button>
              )}
              {canCloseCashier && (
                <button 
                  onClick={handleCloseCashier}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                >
                  Fechar Comanda
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Wallet className="w-4 h-4" />
            <p className="text-sm">Total Bruto</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(command.totalGross)}</p>
          {(serviceCount > 0 || productCount > 0) && (
            <p className="text-xs text-gray-400 mt-1">
              {serviceCount > 0 && `${serviceCount} serviço${serviceCount > 1 ? 's' : ''}`}
              {serviceCount > 0 && productCount > 0 && ' • '}
              {productCount > 0 && `${productCount} produto${productCount > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Gift className="w-4 h-4" />
            <p className="text-sm">Descontos</p>
          </div>
          <p className="text-2xl font-bold text-red-600">-{formatCurrency(command.totalDiscounts)}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Receipt className="w-4 h-4" />
            <p className="text-sm">Total Líquido</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(command.totalNet)}</p>
        </div>
        
        <div className={`rounded-xl border p-4 ${remaining > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <p className="text-sm">Restante</p>
          </div>
          <p className={`text-2xl font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {remaining <= 0 ? '✅ Pago' : formatCurrency(remaining)}
          </p>
          {totalPaid > 0 && remaining > 0 && (
            <p className="text-xs text-gray-500 mt-1">Pagamento parcial registrado</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itens */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Itens ({activeItems.length})
              </h2>
              {isEditable && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Adicionar Item
                </button>
              )}
            </div>

            {activeItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Scissors className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum item ainda.</p>
                <p className="text-sm">Clique em <span className="font-medium text-primary-600">+ Adicionar Item</span> para lançar serviços e produtos.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="pb-3 pr-4">Tipo</th>
                      <th className="pb-3 pr-4">Descrição</th>
                      <th className="pb-3 pr-4 text-center">Qtd</th>
                      <th className="pb-3 pr-4 text-right">Unitário</th>
                      <th className="pb-3 pr-4 text-right">Total</th>
                      {isEditable && <th className="pb-3 text-center">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${item.type === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.type === 'SERVICE' ? <Scissors className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">{item.description}</p>
                        </td>
                        <td className="py-3 pr-4 text-center text-gray-900">{item.quantity}</td>
                        <td className="py-3 pr-4 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 pr-4 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                        {isEditable && (
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagamentos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pagamentos</h2>
              {canAddPayment && (
                <button 
                  onClick={() => {
                    setPaymentAmount(remaining.toFixed(2).replace('.', ','));
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  Registrar Pagamento
                </button>
              )}
            </div>

            {(!command.payments || command.payments.length === 0) ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum pagamento registrado.</p>
                {canAddPayment && (
                  <p className="text-sm">Clique em <span className="font-medium text-green-600">Registrar Pagamento</span> para receber.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="pb-3 pr-4">Método</th>
                      <th className="pb-3 pr-4">Data/Hora</th>
                      <th className="pb-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {command.payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {paymentMethodLabels[payment.method] || payment.method}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-sm">{formatDate(payment.paidAt)}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resumo */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Pago:</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500">Restante:</span>
                <span className={`text-lg font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {remaining <= 0 ? '✅ Pago' : formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Atividade</h2>
            </div>

            {(!command.events || command.events.length === 0) ? (
              <p className="text-gray-500 text-sm">Nenhuma atividade registrada.</p>
            ) : (
              <div className="space-y-4">
                {command.events.slice(0, 10).map((event, index) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      {index < Math.min(command.events.length - 1, 9) && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-gray-900">
                        {eventLabels[event.eventType] || event.eventType}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(event.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Observações</h2>
            {command.notes ? (
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{command.notes}</p>
            ) : (
              <p className="text-gray-400 text-sm">Nenhuma observação.</p>
            )}
            {isEditable && (
              <button className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Adicionar nota
              </button>
            )}
          </div>

          {/* Ações */}
          {isEditable && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Ações</h2>
              <button 
                onClick={() => setShowCancelModal(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
              >
                Cancelar Comanda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Registrar Pagamento</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Restante: {formatCurrency(remaining)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ex: Parcelado em 3x"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Cancelar Comanda</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Esta ação não pode ser desfeita. Por favor, informe o motivo do cancelamento.
            </p>

            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo do cancelamento *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Cliente desistiu do atendimento"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}