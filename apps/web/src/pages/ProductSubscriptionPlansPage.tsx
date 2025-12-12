import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2,
  AlertTriangle,
  Search,
  X,
  Gift,
  Check,
} from 'lucide-react';
import api from '../services/api';

interface Product {
  id: number;
  name: string;
  salePrice: string;
}

interface PlanItem {
  id: string;
  productId: number;
  quantity: string;
  product?: Product;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  billingPeriod: string;
  originalPrice: string;
  discountPercent: string | null;
  finalPrice: string;
  isActive: boolean | null;
  maxSubscribers: number | null;
  currentSubscribers: number | null;
  imageUrl: string | null;
  benefits: string[] | null;
  items?: PlanItem[];
}

const billingPeriodLabels: Record<string, string> = {
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
};

export function ProductSubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    billingPeriod: 'MONTHLY',
    discountPercent: 0,
    imageUrl: '',
    maxSubscribers: '',
    benefits: [''],
    items: [] as { productId: number; quantity: number; product?: Product }[],
  });

  // Product search
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    loadPlans();
    loadProducts();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/product-subscriptions/plans');
      setPlans(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;
    for (const item of formData.items) {
      if (item.product) {
        total += parseFloat(item.product.salePrice) * item.quantity;
      }
    }
    return total;
  };

  const calculateFinalPrice = () => {
    const total = calculateTotalPrice();
    return total * (1 - formData.discountPercent / 100);
  };

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      billingPeriod: 'MONTHLY',
      discountPercent: 0,
      imageUrl: '',
      maxSubscribers: '',
      benefits: [''],
      items: [],
    });
    setShowPlanModal(true);
  };

  const handleOpenEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      billingPeriod: plan.billingPeriod,
      discountPercent: parseFloat(plan.discountPercent || '0'),
      imageUrl: plan.imageUrl || '',
      maxSubscribers: plan.maxSubscribers?.toString() || '',
      benefits: plan.benefits?.length ? plan.benefits : [''],
      items: plan.items?.map(item => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity),
        product: item.product,
      })) || [],
    });
    setShowPlanModal(true);
  };

  const handleAddProduct = (product: Product) => {
    if (formData.items.find(i => i.productId === product.id)) {
      return;
    }
    setFormData({
      ...formData,
      items: [...formData.items, { productId: product.id, quantity: 1, product }],
    });
    setProductSearch('');
    setShowProductSearch(false);
  };

  const handleRemoveProduct = (productId: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(i => i.productId !== productId),
    });
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setFormData({
      ...formData,
      items: formData.items.map(i =>
        i.productId === productId ? { ...i, quantity: Math.max(0.1, quantity) } : i
      ),
    });
  };

  const handleAddBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleUpdateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleSavePlan = async () => {
    if (!formData.name.trim()) {
      alert('Digite o nome do plano');
      return;
    }
    if (formData.items.length === 0) {
      alert('Adicione pelo menos um produto ao plano');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        billingPeriod: formData.billingPeriod,
        discountPercent: formData.discountPercent,
        imageUrl: formData.imageUrl || undefined,
        maxSubscribers: formData.maxSubscribers ? parseInt(formData.maxSubscribers) : undefined,
        benefits: formData.benefits.filter(b => b.trim()),
        items: formData.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      };

      if (editingPlan) {
        await api.patch(`/product-subscriptions/plans/${editingPlan.id}`, payload);
      } else {
        await api.post('/product-subscriptions/plans', payload);
      }

      setShowPlanModal(false);
      loadPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm(`Deseja ${(plan.currentSubscribers || 0) > 0 ? 'desativar' : 'excluir'} o plano "${plan.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/product-subscriptions/plans/${plan.id}`);
      loadPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir plano');
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      await api.patch(`/product-subscriptions/plans/${plan.id}`, {
        isActive: !plan.isActive,
      });
      loadPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar plano');
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num || 0);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

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
        <button onClick={loadPlans} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg">
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
          <h1 className="text-2xl font-bold text-gray-900">Planos de Assinatura de Produtos</h1>
          <p className="text-gray-500 mt-1">Crie kits recorrentes para seus clientes</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Novo Plano
        </button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano cadastrado</h3>
          <p className="text-gray-500 mb-4">Crie seu primeiro plano de assinatura de produtos</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Criar Plano
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border ${plan.isActive ? 'border-gray-200' : 'border-gray-300 opacity-60'} overflow-hidden`}
            >
              {/* Image */}
              {plan.imageUrl ? (
                <img src={plan.imageUrl} alt={plan.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Package className="w-16 h-16 text-primary-400" />
                </div>
              )}

              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <span className="text-sm text-gray-500">{billingPeriodLabels[plan.billingPeriod]}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Products */}
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Produtos inclusos:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {plan.items?.slice(0, 3).map(item => (
                      <li key={item.id} className="truncate">
                        {item.quantity}x {item.product?.name}
                      </li>
                    ))}
                    {(plan.items?.length || 0) > 3 && (
                      <li className="text-gray-400">+{(plan.items?.length || 0) - 3} mais...</li>
                    )}
                  </ul>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  {parseFloat(plan.discountPercent || '0') > 0 && (
                    <span className="text-sm text-gray-400 line-through">{formatCurrency(plan.originalPrice)}</span>
                  )}
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(plan.finalPrice)}</span>
                  {parseFloat(plan.discountPercent || '0') > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      -{plan.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Subscribers */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{plan.currentSubscribers || 0} assinantes</span>
                  {plan.maxSubscribers && (
                    <span className="text-gray-400">/ {plan.maxSubscribers} max</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg ${plan.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                  >
                    {plan.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingPlan ? 'Editar Plano' : 'Novo Plano de Assinatura'}
              </h2>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Kit Hidratacao Mensal"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={2}
                    placeholder="Descricao do plano..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                  <select
                    value={formData.billingPeriod}
                    onChange={e => setFormData({ ...formData, billingPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="MONTHLY">Mensal</option>
                    <option value="BIMONTHLY">Bimestral</option>
                    <option value="QUARTERLY">Trimestral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto %</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={e => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Assinantes</label>
                  <input
                    type="number"
                    value={formData.maxSubscribers}
                    onChange={e => setFormData({ ...formData, maxSubscribers: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ilimitado"
                    min="1"
                  />
                </div>
              </div>

              {/* Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produtos do Kit</label>
                <div className="space-y-2">
                  {formData.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.product?.salePrice || '0')} cada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Qtd:</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleUpdateQuantity(item.productId, parseFloat(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(item.productId)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Product Search */}
                <div className="mt-3 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => {
                        setProductSearch(e.target.value);
                        setShowProductSearch(true);
                      }}
                      onFocus={() => setShowProductSearch(true)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Buscar produto para adicionar..."
                    />
                  </div>
                  {showProductSearch && productSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-gray-500 text-center">Nenhum produto encontrado</div>
                      ) : (
                        filteredProducts.slice(0, 10).map(product => (
                          <button
                            key={product.id}
                            onClick={() => handleAddProduct(product)}
                            disabled={formData.items.some(i => i.productId === product.id)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>{product.name}</span>
                            <span className="text-sm text-gray-500">{formatCurrency(product.salePrice)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Total Price */}
                {formData.items.length > 0 && (
                  <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Preco Original:</span>
                      <span className="text-gray-900">{formatCurrency(calculateTotalPrice())}</span>
                    </div>
                    {formData.discountPercent > 0 && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Desconto ({formData.discountPercent}%):</span>
                        <span className="text-green-600">-{formatCurrency(calculateTotalPrice() - calculateFinalPrice())}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-semibold mt-2 pt-2 border-t border-primary-200">
                      <span className="text-gray-900">Preco Final:</span>
                      <span className="text-primary-600">{formatCurrency(calculateFinalPrice())}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beneficios</label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={benefit}
                        onChange={e => handleUpdateBenefit(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Ex: Frete gratis"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          onClick={() => handleRemoveBenefit(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddBenefit}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar beneficio
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingPlan ? 'Salvar' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSubscriptionPlansPage;
