import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Package, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
  ServiceRecipe,
  SaveRecipeDto,
  SaveRecipeLineDto,
  BackbarProduct,
  createDefaultVariants,
  calculateRecipeMargin,
  UNIT_LABELS,
} from '../types/recipe';
import {
  getServiceRecipe,
  saveServiceRecipe,
  getBackbarProducts,
} from '../services/api';

interface RecipeEditorProps {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  onSaved?: () => void;
}

export function RecipeEditor({
  serviceId,
  serviceName: _serviceName,
  servicePrice,
  onSaved,
}: RecipeEditorProps) {
  // serviceName available for future use
  void _serviceName;
  // State
  const [recipe, setRecipe] = useState<ServiceRecipe | null>(null);
  const [products, setProducts] = useState<BackbarProduct[]>([]);
  const [lines, setLines] = useState<SaveRecipeLineDto[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableVariants, setEnableVariants] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [recipeData, productsData] = await Promise.all([
        getServiceRecipe(serviceId),
        getBackbarProducts(),
      ]);

      setProducts(productsData);

      if (recipeData) {
        setRecipe(recipeData);
        setNotes(recipeData.notes || '');
        setLines(
          recipeData.lines.map((line) => ({
            productId: line.productId,
            quantityStandard: line.quantityStandard,
            quantityBuffer: line.quantityBuffer,
            unit: line.unit,
            isRequired: line.isRequired,
            notes: line.notes,
            sortOrder: line.sortOrder,
          }))
        );
        setEnableVariants(recipeData.variants.length > 1);
      }
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Erro ao carregar receita');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleAddLine = () => {
    if (products.length === 0) return;

    const usedProductIds = lines.map((l) => l.productId);
    const availableProduct = products.find((p) => !usedProductIds.includes(p.id));

    if (!availableProduct) {
      setError('Todos os produtos ja foram adicionados');
      return;
    }

    setLines([
      ...lines,
      {
        productId: availableProduct.id,
        quantityStandard: 1,
        quantityBuffer: 0,
        unit: availableProduct.unit || 'UN',
        isRequired: true,
        sortOrder: lines.length,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: keyof SaveRecipeLineDto,
    value: any
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    // Update unit when product changes
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newLines[index].unit = product.unit || 'UN';
      }
    }

    setLines(newLines);
  };

  const handleSave = async () => {
    if (lines.length === 0) {
      setError('Adicione pelo menos um produto a receita');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const data: SaveRecipeDto = {
        notes: notes || undefined,
        lines: lines.map((line, index) => ({
          ...line,
          sortOrder: index,
        })),
        variants: enableVariants ? createDefaultVariants() : undefined,
      };

      const savedRecipe = await saveServiceRecipe(serviceId, data);
      setRecipe(savedRecipe);
      setSuccess(
        `Receita salva com sucesso! Versao ${savedRecipe.version}`
      );

      if (onSaved) {
        onSaved();
      }
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      setError(err.response?.data?.message || 'Erro ao salvar receita');
    } finally {
      setSaving(false);
    }
  };

  // Calculate costs
  const getProductById = (id: number) => products.find((p) => p.id === id);

  const calculateLineCost = (line: SaveRecipeLineDto): number => {
    const product = getProductById(line.productId);
    if (!product) return 0;
    const qty = line.quantityStandard + (line.quantityBuffer || 0);
    return qty * product.costPrice;
  };

  const totalCost = lines.reduce((sum, line) => sum + calculateLineCost(line), 0);
  const margin = calculateRecipeMargin(servicePrice, totalCost);

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      {recipe && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              Receita ativa - Versao {recipe.version}
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Custo estimado: {formatCurrency(recipe.estimatedCost)}
          </p>
        </div>
      )}

      {/* Errors/Success */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Products list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Produtos Consumidos</h3>
          <button
            onClick={handleAddLine}
            disabled={products.length === 0}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar Produto
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">
              Nenhum produto na receita
            </p>
            <button
              onClick={handleAddLine}
              disabled={products.length === 0}
              className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              + Adicionar primeiro produto
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {lines.map((line, index) => {
              const lineCost = calculateLineCost(line);

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Select */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Produto
                      </label>
                      <select
                        value={line.productId}
                        onChange={(e) =>
                          handleLineChange(index, 'productId', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        {products.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={
                              lines.some((l, i) => i !== index && l.productId === p.id)
                            }
                          >
                            {p.name} ({formatCurrency(p.costPrice)}/{p.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        value={line.quantityStandard}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            'quantityStandard',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0.001"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Unit */}
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Unidade
                      </label>
                      <select
                        value={line.unit}
                        onChange={(e) => handleLineChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        {Object.keys(UNIT_LABELS).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cost */}
                    <div className="w-24 text-right">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Custo
                      </label>
                      <div className="px-3 py-2 text-sm font-medium text-gray-900">
                        {formatCurrency(lineCost)}
                      </div>
                    </div>

                    {/* Remove */}
                    <div className="pt-6">
                      <button
                        onClick={() => handleRemoveLine(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Buffer (optional) */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Extra
                      </label>
                      <input
                        type="number"
                        value={line.quantityBuffer || 0}
                        onChange={(e) =>
                          handleLineChange(
                            index,
                            'quantityBuffer',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="text-xs text-gray-500 pt-4">
                      Quantidade extra de seguranca para desperdicio
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Variants toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enableVariants}
            onChange={(e) => setEnableVariants(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
        <div>
          <span className="text-sm font-medium text-gray-700">
            Habilitar variantes (Curto/Medio/Longo)
          </span>
          <p className="text-xs text-gray-500">
            Permite ajustar quantidade por tamanho do cabelo
          </p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observacoes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          rows={2}
          placeholder="Instrucoes especiais, dicas de aplicacao..."
        />
      </div>

      {/* Summary */}
      {lines.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Custo Total da Receita</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalCost)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Preco do Servico: {formatCurrency(servicePrice)}
              </div>
              <div
                className={`text-lg font-medium ${
                  margin.percent >= 40
                    ? 'text-green-600'
                    : margin.percent >= 20
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                Margem: {margin.percent.toFixed(1)}% ({formatCurrency(margin.value)})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || lines.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Receita'
          )}
        </button>
      </div>
    </div>
  );
}
