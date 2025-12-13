import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BarChart2, Tag, Sparkles, X } from 'lucide-react';
import api from '../services/api';

interface UpsellRule {
  id: string;
  name: string;
  triggerType: string;
  triggerServiceIds: number[];
  triggerProductIds: number[];
  triggerHairTypes: string[];
  recommendedProducts: { productId: number; discount: number; reason: string }[];
  recommendedServices: { serviceId: number; discount: number; reason: string }[];
  displayMessage: string | null;
  discountPercent: string | null;
  validFrom: string | null;
  validUntil: string | null;
  maxUsesTotal: number | null;
  maxUsesPerClient: number | null;
  currentUses: number | null;
  isActive: boolean | null;
  priority: number | null;
  conversionRate?: number;
  createdAt: string;
}

interface UpsellStats {
  totalRules: number;
  activeRules: number;
  totalOffers: number;
  acceptedOffers: number;
  declinedOffers: number;
  conversionRate: number;
  totalRevenue: number;
  averageDiscount: number;
}

interface Service {
  id: number;
  name: string;
  price: string;
}

interface Product {
  id: number;
  name: string;
  salePrice: string;
}

const TRIGGER_TYPES = [
  { value: 'SERVICE', label: 'Servico Selecionado' },
  { value: 'PRODUCT', label: 'Produto no Carrinho' },
  { value: 'HAIR_PROFILE', label: 'Perfil Capilar' },
  { value: 'APPOINTMENT', label: 'Agendamento Confirmado' },
];

const HAIR_TYPES = [
  'STRAIGHT', 'WAVY', 'CURLY', 'COILY',
  'OILY', 'DRY', 'NORMAL', 'MIXED',
  'FINE', 'MEDIUM', 'THICK',
  'CHEMICALLY_TREATED', 'COLOR_TREATED', 'NATURAL',
];

export default function UpsellRulesPage() {
  const [rules, setRules] = useState<UpsellRule[]>([]);
  const [stats, setStats] = useState<UpsellStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<UpsellRule | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    triggerType: 'SERVICE',
    triggerServiceIds: [] as number[],
    triggerProductIds: [] as number[],
    triggerHairTypes: [] as string[],
    recommendedProducts: [] as { productId: number; discount: number; reason: string }[],
    recommendedServices: [] as { serviceId: number; discount: number; reason: string }[],
    displayMessage: '',
    discountPercent: '',
    validFrom: '',
    validUntil: '',
    maxUsesTotal: '',
    maxUsesPerClient: '',
    priority: '10',
  });

  useEffect(() => {
    fetchRules();
    fetchStats();
    fetchServices();
    fetchProducts();
  }, [filterType, filterActive]);

  const fetchRules = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('triggerType', filterType);
      if (filterActive) params.append('isActive', filterActive);
      const { data } = await api.get(`/upsell/rules?${params}`);
      setRules(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/upsell/stats');
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatisticas:', err);
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
    try {
      const payload = {
        name: formData.name,
        triggerType: formData.triggerType,
        triggerServiceIds: formData.triggerServiceIds,
        triggerProductIds: formData.triggerProductIds,
        triggerHairTypes: formData.triggerHairTypes,
        recommendedProducts: formData.recommendedProducts,
        recommendedServices: formData.recommendedServices,
        displayMessage: formData.displayMessage || undefined,
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : undefined,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
        maxUsesTotal: formData.maxUsesTotal ? parseInt(formData.maxUsesTotal) : undefined,
        maxUsesPerClient: formData.maxUsesPerClient ? parseInt(formData.maxUsesPerClient) : undefined,
        priority: parseInt(formData.priority) || 10,
      };

      if (editingRule) {
        await api.patch(`/upsell/rules/${editingRule.id}`, payload);
      } else {
        await api.post('/upsell/rules', payload);
      }
      setShowModal(false);
      resetForm();
      fetchRules();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (rule: UpsellRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      triggerType: rule.triggerType,
      triggerServiceIds: rule.triggerServiceIds || [],
      triggerProductIds: rule.triggerProductIds || [],
      triggerHairTypes: rule.triggerHairTypes || [],
      recommendedProducts: rule.recommendedProducts || [],
      recommendedServices: rule.recommendedServices || [],
      displayMessage: rule.displayMessage || '',
      discountPercent: rule.discountPercent || '',
      validFrom: rule.validFrom?.split('T')[0] || '',
      validUntil: rule.validUntil?.split('T')[0] || '',
      maxUsesTotal: rule.maxUsesTotal?.toString() || '',
      maxUsesPerClient: rule.maxUsesPerClient?.toString() || '',
      priority: rule.priority?.toString() || '10',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    try {
      await api.delete(`/upsell/rules/${id}`);
      fetchRules();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleToggleActive = async (rule: UpsellRule) => {
    try {
      await api.patch(`/upsell/rules/${rule.id}`, { isActive: !rule.isActive });
      fetchRules();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      triggerType: 'SERVICE',
      triggerServiceIds: [],
      triggerProductIds: [],
      triggerHairTypes: [],
      recommendedProducts: [],
      recommendedServices: [],
      displayMessage: '',
      discountPercent: '',
      validFrom: '',
      validUntil: '',
      maxUsesTotal: '',
      maxUsesPerClient: '',
      priority: '10',
    });
  };

  const addRecommendedProduct = () => {
    setFormData({
      ...formData,
      recommendedProducts: [...formData.recommendedProducts, { productId: 0, discount: 0, reason: '' }],
    });
  };

  const addRecommendedService = () => {
    setFormData({
      ...formData,
      recommendedServices: [...formData.recommendedServices, { serviceId: 0, discount: 0, reason: '' }],
    });
  };

  const getTriggerLabel = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regras de Upsell</h1>
          <p className="mt-1 text-sm text-gray-500">Configure ofertas inteligentes para aumentar o ticket medio</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
          <Plus className="h-5 w-5 mr-2" />
          Nova Regra
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Regras Ativas</p>
                <p className="text-xl font-semibold">{stats.activeRules}/{stats.totalRules}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Taxa de Conversao</p>
                <p className="text-xl font-semibold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Ofertas Aceitas</p>
                <p className="text-xl font-semibold">{stats.acceptedOffers}/{stats.totalOffers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Receita Gerada</p>
                <p className="text-xl font-semibold">R$ {stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Gatilho</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              {TRIGGER_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
              <option value="">Todos</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gatilho</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recomendacoes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversao</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                  <div className="text-xs text-gray-500">Prioridade: {rule.priority || 10}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{getTriggerLabel(rule.triggerType)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{(rule.recommendedProducts?.length || 0) + (rule.recommendedServices?.length || 0)} itens</div>
                  {rule.discountPercent && <div className="text-xs text-green-600">{rule.discountPercent}% desconto</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{rule.conversionRate?.toFixed(1) || 0}%</div>
                  <div className="text-xs text-gray-500">{rule.currentUses || 0} usos</div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleToggleActive(rule)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {rule.isActive ? 'Ativa' : 'Inativa'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(rule)} className="text-purple-600 hover:text-purple-900"><Pencil className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete(rule.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nenhuma regra encontrada. Crie sua primeira regra de upsell!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{editingRule ? 'Editar Regra' : 'Nova Regra de Upsell'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Regra</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Gatilho</label>
                  <select value={formData.triggerType} onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                    {TRIGGER_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>
                {formData.triggerType === 'SERVICE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Servicos que Ativam</label>
                    <select multiple value={formData.triggerServiceIds.map(String)} onChange={(e) => setFormData({ ...formData, triggerServiceIds: Array.from(e.target.selectedOptions, o => parseInt(o.value)) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 h-32">
                      {services.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                  </div>
                )}
                {formData.triggerType === 'PRODUCT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produtos que Ativam</label>
                    <select multiple value={formData.triggerProductIds.map(String)} onChange={(e) => setFormData({ ...formData, triggerProductIds: Array.from(e.target.selectedOptions, o => parseInt(o.value)) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 h-32">
                      {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                )}
                {formData.triggerType === 'HAIR_PROFILE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipos de Cabelo</label>
                    <select multiple value={formData.triggerHairTypes} onChange={(e) => setFormData({ ...formData, triggerHairTypes: Array.from(e.target.selectedOptions, o => o.value) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 h-32">
                      {HAIR_TYPES.map(t => (<option key={t} value={t}>{t.replace('_', ' ')}</option>))}
                    </select>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Produtos Recomendados</label>
                    <button type="button" onClick={addRecommendedProduct} className="text-sm text-purple-600 hover:text-purple-800">+ Adicionar Produto</button>
                  </div>
                  {formData.recommendedProducts.map((rec, idx) => (
                    <div key={idx} className="mt-2 p-3 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-3 gap-2">
                        <select value={rec.productId} onChange={(e) => { const updated = [...formData.recommendedProducts]; updated[idx].productId = parseInt(e.target.value); setFormData({ ...formData, recommendedProducts: updated }); }} className="rounded-md border-gray-300 text-sm">
                          <option value={0}>Selecione...</option>
                          {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                        <input type="number" placeholder="Desconto %" value={rec.discount} onChange={(e) => { const updated = [...formData.recommendedProducts]; updated[idx].discount = parseFloat(e.target.value) || 0; setFormData({ ...formData, recommendedProducts: updated }); }} className="rounded-md border-gray-300 text-sm" />
                        <input type="text" placeholder="Motivo" value={rec.reason} onChange={(e) => { const updated = [...formData.recommendedProducts]; updated[idx].reason = e.target.value; setFormData({ ...formData, recommendedProducts: updated }); }} className="rounded-md border-gray-300 text-sm" />
                      </div>
                      <button type="button" onClick={() => { const updated = formData.recommendedProducts.filter((_, i) => i !== idx); setFormData({ ...formData, recommendedProducts: updated }); }} className="mt-1 text-xs text-red-600 hover:text-red-800">Remover</button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Servicos Recomendados</label>
                    <button type="button" onClick={addRecommendedService} className="text-sm text-purple-600 hover:text-purple-800">+ Adicionar Servico</button>
                  </div>
                  {formData.recommendedServices.map((rec, idx) => (
                    <div key={idx} className="mt-2 p-3 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-3 gap-2">
                        <select value={rec.serviceId} onChange={(e) => { const updated = [...formData.recommendedServices]; updated[idx].serviceId = parseInt(e.target.value); setFormData({ ...formData, recommendedServices: updated }); }} className="rounded-md border-gray-300 text-sm">
                          <option value={0}>Selecione...</option>
                          {services.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </select>
                        <input type="number" placeholder="Desconto %" value={rec.discount} onChange={(e) => { const updated = [...formData.recommendedServices]; updated[idx].discount = parseFloat(e.target.value) || 0; setFormData({ ...formData, recommendedServices: updated }); }} className="rounded-md border-gray-300 text-sm" />
                        <input type="text" placeholder="Motivo" value={rec.reason} onChange={(e) => { const updated = [...formData.recommendedServices]; updated[idx].reason = e.target.value; setFormData({ ...formData, recommendedServices: updated }); }} className="rounded-md border-gray-300 text-sm" />
                      </div>
                      <button type="button" onClick={() => { const updated = formData.recommendedServices.filter((_, i) => i !== idx); setFormData({ ...formData, recommendedServices: updated }); }} className="mt-1 text-xs text-red-600 hover:text-red-800">Remover</button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mensagem de Exibicao</label>
                  <textarea value={formData.displayMessage} onChange={(e) => setFormData({ ...formData, displayMessage: e.target.value })} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" placeholder="Ex: Que tal adicionar este tratamento especial?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Desconto Global (%)</label>
                    <input type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                    <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" min="1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valido De</label>
                    <input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valido Ate</label>
                    <input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max. Usos Total</label>
                    <input type="number" value={formData.maxUsesTotal} onChange={(e) => setFormData({ ...formData, maxUsesTotal: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max. por Cliente</label>
                    <input type="number" value={formData.maxUsesPerClient} onChange={(e) => setFormData({ ...formData, maxUsesPerClient: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" min="1" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700">{editingRule ? 'Salvar' : 'Criar Regra'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
