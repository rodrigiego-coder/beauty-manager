import { useState, useEffect } from 'react';
import { Plus, Truck, CheckCircle, Clock, X, ShoppingBag } from 'lucide-react';
import api from '../services/api';

interface Reservation {
  id: string;
  clientId: string;
  status: string;
  deliveryType: string;
  deliveryAddress: string | null;
  scheduledDate: string | null;
  totalAmount: string;
  commandId: string | null;
  notes: string | null;
  confirmedAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  client?: { id: string; name: string | null; phone: string };
  createdAt: string;
}

interface ReservationStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  readyReservations: number;
  deliveredReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  averageValue: number;
}

interface Client { id: string; name: string | null; phone: string; }
interface Product { id: number; name: string; salePrice: string; }

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  READY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  READY: 'Pronto p/ Retirada',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelada',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<Reservation | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDeliveryType, setFilterDeliveryType] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    deliveryType: 'PICKUP',
    deliveryAddress: '',
    scheduledDate: '',
    notes: '',
    items: [] as { productId: number; quantity: number }[],
  });

  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });

  useEffect(() => {
    fetchReservations();
    fetchStats();
    fetchClients();
    fetchProducts();
  }, [filterStatus, filterDeliveryType]);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterDeliveryType) params.append('deliveryType', filterDeliveryType);
      const { data } = await api.get(`/reservations?${params}`);
      setReservations(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/reservations/stats');
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatisticas:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/commands/clients');
      setClients(data || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.items.length === 0) {
      setError('Adicione pelo menos um produto');
      return;
    }
    try {
      const payload = {
        clientId: formData.clientId,
        deliveryType: formData.deliveryType,
        deliveryAddress: formData.deliveryType === 'DELIVERY' ? formData.deliveryAddress : undefined,
        scheduledDate: formData.scheduledDate || undefined,
        notes: formData.notes || undefined,
        items: formData.items,
      };
      await api.post('/reservations', payload);
      setShowModal(false);
      resetForm();
      fetchReservations();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusModal) return;
    try {
      await api.patch(`/reservations/${showStatusModal.id}/status`, statusForm);
      setShowStatusModal(null);
      setStatusForm({ status: '', notes: '' });
      fetchReservations();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const resetForm = () => {
    setFormData({ clientId: '', deliveryType: 'PICKUP', deliveryAddress: '', scheduledDate: '', notes: '', items: [] });
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { productId: 0, quantity: 1 }] });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      return total + parseFloat(product.salePrice) * item.quantity;
    }, 0);
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'PENDING': return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED': return ['READY', 'CANCELLED'];
      case 'READY': return ['DELIVERED', 'CANCELLED'];
      default: return [];
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas de Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie reservas e encomendas de produtos</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
          <Plus className="h-5 w-5 mr-2" />Nova Reserva
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><Clock className="h-8 w-8 text-yellow-600" /><div className="ml-3"><p className="text-sm text-gray-500">Pendentes</p><p className="text-xl font-semibold">{stats.pendingReservations}</p></div></div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><ShoppingBag className="h-8 w-8 text-purple-600" /><div className="ml-3"><p className="text-sm text-gray-500">Prontas</p><p className="text-xl font-semibold">{stats.readyReservations}</p></div></div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600" /><div className="ml-3"><p className="text-sm text-gray-500">Entregues</p><p className="text-xl font-semibold">{stats.deliveredReservations}</p></div></div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="flex items-center"><Truck className="h-8 w-8 text-blue-600" /><div className="ml-3"><p className="text-sm text-gray-500">Receita</p><p className="text-xl font-semibold">R$ {stats.totalRevenue.toFixed(2)}</p></div></div></div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="READY">Prontas</option>
              <option value="DELIVERED">Entregues</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Entrega</label>
            <select value={filterDeliveryType} onChange={(e) => setFilterDeliveryType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              <option value="PICKUP">Retirada</option>
              <option value="DELIVERY">Entrega</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{reservation.client?.name || 'Cliente'}</div>
                  <div className="text-xs text-gray-500">{reservation.client?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    {reservation.deliveryType === 'DELIVERY' ? <><Truck className="h-4 w-4 mr-1" />Entrega</> : <><ShoppingBag className="h-4 w-4 mr-1" />Retirada</>}
                  </div>
                  {reservation.scheduledDate && <div className="text-xs text-gray-500">{new Date(reservation.scheduledDate).toLocaleDateString('pt-BR')}</div>}
                </td>
                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">R$ {parseFloat(reservation.totalAmount).toFixed(2)}</div></td>
                <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[reservation.status]}`}>{STATUS_LABELS[reservation.status]}</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  {getNextStatuses(reservation.status).length > 0 && (
                    <button onClick={() => { setShowStatusModal(reservation); setStatusForm({ status: getNextStatuses(reservation.status)[0], notes: '' }); }} className="text-purple-600 hover:text-purple-900 text-sm">Atualizar</button>
                  )}
                  {reservation.status === 'PENDING' && <button onClick={() => handleDelete(reservation.id)} className="text-red-600 hover:text-red-900 text-sm">Excluir</button>}
                </td>
              </tr>
            ))}
            {reservations.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhuma reserva encontrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nova Reserva</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required>
                    <option value="">Selecione...</option>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.name || c.phone}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Entrega</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setFormData({ ...formData, deliveryType: 'PICKUP' })} className={`p-3 rounded-lg border-2 text-center ${formData.deliveryType === 'PICKUP' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>🏪 Retirada</button>
                    <button type="button" onClick={() => setFormData({ ...formData, deliveryType: 'DELIVERY' })} className={`p-3 rounded-lg border-2 text-center ${formData.deliveryType === 'DELIVERY' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>🚚 Entrega</button>
                  </div>
                </div>
                {formData.deliveryType === 'DELIVERY' && (
                  <div><label className="block text-sm font-medium text-gray-700">Endereco</label><textarea value={formData.deliveryAddress} onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" rows={2} required /></div>
                )}
                <div><label className="block text-sm font-medium text-gray-700">Data Prevista</label><input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" /></div>
                <div>
                  <div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-gray-700">Produtos</label><button type="button" onClick={addItem} className="text-sm text-purple-600 hover:text-purple-800">+ Adicionar</button></div>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="mt-2 p-3 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-3 gap-2">
                        <select value={item.productId} onChange={(e) => { const updated = [...formData.items]; updated[idx].productId = parseInt(e.target.value); setFormData({ ...formData, items: updated }); }} className="col-span-2 rounded-md border-gray-300 text-sm">
                          <option value={0}>Selecione produto...</option>
                          {products.map(p => (<option key={p.id} value={p.id}>{p.name} - R$ {parseFloat(p.salePrice).toFixed(2)}</option>))}
                        </select>
                        <input type="number" placeholder="Qtd" value={item.quantity} onChange={(e) => { const updated = [...formData.items]; updated[idx].quantity = parseInt(e.target.value) || 1; setFormData({ ...formData, items: updated }); }} className="rounded-md border-gray-300 text-sm" min="1" />
                      </div>
                      <button type="button" onClick={() => { const updated = formData.items.filter((_, i) => i !== idx); setFormData({ ...formData, items: updated }); }} className="mt-1 text-xs text-red-600 hover:text-red-800">Remover</button>
                    </div>
                  ))}
                  {formData.items.length > 0 && <div className="mt-3 p-3 bg-purple-50 rounded-md"><div className="text-sm font-medium text-purple-900">Total: R$ {calculateTotal().toFixed(2)}</div></div>}
                </div>
                <div><label className="block text-sm font-medium text-gray-700">Observacoes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" rows={2} /></div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700">Criar Reserva</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowStatusModal(null)} />
            <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Atualizar Status</h3>
                <button onClick={() => setShowStatusModal(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Novo Status</label>
                  <select value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required>
                    {getNextStatuses(showStatusModal.status).map(status => (<option key={status} value={status}>{STATUS_LABELS[status]}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{statusForm.status === 'CANCELLED' ? 'Motivo do Cancelamento' : 'Observacoes'}</label>
                  <textarea value={statusForm.notes} onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" rows={2} required={statusForm.status === 'CANCELLED'} />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowStatusModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700">Atualizar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
