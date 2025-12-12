import { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ProductRecommendation } from '../types';

interface ProductRecommendationsProps {
  clientId: string;
  clientName: string;
  onAddToCommand?: (product: ProductRecommendation) => void;
  compact?: boolean;
}

export function ProductRecommendations({
  clientId,
  clientName,
  onAddToCommand,
  compact = false,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!compact);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (clientId) {
      fetchRecommendations();
    }
  }, [clientId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/recommendations/client/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar recomendações');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Erro ao buscar recomendações:', err);
      setError('Não foi possível carregar as recomendações');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCommand = (product: ProductRecommendation) => {
    if (onAddToCommand) {
      onAddToCommand(product);
      setAddedProducts(prev => new Set(prev).add(product.productId));
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(price));
  };

  if (!clientId) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 text-purple-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Analisando perfil capilar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <Package className="w-5 h-5" />
          <span className="text-sm">
            Nenhuma recomendação disponível. Complete o perfil capilar para receber sugestões.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-purple-800">
              Produtos Recomendados
            </h3>
            <p className="text-xs text-purple-600">
              {recommendations.length} sugestões baseadas no perfil de {clientName}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-purple-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-purple-600" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {recommendations.slice(0, compact ? 3 : 10).map((rec) => (
            <div
              key={rec.productId}
              className={`bg-white rounded-lg p-3 border shadow-sm transition-all ${
                addedProducts.has(rec.productId)
                  ? 'border-green-300 bg-green-50'
                  : 'border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {rec.productName}
                    </h4>
                    {rec.priority > 5 && (
                      <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        Top
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{rec.reason}</p>

                  {/* Matched Criteria */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.matchedCriteria.slice(0, 3).map((criteria, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {criteria}
                      </span>
                    ))}
                    {rec.matchedCriteria.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{rec.matchedCriteria.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-purple-700">
                    {formatPrice(rec.salePrice)}
                  </span>

                  <span className={`text-xs ${
                    rec.currentStock > 5 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {rec.currentStock} em estoque
                  </span>

                  {onAddToCommand && (
                    <button
                      onClick={() => handleAddToCommand(rec)}
                      disabled={addedProducts.has(rec.productId)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${
                        addedProducts.has(rec.productId)
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {addedProducts.has(rec.productId) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Adicionado
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Adicionar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Rule Info */}
              {rec.ruleName && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Regra: {rec.ruleName}
                  </span>
                </div>
              )}
            </div>
          ))}

          {recommendations.length > (compact ? 3 : 10) && (
            <div className="text-center pt-2">
              <span className="text-sm text-purple-600">
                +{recommendations.length - (compact ? 3 : 10)} outras recomendações
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Versão Mini do componente para exibir em cards/listas
 */
export function ProductRecommendationsBadge({
  count,
  onClick,
}: {
  count: number;
  onClick?: () => void;
}) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
    >
      <Sparkles className="w-3 h-3" />
      {count} {count === 1 ? 'recomendação' : 'recomendações'}
    </button>
  );
}
