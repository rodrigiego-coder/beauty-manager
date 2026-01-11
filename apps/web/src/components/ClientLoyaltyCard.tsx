import { useState, useEffect, useCallback } from 'react';
import { copyToClipboard as copyText } from '../utils/clipboard';
import {
  Crown,
  Star,
  Gift,
  History,
  UserPlus,
  X,
  Check,
  Copy,
  Share2,
  DollarSign,
  Percent,
  Package,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

interface LoyaltyTier {
  id: string;
  name: string;
  code: string;
  color: string;
  minPoints: number;
  pointsMultiplier: string;
  benefits: {
    discountPercent?: number;
    priorityBooking?: boolean;
    extraBenefits?: string;
  } | null;
}

interface LoyaltyAccount {
  id: string;
  clientId: string;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  referralCode: string;
  currentTier?: LoyaltyTier;
  nextTier?: LoyaltyTier | null;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  balance: number;
  description: string;
  createdAt: string;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  type: string;
  pointsCost: number;
  value: string | null;
  validDays: number;
}

interface Redemption {
  id: string;
  rewardName: string;
  rewardType: string;
  rewardValue: string | null;
  pointsSpent: number;
  code: string;
  expiresAt: string;
}

interface ClientLoyaltyCardProps {
  clientId: string;
  clientName?: string;
  compact?: boolean;
  onPointsEarned?: (points: number) => void;
}

export function ClientLoyaltyCard({ clientId, clientName, compact = false, onPointsEarned: _onPointsEarned }: ClientLoyaltyCardProps) {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redemption, setRedemption] = useState<Redemption | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      const response = await api.get(`/loyalty/account/${clientId}`);
      setAccount(response.data);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await api.post(`/loyalty/account/${clientId}/enroll`);
      setMessage({ type: 'success', text: 'Cliente inscrito no programa!' });
      loadAccount();
    } catch {
      setMessage({ type: 'error', text: 'Erro ao inscrever cliente' });
    } finally {
      setEnrolling(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await api.get(`/loyalty/account/${clientId}/transactions`);
      setTransactions(response.data);
      setShowTransactions(true);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar extrato' });
    }
  };

  const loadRewards = async () => {
    try {
      const response = await api.get(`/loyalty/account/${clientId}/available-rewards`);
      setRewards(response.data);
      setShowRewards(true);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar recompensas' });
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const response = await api.post(`/loyalty/account/${clientId}/redeem/${rewardId}`);
      setRedemption(response.data);
      setMessage({ type: 'success', text: 'Recompensa resgatada!' });
      loadAccount();
      loadRewards();
    } catch {
      setMessage({ type: 'error', text: 'Erro ao resgatar recompensa' });
    } finally {
      setRedeeming(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    await copyText(text);
    setMessage({ type: 'success', text: 'Código copiado!' });
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    );
  }

  // Not enrolled
  if (!account) {
    if (compact) {
      return (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" />
          {enrolling ? 'Inscrevendo...' : 'Inscrever na Fidelidade'}
        </button>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Crown className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Cliente não participa do programa</p>
          </div>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            {enrolling ? 'Inscrevendo...' : 'Inscrever'}
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress to next tier
  const nextTierProgress = account.nextTier
    ? Math.min(100, ((account.totalPointsEarned - (account.currentTier?.minPoints || 0)) / (account.nextTier.minPoints - (account.currentTier?.minPoints || 0))) * 100)
    : 100;

  // Compact version
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {account.currentTier && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: account.currentTier.color }}
          >
            {account.currentTier.name}
          </span>
        )}
        <span className="text-sm font-semibold text-purple-600">{account.currentPoints} pts</span>
        <button
          onClick={loadRewards}
          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
          title="Resgatar recompensa"
        >
          <Gift className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {account.currentTier && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Crown className="h-4 w-4" />
              </div>
            )}
            <div>
              <div className="text-sm opacity-80">{clientName || 'Cliente'}</div>
              <div className="font-semibold">{account.currentTier?.name || 'Sem nível'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{account.currentPoints.toLocaleString()}</div>
            <div className="text-xs opacity-80">pontos disponíveis</div>
          </div>
        </div>

        {/* Progress to next tier */}
        {account.nextTier && (
          <div className="mb-3">
            <div className="flex justify-between text-xs opacity-80 mb-1">
              <span>{account.currentTier?.name || 'Início'}</span>
              <span>{account.nextTier.name}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${nextTierProgress}%` }}
              />
            </div>
            <div className="text-xs opacity-80 mt-1 text-center">
              Faltam {(account.nextTier.minPoints - account.totalPointsEarned).toLocaleString()} pts para {account.nextTier.name}
            </div>
          </div>
        )}

        {/* Benefits */}
        {account.currentTier?.benefits && (
          <div className="flex flex-wrap gap-2 mb-3">
            {account.currentTier.benefits.discountPercent && (
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                {account.currentTier.benefits.discountPercent}% desconto
              </span>
            )}
            {parseFloat(account.currentTier.pointsMultiplier) > 1 && (
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                {account.currentTier.pointsMultiplier}x pontos
              </span>
            )}
            {account.currentTier.benefits.priorityBooking && (
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                <Star className="h-3 w-3 inline mr-1" />
                Prioridade
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={loadTransactions}
            className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
          >
            <History className="h-4 w-4" />
            Extrato
          </button>
          <button
            onClick={loadRewards}
            className="flex-1 px-3 py-2 bg-white hover:bg-white/90 text-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
          >
            <Gift className="h-4 w-4" />
            Resgatar
          </button>
        </div>

        {/* Referral code */}
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="text-xs opacity-80">Código de indicação: <span className="font-mono font-semibold">{account.referralCode}</span></div>
          <button
            onClick={() => copyToClipboard(account.referralCode)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-2 p-2 rounded-lg text-sm flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Extrato de Pontos</h3>
              <button onClick={() => setShowTransactions(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma transação encontrada</div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${t.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.points > 0 ? <Sparkles className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{t.description}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`font-semibold ${t.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.points > 0 ? '+' : ''}{t.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {showRewards && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Resgatar Recompensa</h3>
                <p className="text-sm text-gray-500">Saldo: {account.currentPoints} pontos</p>
              </div>
              <button onClick={() => setShowRewards(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {rewards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma recompensa disponível</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rewards.map((r) => (
                    <div key={r.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {r.type === 'DISCOUNT_VALUE' && <DollarSign className="h-5 w-5 text-green-500" />}
                        {r.type === 'DISCOUNT_PERCENT' && <Percent className="h-5 w-5 text-blue-500" />}
                        {r.type === 'FREE_SERVICE' && <Sparkles className="h-5 w-5 text-purple-500" />}
                        {r.type === 'FREE_PRODUCT' && <Package className="h-5 w-5 text-orange-500" />}
                        {r.type === 'GIFT' && <Gift className="h-5 w-5 text-pink-500" />}
                        <span className="font-medium text-gray-900 text-sm">{r.name}</span>
                      </div>
                      {r.description && <p className="text-xs text-gray-500 mb-2">{r.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-purple-600 font-semibold text-sm">{r.pointsCost} pts</span>
                        <button
                          onClick={() => handleRedeem(r.id)}
                          disabled={redeeming === r.id || account.currentPoints < r.pointsCost}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {redeeming === r.id ? 'Resgatando...' : 'Resgatar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Redemption Success Modal */}
      {redemption && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resgate realizado!</h3>
            <p className="text-gray-600 mb-4">{redemption.rewardName}</p>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="text-xs text-gray-500 mb-1">Código do voucher</div>
              <div className="font-mono text-xl font-bold text-purple-600">{redemption.code}</div>
              <div className="text-xs text-gray-500 mt-1">
                Válido até {new Date(redemption.expiresAt).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(redemption.code)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </button>
              <button
                onClick={() => {
                  const text = `Seu voucher: ${redemption.code} - ${redemption.rewardName}. Válido até ${new Date(redemption.expiresAt).toLocaleDateString('pt-BR')}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                WhatsApp
              </button>
            </div>

            <button
              onClick={() => setRedemption(null)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ClientLoyaltyCard;
