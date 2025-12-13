import { useState, useEffect } from 'react';
import { Plus, Link2, Clipboard, Trash2, Eye, BarChart2, X, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface CartLinkItem {
  type: string;
  itemId: number;
  name: string;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  quantity: number;
}

interface CartLink {
  id: string;
  code: string;
  clientId: string | null;
  clientPhone: string | null;
  clientName: string | null;
  source: string;
  status: string;
  items: CartLinkItem[];
  message: string | null;
  totalOriginalPrice: string;
  totalDiscount: string;
  totalFinalPrice: string;
  viewCount: number;
  lastViewedAt: string | null;
  convertedAt: string | null;
  commandId: string | null;
  expiresAt: string | null;
  publicUrl: string;
  createdAt: string;
}

interface CartLinkStats {
  totalLinks: number;
  activeLinks: number;
  convertedLinks: number;
  expiredLinks: number;
  conversionRate: number;
  totalViews: number;
  totalRevenue: number;
  bySource: { source: string; count: number; converted: number; revenue: number }[];
}

interface Client { id: string; name: string | null; phone: string; }
interface Service { id: number; name: string; price: string; }
interface Product { id: number; name: string; salePrice: string; }

const SOURCES = [
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
  { value: 'SMS', label: 'SMS', icon: '📱' },
  { value: 'EMAIL', label: 'E-mail', icon: '📧' },
  { value: 'MANUAL', label: 'Manual', icon: '✏️' },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  CONVERTED: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function CartLinksPage() {
  const [links, setLinks] = useState<CartLink[]>([]);
  const [stats, setStats] = useState<CartLinkStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    clientPhone: '',
    clientName: '',
    source: 'WHATSAPP',
    message: '',
    expiresAt: '',
    items: [] as { type: string; itemId: number; quantity: number; discount: number }[],
  });

  useEffect(() => {
    fetchLinks();
    fetchStats();
    fetchClients();
    fetchServices();
    fetchProducts();
  }, [filterStatus, filterSource]);

  const fetchLinks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterSource) params.append('source', filterSource);
      const { data } = await api.get(`/cart-links?${params}`);
      setLinks(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/cart-links/stats');
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

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data.data || data || []);
    } catch (err) {
      console.error('Erro ao carregar servicos:', err);
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
      setError('Adicione pelo menos um item ao carrinho');
      return;
    }
    try {
      const payload = {
        clientId: formData.clientId || undefined,
        clientPhone: formData.clientPhone || undefined,
        clientName: formData.clientName || undefined,
        source: formData.source,
        message: formData.message || undefined,
        expiresAt: formData.expiresAt || undefined,
        items: formData.items.map(item => ({ type: item.type, itemId: item.itemId, quantity: item.quantity || 1, discount: item.discount || 0 })),
      };
      await api.post('/cart-links', payload);
      setShowModal(false);
      resetForm();
      fetchLinks();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return;
    try {
      await api.delete(`/cart-links/${id}`);
      fetchLinks();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const copyToClipboard = async (link: CartLink) => {
    try {
      await navigator.clipboard.writeText(link.publicUrl);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const resetForm = () => {
    setFormData({ clientId: '', clientPhone: '', clientName: '', source: 'WHATSAPP', message: '', expiresAt: '', items: [] });
  };

  const addItem = (type: 'PRODUCT' | 'SERVICE') => {
    setFormData({ ...formData, items: [...formData.items, { type, itemId: 0, quantity: 1, discount: 0 }] });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const list = item.type === 'PRODUCT' ? products : services;
      const found = list.find(i => i.id === item.itemId);
      if (!found) return total;
      const price = parseFloat(item.type === 'PRODUCT' ? (found as Product).salePrice : (found as Service).price);
      const discounted = price * (1 - item.discount / 100);
      return total + discounted * item.quantity;
    }, 0);
  };

  const getSourceIcon = (source: string) => SOURCES.find(s => s.value === source)?.icon || '📎';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Links de Carrinho</h1>
          <p className="mt-1 text-sm text-gray-500">Crie links personalizados para vendas via WhatsApp e outros canais</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
          <Plus className="h-5 w-5 mr-2" />Novo Link
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center"><Link2 className="h-8 w-8 text-purple-600" /><div className="ml-3"><p className="text-sm text-gray-500">Links Ativos</p><p className="text-xl font-semibold">{stats.activeLinks}/{stats.totalLinks}</p></div></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600" /><div className="ml-3"><p className="text-sm text-gray-500">Taxa de Conversao</p><p className="text-xl font-semibold">{stats.conversionRate.toFixed(1)}%</p></div></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center"><Eye className="h-8 w-8 text-blue-600" /><div className="ml-3"><p className="text-sm text-gray-500">Visualizacoes</p><p className="text-xl font-semibold">{stats.totalViews}</p></div></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center"><BarChart2 className="h-8 w-8 text-yellow-600" /><div className="ml-3"><p className="text-sm text-gray-500">Receita Total</p><p className="text-xl font-semibold">R$ {stats.totalRevenue.toFixed(2)}</p></div></div>
          </div>
        </div>
      )}

      {stats && stats.bySource.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Desempenho por Canal</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.bySource.map(source => (
              <div key={source.source} className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{getSourceIcon(source.source)}</span>
                <p className="text-sm font-medium text-gray-900 mt-1">{source.source}</p>
                <p className="text-xs text-gray-500">{source.count} links</p>
                <p className="text-xs text-green-600">{source.converted} convertidos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              <option value="ACTIVE">Ativos</option>
              <option value="CONVERTED">Convertidos</option>
              <option value="EXPIRED">Expirados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Canal</label>
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              {SOURCES.map(s => (<option key={s.value} value={s.value}>{s.icon} {s.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens / Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metricas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getSourceIcon(link.source)}</span>
                    <div>
                      <div className="text-sm font-mono text-gray-900">{link.code}</div>
                      <div className="text-xs text-gray-500">{new Date(link.createdAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{link.clientName || 'Nao informado'}</div>
                  <div className="text-xs text-gray-500">{link.clientPhone || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{link.items.length} itens</div>
                  <div className="text-sm font-medium text-green-600">R$ {parseFloat(link.totalFinalPrice).toFixed(2)}</div>
                  {parseFloat(link.totalDiscount) > 0 && <div className="text-xs text-gray-500 line-through">R$ {parseFloat(link.totalOriginalPrice).toFixed(2)}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900"><Eye className="h-4 w-4 mr-1" />{link.viewCount} views</div>
                  {link.lastViewedAt && <div className="text-xs text-gray-500">Ultimo: {new Date(link.lastViewedAt).toLocaleDateString('pt-BR')}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[link.status]}`}>{link.status}</span>
                  {link.expiresAt && <div className="text-xs text-gray-500 mt-1">Expira: {new Date(link.expiresAt).toLocaleDateString('pt-BR')}</div>}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => copyToClipboard(link)} className={`${copiedId === link.id ? 'text-green-600' : 'text-purple-600'} hover:text-purple-900`} title="Copiar link"><Clipboard className="h-5 w-5" /></button>
                  <button onClick={() => window.open(link.publicUrl, '_blank')} className="text-blue-600 hover:text-blue-900" title="Abrir link"><Eye className="h-5 w-5" /></button>
                  {link.status === 'ACTIVE' && <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:text-red-900" title="Excluir"><Trash2 className="h-5 w-5" /></button>}
                </td>
              </tr>
            ))}
            {links.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nenhum link encontrado. Crie seu primeiro link de carrinho!</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Novo Link de Carrinho</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Canal de Envio</label>
                  <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                    {SOURCES.map(s => (<option key={s.value} value={s.value}>{s.icon} {s.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente (opcional)</label>
                  <select value={formData.clientId} onChange={(e) => { const client = clients.find(c => c.id === e.target.value); setFormData({ ...formData, clientId: e.target.value, clientName: client?.name || '', clientPhone: client?.phone || '' }); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                    <option value="">Selecione ou deixe em branco...</option>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.name || c.phone}</option>))}
                  </select>
                </div>
                {!formData.clientId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Telefone</label><input type="tel" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" /></div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Itens do Carrinho</label>
                    <div className="space-x-2">
                      <button type="button" onClick={() => addItem('PRODUCT')} className="text-sm text-purple-600 hover:text-purple-800">+ Produto</button>
                      <button type="button" onClick={() => addItem('SERVICE')} className="text-sm text-purple-600 hover:text-purple-800">+ Servico</button>
                    </div>
                  </div>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="mt-2 p-3 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-4 gap-2">
                        <select value={item.itemId} onChange={(e) => { const updated = [...formData.items]; updated[idx].itemId = parseInt(e.target.value); setFormData({ ...formData, items: updated }); }} className="col-span-2 rounded-md border-gray-300 text-sm">
                          <option value={0}>Selecione {item.type === 'PRODUCT' ? 'produto' : 'servico'}...</option>
                          {(item.type === 'PRODUCT' ? products : services).map(i => (<option key={i.id} value={i.id}>{i.name} - R$ {parseFloat(item.type === 'PRODUCT' ? (i as Product).salePrice : (i as Service).price).toFixed(2)}</option>))}
                        </select>
                        <input type="number" placeholder="Qtd" value={item.quantity} onChange={(e) => { const updated = [...formData.items]; updated[idx].quantity = parseInt(e.target.value) || 1; setFormData({ ...formData, items: updated }); }} className="rounded-md border-gray-300 text-sm" min="1" />
                        <input type="number" placeholder="Desc %" value={item.discount} onChange={(e) => { const updated = [...formData.items]; updated[idx].discount = parseFloat(e.target.value) || 0; setFormData({ ...formData, items: updated }); }} className="rounded-md border-gray-300 text-sm" min="0" max="100" />
                      </div>
                      <button type="button" onClick={() => { const updated = formData.items.filter((_, i) => i !== idx); setFormData({ ...formData, items: updated }); }} className="mt-1 text-xs text-red-600 hover:text-red-800">Remover</button>
                    </div>
                  ))}
                  {formData.items.length > 0 && <div className="mt-3 p-3 bg-purple-50 rounded-md"><div className="text-sm font-medium text-purple-900">Total: R$ {calculateTotal().toFixed(2)}</div></div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mensagem Personalizada</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" placeholder="Ola! Separei alguns produtos especiais para voce..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Expiracao</label>
                  <input type="datetime-local" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700">Criar Link</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
