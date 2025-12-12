import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Percent,
  Users,
  Sparkles,
  Loader2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import api from '../services/api';
import { RecommendationStats, HairProfileStats, HairTypeLabels, HairConcernsLabels } from '../types';

export function RecommendationStatsPage() {
  const [recStats, setRecStats] = useState<RecommendationStats | null>(null);
  const [profileStats, setProfileStats] = useState<HairProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [recResponse, profileResponse] = await Promise.all([
        api.get(`/recommendations/stats?days=${days}`),
        api.get('/hair-profiles/stats'),
      ]);
      setRecStats(recResponse.data);
      setProfileStats(profileResponse.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Carregando estatísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estatísticas de Recomendações</h1>
          <p className="text-gray-600">Acompanhe o desempenho do sistema de inteligência de produtos</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={60}>Últimos 60 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      {/* Profile Coverage */}
      {profileStats && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Cobertura de Perfis Capilares</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold">{profileStats.profilesCreated}</p>
              <p className="text-white/80">Perfis criados</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{profileStats.totalClients}</p>
              <p className="text-white/80">Total de clientes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{profileStats.coveragePercentage}%</p>
              <p className="text-white/80">Cobertura</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${profileStats.coveragePercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Stats Cards */}
      {recStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Total Recomendações</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {recStats.totalRecommendations}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Aceitas</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {recStats.acceptedCount}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Rejeitadas</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {recStats.rejectedCount}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Percent className="w-5 h-5" />
              <span className="text-sm font-medium">Taxa de Aceitação</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {formatPercent(recStats.acceptanceRate)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {recStats && recStats.topProducts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Produtos Mais Recomendados
              </h2>
            </div>
            <div className="space-y-3">
              {recStats.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{product.timesRecommended} recomendações</span>
                      <span>{product.timesAccepted} aceitas</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      product.acceptanceRate >= 50 ? 'text-green-600' :
                      product.acceptanceRate >= 25 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatPercent(product.acceptanceRate)}
                    </span>
                    <p className="text-xs text-gray-400">aceitação</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Rules */}
        {recStats && recStats.topRules.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Regras Mais Acionadas
              </h2>
            </div>
            <div className="space-y-3">
              {recStats.topRules.slice(0, 5).map((rule, index) => (
                <div key={rule.ruleId} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{rule.ruleName}</p>
                    <p className="text-sm text-gray-500">
                      {rule.timesTriggered} acionamentos
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      rule.acceptanceRate >= 50 ? 'text-green-600' :
                      rule.acceptanceRate >= 25 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {formatPercent(rule.acceptanceRate)}
                    </span>
                    <p className="text-xs text-gray-400">aceitação</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hair Type Distribution */}
        {profileStats && Object.keys(profileStats.hairTypeDistribution).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Distribuição por Tipo de Cabelo
              </h2>
            </div>
            <div className="space-y-3">
              {Object.entries(profileStats.hairTypeDistribution).map(([type, count]) => {
                const total = Object.values(profileStats.hairTypeDistribution).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {HairTypeLabels[type as keyof typeof HairTypeLabels] || type}
                      </span>
                      <span className="text-sm text-gray-500">{count} ({formatPercent(percent)})</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Concerns */}
        {profileStats && profileStats.topConcerns.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Necessidades Mais Comuns
              </h2>
            </div>
            <div className="space-y-3">
              {profileStats.topConcerns.map((concern, index) => (
                <div key={concern.concern} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {HairConcernsLabels[concern.concern as keyof typeof HairConcernsLabels] || concern.concern}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-700">
                    {concern.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {(!recStats || recStats.totalRecommendations === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma recomendação ainda
          </h3>
          <p className="text-gray-500">
            As estatísticas aparecerão quando o sistema começar a fazer recomendações.
          </p>
        </div>
      )}
    </div>
  );
}
