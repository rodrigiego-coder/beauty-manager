import { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Check,
  X,
  Search,
} from 'lucide-react';
import api from '../services/api';
import {
  RecommendationRule,
  RuleConditions,
  RecommendedProduct,
  HairTypeLabels,
  ScalpTypeLabels,
  HairConcernsLabels,
} from '../types';

interface Product {
  id: number;
  name: string;
  salePrice: string;
  currentStock: number;
}

export function RecommendationRulesPage() {
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [rulePriority, setRulePriority] = useState(0);
  const [ruleActive, setRuleActive] = useState(true);
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND');
  const [selectedHairTypes, setSelectedHairTypes] = useState<string[]>([]);
  const [selectedThickness, setSelectedThickness] = useState<string[]>([]);
  const [selectedLength, setSelectedLength] = useState<string[]>([]);
  const [selectedPorosity, setSelectedPorosity] = useState<string[]>([]);
  const [selectedScalpTypes, setSelectedScalpTypes] = useState<string[]>([]);
  const [selectedChemicalHistory, setSelectedChemicalHistory] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);

  // Product search
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    loadRules();
    loadProducts();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations/rules');
      setRules(response.data);
    } catch (err) {
      console.error('Erro ao carregar regras:', err);
      setError('Não foi possível carregar as regras');
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

  const openNewRuleModal = () => {
    setEditingRule(null);
    resetForm();
    setShowModal(true);
  };

  const openEditRuleModal = (rule: RecommendationRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description || '');
    setRulePriority(rule.priority);
    setRuleActive(rule.isActive);
    setConditionLogic(rule.conditions.logic || 'AND');
    setSelectedHairTypes(rule.conditions.hairTypes || []);
    setSelectedThickness(rule.conditions.hairThickness || []);
    setSelectedLength(rule.conditions.hairLength || []);
    setSelectedPorosity(rule.conditions.hairPorosity || []);
    setSelectedScalpTypes(rule.conditions.scalpTypes || []);
    setSelectedChemicalHistory(rule.conditions.chemicalHistory || []);
    setSelectedConcerns(rule.conditions.mainConcerns || []);
    setRecommendedProducts(rule.recommendedProducts || []);
    setShowModal(true);
  };

  const resetForm = () => {
    setRuleName('');
    setRuleDescription('');
    setRulePriority(0);
    setRuleActive(true);
    setConditionLogic('AND');
    setSelectedHairTypes([]);
    setSelectedThickness([]);
    setSelectedLength([]);
    setSelectedPorosity([]);
    setSelectedScalpTypes([]);
    setSelectedChemicalHistory([]);
    setSelectedConcerns([]);
    setRecommendedProducts([]);
    setProductSearch('');
    setShowProductSearch(false);
  };

  const handleSave = async () => {
    if (!ruleName.trim()) {
      alert('Informe o nome da regra');
      return;
    }

    if (recommendedProducts.length === 0) {
      alert('Adicione pelo menos um produto recomendado');
      return;
    }

    const conditions: RuleConditions = {
      hairTypes: selectedHairTypes.length > 0 ? selectedHairTypes : undefined,
      hairThickness: selectedThickness.length > 0 ? selectedThickness : undefined,
      hairLength: selectedLength.length > 0 ? selectedLength : undefined,
      hairPorosity: selectedPorosity.length > 0 ? selectedPorosity : undefined,
      scalpTypes: selectedScalpTypes.length > 0 ? selectedScalpTypes : undefined,
      chemicalHistory: selectedChemicalHistory.length > 0 ? selectedChemicalHistory : undefined,
      mainConcerns: selectedConcerns.length > 0 ? selectedConcerns : undefined,
      logic: conditionLogic,
    };

    const payload = {
      name: ruleName,
      description: ruleDescription || undefined,
      priority: rulePriority,
      isActive: ruleActive,
      conditions,
      recommendedProducts,
    };

    try {
      setSaving(true);
      if (editingRule) {
        await api.put(`/recommendations/rules/${editingRule.id}`, payload);
      } else {
        await api.post('/recommendations/rules', payload);
      }
      setShowModal(false);
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar regra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Deseja realmente excluir esta regra?')) return;

    try {
      await api.delete(`/recommendations/rules/${ruleId}`);
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir regra');
    }
  };

  const toggleArrayValue = (
    array: string[],
    setArray: (arr: string[]) => void,
    value: string
  ) => {
    if (array.includes(value)) {
      setArray(array.filter(v => v !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const addProduct = (product: Product) => {
    if (recommendedProducts.find(p => p.productId === product.id)) {
      return;
    }
    setRecommendedProducts([
      ...recommendedProducts,
      {
        productId: product.id,
        priority: recommendedProducts.length + 1,
        reason: '',
      },
    ]);
    setProductSearch('');
    setShowProductSearch(false);
  };

  const removeProduct = (productId: number) => {
    setRecommendedProducts(recommendedProducts.filter(p => p.productId !== productId));
  };

  const updateProductReason = (productId: number, reason: string) => {
    setRecommendedProducts(
      recommendedProducts.map(p =>
        p.productId === productId ? { ...p, reason } : p
      )
    );
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price));
  };

  const getConditionSummary = (conditions: RuleConditions): string => {
    const parts: string[] = [];
    if (conditions.hairTypes?.length) {
      parts.push(`${conditions.hairTypes.length} tipo(s) de cabelo`);
    }
    if (conditions.mainConcerns?.length) {
      parts.push(`${conditions.mainConcerns.length} necessidade(s)`);
    }
    if (conditions.scalpTypes?.length) {
      parts.push(`${conditions.scalpTypes.length} tipo(s) de couro`);
    }
    if (conditions.chemicalHistory?.length) {
      parts.push(`${conditions.chemicalHistory.length} histórico(s) químico(s)`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Sem condições';
  };

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
      !recommendedProducts.find(rp => rp.productId === p.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Carregando regras...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regras de Recomendação</h1>
          <p className="text-gray-600">Configure quais produtos recomendar para cada perfil capilar</p>
        </div>
        <button
          onClick={openNewRuleModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Nova Regra
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma regra criada</h3>
          <p className="text-gray-500 mb-4">
            Crie regras para recomendar produtos automaticamente baseado no perfil capilar dos clientes.
          </p>
          <button
            onClick={openNewRuleModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Criar Primeira Regra
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        rule.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rule.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      Prioridade: {rule.priority}
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-gray-600 mt-1">{rule.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Condições:</span>{' '}
                    {getConditionSummary(rule.conditions)}
                    {rule.conditions.logic && (
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {rule.conditions.logic}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Produtos:</span>{' '}
                    {rule.recommendedProducts.length} produto(s) recomendado(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditRuleModal(rule)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRule ? 'Editar Regra' : 'Nova Regra'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Regra *
                  </label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={e => setRuleName(e.target.value)}
                    placeholder="Ex: Cabelos Cacheados com Frizz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={ruleDescription}
                    onChange={e => setRuleDescription(e.target.value)}
                    rows={2}
                    placeholder="Descrição opcional da regra..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <input
                    type="number"
                    value={rulePriority}
                    onChange={e => setRulePriority(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maior = mais prioridade
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setRuleActive(!ruleActive)}
                    className={`w-full px-3 py-2 rounded-lg border flex items-center justify-center gap-2 ${
                      ruleActive
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`}
                  >
                    {ruleActive ? (
                      <>
                        <Check className="w-4 h-4" />
                        Ativa
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Inativa
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Condições</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Lógica:</span>
                    <button
                      type="button"
                      onClick={() => setConditionLogic(conditionLogic === 'AND' ? 'OR' : 'AND')}
                      className={`px-3 py-1 text-sm font-medium rounded-lg ${
                        conditionLogic === 'AND'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {conditionLogic === 'AND' ? 'E (todas)' : 'OU (qualquer)'}
                    </button>
                  </div>
                </div>

                {/* Hair Types */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Tipo de Cabelo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(HairTypeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          toggleArrayValue(selectedHairTypes, setSelectedHairTypes, value)
                        }
                        className={`px-3 py-1 text-sm rounded-lg border ${
                          selectedHairTypes.includes(value)
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Concerns */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Necessidades/Problemas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(HairConcernsLabels).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          toggleArrayValue(selectedConcerns, setSelectedConcerns, value)
                        }
                        className={`px-3 py-1 text-sm rounded-lg border ${
                          selectedConcerns.includes(value)
                            ? 'bg-orange-100 border-orange-300 text-orange-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scalp Types */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Tipo de Couro Cabeludo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ScalpTypeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          toggleArrayValue(selectedScalpTypes, setSelectedScalpTypes, value)
                        }
                        className={`px-3 py-1 text-sm rounded-lg border ${
                          selectedScalpTypes.includes(value)
                            ? 'bg-green-100 border-green-300 text-green-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Produtos Recomendados *
                </h3>

                {/* Added Products */}
                {recommendedProducts.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {recommendedProducts.map((recProd) => {
                      const product = products.find(p => p.id === recProd.productId);
                      if (!product) return null;
                      return (
                        <div
                          key={recProd.productId}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <input
                              type="text"
                              value={recProd.reason}
                              onChange={e =>
                                updateProductReason(recProd.productId, e.target.value)
                              }
                              placeholder="Motivo da recomendação..."
                              className="w-full mt-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <span className="text-purple-600 font-medium">
                            {formatPrice(product.salePrice)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProduct(recProd.productId)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Product Search */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={e => {
                          setProductSearch(e.target.value);
                          setShowProductSearch(true);
                        }}
                        onFocus={() => setShowProductSearch(true)}
                        placeholder="Buscar produto para adicionar..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {showProductSearch && productSearch.length >= 1 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <p className="p-3 text-sm text-gray-500">Nenhum produto encontrado</p>
                      ) : (
                        filteredProducts.slice(0, 10).map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="w-full p-3 text-left hover:bg-purple-50 flex justify-between items-center"
                          >
                            <span className="text-gray-900">{product.name}</span>
                            <span className="text-purple-600 font-medium">
                              {formatPrice(product.salePrice)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
