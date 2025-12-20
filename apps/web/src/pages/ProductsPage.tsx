import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  ArrowUpDown,
  TrendingUp,
  BoxesIcon,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import {
  Product,
  ProductUnit,
  ProductStats,
  CreateProductData,
  UpdateProductData,
  AdjustStockData,
  PRODUCT_UNITS,
  getUnitAbbreviation,
  calculateMargin,
  isLowStock,
} from '../types/product';

export function ProductsPage() {
  // Estado dos produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form de criar/editar
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    costPrice: 0,
    salePrice: 0,
    currentStock: 0,
    minStock: 0,
    unit: 'UN',
    isRetail: true,
    isBackbar: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Form de ajustar estoque
  const [adjustFormData, setAdjustFormData] = useState<AdjustStockData>({
    quantity: 1,
    type: 'IN',
    reason: '',
  });
  const [adjustFormErrors, setAdjustFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [showInactive, showLowStockOnly]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showInactive) {
        params.append('includeInactive', 'true');
      }
      if (showLowStockOnly) {
        params.append('lowStockOnly', 'true');
      }
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/products/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatisticas:', err);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (formData.costPrice === undefined || formData.costPrice < 0) {
      errors.costPrice = 'Preco de custo deve ser maior ou igual a zero';
    }

    if (formData.salePrice === undefined || formData.salePrice < 0) {
      errors.salePrice = 'Preco de venda deve ser maior ou igual a zero';
    }

    if (formData.salePrice < formData.costPrice) {
      errors.salePrice = 'Preco de venda nao pode ser menor que preco de custo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdjustForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!adjustFormData.quantity || adjustFormData.quantity < 1) {
      errors.quantity = 'Quantidade deve ser pelo menos 1';
    }

    if (!adjustFormData.reason || adjustFormData.reason.trim().length < 3) {
      errors.reason = 'Motivo deve ter pelo menos 3 caracteres';
    }

    if (
      adjustFormData.type === 'OUT' &&
      selectedProduct &&
      adjustFormData.quantity > selectedProduct.currentStock
    ) {
      errors.quantity = `Quantidade maior que o estoque disponivel (${selectedProduct.currentStock})`;
    }

    setAdjustFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      costPrice: 0,
      salePrice: 0,
      currentStock: 0,
      minStock: 0,
      unit: 'UN',
      isRetail: true,
      isBackbar: false,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      costPrice: parseFloat(product.costPrice),
      salePrice: parseFloat(product.salePrice),
      currentStock: product.currentStock,
      minStock: product.minStock,
      unit: product.unit,
      isRetail: product.isRetail,
      isBackbar: product.isBackbar,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleOpenAdjustStockModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustFormData({
      quantity: 1,
      type: 'IN',
      reason: '',
    });
    setAdjustFormErrors({});
    setShowAdjustStockModal(true);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await api.post('/products', formData);
      setShowCreateModal(false);
      loadProducts();
      loadStats();
    } catch (err: any) {
      console.error('Erro ao criar produto:', err);
      const message = err.response?.data?.message || 'Erro ao criar produto';
      setFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !selectedProduct) return;

    try {
      setSubmitting(true);
      const updateData: UpdateProductData = {};

      if (formData.name !== selectedProduct.name) {
        updateData.name = formData.name;
      }
      if (formData.description !== (selectedProduct.description || '')) {
        updateData.description = formData.description;
      }
      if (formData.costPrice !== parseFloat(selectedProduct.costPrice)) {
        updateData.costPrice = formData.costPrice;
      }
      if (formData.salePrice !== parseFloat(selectedProduct.salePrice)) {
        updateData.salePrice = formData.salePrice;
      }
      if (formData.currentStock !== selectedProduct.currentStock) {
        updateData.currentStock = formData.currentStock;
      }
      if (formData.minStock !== selectedProduct.minStock) {
        updateData.minStock = formData.minStock;
      }
      if (formData.unit !== selectedProduct.unit) {
        updateData.unit = formData.unit;
      }

      await api.patch(`/products/${selectedProduct.id}`, updateData);
      setShowEditModal(false);
      setSelectedProduct(null);
      loadProducts();
      loadStats();
    } catch (err: any) {
      console.error('Erro ao atualizar produto:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar produto';
      setFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      await api.delete(`/products/${selectedProduct.id}`);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadProducts();
      loadStats();
    } catch (err: any) {
      console.error('Erro ao desativar produto:', err);
      alert(err.response?.data?.message || 'Erro ao desativar produto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async (product: Product) => {
    try {
      await api.patch(`/products/${product.id}/reactivate`);
      loadProducts();
      loadStats();
    } catch (err: any) {
      console.error('Erro ao reativar produto:', err);
      alert(err.response?.data?.message || 'Erro ao reativar produto');
    }
  };

  const handleAdjustStock = async () => {
    if (!validateAdjustForm() || !selectedProduct) return;

    try {
      setSubmitting(true);
      await api.post(`/products/${selectedProduct.id}/adjust-stock`, adjustFormData);
      setShowAdjustStockModal(false);
      setSelectedProduct(null);
      loadProducts();
      loadStats();
    } catch (err: any) {
      console.error('Erro ao ajustar estoque:', err);
      const message = err.response?.data?.message || 'Erro ao ajustar estoque';
      setAdjustFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const getNewStockPreview = (): number => {
    if (!selectedProduct) return 0;
    if (adjustFormData.type === 'IN') {
      return selectedProduct.currentStock + adjustFormData.quantity;
    }
    return Math.max(0, selectedProduct.currentStock - adjustFormData.quantity);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie o estoque do seu salao</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Cards de Resumo */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BoxesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estoque Baixo</p>
                <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.lowStockCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor em Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalStockValue)}</p>
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
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Mostrar inativos</span>
          </label>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
              showLowStockOnly
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Estoque Baixo
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-gray-500 mb-6">
            Cadastre seu primeiro produto para comecar
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Cadastrar primeiro produto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minimo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venda
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margem
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const lowStock = isLowStock(product);
                  const margin = calculateMargin(parseFloat(product.costPrice), parseFloat(product.salePrice));

                  return (
                    <tr key={product.id} className={!product.active ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${lowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {lowStock && <AlertTriangle className="w-4 h-4" />}
                          <span className="font-medium">
                            {product.currentStock} {getUnitAbbreviation(product.unit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.minStock} {getUnitAbbreviation(product.unit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(product.salePrice)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className={`w-4 h-4 ${margin >= 50 ? 'text-green-600' : margin >= 20 ? 'text-yellow-600' : 'text-red-600'}`} />
                          <span className={margin >= 50 ? 'text-green-600' : margin >= 20 ? 'text-yellow-600' : 'text-red-600'}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.active ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.active ? (
                            <>
                              <button
                                onClick={() => handleOpenAdjustStockModal(product)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ajustar Estoque"
                              >
                                <ArrowUpDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(product)}
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(product)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Desativar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReactivate(product)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Reativar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
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

      {/* Modal Criar Produto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Novo Produto</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Shampoo Profissional"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descricao
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                  placeholder="Descricao do produto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {PRODUCT_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label} ({unit.abbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preco de Custo (R$) *
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.costPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.costPrice && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.costPrice}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preco de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.salePrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.salePrice && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.salePrice}</p>
                  )}
                </div>
              </div>

              {/* Preview da margem */}
              {formData.costPrice > 0 && formData.salePrice > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Margem de Lucro:</span>
                    <span className={`font-medium ${
                      calculateMargin(formData.costPrice, formData.salePrice) >= 50 ? 'text-green-600' :
                      calculateMargin(formData.costPrice, formData.salePrice) >= 20 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {calculateMargin(formData.costPrice, formData.salePrice).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Minimo
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Flags Retail/Backbar */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Tipo de Produto</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRetail}
                      onChange={(e) => setFormData({ ...formData, isRetail: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Vendavel (Retail)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBackbar}
                      onChange={(e) => setFormData({ ...formData, isBackbar: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Uso no salao (Backbar)</span>
                  </label>
                </div>
              </div>

              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {formErrors.submit}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Produto */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Editar Produto</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descricao
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {PRODUCT_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label} ({unit.abbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preco de Custo (R$) *
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.costPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.costPrice && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.costPrice}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preco de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.salePrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.salePrice && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.salePrice}</p>
                  )}
                </div>
              </div>

              {/* Preview da margem */}
              {formData.costPrice > 0 && formData.salePrice > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Margem de Lucro:</span>
                    <span className={`font-medium ${
                      calculateMargin(formData.costPrice, formData.salePrice) >= 50 ? 'text-green-600' :
                      calculateMargin(formData.costPrice, formData.salePrice) >= 20 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {calculateMargin(formData.costPrice, formData.salePrice).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Minimo
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Flags Retail/Backbar */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Tipo de Produto</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRetail}
                      onChange={(e) => setFormData({ ...formData, isRetail: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Vendavel (Retail)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBackbar}
                      onChange={(e) => setFormData({ ...formData, isBackbar: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Uso no salao (Backbar)</span>
                  </label>
                </div>
              </div>

              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {formErrors.submit}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajustar Estoque */}
      {showAdjustStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Ajustar Estoque</h2>
              <button
                onClick={() => {
                  setShowAdjustStockModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Info do Produto */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">
                  Estoque atual: <span className="font-medium text-gray-900">{selectedProduct.currentStock} {getUnitAbbreviation(selectedProduct.unit)}</span>
                </p>
              </div>

              {/* Tipo de Ajuste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ajuste
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="adjustType"
                      checked={adjustFormData.type === 'IN'}
                      onChange={() => setAdjustFormData({ ...adjustFormData, type: 'IN' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Entrada</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="adjustType"
                      checked={adjustFormData.type === 'OUT'}
                      onChange={() => setAdjustFormData({ ...adjustFormData, type: 'OUT' })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Saida</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  value={adjustFormData.quantity}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, quantity: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    adjustFormErrors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                />
                {adjustFormErrors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{adjustFormErrors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={adjustFormData.reason}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, reason: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    adjustFormErrors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Compra fornecedor, Perda, Uso interno..."
                />
                {adjustFormErrors.reason && (
                  <p className="text-red-500 text-sm mt-1">{adjustFormErrors.reason}</p>
                )}
              </div>

              {/* Preview do novo estoque */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Novo estoque:</span>
                  <span className="font-bold text-blue-900">
                    {getNewStockPreview()} {getUnitAbbreviation(selectedProduct.unit)}
                  </span>
                </div>
              </div>

              {adjustFormErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {adjustFormErrors.submit}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAdjustStockModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Confirmando...' : 'Confirmar Ajuste'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusao */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Desativar produto?
              </h3>
              <p className="text-gray-600 mb-2">
                Tem certeza que deseja desativar o produto{' '}
                <span className="font-medium">{selectedProduct.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Estoque atual: <span className="font-medium">{selectedProduct.currentStock} {getUnitAbbreviation(selectedProduct.unit)}</span>
              </p>
              <p className="text-sm text-gray-500">
                O produto nao aparecera mais na lista de lancamento de comandas.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Desativando...' : 'Confirmar Desativacao'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
