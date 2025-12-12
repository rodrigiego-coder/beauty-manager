import { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  Users,
  Coins,
  Gift,
  TrendingUp,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

interface LoyaltyStats {
  totalEnrolledClients: number;
  pointsInCirculation: number;
  pointsEarnedThisMonth: number;
  pointsRedeemedThisMonth: number;
  redemptionsThisMonth: number;
  revenueInfluenced: number;
  tierDistribution: Array<{
    tierId: string;
    tierName: string;
    tierColor: string;
    count: number;
  }>;
  topRewards: Array<{
    rewardId: string;
    rewardName: string;
    redemptionCount: number;
  }>;
}

interface LeaderboardEntry {
  clientId: string;
  clientName: string;
  currentPoints: number;
  totalPointsEarned: number;
  tierId: string | null;
  tierName: string | null;
  tierColor: string | null;
  rank: number;
}

export function LoyaltyDashboardPage() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.get('/loyalty/stats'),
        api.get('/loyalty/leaderboard?limit=10'),
      ]);
      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-yellow-500">🥇</span>;
    if (rank === 2) return <span className="text-gray-400">🥈</span>;
    if (rank === 3) return <span className="text-amber-600">🥉</span>;
    return <span className="text-gray-400 font-medium">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Crown className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Fidelidade</h1>
            <p className="text-gray-500">Acompanhe o desempenho do programa</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes Inscritos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEnrolledClients.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Coins className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pontos em Circulação</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pointsInCirculation.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pontos Ganhos (Mês)</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pointsEarnedThisMonth.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gift className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resgates (Mês)</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.redemptionsThisMonth || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Nível</h2>
          {stats?.tierDistribution && stats.tierDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.tierDistribution}
                    dataKey="count"
                    nameKey="tierName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.tierColor || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhum dado disponível
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {stats?.tierDistribution.map((tier) => (
              <div key={tier.tierId} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.tierColor }} />
                <span className="text-sm text-gray-600">{tier.tierName} ({tier.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rewards */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recompensas Mais Resgatadas</h2>
          {stats?.topRewards && stats.topRewards.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topRewards} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="rewardName" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="redemptionCount" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhum resgate registrado
            </div>
          )}
        </div>
      </div>

      {/* Points Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Movimentação de Pontos (Mês)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Pontos Ganhos</p>
            <p className="text-3xl font-bold text-green-700">{stats?.pointsEarnedThisMonth.toLocaleString() || 0}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-1">Pontos Resgatados</p>
            <p className="text-3xl font-bold text-red-700">{stats?.pointsRedeemedThisMonth.toLocaleString() || 0}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Saldo Líquido</p>
            <p className="text-3xl font-bold text-purple-700">
              {((stats?.pointsEarnedThisMonth || 0) - (stats?.pointsRedeemedThisMonth || 0)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">Top 10 Clientes</h2>
        </div>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 w-16">Rank</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Nível</th>
                  <th className="pb-3 text-right">Pontos Atuais</th>
                  <th className="pb-3 text-right">Total Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.clientId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankBadge(entry.rank)}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-gray-900">{entry.clientName}</span>
                    </td>
                    <td className="py-3">
                      {entry.tierName ? (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: entry.tierColor || '#6B7280' }}
                        >
                          {entry.tierName}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-semibold text-purple-600">
                      {entry.currentPoints.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {entry.totalPointsEarned.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum cliente inscrito no programa
          </div>
        )}
      </div>
    </div>
  );
}

export default LoyaltyDashboardPage;
