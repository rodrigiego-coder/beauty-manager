import { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  Clock,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  ChefHat,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

interface DeliveryItem {
  id: string;
  productId: number;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  product?: {
    id: number;
    name: string;
    imageUrl: string | null;
  };
}

interface Delivery {
  id: string;
  subscriptionId: string;
  scheduledDate: string;
  deliveredDate: string | null;
  status: string;
  deliveryType: string;
  commandId: string | null;
  totalAmount: string;
  notes: string | null;
  items?: DeliveryItem[];
  subscription?: {
    id: string;
    clientId: string;
    deliveryAddress: string | null;
    plan?: {
      name: string;
    };
    client?: {
      id: string;
      name: string | null;
      phone: string;
    };
  };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  PREPARING: { label: 'Preparando', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: ChefHat },
  READY: { label: 'Pronta', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Package },
  DELIVERED: { label: 'Entregue', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'text-red-700', bgColor: 'bg-red-100', icon: X },
};

const deliveryTypeLabels: Record<string, string> = {
  PICKUP: 'Retirada',
  DELIVERY: 'Entrega',
};

export function SubscriptionDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
  });

  useEffect(() => {
    loadDeliveries();
  }, [selectedDate, selectedStatus]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await api.get(`/product-subscriptions/deliveries/all?${params.toString()}`);
      setDeliveries(response.data);

      // Calculate stats
      const statsData = { pending: 0, preparing: 0, ready: 0, delivered: 0 };
      for (const delivery of response.data) {
        if (delivery.status === 'PENDING') statsData.pending++;
        else if (delivery.status === 'PREPARING') statsData.preparing++;
        else if (delivery.status === 'READY') statsData.ready++;
        else if (delivery.status === 'DELIVERED') statsData.delivered++;
      }
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      setActionLoading(deliveryId);
      await api.patch(`/product-subscriptions/deliveries/${deliveryId}/status`, {
        status: newStatus,
      });
      loadDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateCommand = async (deliveryId: string) => {
    try {
      setActionLoading(deliveryId);
      const response = await api.post(`/product-subscriptions/deliveries/${deliveryId}/generate-command`);
      alert(`Comanda gerada com sucesso!`);
      loadDeliveries();

      // Optionally navigate to command
      if (confirm('Deseja abrir a comanda?')) {
        window.open(`/comandas/${response.data.commandId}`, '_blank');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao gerar comanda');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR });
  };

  const getNextStatusAction = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { nextStatus: 'PREPARING', label: 'Iniciar Preparo', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'PREPARING':
        return { nextStatus: 'READY', label: 'Marcar Pronta', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'READY':
        return { nextStatus: 'DELIVERED', label: 'Marcar Entregue', color: 'bg-green-600 hover:bg-green-700' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
        <button onClick={loadDeliveries} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entregas de Assinaturas</h1>
          <p className="text-gray-500 mt-1">Gerencie as entregas de produtos recorrentes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Pronta</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Preparando</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{stats.preparing}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span className="text-purple-800 font-medium">Prontas</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">{stats.ready}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Entregues</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{stats.delivered}</p>
        </div>
      </div>

      {/* Deliveries List */}
      {deliveries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
          <p className="text-gray-500">Ajuste os filtros ou selecione outra data</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map(delivery => {
            const StatusIcon = statusConfig[delivery.status]?.icon || Clock;
            const nextAction = getNextStatusAction(delivery.status);

            return (
              <div key={delivery.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Client Info */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary-100 rounded-full">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {delivery.subscription?.client?.name || 'Cliente'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Phone className="w-4 h-4" />
                          {delivery.subscription?.client?.phone}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[delivery.status]?.bgColor} ${statusConfig[delivery.status]?.color}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {statusConfig[delivery.status]?.label}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {deliveryTypeLabels[delivery.deliveryType]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plan & Price */}
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{delivery.subscription?.plan?.name}</p>
                      <p className="text-xl font-bold text-primary-600 mt-1">
                        {formatCurrency(delivery.totalAmount)}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(delivery.scheduledDate)}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {delivery.deliveryType === 'DELIVERY' && delivery.subscription?.deliveryAddress && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">{delivery.subscription.deliveryAddress}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Produtos:</p>
                    <div className="flex flex-wrap gap-2">
                      {delivery.items?.map(item => (
                        <span key={item.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {item.quantity}x {item.product?.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    {nextAction && (
                      <button
                        onClick={() => handleUpdateStatus(delivery.id, nextAction.nextStatus)}
                        disabled={actionLoading === delivery.id}
                        className={`px-4 py-2 text-white rounded-lg text-sm flex items-center gap-2 ${nextAction.color} disabled:opacity-50`}
                      >
                        {actionLoading === delivery.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        {nextAction.label}
                      </button>
                    )}

                    {!delivery.commandId && delivery.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleGenerateCommand(delivery.id)}
                        disabled={actionLoading === delivery.id}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200 disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                        Gerar Comanda
                      </button>
                    )}

                    {delivery.commandId && (
                      <a
                        href={`/comandas/${delivery.commandId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Comanda
                      </a>
                    )}

                    {delivery.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(delivery.id, 'CANCELLED')}
                        disabled={actionLoading === delivery.id}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubscriptionDeliveriesPage;
