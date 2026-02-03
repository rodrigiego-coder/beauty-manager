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
  Store,
  Scissors,
  ArrowLeftRight,
  CheckSquare,
  Square,
  Power,
  PowerOff,
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
  isLowStockRetail,
  isLowStockInternal,
  StockLocation,
} from '../types/product';

export function ProductsPage() {
  // Estado dos produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab ativa (retail = Loja/Venda, internal = Consumo/Salão)
  const [activeTab, setActiveTab] = useState<StockLocation>('retail');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Seleção em massa
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

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
    stockRetail: 0,
    stockInternal: 0,
    minStockRetail: 0,
    minStockInternal: 0,
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

  // Modal de transferência entre localizações
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFormData, setTransferFormData] = useState({
    quantity: 1,
    fromLocation: 'RETAIL' as 'RETAIL' | 'INTERNAL',
    toLocation: 'INTERNAL' as 'RETAIL' | 'INTERNAL',
    reason: '',
  });
  const [transferFormErrors, setTransferFormErrors] = useState<Record<string, string>>({});

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
    // Filter by search term
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by active tab
    const matchesTab = activeTab === 'retail' ? product.isRetail : product.isBackbar;

    return matchesSearch && matchesTab;
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

    if (adjustFormData.type === 'OUT' && selectedProduct) {
      const currentStock = activeTab === 'retail' ? selectedProduct.stockRetail : selectedProduct.stockInternal;
      if (adjustFormData.quantity > currentStock) {
        errors.quantity = `Quantidade maior que o estoque disponivel (${currentStock})`;
      }
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
      stockRetail: 0,
      stockInternal: 0,
      minStockRetail: 0,
      minStockInternal: 0,
      unit: 'UN',
      isRetail: activeTab === 'retail',
      isBackbar: activeTab === 'internal',
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
      stockRetail: product.stockRetail,
      stockInternal: product.stockInternal,
      minStockRetail: product.minStockRetail,
      minStockInternal: product.minStockInternal,
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
      if (formData.stockRetail !== selectedProduct.stockRetail) {
        updateData.stockRetail = formData.stockRetail;
      }
      if (formData.stockInternal !== selectedProduct.stockInternal) {
        updateData.stockInternal = formData.stockInternal;
      }
      if (formData.minStockRetail !== selectedProduct.minStockRetail) {
        updateData.minStockRetail = formData.minStockRetail;
      }
      if (formData.minStockInternal !== selectedProduct.minStockInternal) {
        updateData.minStockInternal = formData.minStockInternal;
      }
      if (formData.unit !== selectedProduct.unit) {
        updateData.unit = formData.unit;
      }
      if (formData.isRetail !== selectedProduct.isRetail) {
        updateData.isRetail = formData.isRetail;
      }
      if (formData.isBackbar !== selectedProduct.isBackbar) {
        updateData.isBackbar = formData.isBackbar;
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

  // Validar formulário de transferência
  const validateTransferForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (transferFormData.quantity < 1) {
      errors.quantity = 'Quantidade deve ser pelo menos 1';
    }

    if (transferFormData.fromLocation === transferFormData.toLocation) {
      errors.direction = 'Origem e destino devem ser diferentes';
    }

    // Verificar estoque disponível na origem
    if (selectedProduct) {
      const sourceStock = transferFormData.fromLocation === 'RETAIL'
        ? selectedProduct.stockRetail
        : selectedProduct.stockInternal;
      if (transferFormData.quantity > sourceStock) {
        errors.quantity = `Estoque insuficiente. Disponível: ${sourceStock}`;
      }
    }

    setTransferFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Executar transferência
  const handleTransfer = async () => {
    if (!validateTransferForm() || !selectedProduct) return;

    try {
      setSubmitting(true);
      await api.post(`/products/${selectedProduct.id}/transfer`, transferFormData);
      setShowTransferModal(false);
      setSelectedProduct(null);
      setTransferFormData({
        quantity: 1,
        fromLocation: 'RETAIL',
        toLocation: 'INTERNAL',
        reason: '',
      });
      loadProducts();
      loadStats();
    } catch (err: any) {
      console.error('Erro ao transferir estoque:', err);
      const message = err.response?.data?.message || 'Erro ao transferir estoque';
      setTransferFormErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir modal de transferência
  const openTransferModal = (product: Product) => {
    setSelectedProduct(product);
    // Definir direção baseada na tab ativa
    const from = activeTab === 'retail' ? 'RETAIL' : 'INTERNAL';
    const to = activeTab === 'retail' ? 'INTERNAL' : 'RETAIL';
    setTransferFormData({
      quantity: 1,
      fromLocation: from,
      toLocation: to,
      reason: '',
    });
    setTransferFormErrors({});
    setShowTransferModal(true);
  };

  const getNewStockPreview = (): number => {
    if (!selectedProduct) return 0;
    const currentStock = activeTab === 'retail' ? selectedProduct.stockRetail : selectedProduct.stockInternal;
    if (adjustFormData.type === 'IN') {
      return currentStock + adjustFormData.quantity;
    }
    return Math.max(0, currentStock - adjustFormData.quantity);
  };

  // Helper to get current stock based on active tab
  const getCurrentStock = (product: Product): number => {
    return activeTab === 'retail' ? product.stockRetail : product.stockInternal;
  };

  const getMinStock = (product: Product): number => {
    return activeTab === 'retail' ? product.minStockRetail : product.minStockInternal;
  };

  const isProductLowStock = (product: Product): boolean => {
    return activeTab === 'retail' ? isLowStockRetail(product) : isLowStockInternal(product);
  };

  // Funções de seleção em massa
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleBulkStatus = async (active: boolean) => {
    if (selectedIds.length === 0) return;

    try {
      setBulkLoading(true);
      await api.patch('/products/bulk-status', { ids: selectedIds, active });
      setSelectedIds([]);
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Erro ao atualizar status em massa:', err);
    } finally {
      setBulkLoading(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estoque Loja</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.retailStockValue || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Scissors className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estoque Salão</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.internalStockValue || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Loja/Venda vs Consumo/Salão */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('retail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'retail'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Store className="w-4 h-4" />
          Loja / Venda
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'internal'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Scissors className="w-4 h-4" />
          Consumo / Salão
        </button>
      </div>

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

      {/* Barra de Ações em Massa */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-primary-600" />
            <span className="text-primary-700 font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? 'produto selecionado' : 'produtos selecionados'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              Ativar
            </button>
            <button
              onClick={() => handleBulkStatus(false)}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <PowerOff className="w-4 h-4" />
              Desativar
            </button>
            <button
              onClick={() => setSelectedIds([])}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title={selectedIds.length === filteredProducts.length ? 'Desmarcar todos' : 'Selecionar todos'}
                    >
                      {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
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
                  const lowStock = isProductLowStock(product);
                  const margin = calculateMargin(parseFloat(product.costPrice), parseFloat(product.salePrice));
                  const stock = getCurrentStock(product);
                  const minStock = getMinStock(product);

                  return (
                    <tr key={product.id} className={!product.active ? 'bg-gray-50' : ''}>
                      <td className="w-12 px-4 py-4">
                        <button
                          onClick={() => toggleSelect(product.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {selectedIds.includes(product.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {product.name}
                            {product.isRetail && product.isBackbar && (
                              <span className="ml-2 text-xs text-gray-400">(Ambos)</span>
                            )}
                          </div>
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
                            {stock} {getUnitAbbreviation(product.unit)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {minStock} {getUnitAbbreviation(product.unit)}
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
                                onClick={() => openTransferModal(product)}
                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Transferir entre Loja/Salão"
                              >
                                <ArrowLeftRight className="w-4 h-4" />
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
                    <span className="text-sm text-gray-700">Disponível para venda (Loja)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBackbar}
                      onChange={(e) => setFormData({ ...formData, isBackbar: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Usado em serviços (Salão)</span>
                  </label>
                </div>
              </div>

              {/* Estoque Loja (Retail) */}
              {formData.isRetail && (
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <p className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Estoque Loja (Venda)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Atual
                      </label>
                      <input
                        type="number"
                        value={formData.stockRetail}
                        onChange={(e) => setFormData({ ...formData, stockRetail: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        value={formData.minStockRetail}
                        onChange={(e) => setFormData({ ...formData, minStockRetail: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Estoque Salão (Internal) */}
              {formData.isBackbar && (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <p className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Estoque Salão (Consumo)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Atual
                      </label>
                      <input
                        type="number"
                        value={formData.stockInternal}
                        onChange={(e) => setFormData({ ...formData, stockInternal: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        value={formData.minStockInternal}
                        onChange={(e) => setFormData({ ...formData, minStockInternal: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                    <span className="text-sm text-gray-700">Disponível para venda (Loja)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBackbar}
                      onChange={(e) => setFormData({ ...formData, isBackbar: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Usado em serviços (Salão)</span>
                  </label>
                </div>
              </div>

              {/* Estoque Loja (Retail) */}
              {formData.isRetail && (
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <p className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Estoque Loja (Venda)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Atual
                      </label>
                      <input
                        type="number"
                        value={formData.stockRetail}
                        onChange={(e) => setFormData({ ...formData, stockRetail: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        value={formData.minStockRetail}
                        onChange={(e) => setFormData({ ...formData, minStockRetail: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Estoque Salão (Internal) */}
              {formData.isBackbar && (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <p className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Estoque Salão (Consumo)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Atual
                      </label>
                      <input
                        type="number"
                        value={formData.stockInternal}
                        onChange={(e) => setFormData({ ...formData, stockInternal: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        value={formData.minStockInternal}
                        onChange={(e) => setFormData({ ...formData, minStockInternal: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

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
              <div className={`rounded-lg p-4 ${activeTab === 'retail' ? 'bg-purple-50' : 'bg-green-50'}`}>
                <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">
                  {activeTab === 'retail' ? (
                    <>
                      <Store className="w-4 h-4 inline mr-1" />
                      Estoque Loja: <span className="font-medium text-gray-900">{selectedProduct.stockRetail} {getUnitAbbreviation(selectedProduct.unit)}</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 inline mr-1" />
                      Estoque Salão: <span className="font-medium text-gray-900">{selectedProduct.stockInternal} {getUnitAbbreviation(selectedProduct.unit)}</span>
                    </>
                  )}
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
              <div className="text-sm text-gray-500 mb-2 space-y-1">
                {selectedProduct.isRetail && (
                  <p>Estoque Loja: <span className="font-medium">{selectedProduct.stockRetail} {getUnitAbbreviation(selectedProduct.unit)}</span></p>
                )}
                {selectedProduct.isBackbar && (
                  <p>Estoque Salão: <span className="font-medium">{selectedProduct.stockInternal} {getUnitAbbreviation(selectedProduct.unit)}</span></p>
                )}
              </div>
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

      {/* Modal Transferir Estoque */}
      {showTransferModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Transferir Estoque</h2>
                  <p className="text-sm text-gray-500">{selectedProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Estoque atual */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Estoque Loja</p>
                  <p className={`text-2xl font-bold ${transferFormData.fromLocation === 'RETAIL' ? 'text-purple-600' : 'text-gray-900'}`}>
                    {selectedProduct.stockRetail}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Estoque Salão</p>
                  <p className={`text-2xl font-bold ${transferFormData.fromLocation === 'INTERNAL' ? 'text-purple-600' : 'text-gray-900'}`}>
                    {selectedProduct.stockInternal}
                  </p>
                </div>
              </div>

              {/* Direção da transferência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direção da Transferência
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferFormData({
                      ...transferFormData,
                      fromLocation: 'RETAIL',
                      toLocation: 'INTERNAL',
                    })}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      transferFormData.fromLocation === 'RETAIL'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Store className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Loja → Salão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferFormData({
                      ...transferFormData,
                      fromLocation: 'INTERNAL',
                      toLocation: 'RETAIL',
                    })}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      transferFormData.fromLocation === 'INTERNAL'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Scissors className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Salão → Loja</span>
                  </button>
                </div>
                {transferFormErrors.direction && (
                  <p className="mt-1 text-sm text-red-600">{transferFormErrors.direction}</p>
                )}
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade a Transferir
                </label>
                <input
                  type="number"
                  min="1"
                  value={transferFormData.quantity}
                  onChange={(e) => setTransferFormData({
                    ...transferFormData,
                    quantity: parseInt(e.target.value) || 0,
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    transferFormErrors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {transferFormErrors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{transferFormErrors.quantity}</p>
                )}
              </div>

              {/* Motivo (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={transferFormData.reason}
                  onChange={(e) => setTransferFormData({
                    ...transferFormData,
                    reason: e.target.value,
                  })}
                  placeholder="Ex: Reposição para o salão"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Preview do resultado */}
              {transferFormData.quantity > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-700 mb-2">Resultado após transferência:</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Loja:</span>{' '}
                      <span className="font-medium">
                        {transferFormData.fromLocation === 'RETAIL'
                          ? selectedProduct.stockRetail - transferFormData.quantity
                          : selectedProduct.stockRetail + transferFormData.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Salão:</span>{' '}
                      <span className="font-medium">
                        {transferFormData.fromLocation === 'INTERNAL'
                          ? selectedProduct.stockInternal - transferFormData.quantity
                          : selectedProduct.stockInternal + transferFormData.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Erro de submissão */}
              {transferFormErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{transferFormErrors.submit}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={submitting || transferFormData.quantity < 1}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Transferindo...' : 'Confirmar Transferência'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
