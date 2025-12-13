import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Props {
  clientId: string;
  clientName: string;
}

export default function AIClientInsight({ clientId, clientName }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsight();
  }, [clientId]);

  const loadInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ insight: string }>(`/ai-assistant/client/${clientId}/insight`);
      setInsight(data.insight);
    } catch (err: any) {
      console.error('Erro ao carregar insight:', err);
      setError(err.response?.data?.message || 'Não foi possível gerar insights');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="animate-pulse w-5 h-5 bg-purple-300 rounded"></div>
          <span className="font-semibold text-purple-700">Belle está analisando...</span>
        </div>
        <div className="space-y-2">
          <div className="animate-pulse h-4 bg-purple-100 rounded w-3/4"></div>
          <div className="animate-pulse h-4 bg-purple-100 rounded w-1/2"></div>
          <div className="animate-pulse h-4 bg-purple-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-red-700">Erro ao gerar insight</span>
        </div>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={loadInsight}
          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-purple-700">Belle diz sobre {clientName}:</span>
        </div>
        <button
          onClick={loadInsight}
          className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors"
          title="Atualizar insight"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{insight}</div>
    </div>
  );
}
